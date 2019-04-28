import { IComponent, ComponentList, TComAndDir, DirectiveList } from '../types';

import { utils } from '../utils';
import { Compile } from './compile';
import { buildComponentScope } from './compiler-utils';
import { Vnode, parseTemplateToVnode, isTagName } from '../vnode';
import { mountDirective } from './directive-compiler';
import { buildViewChildandChildren, buildContentChildandChildren, ChangeDetectionStrategy } from '../component';
import { lifecycleCaller } from '../lifecycle';
import { InDiv } from '../indiv';

/**
 * use lifecycle nvDestory for @Directive
 *
 * @param {DirectiveList[]} directiveList
 */
function emitDirectiveDestory(directiveList: DirectiveList[]): void {
  directiveList.forEach(directive => {
    lifecycleCaller(directive.instanceScope, 'nvOnDestory');
  });
}

/**
 * use lifecycle nvDestory for @Component
 *
 * @param {ComponentList[]} componentList
 */
function emitComponentDestory(componentList: ComponentList[]): void {
  componentList.forEach(component => {
    emitDirectiveDestory(component.instanceScope.directiveList);
    emitComponentDestory(component.instanceScope.componentList);
    lifecycleCaller(component.instanceScope, 'nvOnDestory');
  });
}

/**
 * mountComponent for Components in Component
 *
 * @export
 * @param {IComponent} componentInstance
 * @param {TComAndDir} componentAndDirectives
 */
export async function mountComponent(componentInstance: IComponent, componentAndDirectives: TComAndDir): Promise<void> {
  const cacheComponentList: ComponentList[] = [...componentInstance.componentList];
  const foundCacheComponentList: ComponentList[] = [];
  componentsConstructor(componentInstance, componentAndDirectives);
  const componentListLength = componentInstance.componentList.length;
  for (let i = 0; i < componentListLength; i++) {
    const component = componentInstance.componentList[i];
    // find Component from cache
    const cacheComponentIndex = cacheComponentList.findIndex(cache => cache.nativeElement === component.nativeElement);
    const cacheComponent = cacheComponentList[cacheComponentIndex];

    // clear cache, the rest need to be destoried, and push cacheComponent to foundCacheComponentList
    if (cacheComponentIndex !== -1) {
      cacheComponentList.splice(cacheComponentIndex, 1);
      foundCacheComponentList.push(cacheComponent);
    }
    if (cacheComponent) {
      component.instanceScope = cacheComponent.instanceScope;
      // old inputs: component.instanceScope._save_inputs
      // new inputs: component.inputs
      if (!utils.isEqual(component.instanceScope._save_inputs, component.inputs)) {
        if (component.instanceScope.nvReceiveInputs) component.instanceScope.nvReceiveInputs({ ...component.inputs });
        component.instanceScope._save_inputs = component.inputs;

        for (const key in component.inputs) {
          if (component.instanceScope.inputsList) {
            component.instanceScope.inputsList.forEach(({ propertyName, inputName }) => {
              if (inputName === key) (component.instanceScope as any)[propertyName] = component.inputs[key];
            });
          }
        }
        // 标记组件为脏组件
        component.isDirty = true;
      }
    } else {
      component.instanceScope = buildComponentScope(component.constructorFunction, component.inputs, component.nativeElement, componentInstance);
    }

    component.instanceScope.$indivInstance = componentInstance.$indivInstance;
    // 赋值 <nv-content>的 Vnode[] 给组件实例nvContent
    component.instanceScope.nvContent = component.nvContent;

    if (!cacheComponent) {
      lifecycleCaller(component.instanceScope, 'nvOnInit');
      lifecycleCaller(component.instanceScope, 'watchData');
      lifecycleCaller(component.instanceScope, 'nvBeforeMount');
    }
  }
  // the rest should use nvOnDestory to destory
  const cacheComponentListLength = cacheComponentList.length;
  for (let i = 0; i < cacheComponentListLength; i++) {
    const cache = cacheComponentList[i];
    emitDirectiveDestory(cache.instanceScope.directiveList);
    emitComponentDestory(cache.instanceScope.componentList);
    lifecycleCaller(cache.instanceScope, 'nvOnDestory');
  }

  // render, only component which isn't rendered will be rendered and called 
  for (let i = 0; i < componentListLength; i++) {
    const component = componentInstance.componentList[i];
    // 如果没找到该组件
    if (!foundCacheComponentList.find(cache => cache.nativeElement === component.nativeElement)) {
      await component.instanceScope.render();
      // in ssr env indiv won't call nvAfterMount
      if (!component.instanceScope.$indivInstance.getIndivEnv.isServerRendering) lifecycleCaller(component.instanceScope, 'nvAfterMount');
    } else {
      // 如果找到该组件 并且为脏组件
      if (component.isDirty) {
        // 如果是 OnPush 模式的话，则需要触发一次更新
        if (component.instanceScope.nvChangeDetection === ChangeDetectionStrategy.OnPush) {
          if (component.instanceScope.nvDoCheck) component.instanceScope.nvDoCheck();
          await component.instanceScope.render();
        }
        component.isDirty = false;
      }
    }
  }

  // build @ViewChild @ViewChildren
  buildViewChildandChildren(componentInstance);
  // build @ContentChild @ContentChildren
  buildContentChildandChildren(componentInstance);
}

