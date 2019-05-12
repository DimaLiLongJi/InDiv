import { DirectiveList, IComponent, TComAndDir } from '../types';

import { utils } from '../utils';
import { buildDirectiveScope } from './compiler-utils';
import { lifecycleCaller } from '../lifecycle';

/**
 * construct Directives in Directive
 *
 * @export
 * @param {IComponent} componentInstance
 * @param {TComAndDir} componentAndDirectives
 */
export function directivesConstructor(componentInstance: IComponent, componentAndDirectives: TComAndDir): void {
  componentInstance.$directiveList = [];

  componentAndDirectives.directives.forEach(directive => {
    const declaration = componentInstance.$declarationMap.get(directive.name);
    componentInstance.$directiveList.push({
      nativeElement: directive.nativeElement,
      inputs: directive.inputs,
      instanceScope: null,
      constructorFunction: declaration,
      isFromContent: directive.isFromContent,
    });
  });
}

/**
 * mountDirective for Directives in Component
 *
 * @export
 * @param {IComponent} componentInstance
 * @param {TComAndDir} componentAndDirectives
 */
export function mountDirective(componentInstance: IComponent, componentAndDirectives: TComAndDir): void {
  const cacheDirectiveList: DirectiveList[] = [...componentInstance.$directiveList];
  directivesConstructor(componentInstance, componentAndDirectives);
  const directiveListLength = componentInstance.$directiveList.length;
  for (let i = 0; i < directiveListLength; i++) {
    const directive = componentInstance.$directiveList[i];
    // find Directive from cache
    const cacheDirectiveIndex = cacheDirectiveList.findIndex(cache => cache.nativeElement === directive.nativeElement);
    const cacheDirective = cacheDirectiveList[cacheDirectiveIndex];

    // clear cache and the rest need to be destoried
    if (cacheDirectiveIndex !== -1) cacheDirectiveList.splice(cacheDirectiveIndex, 1);
    if (cacheDirective) {
      directive.instanceScope = cacheDirective.instanceScope;
      // old inputs: directive.instanceScope.$saveInputs
      // new inputs: directive.inputs
      if (!utils.isEqual(directive.instanceScope.$saveInputs, directive.inputs)) {
        if (directive.instanceScope.nvReceiveInputs) directive.instanceScope.nvReceiveInputs(directive.inputs);
        directive.instanceScope.$saveInputs = directive.inputs;

        if (directive.instanceScope.$inputsList) {
          directive.instanceScope.$inputsList.forEach(({ propertyName, inputName }) => {
            if (inputName === (directive.instanceScope as any).constructor.selector) (directive.instanceScope as any)[propertyName] = directive.inputs;
          });
        }

      }
    } else {
      directive.instanceScope = buildDirectiveScope(directive.constructorFunction, directive.inputs, directive.nativeElement, componentInstance);
    }

    directive.instanceScope.$indivInstance = componentInstance.$indivInstance;

    if (!cacheDirective) {
      lifecycleCaller(directive.instanceScope, 'nvOnInit');
      lifecycleCaller(directive.instanceScope, 'nvBeforeMount');
    }
  }
  // the rest should use nvOnDestory
  const cacheDirectiveListLength = cacheDirectiveList.length;
  for (let i = 0; i < cacheDirectiveListLength; i++) {
    const cache = cacheDirectiveList[i];
    lifecycleCaller(cache.instanceScope, 'nvOnDestory');
  }

  // after mount
  for (let i = 0; i < directiveListLength; i++) {
    const directive = componentInstance.$directiveList[i];
    lifecycleCaller(directive.instanceScope, 'nvHasRender');
    if (!cacheDirectiveList.find(cache => cache.nativeElement === directive.nativeElement)) {
      if (!directive.instanceScope.$indivInstance.getIndivEnv.isServerRendering) lifecycleCaller(directive.instanceScope, 'nvAfterMount');
    }
  }
}
