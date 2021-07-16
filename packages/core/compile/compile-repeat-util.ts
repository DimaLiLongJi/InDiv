import { IComponent } from '../types';
import { Vnode, TAttributes } from "../vnode";
import { isFromVM, buildProps, argumentsIsReady, getVMFunctionArguments, getValueByValue, getVMVal, getVMFunction, setVMVal, valueIsReady } from './utils';
import { ChangeDetectionStrategy } from '../component';
import { buildPipeScope } from './compiler-utils';

/**
 * compile util for nv-repeat DOM
 *
 * @export
 * @class CompileRepeatUtil
 */
export class CompileRepeatUtil {
  public fragment?: Vnode[];

  /**
   * Creates an instance of CompileRepeatUtil.
   *
   * @param {Vnode[]} [fragment]
   * @memberof CompileRepeatUtil
   */
  constructor(fragment?: Vnode[]) {
    this.fragment = fragment;
  }

  /**
   * get value by repeat value
   *
   * @param {*} val
   * @param {string} exp
   * @param {string} key
   * @returns {*}
   * @memberof CompileRepeatUtil
   */
  public _getVMRepeatVal(val: any, exp: string, key: string): any {
    let value: any;
    const valueList = exp.replace(/\(.*\)/, '').split('.');
    valueList.forEach((v, index) => {
      if (v === key && index === 0) {
        value = val;
        return;
      }
      value = value[v];
    });
    return value;
  }

  /**
   * set value by key and anthor value
   *
   * @param {*} vm
   * @param {string} exp
   * @param {string} key
   * @param {*} setValue
   * @returns {*}
   * @memberof CompileRepeatUtil
   */
  public _setValueByValue(vm: any, exp: string, key: string, setValue: any): any {
    const valueList = exp.replace(/\(.*\)/, '').split('.');
    let value = vm;
    let lastKey;
    valueList.forEach((v, index) => {
      if (v === key && index === 0) return lastKey = v;
      if (index < valueList.length) lastKey = v;
      if (index < valueList.length - 1) value = value[v];
    });
    if (lastKey) value[lastKey] = setValue;
  }

  /**
   * bind handler for nv irective
   *
   * @param {Vnode} vnode
   * @param {string} [key]
   * @param {string} [dir]
   * @param {string} [exp]
   * @param {number} [index]
   * @param {*} [vm]
   * @param {*} [watchValue]
   * @memberof CompileRepeatUtil
   */
  public bind(vnode: Vnode, key?: string, dir?: string, exp?: string, index?: number, vm?: any, watchValue?: any, val?: any): void {
    const repeatValue = vnode.repeatData[key];
    let value;
    const needCompileStringList = exp.split('|').map(v => v.trim());
    const needCompileValue = needCompileStringList[0];
    if (/^.*\(.*\)$/.test(needCompileValue)) {
      if (dir === 'model') throw new Error(`directive: nv-model can't use ${needCompileValue} as value`);
      // if Function() need function return value
      const fn = getVMFunction(vm, needCompileValue);
      const argsList = getVMFunctionArguments(vm, needCompileValue, vnode);
      value = this.pipeHandler(exp, fn.apply(vm, argsList), needCompileStringList, vm, vnode);
      // repeat value
    } else if (needCompileValue === key || needCompileValue.indexOf(`${key}.`) === 0) {
      value = this.pipeHandler(exp, this._getVMRepeatVal(repeatValue, needCompileValue, key), needCompileStringList, vm, vnode);
    }
    // normal value
    else if (isFromVM(vm, needCompileValue)) value = this.pipeHandler(exp, getVMVal(vm, needCompileValue), needCompileStringList, vm, vnode);
    else if (needCompileValue === '$index') value = index;
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
    } else throw new Error(`directive: nv-${dir} can't use recognize this value ${needCompileValue}`);

    if (!vnode.childNodes || vnode.childNodes.length === 0) this.templateUpdater(vnode, repeatValue, key, vm);

