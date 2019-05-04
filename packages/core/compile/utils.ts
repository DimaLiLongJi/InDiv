import { Vnode } from '../vnode';
import { IComponent } from '../types';
import { utils } from '../utils';

/**
 * get function from vm
 *
 * @export
 * @param {*} vm
 * @param {string} exp
 * @returns {Function}
 */
export function getVMFunction(vm: any, exp: string): Function {
  const fnList = exp.replace(/\(.*\)/, '').split('.');
  let fn = vm;
  fnList.forEach(f => {
    fn = fn[f];
  });
  return fn as Function;
}

/**
 * check arguments from function is ready to be used
 *
 * @export
 * @param {string} exp
 * @param {Vnode} vnode
 * @param {*} vm
 * @returns {boolean}
 */
export function argumentsIsReady(exp: string, vnode: Vnode, vm: any): boolean {
  if (/^.*\(.*((\))|(\)\}))$/.test(exp)) {
    const args = exp.match(/\((.*)\)/)[1].replace(/\s+/g, '').split(',');
    let result = true;
    args.forEach(arg => {
      const _argKey = arg.split('.')[0];
      if (arg === '') return;
      if (arg === '$event') return;
      else if (arg === '$element') return;
      else if (arg === 'true' || arg === 'false') return;
      else if (arg === 'null') return;
      else if (arg === 'undefined') return;
      else if (/^\'.*\'$/.test(arg) || /^\".*\"$/.test(arg) || /(^[-,+]?\d+$)|(^[-, +]?\d+\.\d+$)/.test(arg)) return;
      else if (isFromVM(vm, arg)) return;
      else if (vnode.repeatData && vnode.repeatData.hasOwnProperty(_argKey)) return;
      else result = false;
    });
    return result;
  } else return true;
}

/**
 * check value is ready to be used
 *
 * @export
 * @param {string} exp
 * @param {Vnode} vnode
 * @param {*} vm
 * @returns {boolean}
 */
export function valueIsReady(exp: string, vnode: Vnode, vm: any): boolean {
  if (/^.*\(.*((\))|(\)\}))$/.test(exp)) return true;
  else {
    let _exp: string;
    if (/^[^\s]+\sin\s[^\s]+$/.test(exp)) { // is nv-repeat
      const _value = exp.split(' in ')[1];
      if (!_value) throw new Error(`directive nv-repeat 's expression ${exp} is wrong!`);
      const value = _value.replace(/\s*/g, '');
      _exp = value.replace(/\(.*\)/, '').split('.')[0];
    } else _exp = exp.split('.')[0]; // is common dirctive

    if (_exp === '') return true;
    if (_exp === '$event') return true;
    if (_exp === '$element') return true;
    else if (_exp === 'true' || _exp === 'false') return true;
    else if (_exp === 'null') return true;
    else if (_exp === 'undefined') return true;
    else if (/^\'.*\'$/.test(_exp) || /^\".*\"$/.test(_exp) || /(^[-,+]?\d+$)|(^[-, +]?\d+\.\d+$)/.test(_exp)) return true;
    else if (isFromVM(vm, _exp)) return true;
    else if (vnode.repeatData && vnode.repeatData.hasOwnProperty(_exp)) return true;
    else return false;
  }
}

/**
 * get value from vm
 *
 * @export
 * @param {*} vm
 * @param {string} exp
 * @returns {*}
 */
export function getVMVal(vm: any, exp: string): any {
  const valueList = exp.replace(/\(.*\)/, '').split('.');
  let value = vm;
  valueList.forEach(v => {
    value = value[v];
  });
  return value;
}

/**
 * get value from other value
 *
 * @export
 * @param {*} vm
 * @param {string} exp
 * @param {string} key
 * @returns {*}
 */
export function getValueByValue(vm: any, exp: string, key: string): any {
  const valueList = exp.replace(/\(.*\)/, '').split('.');
  let value = vm;
  valueList.forEach((v, index) => {
    if (v === key && index === 0) return;
    value = value[v];
  });
  return value;
}

