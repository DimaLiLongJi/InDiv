import { IComponent } from "../types";

import { Vnode, TAttributes, isRepeatNode, isTextNode, isDirective, isEventDirective, isPropOrNvDirective, isTagName } from "../vnode";
import { cloneVnode, copyRepeatData, isFromVM, buildProps, argumentsIsReady, getVMFunctionArguments, getValueByValue, getVMVal, getVMFunction, setVMVal, valueIsReady } from './utils';
import { utils } from '../utils';
import { CompileRepeatUtil } from './compile-repeat-util';
import { ChangeDetectionStrategy } from '../component';
import { buildPipeScope } from "./compiler-utils";

/**
 * compile util for Compiler
 *
 * @export
 * @class CompileUtil
 */
export class CompileUtil {
  [index: string]: any;
  public fragment?: Vnode[];

  /**
   * Creates an instance of CompileUtil.
   *
   * @param {Vnode[]} [fragment]
   *  @memberof CompileUtil
   */
  constructor(fragment?: Vnode[]) {
    this.fragment = fragment;
  }

  /**
   * get value by repeat value
   *
   * @param {*} vm
   * @param {string} exp
   * @returns {void}
   * @memberof CompileUtil
   */
  public _getVMRepeatVal(vm: any, exp: string): void {
    const _vlList = exp.split(' in ')[1];
    if (!_vlList) throw new Error(`directive nv-repeat 's expression ${exp} is wrong!`);
    const vlList = _vlList.replace(/\s*/g, '');
    const value = getVMVal(vm, vlList);
    return value;
  }

