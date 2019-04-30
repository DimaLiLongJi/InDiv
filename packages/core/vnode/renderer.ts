import { Vnode } from './vnode';
import { ParseOptions } from './parse';

/**
 * Renderer in Indiv
 * 
 * can rewrite your Render for different platform
 * 
 * if you want to rewirte a renderer, please implements this abstract class
 *
 * @export
 * @abstract
 * @class Renderer
 */
export abstract class Renderer {
  /**
   * parse nativeElement to Vnode[]
   *
   * @abstract
   * @param {*} nativeElement
   * @param {ParseOptions} [parseVnodeOptions]
   * @returns {Vnode[]}
   * @memberof Renderer
   */
  public abstract nativeElementToVnode(nativeElement: any, parseVnodeOptions?: ParseOptions): Vnode[];

  /**
   * get nativeElements by TagName
   *
   * @abstract
   * @param {string} name
   * @param {*} [master]
   * @returns {*}
   * @memberof Renderer
   */
  public abstract getElementsByTagName(name: string, master?: any): any;

  /**
   * get nativeElement by cssSelector
   * 
   * getElementByQuery(cssSelector, master) as master.querySelector(cssSelector)
   *
   * cssSelector is standard css-selectors
   * 
   * @abstract
   * @param {string} query
   * @param {*} [master]
   * @returns {*}
   * @memberof Renderer
   */
  public abstract getElementByQuery(cssSelector: string, master?: any): any;

  /**
   * get nativeElements by cssSelector
   *
   * getAllElementsByQuery(cssSelector, master) as master.querySelectorAll(cssSelector)
   *
   * cssSelector is standard css-selectors
   *
   * @abstract
   * @param {string} cssSelector
   * @param {*} [master]
   * @returns {*}
   * @memberof Renderer
   */
  public abstract getAllElementsByQuery(cssSelector: string, master?: any): any;

  /**
   * check nativeElement has childnodes or not
   *
   * @abstract
   * @param {*} nativeElement
   * @returns {boolean}
   * @memberof Renderer
   */
  public abstract hasChildNodes(nativeElement: any): boolean;

  /**
   * get childnodes by nativeElement
   *
   * @abstract
   * @param {*} nativeElement
   * @returns {any[]}
   * @memberof Renderer
   */
  public abstract getChildNodes(nativeElement: any): any[];

  /**
   * remove child from nativeElement
   *
   * @abstract
   * @param {*} parent
   * @param {*} child
   * @memberof Renderer
   */
  public abstract removeChild(parent: any, child: any): void;

  /**
   * append child to nativeElement
   *
   * @abstract
   * @param {*} parent
   * @param {*} child
   * @memberof Renderer
   */
  public abstract appendChild(parent: any, child: any): void;

  /**
   * insert child to nativeElement by index
   *
   * @abstract
   * @param {*} parent
   * @param {*} child
   * @param {number} index
   * @memberof Renderer
   */
  public abstract insertBefore(parent: any, child: any, index: number): void;

  /**
   * check parent nativeElement is containted with child nativeElement
   *
   * @abstract
   * @param {*} parent
   * @param {*} child
   * @returns {boolean}
   * @memberof Renderer
   */
  public abstract isContainted(parent: any, child: any): boolean;

  /**
   * create nativeElement by tagName
   *
   * @abstract
   * @param {string} tagName
   * @returns {*}
   * @memberof Renderer
   */
  public abstract creatElement(tagName: string): any;

  /**
   * create nativeTextElement by value
   *
   * @abstract
   * @param {string} value
   * @returns {*}
   * @memberof Renderer
   */
  public abstract creatTextElement(value: string): any;

  /**
   * create nativeCommentElement by value
   *
   * @abstract
   * @param {string} value
   * @returns {*}
   * @memberof Renderer
   */
  public abstract creatCommentElement(value: string): any;

  /**
   * get attribute by name from nativeElement
   *
   * @abstract
   * @param {*} element
   * @param {string} name
   * @returns {*}
   * @memberof Renderer
   */
  public abstract getAttribute(element: any, name: string): any;

  /**
   * set attribute to nativeElement
   *
   * @abstract
   * @param {*} element
   * @param {string} name
   * @param {*} value
   * @memberof Renderer
   */
  public abstract setAttribute(element: any, name: string, value: any): void;

  /**
   * set nv attribute to nativeElement 
   *
   * @abstract
   * @param {*} element
   * @param {string} name
   * @param {*} value
   * @memberof Renderer
   */
  public abstract setNvAttribute(element: any, name: string, value: any): void;

  /**
   * remove attribute from nativeElement
   *
   * @abstract
   * @param {*} element
   * @param {string} name
   * @param {*} [value]
   * @memberof Renderer
   */
  public abstract removeAttribute(element: any, name: string, value?: any): void;

  /**
   * remove nv attribute from nativeElement
   *
   * @abstract
   * @param {*} element
   * @param {string} name
   * @param {*} [value]
   * @memberof Renderer
   */
  public abstract removeNvAttribute(element: any, name: string, value?: any): void;

  /**
   * set nodeValue to nativeElement
   *
   * @abstract
   * @param {*} element
   * @param {*} nodeValue
   * @memberof Renderer
   */
  public abstract setNodeValue(element: any, nodeValue: any): void;

  /**
   * set value to nativeElement like input
   *
   * @abstract
   * @param {*} element
   * @param {*} value
   * @memberof Renderer
   */
  public abstract setValue(element: any, value: any): void;

  /**
   * remove eventListener from nativeElement
   *
   * @abstract
   * @param {*} element
   * @param {string} eventType
   * @param {*} handler
   * @memberof Renderer
   */
  public abstract removeEventListener(element: any, eventType: string, handler: any): void;

  /**
   * add eventListener from nativeElement
   *
   * @abstract
   * @param {*} element
   * @param {string} eventType
   * @param {*} handler
   * @memberof Renderer
   */
  public abstract addEventListener(element: any, eventType: string, handler: any): void;

  /**
   * set a style to nativeElement
   *
   * @abstract
   * @param {*} element
   * @param {string} name
   * @param {*} value
   * @memberof Renderer
   */
  public abstract setStyle(element: any, name: string, value: any): void;

  /**
   * remove a style to nativeElement
   *
   * @abstract
   * @param {*} element
   * @param {string} name
   * @memberof Renderer
   */
  public abstract removeStyle(element: any, name: string): void;

  /**
   * get a style from nativeElement
   *
   * @abstract
   * @param {*} element
   * @param {string} name
   * @memberof Renderer
   */
  public abstract getStyle(element: any, name: string): void;
}
