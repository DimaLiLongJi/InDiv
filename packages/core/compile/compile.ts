import { parseTemplateToVnode, Vnode, ParseOptions, IPatchList, diffVnode, patchVnode, isRepeatNode, isElementNode, isTextNode, isDirective, isEventDirective, isPropOrNvDirective, isTagName } from '../vnode';
import { argumentsIsReady, valueIsReady, cloneVnode } from './utils';
import { CompileUtil } from './compile-utils';
import { IComponent } from '../types';

/**
 * main compiler
 *
 * @class Compile
 */
export class Compile {
  public componentInstance: IComponent;
  public mountedElement: any;
  public fragment: Vnode[];
  public saveVnode: Vnode[];
  public parseVnodeOptions: ParseOptions;

  /**
   * Creates an instance of Compile.
   * @param {any} el
   * @param {*} componentInstance
   * @memberof Compile
   */
  constructor(el: any, componentInstance: IComponent) {
    this.componentInstance = componentInstance;
    this.mountedElement = el;
    if (componentInstance.$parseVnodeOptions) this.parseVnodeOptions = componentInstance.$parseVnodeOptions;
    if (componentInstance.$saveVnode) this.saveVnode = componentInstance.$saveVnode;
  }

  /**
   * start compile and change saveVnode
   *
   * will return the newest vnode[]
   *
   * @returns {Vnode[]}
   * @memberof Compile
   */
  public startCompile(): Vnode[] {
    if (!this.mountedElement) throw new Error('class Compile need el in constructor');
    this.fragment = parseTemplateToVnode('');

    if (!this.saveVnode) this.saveVnode = this.componentInstance.$indivInstance.getRenderer.nativeElementToVnode(this.mountedElement, this.parseVnodeOptions);

    this.compileVnode(this.componentInstance.$templateVnode);

    const patchList: IPatchList[] = [];
    this.fragment.forEach(child => child.parentVnode = { nativeElement: this.mountedElement });

    diffVnode({ childNodes: this.saveVnode, nativeElement: this.mountedElement, parentVnode: null }, { childNodes: this.fragment, nativeElement: this.mountedElement, parentVnode: null }, patchList);
    patchVnode(patchList, this.componentInstance.$indivInstance.getRenderer);

    this.fragment = null;

    return this.saveVnode;
  }

  /**
   * compile vnode
   *
   * @memberof Compile
   */
  public compileVnode(vnodes: Vnode[]): void {
    this.recursiveDOM(vnodes, this.fragment, null);
  }

  /**
   * recursive DOM for New State
   *
   * @param {Vnode[]} vnodes
   * @param {Vnode[]} fragment
   * @param {Vnode} parent
   * @memberof Compile
   */
  public recursiveDOM(vnodes: Vnode[], fragment: Vnode[], parent: Vnode): void {
    vnodes.forEach((vnode: Vnode) => {

      const _fragmentChild = new Vnode(vnode);
      // 因为当不上循环node时候将不会递归创建新vnode了
      if (!isRepeatNode(_fragmentChild)) _fragmentChild.childNodes = [];
      if (parent) {
        _fragmentChild.parentVnode = parent;
        vnode.parentVnode = parent;
      }
      fragment.push(_fragmentChild);

      // 要用新的编译
      if (vnode.childNodes && vnode.childNodes.length > 0 && !isRepeatNode(vnode)) this.recursiveDOM(vnode.childNodes, _fragmentChild.childNodes, _fragmentChild);

      const text = _fragmentChild.template;
      const reg = /\{\{(.*)\}\}/g;
      if (isElementNode(_fragmentChild)) this.compile(_fragmentChild, fragment);

      if (isTextNode(_fragmentChild) && reg.test(text)) {
        const textList = text.match(/(\{\{[^\{\}]+?\}\})/g);
        const length = textList.length;
        if (textList && length > 0) {
          for (let i = 0; i < length; i++) this.compileText(_fragmentChild, textList[i]);
        }
      }

      // after compile repeatNode, remove repeatNode
      if (isRepeatNode(_fragmentChild) && fragment.indexOf(_fragmentChild) !== -1) fragment.splice(fragment.indexOf(_fragmentChild), 1);

      // 如果是 <nv-content> 则内部来自父组件
      if (isTagName(_fragmentChild, 'nv-content')) _fragmentChild.childNodes = this.componentInstance.$nvContent.map(content => cloneVnode(content, null, _fragmentChild));
    });
  }

  /**
   * compile string to DOM
   *
   * @param {Vnode} vnode
   * @param {Vnode[]} fragment
   * @memberof Compile
   */
  public compile(vnode: Vnode, fragment: Vnode[]): void {
    const nodeAttrs = vnode.attributes;
    if (nodeAttrs) {
      nodeAttrs.forEach(attr => {
        const attrName = attr.name;
        const exp = attr.value;
        const dir = attrName.substring(3);

        const compileUtil = new CompileUtil(fragment);
        if (isDirective(attr.type) && valueIsReady(exp, vnode, this.componentInstance)) compileUtil.bind(vnode, this.componentInstance, exp, dir);
        if (isEventDirective(attr.type) && valueIsReady(exp, vnode, this.componentInstance)) compileUtil.eventHandler(vnode, this.componentInstance, exp, dir);
        if (isPropOrNvDirective(attr.type)) {
          const _exp = /^\{(.+)\}$/.exec(exp)[1];
          if (valueIsReady(_exp, vnode, this.componentInstance) && argumentsIsReady(_exp, vnode, this.componentInstance)) compileUtil.propHandler(vnode, this.componentInstance, attr);
        }
      });
    }
  }

  /**
   * compile text and use CompileUtil templateUpdater
   *
   * @param {Vnode} vnode
   * @param {string} exp
   * @memberof Compile
   */
  public compileText(vnode: Vnode, exp: string): void {
    new CompileUtil().templateUpdater(vnode, this.componentInstance, exp);
  }
}