    switch (dir) {
      case 'model': {
        let watchData;
        // 如果观察数据来自当前要渲染的重复key
        if (needCompileValue === key || needCompileValue.indexOf(`${key}.`) === 0) {
          watchData = watchValue;
          this.modelUpdater(vnode, value, needCompileValue, key, index, watchData, vm);
          // 如果观察数据来自当前要组件实例
        } else if (isFromVM(vm, needCompileValue)) {
          watchData = this.pipeHandler(exp, getVMVal(vm, needCompileValue), needCompileStringList, vm, vnode);
          this.modelUpdater(vnode, value, needCompileValue, key, index, watchData, vm);
        }
        break;
      }
      case 'text': {
        this.textUpdater(vnode, value);
        break;
      }
      case 'if': {
        this.ifUpdater(vnode, value, vm);
        break;
      }
      case 'if-not': {
        this.ifNotUpdater(vnode, value, vm);
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

  /**
   * update text for {{}}
   *
   * @param {Vnode} vnode
   * @param {*} [val]
   * @param {string} [key]
   * @param {*} [vm]
   * @memberof CompileRepeatUtil
   */
  public templateUpdater(vnode: Vnode, val?: any, key?: string, vm?: any): void {
    const text = vnode.nodeValue;
    const reg = /\{\{(.*)\}\}/g;
    if (reg.test(text)) {
      const textList = text.match(/(\{\{[^\{\}]+?\}\})/g);
      if (textList && textList.length > 0) {
        for (let i = 0; i < textList.length; i++) {
          const exp = textList[i].replace('{{', '').replace('}}', '');
          const needCompileStringList = exp.split('|').map(v => v.trim());
          const needCompileValue = needCompileStringList[0];

          if (/^.*\(.*\)$/.test(needCompileValue) && argumentsIsReady(needCompileValue, vnode, vm)) {
            const fn = getVMFunction(vm, needCompileValue);
            const argsList = getVMFunctionArguments(vm, needCompileValue, vnode);
            const fromVmValue = this.pipeHandler(textList[i], fn.apply(vm, argsList), needCompileStringList, vm, vnode);
            vnode.nodeValue = vnode.nodeValue.replace(textList[i], fromVmValue);
          } else if (needCompileValue === key || needCompileValue.indexOf(`${key}.`) === 0) {
            const fromVmValue = this.pipeHandler(textList[i], this._getVMRepeatVal(val, needCompileValue, key), needCompileStringList, vm, vnode);
            vnode.nodeValue = vnode.nodeValue.replace(textList[i], fromVmValue);
          } else if (isFromVM(vm, needCompileValue)) {
            const fromVmValue = this.pipeHandler(textList[i], getVMVal(vm, needCompileValue), needCompileStringList, vm, vnode);
            vnode.nodeValue = vnode.nodeValue.replace(textList[i], fromVmValue);
          } else if (vnode.repeatData) {
            Object.keys(vnode.repeatData).forEach(data => {
              if (needCompileValue === data || needCompileValue.indexOf(`${data}.`) === 0) {
                const fromVmValue = this.pipeHandler(textList[i], getValueByValue(vnode.repeatData[data], needCompileValue, data), needCompileStringList, vm, vnode);
                vnode.nodeValue = vnode.nodeValue.replace(textList[i], fromVmValue);
              }
            });
          } else throw new Error(`directive: {{${needCompileValue}}} can\'t use recognize ${needCompileValue}`);
        }
      }
    }
  }

  /**
   * update value of input for nv-model
   *
   * @param {Vnode} vnode
   * @param {*} value
   * @param {string} exp
   * @param {string} key
   * @param {number} index
   * @param {*} watchData
   * @param {*} vm
   * @memberof CompileRepeatUtil
   */
  public modelUpdater(vnode: Vnode, value: any, exp: string, key: string, index: number, watchData: any, vm: any): void {
    vnode.value = typeof value === 'undefined' ? '' : value;
    const findAttribute = vnode.attributes.find(attr => attr.name === 'nv-model');
    findAttribute.nvValue = (typeof value === 'undefined' ? '' : value);

    const utilVm = this;
    const func = function (event: Event): void {
      event.preventDefault();
      if (isFromVM(vm, exp)) {
        if ((event.target as HTMLInputElement).value === watchData) return;
        setVMVal(vm, exp, (event.target as HTMLInputElement).value);
      } else if (exp === key || exp.indexOf(`${key}.`) === 0) {
        if (typeof watchData[index] !== 'object') watchData[index] = (event.target as HTMLInputElement).value;
        if (typeof watchData[index] === 'object') {
          let vals = getValueByValue(watchData[index], exp, key);
          vals = (event.target as HTMLInputElement).value;
          utilVm._setValueByValue(watchData[index], exp, key, vals);
        }
      } else throw new Error(`directive: nv-model can\'t use recognize this prop ${exp}`);
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
   * @memberof CompileRepeatUtil
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
   * remove or show DOM for nv-if
   *
   * @param {Vnode} vnode
   * @param {*} value
   * @param {*} vm
   * @memberof CompileRepeatUtil
   */
  public ifUpdater(vnode: Vnode, value: any, vm: any): void {
    const valueOfBoolean = Boolean(value);
    if (!valueOfBoolean && vnode.parentVnode.childNodes.indexOf(vnode) !== -1) vnode.parentVnode.childNodes.splice(vnode.parentVnode.childNodes.indexOf(vnode), 1);
    if (valueOfBoolean) {
      const findAttribute = vnode.attributes.find(attr => attr.name === 'nv-if');
      findAttribute.nvValue = valueOfBoolean;
    }
  }

  /**
   * remove or show DOM for nv-if-not
   *
   * @param {Vnode} vnode
   * @param {*} value
   * @param {*} vm
   * @memberof CompileRepeatUtil
   */
  public ifNotUpdater(vnode: Vnode, value: any, vm: any): void {
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
   * @memberof CompileRepeatUtil
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
   * update value of repeat node for nv-value
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
   * compile event and build eventType in DOM
   *
   * @param {Vnode} vnode
   * @param {*} vm
   * @param {string} exp
   * @param {string} eventName
   * @param {string} key
   * @param {*} val
   * @memberof CompileRepeatUtil
   */
  public eventHandler(vnode: Vnode, vm: any, exp: string, eventName: string, key: string, val: any): void {
    const eventType = eventName.split(':')[1];

    const fn = getVMFunction(vm, exp);
    const args = exp.match(/\((.*)\)/)[1].replace(/\s+/g, '').split(',');

    const utilVm = this;
    const func = function (event: Event): any {
      const argsList: any[] = [];
      args.forEach(arg => {
        if (arg === '') return false;
        if (arg === '$event') return argsList.push(event);
        if (arg === '$element') return argsList.push(event.target);
        if (arg === 'true' || arg === 'false') return argsList.push(arg === 'true');
        if (arg === 'null') return argsList.push(null);
        if (arg === 'undefined') return argsList.push(undefined);
        if (isFromVM(vm, arg)) return argsList.push(getVMVal(vm, arg));
        if (/^\'.*\'$/.test(arg)) return argsList.push(arg.match(/^\'(.*)\'$/)[1]);
        if (/^\".*\"$/.test(arg)) return argsList.push(arg.match(/^\"(.*)\"$/)[1]);
        if (!/^\'.*\'$/.test(arg) && !/^\".*\"$/.test(arg) && /(^[-,+]?\d+$)|(^[-, +]?\d+\.\d+$)/.test(arg)) return argsList.push(Number(arg));
        if (arg === key || arg.indexOf(`${key}.`) === 0) return argsList.push(utilVm._getVMRepeatVal(val, arg, key));
        if (vnode.repeatData) {
          // $index in this
          Object.keys(vnode.repeatData).forEach(data => {
            if (arg === data || arg.indexOf(`${data}.`) === 0) return argsList.push(getValueByValue(vnode.repeatData[data], arg, data));
          });
        }
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
   * handle prop
   *
   * @param {Vnode} vnode
   * @param {*} vm
   * @param {TAttributes} attr
   * @param {string} prop
   * @memberof CompileRepeatUtil
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
          })
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
