const VirtualDOM = require('./VirtualDOM');
const Utils = require('./Utils');

class CompileUtilForRepeat {
  constructor(fragment) {
    this.$fragment = fragment;
  }

  _getVMVal(vm, exp) {
    const valueList = exp.replace('()', '').split('.');
    let value = vm;
    valueList.forEach(v => {
      if (v === 'this') return;
      value = value[v];
    });
    return value;
  }

  _getVMRepeatVal(val, exp, key) {
    let value;
    const valueList = exp.replace('()', '').split('.');
    valueList.forEach(v => {
      if (v === key) {
        value = val;
        return;
      }
      value = value[v];
    });
    return value;
  }

  bind(node, val, key, dir, exp, index, vm, watchData) {
    let value;
    if (exp.indexOf(key) === 0 || exp.indexOf(`${key}.`) === 0) {
      value = this._getVMRepeatVal(val, exp, key);
    } else {
      value = this._getVMVal(vm, exp);
    }
    const watchValue = this._getVMVal(vm, watchData);
    this.templateUpdater(node, val, key, vm);
    const updaterFn = this[`${dir}Updater`];
    switch (dir) {
    case 'model':
      updaterFn && updaterFn.call(this, node, value, exp, key, index, watchValue, watchData, vm);
      break;
    default:
      updaterFn && updaterFn.call(this, node, value);
    }
  }

  templateUpdater(node, val, key, vm) {
    const text = node.textContent;
    const reg = /\{\{(.*)\}\}/g;
    if (reg.test(text)) {
      const exp = RegExp.$1;
      let value;
      if (exp.indexOf(key) === 0 || exp.indexOf(`${key}.`) === 0) {
        value = this._getVMRepeatVal(val, exp, key);
      } else {
        value = this._getVMVal(vm, exp);
      }
      node.textContent = node.textContent.replace(/(\{\{.*\}\})/g, value);
    }
  }

  textUpdater(node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value;
  }

  htmlUpdater(node, value) {
    node.innerHTML = typeof value === 'undefined' ? '' : value;
  }

  ifUpdater(node, value) {
    if (value) this.$fragment.appendChild(node);
  }

  classUpdater(node, value, oldValue) {
    let className = node.className;
    className = className.replace(oldValue, '').replace(/\s$/, '');
    const space = className && String(value) ? ' ' : '';
    node.className = className + space + value;
  }

  modelUpdater(node, value, exp, key, index, watchValue, watchData, vm) {
    node.value = typeof value === 'undefined' ? '' : value;
    const val = exp.replace(`${key}.`, '');
    const fn = function (event) {
      event.preventDefault();
      if (event.target.value === watchValue[index][val]) return;
      watchValue[index][val] = event.target.value;
    };
    // node.addEventListener('change', fn, false);
    node.addEventListener('input', fn, false);
  }