  /**
   * bind handler for nv irective
   *
   * if node is repeat node and it will break compile and into CompileRepeatUtil
   *
   * @param {Vnode} vnode
   * @param {*} vm
   * @param {string} exp
   * @param {string} dir
   * @memberof CompileUtil
   */
  public bind(vnode: Vnode, vm: IComponent, exp: string, dir: string): void {
    const isRepeatNodeBoolean = isRepeatNode(vnode);
    if (isRepeatNodeBoolean) {
      // compile repeatNode's attributes
      switch (dir) {
        case 'repeat':
          this.repeatUpdater(vnode, this._getVMRepeatVal(vm, exp), exp, vm);
          break;
      }
    } else {
      let value = null;
      // 拆分管道pipe
      const needCompileStringList = exp.split('|').map(v => v.trim());
      const needCompileValue = needCompileStringList[0];
      // for Function(arg)
      if (/^.*\(.*\)$/.test(needCompileValue)) {
        if (dir === 'model') throw new Error(`directive: nv-model can't use ${needCompileValue} as prop`);
        // if Function need function return value
        const fn = getVMFunction(vm, needCompileValue);
        const argsList = getVMFunctionArguments(vm, needCompileValue, vnode);
        value = this.pipeHandler(exp, fn.apply(vm, argsList), needCompileStringList, vm, vnode);
        // normal value
      } else if (isFromVM(vm, needCompileValue)) value = this.pipeHandler(exp, getVMVal(vm, needCompileValue), needCompileStringList, vm, vnode);
      else if (/^\'.*\'$/.test(needCompileValue)) value = this.pipeHandler(exp, needCompileValue.match(/^\'(.*)\'$/)[1], needCompileStringList, vm, vnode);
      else if (/^\".*\"$/.test(needCompileValue)) value = this.pipeHandler(exp, needCompileValue.match(/^\"(.*)\"$/)[1], needCompileStringList, vm, vnode);
      else if (!/^\'.*\'$/.test(needCompileValue) && !/^\".*\"$/.test(needCompileValue) && /(^[-,+]?\d+$)|(^[-, +]?\d+\.\d+$)/g.test(needCompileValue)) value = this.pipeHandler(exp, Number(needCompileValue), needCompileStringList, vm, vnode);
      else if (needCompileValue === 'true' || needCompileValue === 'false') value = this.pipeHandler(exp, (needCompileValue === 'true'), needCompileStringList, vm, vnode);
      else if (needCompileValue === 'null') value = this.pipeHandler(exp, null, needCompileStringList, vm, vnode);
      else if (needCompileValue === 'undefined') value = this.pipeHandler(exp, undefined, needCompileStringList, vm, vnode);
      else if (vnode.repeatData) {
        Object.keys(vnode.repeatData).forEach(data => {
          if (needCompileValue === data || needCompileValue.indexOf(`${data}.`) === 0) value = this.pipeHandler(exp, getValueByValue(vnode.repeatData[data], needCompileValue, data), needCompileStringList, vm, vnode);
        });
      } else throw new Error(`directive: nv-${dir} can't use recognize this value ${needCompileValue} as prop`);

      // compile unrepeatNode's attributes
      switch (dir) {
        case 'model': {
          this.modelUpdater(vnode, value, needCompileValue, vm);
          break;
        }
        case 'text': {
          this.textUpdater(vnode, value);
          break;
        }
        case 'if': {
          this.ifUpdater(vnode, value);
          break;
        }
        case 'if-not': {
          this.ifNotUpdater(vnode, value);
          break;
        }
        case 'class': {
          this.classUpdater(vnode, value);
          break;
        }
        case 'key': {
          this.keyUpdater(vnode, value);
          break;
        }
        case 'value': {
          this.valueUpdater(vnode, value);
          break;
        }
        default: this.commonUpdater(vnode, value, dir);
      }
    }
  }

  /**
   * update text for {{}}
   *
   * @param Vnode node
   * @param {*} vm
   * @param {string} exp
   * @memberof CompileUtil
   */
  public templateUpdater(vnode: Vnode, vm: any, exp: string): void {
    const _exp = exp.replace('{{', '').replace('}}', '');
    // 拆分管道pipe
    const needCompileStringList = _exp.split('|').map(v => v.trim());
    const needCompileValue = needCompileStringList[0];

    if (/^.*\(.*\)$/.test(needCompileValue) && argumentsIsReady(needCompileValue, vnode, vm)) {
      const fn = getVMFunction(vm, needCompileValue);
      const argsList = getVMFunctionArguments(vm, needCompileValue, vnode);
      const fromVmValue = this.pipeHandler(exp, fn.apply(vm, argsList), needCompileStringList, vm, vnode);
      vnode.nodeValue = vnode.nodeValue.replace(exp, fromVmValue);
    } else if (isFromVM(vm, needCompileValue)) {
      const fromVmValue = this.pipeHandler(exp, getVMVal(vm, needCompileValue), needCompileStringList, vm, vnode);
      vnode.nodeValue = vnode.nodeValue.replace(exp, fromVmValue);
    } else if (vnode.repeatData) {
      Object.keys(vnode.repeatData).forEach(data => {
        if (exp === data || exp.indexOf(`${data}.`) === 0) {
          const fromVmValue = this.pipeHandler(exp, getValueByValue(vnode.repeatData[data], exp, data), needCompileStringList, vm, vnode);
          vnode.nodeValue = vnode.nodeValue.replace(exp, fromVmValue);
        }
      });
    } else throw new Error(`directive: ${exp} can't use recognize this value`);
  }

  /**
   * update value of input for nv-model
   *
   * @param {Vnode} vnode
   * @param {*} value
   * @param {string} exp
   * @param {*} vm
   * @memberof CompileUtil
   */
  public modelUpdater(vnode: Vnode, value: any, exp: string, vm: any): void {
    vnode.value = typeof value === 'undefined' ? '' : value;
    const findAttribute = vnode.attributes.find(attr => attr.name === 'nv-model');
    findAttribute.nvValue = (typeof value === 'undefined' ? '' : value);

    const func = (event: Event) => {
      event.preventDefault();
      if (!utils.hasWindowAndDocument()) return;
      if (isFromVM(vm, exp)) setVMVal(vm, exp, (event.target as HTMLInputElement).value);
      // OnPush 模式要允许触发更新
      if ((vm as IComponent).$nvChangeDetection === ChangeDetectionStrategy.OnPush) {
        if ((vm as IComponent).nvDoCheck) (vm as IComponent).nvDoCheck();
        (vm as IComponent).render();
      }
    };

    const sameEventType = vnode.eventTypes.find(_eventType => _eventType.type === 'input');
    if (sameEventType) sameEventType.handler = func;
    if (!sameEventType) vnode.eventTypes.push({
      type: 'input',
      handler: func,
      token: value,
    });
  }

  /**
   * update text for nv-text
   *
   * @param {Vnode} vnode
   * @param {*} value
   * @returns {void}
   * @memberof CompileUtil
   */
  public textUpdater(vnode: Vnode, value: any): void {
    const findAttribute = vnode.attributes.find(attr => attr.name === 'nv-text');
    findAttribute.nvValue = (typeof value === 'undefined' ? '' : value);

    vnode.nodeValue = typeof value === 'undefined' ? '' : value;
    if (!vnode.childNodes || (vnode.childNodes && vnode.childNodes.length > 0)) vnode.childNodes = [];
    vnode.childNodes.push(new Vnode({
      type: 'text',
      nodeValue: typeof value === 'undefined' ? '' : value,
      parentVnode: vnode,
      template: typeof value === 'undefined' ? '' : value,
      voidElement: true,
    }));
    vnode.voidElement = true;
  }

  /**
   * remove or show for nv-if
   *
   * @param {Vnode} vnode
   * @param {*} value
   * @memberof CompileUtil
   */
  public ifUpdater(vnode: Vnode, value: any): void {
    const valueOfBoolean = Boolean(value);
    if (!valueOfBoolean && vnode.parentVnode.childNodes.indexOf(vnode) !== -1) vnode.parentVnode.childNodes.splice(vnode.parentVnode.childNodes.indexOf(vnode), 1);
    if (valueOfBoolean) {
      const findAttribute = vnode.attributes.find(attr => attr.name === 'nv-if');
      findAttribute.nvValue = valueOfBoolean;
    }
  }

  /**
   * remove or show for nv-if-not
   *
   * @param {Vnode} vnode
   * @param {*} value
   * @memberof CompileUtil
   */
  public ifNotUpdater(vnode: Vnode, value: any): void {
    const valueOfBoolean = !Boolean(value);
    if (!valueOfBoolean && vnode.parentVnode.childNodes.indexOf(vnode) !== -1) vnode.parentVnode.childNodes.splice(vnode.parentVnode.childNodes.indexOf(vnode), 1);
    if (valueOfBoolean) {
      const findAttribute = vnode.attributes.find(attr => attr.name === 'nv-if-not');
      findAttribute.nvValue = valueOfBoolean;
    }
  }

  /**
   * update class for nv-class
   *
   * @param {Vnode} vnode
   * @param {*} value
   * @returns {void}
   * @memberof CompileUtil
   */
  public classUpdater(vnode: Vnode, value: any): void {
    const findAttribute = vnode.attributes.find(attr => attr.name === 'nv-class');
    findAttribute.nvValue = value;
  }

  /**
   * update value of repeat node for nv-key
   *
   * @param {Vnode} vnode
   * @param {*} value
   * @memberof CompileRepeatUtil
   */
  public keyUpdater(vnode: Vnode, value: any): void {
    const findAttribute = vnode.attributes.find(attr => attr.name === 'nv-key');
    findAttribute.nvValue = value;
    vnode.key = value;
  }

  /**
   * update value of node for nv-value
   *
   * @param {Vnode} vnode
   * @param {*} value
   * @memberof CompileRepeatUtil
   */
  public valueUpdater(vnode: Vnode, value: any): void {
    const findAttribute = vnode.attributes.find(attr => attr.name === 'nv-value');
    findAttribute.nvValue = value;
    vnode.value = value;
  }

  /**
   * commonUpdater for nv directive except repeat model text if class
   *
   * @param {Vnode} vnode
   * @param {*} value
   * @param {string} dir
   * @memberof CompileUtil
   */
  public commonUpdater(vnode: Vnode, value: any, dir: string): void {
    const findAttribute = vnode.attributes.find(attr => attr.name === `nv-${dir}`);
    findAttribute.nvValue = value;
  }

  /**
   * update repeat Vnode for nv-repeat
   *
   * if it has child and it will into repeatChildrenUpdater
   *
   * @param {Vnode} vnode
   * @param {*} value
   * @param {string} expFather
   * @param {*} vm
   * @memberof CompileUtil
   */
  public repeatUpdater(vnode: Vnode, value: any, expFather: string, vm: any): void {
    if (!value) return;
    if (!Array.isArray(value)) throw new Error('compile error: nv-repeat need an Array!');

    const _key = expFather.split(' in ')[0];
    if (!_key) throw new Error(`directive nv-repeat 's expression ${expFather} is wrong!`);
    const key = _key.replace(/\s*/g, '');
    value.forEach((val: any, index: number) => {
      const repeatData: { [key: string]: any } = { ...vnode.repeatData };
      repeatData[key] = val;
      repeatData.$index = index;

      const newVnode = cloneVnode(vnode, repeatData);
      newVnode.index = index;
      const nodeAttrs = newVnode.attributes;
      const text = newVnode.template;
      const reg = /\{\{(.*)\}\}/g;
      const compileUtilForRepeat = new CompileRepeatUtil();
      this.fragment.splice(this.fragment.indexOf(vnode), 0, newVnode);

      if (isTextNode(newVnode) && reg.test(text)) compileUtilForRepeat.templateUpdater(newVnode, val, key, vm);

      if (nodeAttrs) {
        nodeAttrs.forEach(attr => {
          const attrName = attr.name;
          const dir = attrName.substring(3);
          const exp = attr.value;
          if (isDirective(attr.type) && attrName !== 'nv-repeat' && valueIsReady(exp, newVnode, vm) && argumentsIsReady(exp, newVnode, vm)) compileUtilForRepeat.bind(newVnode, key, dir, exp, index, vm, value, val);
          if (isEventDirective(attr.type) && attrName !== 'nv-repeat' && valueIsReady(exp, newVnode, vm) && argumentsIsReady(exp, newVnode, vm)) compileUtilForRepeat.eventHandler(newVnode, vm, exp, dir, key, val);
          if (isPropOrNvDirective(attr.type)) {
            const _exp = /^\{(.+)\}$/.exec(exp)[1];
            if (valueIsReady(_exp, newVnode, vm) && argumentsIsReady(_exp, newVnode, vm)) compileUtilForRepeat.propHandler(newVnode, vm, attr);
          }
        });

      }

      if (newVnode.childNodes && newVnode.childNodes.length > 0 && this.fragment.indexOf(newVnode) !== -1) {
         // 先根据此次循环的key编译一遍
        this.repeatChildrenUpdaterByKey(newVnode, val, expFather, index, vm, value);
        // 然后再编译子节点
        this.repeatChildrenUpdater(newVnode, vm);
      } 
    });
  }

  /**
   * update all child value by repeat key
   *
   * @param {Vnode} vnode
   * @param {*} value
   * @param {string} expFather
   * @param {number} index
   * @param {*} vm
   * @param {*} watchValue
   * @memberof CompileUtil
   */
  public repeatChildrenUpdaterByKey(vnode: Vnode, value: any, expFather: string, index: number, vm: any, watchValue: any): void {
    const _key = expFather.split(' in ')[0];
    if (!_key) throw new Error(`directive nv-repeat 's expression ${expFather} is wrong!`);
    const key = _key.replace(/\s*/g, '');

    const compileUtilForRepeat = new CompileRepeatUtil(vnode.childNodes);

    vnode.childNodes.forEach(child => {
      const repeatData = { ...vnode.repeatData, ...child.repeatData };
      repeatData[key] = value;
      repeatData.$index = index;
      child.repeatData = repeatData;
      copyRepeatData(child, repeatData);
      // 转移到 <nv-content>到组件视图上
      const isNvContentVNode = isTagName(child, 'nv-content');
      if (isNvContentVNode) child.childNodes = vm.$nvContent.map((content: Vnode) => cloneVnode(content, null, child));

      const nodeAttrs = child.attributes;
      const text = child.template;
      const reg = /\{\{(.*)\}\}/g;

      if (isTextNode(child) && reg.test(text)) compileUtilForRepeat.templateUpdater(child, value, key, vm);

      if (nodeAttrs) {
        nodeAttrs.forEach(attr => {
          const attrName = attr.name;
          const exp = attr.value;
          const dir = attrName.substring(3);

          if (isDirective(attr.type) && attrName !== 'nv-repeat' && valueIsReady(exp, vnode, vm) && argumentsIsReady(exp, child, vm)) compileUtilForRepeat.bind(child, key, dir, exp, index, vm, watchValue, value);
          if (isEventDirective(attr.type) && attrName !== 'nv-repeat' && valueIsReady(exp, vnode, vm) && argumentsIsReady(exp, child, vm)) compileUtilForRepeat.eventHandler(child, vm, exp, dir, key, value);
          if (isPropOrNvDirective(attr.type)) {
            const _exp = /^\{(.+)\}$/.exec(exp)[1];
            if (valueIsReady(_exp, vnode, vm) && argumentsIsReady(_exp, child, vm)) compileUtilForRepeat.propHandler(child, vm, attr);
          }
        });
      }
      // 如果该组件是 <nv-content></nv-content> 则不会参与子组件的更新
      if (!isNvContentVNode && child.childNodes && child.childNodes.length > 0) this.repeatChildrenUpdaterByKey(child, value, expFather, index, vm, watchValue);
    });
  }

  /**
   * update child if child has nv-repeat directive
   *
   * @param {Vnode} vnode
   * @param {*} vm
   * @memberof CompileUtil
   */
  public repeatChildrenUpdater(vnode: Vnode, vm: any): void {
    const _fragmentList: {
      originChild: Vnode,
      container: Vnode,
    }[] = [];

    vnode.childNodes.forEach(child => {
      const restRepeat = child.attributes.find(attr => isDirective(attr.type) && attr.name === 'nv-repeat');
      if (restRepeat) {
        // if is repeat vnode, we do this
        const _value = restRepeat.value.split(' in ')[1];
        if (!_value) throw new Error(`directive nv-repeat 's expression ${restRepeat.value} is wrong!`);
        const newWatchData = _value.replace(/\s*/g, '');

        // 创建一个同级于vnode的容器存放新的子元素的容器，最后再统一放入vnode中
        const _newContainerFragment = new Vnode(vnode);
        // 因为确定了是不允许递归的循环node所以子节点要清空
        _newContainerFragment.childNodes = [];
        _newContainerFragment.childNodes.push(child);
        _fragmentList.push({
          originChild: child,
          container: _newContainerFragment,
        });

        const compileUtil = new CompileUtil(_newContainerFragment.childNodes);

        if (isFromVM(vm, newWatchData)) compileUtil.repeatUpdater(child, this._getVMRepeatVal(vm, restRepeat.value), restRepeat.value, vm);
        else if (child.repeatData) {
          let findData: any;
          Object.keys(child.repeatData).forEach(dataKey => {
            if (newWatchData === dataKey || newWatchData.indexOf(`${dataKey}.`) === 0) findData = getValueByValue(child.repeatData[dataKey], newWatchData, dataKey);
          });
          if (findData) compileUtil.repeatUpdater(child, findData, restRepeat.value, vm);
        } else throw new Error(`dirctive nv-repeat can't use ${newWatchData}`);

        // remove child from _newContainerFragment.childNodes
        if (_newContainerFragment.childNodes.indexOf(child) !== -1) _newContainerFragment.childNodes.splice(_newContainerFragment.childNodes.indexOf(child), 1);
      } else {
        // if isn't repeat vnode, we repeat it's children
        this.repeatChildrenUpdater(child, vm);
      }
    });
    // push repeat child into vnode.childNodes
    _fragmentList.forEach(_fragmentObject => {
      if (vnode.childNodes.indexOf(_fragmentObject.originChild) !== -1) vnode.childNodes.splice(vnode.childNodes.indexOf(_fragmentObject.originChild), 0, ..._fragmentObject.container.childNodes);
    });
    // remove child from vnode.childNodes
    _fragmentList.forEach(_fragmentObject => {
      if (vnode.childNodes.indexOf(_fragmentObject.originChild) !== -1) vnode.childNodes.splice(vnode.childNodes.indexOf(_fragmentObject.originChild), 1);
    });
  }

  /**
   * compile event and build eventType in Vnode
   *
   * @param {Vnode} vnode
   * @param {*} vm
   * @param {string} exp
   * @param {string} eventName
   * @memberof Compile
   */
  public eventHandler(vnode: Vnode, vm: any, exp: string, eventName: string): void {
    const eventType = eventName.split(':')[1];

    const fn = getVMFunction(vm, exp);

    const args = exp.match(/\((.*)\)/)[1].replace(/\s+/g, '').split(',');

    const func = function (event: Event): void {
      const argsList: any[] = [];
      args.forEach(arg => {
        if (arg === '') return false;
        if (arg === '$event') return argsList.push(event);
        if (arg === '$element' && event.target) return argsList.push(event.target);
        if (arg === 'true' || arg === 'false') return argsList.push(arg === 'true');
        if (arg === 'null') return argsList.push(null);
        if (arg === 'undefined') return argsList.push(undefined);
        if (isFromVM(vm, arg)) return argsList.push(getVMVal(vm, arg));
        if (/^\'.*\'$/.test(arg)) return argsList.push(arg.match(/^\'(.*)\'$/)[1]);
        if (/^\".*\"$/.test(arg)) return argsList.push(arg.match(/^\"(.*)\"$/)[1]);
        if (!/^\'.*\'$/.test(arg) && !/^\".*\"$/.test(arg) && /(^[-,+]?\d+$)|(^[-, +]?\d+\.\d+$)/.test(arg)) return argsList.push(Number(arg));
      });

      const saveWatchStatus = (vm as IComponent).$watchStatus;
      if (saveWatchStatus === 'available') (vm as IComponent).$watchStatus = 'pending';

      fn.apply(vm, argsList);

      if (saveWatchStatus === 'available') {
        (vm as IComponent).$watchStatus = 'available';
        if ((vm as IComponent).$isWaitingRender && (vm as IComponent).nvDoCheck) (vm as IComponent).nvDoCheck();
        if ((vm as IComponent).$isWaitingRender) {
          (vm as IComponent).render();
          (vm as IComponent).$isWaitingRender = false;
        }
      }
    };
    if (eventType && fn) {
      const sameEventType = vnode.eventTypes.find(_eventType => _eventType.type === eventType);
      if (sameEventType) {
        sameEventType.handler = func;
        sameEventType.token = fn;
      }
      if (!sameEventType) vnode.eventTypes.push({
        type: eventType,
        handler: func,
        token: fn,
      });
    }
  }

  /**
   * handler props
   *
   * @param {Vnode} vnode
   * @param {*} vm
   * @param {TAttributes} attr
   * @param {string} prop
   * @memberof CompileUtil
   */
  public propHandler(vnode: Vnode, vm: any, attr: TAttributes): void {
    const prop = /^\{(.+)\}$/.exec(attr.value);
    if (prop) {
      const propValue = prop[1];
      let _prop = null;
      if (/^.*\(.*\)$/.test(propValue)) {
        const fn = getVMFunction(vm, propValue);
        const args = propValue.match(/\((.*)\)/)[1].replace(/\s+/g, '').split(',');
        const argsList: any[] = [];
        args.forEach(arg => {
          if (arg === '') return false;
          if (arg === '$element') return argsList.push(vnode.nativeElement);
          if (arg === 'true' || arg === 'false') return argsList.push(arg === 'true');
          if (arg === 'null') return argsList.push(null);
          if (arg === 'undefined') return argsList.push(undefined);
          if (isFromVM(vm, arg)) return argsList.push(getVMVal(vm, arg));
          if (/^\'.*\'$/.test(arg)) return argsList.push(arg.match(/^\'(.*)\'$/)[1]);
          if (/^\".*\"$/.test(arg)) return argsList.push(arg.match(/^\"(.*)\"$/)[1]);
          if (!/^\'.*\'$/.test(arg) && !/^\".*\"$/.test(arg) && /(^[-,+]?\d+$)|(^[-, +]?\d+\.\d+$)/g.test(arg)) return argsList.push(Number(arg));
          if (vnode.repeatData) {
            // $index in this
            Object.keys(vnode.repeatData).forEach(data => {
              if (arg === data || arg.indexOf(`${data}.`) === 0) return argsList.push(getValueByValue(vnode.repeatData[data], arg, data));
            });
          }
        });
        const value = fn.apply(vm, argsList);
        attr.nvValue = value;
        return;
      }
      const valueList = propValue.split('.');
      const key = valueList[0];
      if (isFromVM(vm, propValue)) {
        _prop = getVMVal(vm, propValue);
        attr.nvValue = buildProps(_prop, vm);
        return;
      }
      if (vnode.repeatData && vnode.repeatData.hasOwnProperty(key)) {
        _prop = getValueByValue(vnode.repeatData[key], propValue, key);
        attr.nvValue = buildProps(_prop, vm);
        return;
      }
      if (/^\'.*\'$/.test(propValue)) {
        attr.nvValue = propValue.match(/^\'(.*)\'$/)[1];
        return;
      }
      if (/^\".*\"$/.test(propValue)) {
        attr.nvValue = propValue.match(/^\"(.*)\"$/)[1];
        return;
      }
      if (!/^\'.*\'$/.test(propValue) && !/^\".*\"$/.test(propValue) && /(^[-,+]?\d+$)|(^[-, +]?\d+\.\d+$)/.test(propValue)) {
        attr.nvValue = Number(propValue);
        return;
      }
      if (propValue === 'true' || propValue === 'false') {
        attr.nvValue = (propValue === 'true');
        return;
      }
      if (propValue === 'null') {
        attr.nvValue = null;
        return;
      }
      if (propValue === 'undefined') {
        attr.nvValue = undefined;
        return;
      }
    }
  }

  public pipeHandler(oldExp: string, value: any, needCompileStringList: string[], vm: any, vnode: Vnode): any {
      let canCompileFlag = true;
      let fromVmValue = value;
      if (needCompileStringList.length > 1) {
        needCompileStringList.forEach((need, index) => {
          if (index !== 0) {
            const pipeArgusList: string[] = [];
            let pipeName = '';
            // need： test-pipe: 1:2 分离管道名和参数
            need.split(':').forEach((v, i) => {
              if (i === 0) pipeName = v.trim();
              else pipeArgusList.push(v.trim());
            });
            const argList: any[] = [];
            pipeArgusList.forEach(pipeArgu => {
              // 参数没准备好，不允许编译
              if (!valueIsReady(pipeArgu, vnode, vm)) {
                canCompileFlag = false;
                return;
              }
              let pipeArguValue = null;
              if (isFromVM(vm, pipeArgu)) pipeArguValue = getVMVal(vm, pipeArgu);
              else if (/^\'.*\'$/.test(pipeArgu)) pipeArguValue = pipeArgu.match(/^\'(.*)\'$/)[1];
              else if (/^\".*\"$/.test(pipeArgu)) pipeArguValue = pipeArgu.match(/^\"(.*)\"$/)[1];
              else if (!/^\'.*\'$/.test(pipeArgu) && !/^\".*\"$/.test(pipeArgu) && /(^[-,+]?\d+$)|(^[-, +]?\d+\.\d+$)/g.test(pipeArgu)) pipeArguValue = Number(pipeArgu);
              else if (pipeArgu === 'true' || pipeArgu === 'false') pipeArguValue = (pipeArgu === 'true');
              else if (pipeArgu === 'null') pipeArguValue = null;
              else if (pipeArgu === 'undefined') pipeArguValue = undefined;
              else if (vnode.repeatData) {
                Object.keys(vnode.repeatData).forEach(data => {
                  if (pipeArgu === data || pipeArgu.indexOf(`${data}.`) === 0) pipeArguValue = getValueByValue(vnode.repeatData[data], pipeArgu, data);
                });
              }
              argList.push(pipeArguValue);
            });
            // 如果管道参数可以渲染则获取管道结果
            if (canCompileFlag) {
              // 通过组件中的$declarationMap获取管道实例
              const PipeClass = vm.$declarationMap.get(pipeName);
              // 获取管道实例
              const pipeInstance =  buildPipeScope(PipeClass, vm.$nativeElement, vm);
              // 调用管道的transform方法
              if (!pipeInstance.transform) throw Error(`Pipe ${pipeName} don't implement the method 'transform'`);
              fromVmValue = pipeInstance.transform(value, ...argList);
            }
          }
        });
      }
      if (canCompileFlag) return fromVmValue;
      else return oldExp;
  }
}