/**
 * construct Components in Component
 *
 * @export
 * @param {IComponent} componentInstance
 * @param {TComAndDir} componentAndDirectives
 */
export function componentsConstructor(componentInstance: IComponent, componentAndDirectives: TComAndDir): void {
  componentInstance.componentList = [];

  componentAndDirectives.components.forEach(component => {
    const declaration = componentInstance.declarationMap.get(component.name);
    componentInstance.componentList.push({
      nativeElement: component.nativeElement,
      inputs: component.inputs,
      instanceScope: null,
      constructorFunction: declaration,
      nvContent: component.nvContent,
      isFromContent: component.isFromContent,
      isDirty: false,
    });
  });
}

/**
 * build list for build @Component and @Directive
 *
 * @export
 * @param {Vnode} vnode
 * @param {TComAndDir} componentAndDirectives
 * @param {Vnode[]} contentComponentStack
 */
export function buildComponentsAndDirectives(vnode: Vnode, componentAndDirectives: TComAndDir, contentComponentStack: Vnode[]): void {
  if (vnode.type === 'text') return;
  const componentInputs: any = {};

  // 判断栈是否为空，如果没空则证明是 <nv-content> 的子作用域的组件
  const fromContent = contentComponentStack.length ? true : false;
  let hasPushStack = false;
  if (isTagName(vnode, 'nv-content') && vnode.childNodes && vnode.childNodes.length > 0) {
    contentComponentStack.push(vnode);
    hasPushStack = true;
  }

  if (vnode.childNodes && vnode.childNodes.length > 0) vnode.childNodes.forEach(child => buildComponentsAndDirectives(child, componentAndDirectives, contentComponentStack));

  if (vnode.attributes && vnode.attributes.length > 0) {
    vnode.attributes.forEach(attr => {
      if (attr.type === 'directive') {
        componentAndDirectives.directives.push({
          nativeElement: vnode.nativeElement,
          inputs: attr.nvValue,
          name: attr.name,
          isFromContent: fromContent,
        });
      }
      if (attr.type === 'prop') componentInputs[attr.name] = attr.nvValue;
    });
  }

  if (vnode.type === 'component') {
    componentAndDirectives.components.push({
      nativeElement: vnode.nativeElement,
      inputs: componentInputs,
      name: vnode.tagName,
      nvContent: vnode.childNodes,
      isFromContent: fromContent,
    });
  }

  // 深度优先遍历后，出栈
  if (hasPushStack) contentComponentStack.pop();
}

/**
 * render Component with using nativeElement and RenderTask instance
 *
 * @export
 * @param {*} nativeElement
 * @param {IComponent} componentInstance
 * @returns {Promise<IComponent>}
 */
export async function componentCompiler(nativeElement: any, componentInstance: IComponent): Promise<IComponent> {
  // for compile, @Component must init parseVnodeOptions, templateVnode and compileInstance
  if (!componentInstance.parseVnodeOptions) {
    componentInstance.parseVnodeOptions = {
      components: [],
      directives: [],
    };
    componentInstance.declarationMap.forEach((value, key) => {
      if (componentInstance.parseVnodeOptions.components.indexOf(key) === -1 && (value as any).nvType === 'nvComponent') componentInstance.parseVnodeOptions.components.push(key);
      if (componentInstance.parseVnodeOptions.directives.indexOf(key) === -1 && (value as any).nvType === 'nvDirective') componentInstance.parseVnodeOptions.directives.push(key);
    });
  }
  if (!componentInstance.templateVnode) componentInstance.templateVnode = parseTemplateToVnode(componentInstance.template, componentInstance.parseVnodeOptions);
  if (!componentInstance.compileInstance) componentInstance.compileInstance = new Compile(nativeElement, componentInstance);

  let saveVnode: Vnode[] = [];
  try {
    saveVnode = componentInstance.compileInstance.startCompile();
  } catch (error) {
    throw new Error(`Error: ${error}, compoent ${(componentInstance.constructor as any).selector} was compiled failed!`);
  }

  // for save saveVnode in componentInstance
  componentInstance.saveVnode = saveVnode;
  let componentAndDirectives: TComAndDir = { components: [], directives: [] };
  // 定义一个来自 <nv-content> 的 Vnode 栈
  let contentComponentStack: Vnode[] = [];

  saveVnode.forEach(vnode => buildComponentsAndDirectives(vnode, componentAndDirectives, contentComponentStack));

  // firstly mount directive
  try {
    mountDirective(componentInstance, componentAndDirectives);
  } catch (error) {
    throw new Error(`Error: ${error}, directives of compoent ${(componentInstance.constructor as any).selector} were compiled failed!`);
  }

  // then mount component
  try {
    await mountComponent(componentInstance, componentAndDirectives);
    lifecycleCaller(componentInstance, 'nvHasRender');
  } catch (error) {
    throw new Error(`Error: ${error}, components of compoent ${(componentInstance.constructor as any).selector} were compiled failed!`);
  }

  componentAndDirectives = null;
  contentComponentStack = null;

  return componentInstance;
}