  eventHandler(node, vm, exp, event, key, val) {
    const eventType = event.split(':')[1];
    const fnList = exp.replace(/\(.*\)/, '').split('.');
    const args = exp.match(/\((.*)\)/)[1].replace(/ /g, '').split(',');
    let fn = vm;
    fnList.forEach(f => {
      if (f === 'this') return;
      fn = fn[f];
    });
    const func = (event) => {
      let argsList = [];
      args.forEach(arg => {
        if (arg === '') return false;
        if (arg === '$event') argsList.push(event);
        if (/(this.).*/g.test(arg) || /(this.state.).*/g.test(arg) || /(this.props.).*/g.test(arg)) argsList.push(this._getVMVal(vm, arg));
        if (/\'.*\'/g.test(arg)) argsList.push(arg.match(/\'(.*)\'/)[1]);
        if (!/\'.*\'/g.test(arg) && /^[0-9]*$/g.test(arg)) argsList.push(Number(arg));
        if (arg === 'true' || arg === 'false') argsList.push(arg === 'true');
        if (arg.indexOf(key) === 0 || arg.indexOf(`${key}.`) === 0) argsList.push(this._getVMRepeatVal(val, arg, key));
      });
      fn.apply(vm, argsList);
    };
    if (eventType && fn) node.addEventListener(eventType, func, false);
  }
}

class CompileUtil {
  constructor(fragment) {
    this.$fragment = fragment;
  }

  _getVMVal(vm, exp) {
    const valueList = exp.replace('()', '').split('.');
    let value = vm;
    valueList.forEach(v => {
      if (v === 'this') return;
      value = value[v];
    });
    return value;
  }

  _getVMRepeatVal(vm, exp) {
    const vlList = exp.split(' ');
    const value = this._getVMVal(vm, vlList[3]);
    return value;
  }

  _setVMVal(vm, exp, value) {
    var val = vm;
    exp = exp.split('.');
    exp.forEach((k, i) => {
      if (i < exp.length - 1) {
        val = val[k];
      } else {
        val[k] = value;
      }
    });
  }

  bind(node, vm, exp, dir) {
    const updaterFn = this[`${dir}Updater`];
    const isRepeatNode = this.isRepeatNode(node);
    if (isRepeatNode) {
      switch (dir) {
      case 'repeat':
        updaterFn && updaterFn.call(this, node, this._getVMRepeatVal(vm, exp), exp, vm);
        break;
      }
    } else {
      switch (dir) {
      case 'model':
        updaterFn && updaterFn.call(this, node, this._getVMVal(vm, exp), exp, vm);
        break;
      case 'text':
        updaterFn && updaterFn.call(this, node, this._getVMVal(vm, exp));
        break;
      case 'if':
        updaterFn && updaterFn.call(this, node, this._getVMVal(vm, exp), exp, vm);
        break;
      default:
        updaterFn && updaterFn.call(this, node, this._getVMVal(vm, exp));
      }
    }
  }

  templateUpdater(node, vm, exp) {
    node.textContent = node.textContent.replace(/(\{\{.*\}\})/g, this._getVMVal(vm, exp));
  }

  textUpdater(node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value;
  }

  htmlUpdater(node, value) {
    node.innerHTML = typeof value === 'undefined' ? '' : value;
  }

  ifUpdater(node, value) {
    if (!value && this.$fragment.contains(node)) {
      this.$fragment.removeChild(node);
    } else {
      this.$fragment.appendChild(node);
    }
  }

  classUpdater(node, value, oldValue) {
    let className = node.className;
    className = className.replace(oldValue, '').replace(/\s$/, '');
    const space = className && String(value) ? ' ' : '';
    node.className = className + space + value;
  }

  modelUpdater(node, value, exp, vm) {
    node.value = typeof value === 'undefined' ? '' : value;
    const val = exp.replace(/(this.state.)|(this.props)/, '');
    const fn = function (event) {
      event.preventDefault();
      if (/(this.state.).*/.test(exp)) vm.state[val] = event.target.value;
      if (/(this.props.).*/.test(exp)) vm.props[val] = event.target.value;
    };
    // node.addEventListener('change', fn, false);
    node.addEventListener('input', fn, false);
  }

  repeatUpdater(node, value, expFather, vm) {
    const key = expFather.split(' ')[1];
    const watchData = expFather.split(' ')[3];
    value.forEach((val, index) => {
      const newElement = node.cloneNode(true);
      const nodeAttrs = newElement.attributes;
      const text = newElement.textContent;
      const reg = /\{\{(.*)\}\}/g;
      if (reg.test(text) && text.indexOf(`{{${key}`) >= 0) {
        new CompileUtilForRepeat(this.$fragment).templateUpdater(newElement, val, key, vm);
      }
      if (nodeAttrs) {
        Array.from(nodeAttrs).forEach(attr => {
          const attrName = attr.name;
          if (this.isDirective(attrName) && attrName !== 'es-repeat') {
            const dir = attrName.substring(3);
            const exp = attr.value;
            if (this.isEventDirective(dir)) {
              new CompileUtilForRepeat(this.$fragment).eventHandler(newElement, vm, exp, dir, key, val);
            } else {
              new CompileUtilForRepeat(this.$fragment).bind(newElement, val, key, dir, exp, index, vm, watchData);
            }
            // node.removeAttribute(attrName);
          }
        });
      }
      if (!this.isIfNode(node)) this.$fragment.appendChild(newElement);
    });
  }

  isDirective(attr) {
    return attr.indexOf('es-') === 0;
  }

  isEventDirective(event) {
    return event.indexOf('on') === 0;
  }

  isElementNode(node) {
    return node.nodeType === 1;
  }

  isRepeatNode(node) {
    const nodeAttrs = node.attributes;
    let result = false;
    if (nodeAttrs) {
      Array.from(nodeAttrs).forEach(attr => {
        const attrName = attr.name;
        if (attrName === 'es-repeat') result = true;
      });
    }
    return result;
  }

  isIfNode(node) {
    const nodeAttrs = node.attributes;
    let result = false;
    if (nodeAttrs) {
      Array.from(nodeAttrs).forEach(attr => {
        const attrName = attr.name;
        if (attrName === 'es-if') result = true;
      });
    }
    return result;
  }
}

class Compile {
  // removeDOM
  // constructor(el, vm, routerRenderDom) {
  //   this.utils = new Utils();
  //   this.$vm = vm;
  //   this.$el = this.isElementNode(el) ? el : document.querySelector(el);
  //   if (this.$el) {
  //     this.$fragment = this.node2Fragment(this.$el);
  //     this.init();
  //     if (routerRenderDom) {
  //       const newRouterRenderDom = this.$fragment.querySelectorAll('router-render')[0];
  //       newRouterRenderDom.parentNode.replaceChild(routerRenderDom, newRouterRenderDom);
  //     }
  //     this.$el.appendChild(this.$fragment);
  //   }
  // }

  constructor(el, vm) {
    this.utils = new Utils();
    this.$vm = vm;
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    if (this.$el) {
      this.$fragment = this.node2Fragment(this.$el);
      this.init();
      const oldVnode = VirtualDOM.parseToVnode(this.$el);
      const newVnode = VirtualDOM.parseToVnode(this.$fragment);
      const patchList = [];
      VirtualDOM.diffVnode(oldVnode, newVnode, patchList);
      VirtualDOM.renderVnode(patchList);
    }
  }

  init() {
    this.compileElement(this.$fragment);
  }

  compileElement(fragment) {
    const elementCreated = document.createElement('div');
    // elementCreated.innerHTML = this.$vm.$template;
    elementCreated.innerHTML = this.utils.formatInnerHTML(this.$vm.$template);
    let childNodes = elementCreated.childNodes;
    this.recursiveDOM(childNodes, fragment);
  }

  recursiveDOM(childNodes, fragment) {
    Array.from(childNodes).forEach(node => {
      if (node.hasChildNodes()) {
        this.recursiveDOM(node.childNodes, node);
      }
      const text = node.textContent;
      const reg = /\{\{(.*)\}\}/g;
      if (this.isElementNode(node)) {
        if (reg.test(text)) {
          const regText = RegExp.$1;
          if (/(.*\{\{(this.).*\}\}.*)/g.test(text)) this.compileText(node, regText);
        }
        this.compile(node, fragment);
      }
      if (this.isRepeatNode(node) && fragment.contains(node)) {
        fragment.removeChild(node);
      } else {
        if (!this.isIfNode(node)) fragment.appendChild(node);
      }
    });
  }

  compile(node, fragment) {
    const nodeAttrs = node.attributes;
    if (nodeAttrs) {
      Array.from(nodeAttrs).forEach(attr => {
        const attrName = attr.name;
        if (this.isDirective(attrName)) {
          const dir = attrName.substring(3);
          const exp = attr.value;
          if (this.isEventDirective(dir)) {
            this.eventHandler(node, this.$vm, exp, dir);
          } else {
            new CompileUtil(fragment).bind(node, this.$vm, exp, dir);
          }
          // node.removeAttribute(attrName);
        }
      });
    }
  }

  node2Fragment(el) {
    const fragment = document.createDocumentFragment();
    let child;
    while (child === el.firstChild) {
      fragment.appendChild(child);
    }
    return fragment;
  }

  compileText(node, exp) {
    new CompileUtil(this.$fragment).templateUpdater(node, this.$vm, exp);
  }

  eventHandler(node, vm, exp, event) {
    const compileUtil = new CompileUtil();
    const eventType = event.split(':')[1];
    const fnList = exp.replace(/\(.*\)/, '').split('.');
    const args = exp.match(/\((.*)\)/)[1].replace(/\s+/g, '').split(',');
    let fn = vm;
    fnList.forEach(f => {
      if (f === 'this') return;
      fn = fn[f];
    });
    const func = (event) => {
      let argsList = [];
      args.forEach(arg => {
        if (arg === '') return false;
        if (arg === '$event') argsList.push(event);
        if (/(this.).*/g.test(arg) || /(this.state.).*/g.test(arg) || /(this.props.).*/g.test(arg)) argsList.push(compileUtil._getVMVal(vm, arg));
        if (/\'.*\'/g.test(arg)) argsList.push(arg.match(/\'(.*)\'/)[1]);
        if (!/\'.*\'/g.test(arg) && /^[0-9]*$/g.test(arg)) argsList.push(Number(arg));
        if (arg === 'true' || arg === 'false') argsList.push(arg === 'true');
      });
      fn.apply(vm, argsList);
    };
    if (eventType && fn) node.addEventListener(eventType, func, false);
  }

  isDirective(attr) {
    return attr.indexOf('es-') === 0;
  }

  isEventDirective(event) {
    return event.indexOf('on') === 0;
  }

  isElementNode(node) {
    return node.nodeType === 1;
  }

  isRepeatNode(node) {
    const nodeAttrs = node.attributes;
    let result = false;
    if (nodeAttrs) {
      Array.from(nodeAttrs).forEach(attr => {
        const attrName = attr.name;
        if (attrName === 'es-repeat') result = true;
      });
    }
    return result;
  }

  isIfNode(node) {
    const nodeAttrs = node.attributes;
    let result = false;
    if (nodeAttrs) {
      Array.from(nodeAttrs).forEach(attr => {
        const attrName = attr.name;
        if (attrName === 'es-if') result = true;
      });
    }
    return result;
  }

  isTextNode(node) {
    return node.nodeType === 3;
  }
}

module.exports = Compile;
