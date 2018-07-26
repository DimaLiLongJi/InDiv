import { IPatchList } from './virtualDOM';
import { IUtil } from './utils';
import { ICompileUtil } from './compileUtils';

export interface ICompile {
    utils: IUtil;
    $vm: any;
    $el: Element;
    $fragment: DocumentFragment;

    init(): void;
    compileElement(fragment: DocumentFragment): void;
    recursiveDOM(childNodes: NodeListOf<Node & ChildNode>, fragment: DocumentFragment | Element): void;
    compile(node: Element, fragment: DocumentFragment | Element): void;
    node2Fragment(el: Element): DocumentFragment;
    compileText(node: Element, exp: string): void;
    eventHandler(node: Element, vm: any, exp: string, eventName: string): void;
    isDirective(attr: string): boolean;
    isEventDirective(eventName: string): boolean;
    isElementNode(node: Element | string): boolean;
    isRepeatNode(node: Element): boolean;
    isIfNode(node: Element): boolean;
    isTextNode(node: Element): boolean;
}