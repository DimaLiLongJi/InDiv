import { IComponent, IDirective } from '../types';
import { ElementRef } from '../component';
import { NvInstanceFactory } from '../di';

/**
 * build scope for Components in Component
 *
 * @export
 * @param {Function} ComponentClass
 * @param {*} inputs
 * @param {*} nativeElement
 * @param {IComponent} componentInstance
 * @returns {IComponent}
 */
export function buildComponentScope(ComponentClass: Function, inputs: any, nativeElement: any, componentInstance: IComponent): IComponent {
  const componentInjector = componentInstance.$privateInjector.fork();
  componentInjector.setProviderAndInstance(ElementRef, ElementRef, new ElementRef(nativeElement));
  const _component: IComponent = NvInstanceFactory(ComponentClass, componentInjector);

  // $saveInputs in @Component for save props states
  _component.$saveInputs = inputs;
  _component.$nativeElement = nativeElement;

  for (const key in inputs) {
    if (_component.$inputsList) {
      _component.$inputsList.forEach(({ propertyName, inputName }) => {
        if (inputName === key) (_component as any)[propertyName] = inputs[key];
      });
    }
  }

  componentInstance.$declarationMap.forEach((declaration, key) => {
    if (!_component.$declarationMap.has(key)) _component.$declarationMap.set(key, declaration);
  });

  return _component;
}

/**
 * build scope for Directives in Directive
 *
 * @export
 * @param {Function} DirectiveClass
 * @param {*} inputs
 * @param {*} nativeElement
 * @param {IComponent} componentInstance
 * @returns {IDirective}
 */
export function buildDirectiveScope(DirectiveClass: Function, inputs: any, nativeElement: any, componentInstance: IComponent): IDirective {
  const directiveInjector = componentInstance.$privateInjector.fork();
  directiveInjector.setProviderAndInstance(ElementRef, ElementRef, new ElementRef(nativeElement));
  const _directive: IDirective = NvInstanceFactory(DirectiveClass, directiveInjector);

  _directive.$saveInputs = inputs;
  _directive.$nativeElement = nativeElement;

  if (_directive.$inputsList) {
    _directive.$inputsList.forEach(({ propertyName, inputName }) => {
      if (inputName === (DirectiveClass as any).selector) (_directive as any)[propertyName] = inputs;
    });
  }

  componentInstance.$declarationMap.forEach((declaration, key) => {
    if (!_directive.$declarationMap.has(key)) _directive.$declarationMap.set(key, declaration);
  });

  return _directive;
}
