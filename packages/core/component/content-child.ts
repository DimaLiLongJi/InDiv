import { IComponent, ComponentList, DirectiveList } from '../types';
import { utils } from '../utils';
import { ElementRef } from './element-ref';
import { buildFoundMap } from './utils';

/**
 * for build @ContentChild in Component
 *
 * @param {IComponent} component
 * @returns {void}
 */
function buildContentChild(component: IComponent): void {
  if (!component.contentChildList) return;
  component.contentChildList.forEach(({ propertyName, selector }) => {
    if (typeof selector === 'string') {
      if (component.declarationMap.has(selector)) {
        const foundMap: ComponentList[] | DirectiveList[] = buildFoundMap(component, selector);
        if (!foundMap) return;
        const found = foundMap.find(value => ((value.constructorFunction as any).selector === selector) && value.isFromContent);
        if (found) component[propertyName] = found.instanceScope;
      } else {
        const content = component.$indivInstance.getRenderer.getElementByQuery('nv-content', component.nativeElement);
        if (!content) return; 
        const findElementRef = component.$indivInstance.getRenderer.getElementByQuery(selector, content);
        if (findElementRef) component[propertyName] = new ElementRef(findElementRef);
      }
    }
    if (utils.isFunction(selector)) {
      const foundMap: ComponentList[] | DirectiveList[] = buildFoundMap(component, selector);
      if (foundMap) component[propertyName] = foundMap.find(value => (value.constructorFunction === selector) && value.isFromContent).instanceScope;
    }
  });
}

/**
 * for build @ContentChildren in Component
 *
 * @param {IComponent} component
 * @returns {void}
 */
function buildContentChildren(component: IComponent): void {
  if (!component.contentChildrenList) return;
  component.contentChildrenList.forEach(({ propertyName, selector }) => {
    if (typeof selector === 'string') {
      if (component.declarationMap.has(selector)) {
        const foundMap: ComponentList[] | DirectiveList[] = buildFoundMap(component, selector);
        if (!foundMap) return;
        component[propertyName] = (foundMap as any[]).map(value => {
          if (((value.constructorFunction as any).selector === selector) && value.isFromContent) return value.instanceScope;
        });
      } else {
        const contents: any[] = component.$indivInstance.getRenderer.getAllElementsByQuery('nv-content', component.nativeElement);
        const propertyValues: any[] = [];
        Array.from(contents).forEach(content => {
          Array.from(component.$indivInstance.getRenderer.getAllElementsByQuery(selector, content)).forEach((findElementRef: any) => {
            propertyValues.push(new ElementRef(findElementRef));
          });
        });
        component[propertyName] = propertyValues;
      }
    }
    if (utils.isFunction(selector)) {
      const foundMap: ComponentList[] | DirectiveList[] = buildFoundMap(component, selector);
      if (foundMap) component[propertyName] = (foundMap as any[]).map(value => {
        if (value.constructorFunction === selector && value.isFromContent) return value.instanceScope;
      });
    }
  });
}

/**
 * for build @ContentChild and @ContentChildren in Component
 *
 * @export
 * @param {IComponent} component
 */
export function buildContentChildandChildren(component: IComponent): void {
  buildContentChild(component);
  buildContentChildren(component);
}

/**
 * use Decorator @ContentChild to select a DOM or Component/Directive instance from <nv-content>
 * 
 * usage:
 * 1. selector: string;
 *  if selector is a DOM tagName, @ContentChildren will select the first matched DOM
 *  if selector is a selector of Component or Directive, @ContentChildren will select the first matched Component/Directive instance
 * 2. selector: Function;
 *  if selector is a  Component or Directive, @ContentChildren will select the first matched Component/Directive instance
 *
 * @export
 * @param {(Function | string)} selector
 * @returns {(target: IComponent, propertyName: string) => any}
 */
export function ContentChild(selector: Function | string): (target: IComponent, propertyName: string) => any {
  return function (target: IComponent, propertyName: string): any {
    if (!target.contentChildList) target.contentChildList = [];
    target.contentChildList.push({ propertyName, selector });
    return target[propertyName];
  };
}

/**
 * use Decorator @ContentChildren to select a DOM or Component/Directive instance from <nv-content>
 * 
 * usage:
 * 1. selector: string;
 *  if selector is a DOM tagName, @ContentChildren will select all matched DOM
 *  if selector is a selector of Component or Directive, @ContentChildren will select all matched Component/Directive instances
 * 2. selector: Function;
 *  if selector is a  Component or Directive, @ContentChildren will select all matched Component/Directive instances
 *
 * @export
 * @param {(Function | string)} selector
 * @returns {(target: IComponent, propertyName: string) => any}
 */
export function ContentChildren(selector: Function | string): (target: IComponent, propertyName: string) => any {
  return function (target: IComponent, propertyName: string): any {
    if (!target.contentChildrenList) target.contentChildrenList = [];
    target.contentChildrenList.push({ selector, propertyName });
    return target[propertyName];
  };
}