/**
 * get arguments from vm
 *
 * @export
 * @param {*} vm
 * @param {string} exp
 * @param {Vnode} vnode
 * @returns {any[]}
 */
export function getVMFunctionArguments(vm: any, exp: string, vnode: Vnode): any[] {
  const args = exp.match(/\((.*)\)/)[1].replace(/\s+/g, '').split(',');
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
    if (!/^\'.*\'$/.test(arg) && !/^\".*\"$/.test(arg) && /(^[-,+]?\d+$)|(^[-, +]?\d+\.\d+$)/.test(arg)) return argsList.push(Number(arg));
    if (vnode.repeatData) {
      // $index in this
      Object.keys(vnode.repeatData).forEach(key => {
        if (arg === key || arg.indexOf(`${key}.`) === 0) return argsList.push(getValueByValue(vnode.repeatData[key], arg, key));
      });
    }
  });
  return argsList;
}

/**
 * find exp is member of vm instance
 *
 * @param {*} vm
 * @param {string} exp
 * @returns {boolean}
 */
export function isFromVM(vm: any, exp: string): boolean {
  if (!vm) return false;
  const value = exp.replace(/\(.*\)/, '').split('.')[0];
  return value in vm;
}

/**
 * clone Vnode and clone it event
 *
 * event by attribute in DOM: eventTypes
 * repeat data by attribute in DOM: repeatData
 * isComponent: clone Component need add isComponent=true
 *
 * @export
 * @param {Vnode} vnode
 * @param {*} [repeatData]
 * @param {Vnode} [parentVnode]
 * @returns {Vnode}
 */
export function cloneVnode(vnode: Vnode, repeatData?: any, parentVnode?: Vnode): Vnode {
  const newVnode = new Vnode(vnode);
  if (repeatData) newVnode.repeatData = { ...repeatData };
  if (parentVnode) newVnode.parentVnode = parentVnode;
  copyRepeatData(newVnode, repeatData);
  copyParentVnode(newVnode);
  return newVnode;
}

/**
 * copy parentVnode from parentVnode to children
 *
 * @param {Vnode} vnode
 * @param {*} [repeatData]
 * @returns {void}
 */
export function copyParentVnode(vnode: Vnode): void {
  if (!vnode.childNodes || vnode.childNodes.length === 0) return;
  vnode.childNodes.forEach(child => {
    child.parentVnode = vnode;
    copyParentVnode(child);
  });
}

/**
 * copy repeatData from parentVnode to children
 *
 * @param {Vnode} vnode
 * @param {*} [repeatData]
 * @returns {void}
 */
export function copyRepeatData(vnode: Vnode, repeatData?: any): void {
  if (!vnode.childNodes || vnode.childNodes.length === 0) return;
  vnode.childNodes.forEach(child => {
    child.repeatData = { ...child.repeatData, ...repeatData };
    copyRepeatData(child, repeatData);
  });
}

/**
 * build props
 *
 * @param {*} prop
 * @param {IComponent} vm
 * @returns {*}
 * @memberof CompileUtil
 */
export function buildProps(prop: any, vm: IComponent): any {
  if (utils.isFunction(prop)) return prop.bind(vm);
  else return utils.deepClone(prop);
}

/**
 * set value from vm
 *
 * @export
 * @param {*} vm
 * @param {string} exp
 * @param {*} value
 */
export function setVMVal(vm: any, exp: string, value: any): void {
  let vmValue: any = null;
  const keyList = exp.split('.');
  if (keyList.length === 1) vm[exp] = value;
  else {
    keyList.forEach((key, index) => {
      if (index === 0) vmValue = vm[key];
      if (index !== 0 && index !== keyList.length - 1) vmValue = vmValue[key];
      if (index === keyList.length - 1) vmValue[key] = value;
    });
  }
}
