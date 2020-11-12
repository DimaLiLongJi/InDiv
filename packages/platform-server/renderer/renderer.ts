import { Renderer, Vnode, parseTemplateToVnode, ParseOptions } from '@indiv/core';
import { _document } from './document';

/**
 * get template from nativeElement
 *
 * @export
 * @param {Element} nativeElement
 * @returns {string}
 */
export function getTemplate(nativeElement: Element): string {
  const copyElement = nativeElement.cloneNode();
  const tagName = nativeElement.tagName.toLocaleLowerCase();
  let tmpNode = _document.createElement('div');
  tmpNode.appendChild(copyElement);
  const template = tmpNode.innerHTML;
  tmpNode = null;
  nativeElement = null;
  if (new RegExp(`^\<${tagName}.*\>\<\/${tagName}\>$`).test(template)) return template.split(`</${tagName}>`)[0];
  return template;
}

/**
 * parse nativeElement to vnode
 *
 * @export
 * @param {Element} nativeElement
 * @param {Vnode[]} vnodeList
 * @param {Vnode} parentVnode
 * @param {ParseOptions} [parseVnodeOptions]
 */
export function parseNativeElementToVnode(nativeElement: Element, vnodeList: Vnode[], parentVnode: Vnode, parseVnodeOptions?: ParseOptions): void {
  let type = 'text';
  if (nativeElement.nodeType === 1) type = 'tag';
  if (nativeElement.nodeType === 1 && nativeElement.tagName && parseVnodeOptions.components.indexOf(nativeElement.tagName.toLocaleLowerCase()) !== -1) type = 'component';

  let voidElement = false;
  if (type === 'text' || !nativeElement.hasChildNodes()) voidElement = true;

  const newVnode = new Vnode({
    tagName: type !== 'text' ? nativeElement.tagName.toLocaleLowerCase() : null,
    nativeElement,
    parentVnode,
    attributes: [],
    nodeValue: type === 'text' ? nativeElement.nodeValue : null,
    childNodes: type !== 'text' ? [] : null,
    type,
    value: type !== 'text' && (nativeElement.tagName.toLocaleLowerCase() === 'input' || nativeElement.tagName.toLocaleLowerCase() === 'textarea') ? (nativeElement as HTMLInputElement).value : null,
    repeatData: null,
    eventTypes: [],
    key: null,
    checked: false,
    voidElement, 
    template: type === 'text' ? nativeElement.nodeValue : getTemplate(nativeElement),
  });

  vnodeList.push(newVnode);
  if (type !== 'component' && nativeElement.hasChildNodes()) Array.from(nativeElement.childNodes).forEach(child => parseNativeElementToVnode(child as Element, newVnode.childNodes, newVnode, parseVnodeOptions));
}

/**
 * InDiv Render for paltform server
 *
 * @export
 * @class PlatfromServerRenderer
 * @extends {Renderer}
 */
export class PlatfromServerRenderer extends Renderer {
  public nativeElementToVnode(nativeElement: Element, parseVnodeOptions?: ParseOptions): Vnode[] {
    if (!nativeElement.hasChildNodes()) return parseTemplateToVnode(nativeElement.innerHTML, parseVnodeOptions);
    const vnodeList: Vnode[] = [];
    Array.from(nativeElement.childNodes).forEach(child => parseNativeElementToVnode(child as Element, vnodeList, null, parseVnodeOptions));
    return vnodeList;
  }

  public getElementsByTagName(name: string, master?: any): HTMLCollectionOf<Element> {
    if (master) return (master as Element).getElementsByTagName(name);
    else return _document.getElementsByTagName(name);
  }

  public getElementByQuery(name: string, master?: any): Element {
    if (master) return (master as Element).querySelector(name);
    else return _document.querySelector(name);
  }

  public getAllElementsByQuery(name: string, master?: any): NodeListOf<Element>  {
    if (master) return (master as Element).querySelectorAll(name);
    else return _document.querySelectorAll(name);
  }

  public hasChildNodes(nativeElement: Element): boolean {
    return nativeElement.hasChildNodes();
  }

  public getChildNodes(nativeElement: Element): Element[] {
    const childNodes: Element[] = [];
    if (nativeElement.hasChildNodes()) Array.from(nativeElement.childNodes).forEach(child => childNodes.push(child as Element));
    return childNodes;
  }

  public removeChild(parent: Element, child: Element): void {
    if (parent.contains(child)) {
      (parent as Element).removeChild(child as Element);
    }
  }

  public appendChild(parent: Element, child: Element): void {
    (parent as Element).appendChild(child as Element);
  }

  public insertBefore(parent: Element, child: Element, index: number): void {
    parent.insertBefore(child, parent.childNodes[index]);
  }

  public isContainted(parent: Element, child: Element): boolean {
    return parent.contains(child);
  }

  public creatElement(tagName: string): any {
    return _document.createElement(tagName.toLocaleUpperCase());
  }

  public creatTextElement(value: string): any {
    return _document.createTextNode(value);
  }

  public creatCommentElement(value: string): any {
    return _document.createComment(value);
  }

  public getAttribute(element: Element, name: string): string {
    return element.getAttribute(name);
  }

  public setNvAttribute(element: Element, name: string, value: any): void {
    const blackListAttr = ['nv-text', 'nv-if', 'nv-repeat', 'nv-model', 'nv-key'];
    if (blackListAttr.indexOf(name) !== -1) return;
    switch (name) {
      case 'nv-html': {
        element.innerHTML = typeof value === 'undefined' ? '' : value;
        break;
      }
      case 'nv-class': {
        if (Array.isArray(value)) element.classList.add(...value.map((_value: string) => String(_value).trim()));
        else if (String(value).trim()) element.classList.add(String(value).trim());
        break;
      }
      default: {
        const attrName = name.replace('nv-', '');
        element.setAttribute(attrName, value);
      }
    }
  }

  public setAttribute(element: Element, name: string, value: any): void {
    element.setAttribute(name, value);
  }

  public removeNvAttribute(element: Element, name: string, value?: any): void {
    const blackListAttr = ['nv-text', 'nv-if', 'nv-repeat', 'nv-model', 'nv-key'];
    if (blackListAttr.indexOf(name) !== -1) return;
    switch (name) {
      case 'nv-html': {
        element.innerHTML = '';
        break;
      }
      case 'nv-class': {
        if (Array.isArray(value)) element.classList.remove(...value.map((_value: string) => String(_value).trim()));
        else if (String(value).trim()) element.classList.remove(String(value).trim());
        break;
      }
      default: {
        const attrName = name.replace('nv-', '');
        element.removeAttribute(attrName);
      }
    }
  }

  public removeAttribute(element: Element, name: string, value?: any): void {
    element.removeAttribute(name);
  }

  public setNodeValue(element: Element, nodeValue: any): void {
    element.nodeValue = nodeValue;
  }

  public setValue(element: HTMLInputElement, value: any): void {
    element.value = value;
  }

  public removeEventListener(element: Element, eventType: string, handler: any): void {
    element.removeEventListener(eventType, handler);
  }

  public addEventListener(element: Element, eventType: string, handler: any): void {
    element.addEventListener(eventType, handler);
  }

  public setStyle(element: HTMLElement, name: string, value: any): void {
    element.style[name as any] = value;
  }

  public removeStyle(element: HTMLElement, name: string): void {
    element.style[name as any] = "";
  }

  public getStyle(element: HTMLElement, name: string): any {
    return element.style[name as any];
  }
}
