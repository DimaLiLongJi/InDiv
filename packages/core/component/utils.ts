import { IComponent, ComponentList, DirectiveList, IDirective } from '../types';
import { utils } from '../utils';

/**
 * collect dependences from inputs of @Component template
 *
 * @param {IComponent} componentInstance
 * @returns {void}
 */
function resolveInputs(componentInstance: IComponent): void {
  const templateMatchResult: string[] = componentInstance.template.match(/\"\{[^\{\}]+?\}\"/g);
  if (!templateMatchResult) return;
  templateMatchResult.forEach((matchProps) => {
    const pureMatchProps = matchProps.replace(/^\"\{/, '').replace(/\}\"$/, '');
    if (/^.*\(.*\)$/.test(pureMatchProps)) {
      const args = pureMatchProps.match(/\((.*)\)/)[1].replace(/\s+/g, '').split(',');
      args.forEach(arg => {
        const pureArg = arg.split('.')[0];
        if (componentInstance && pureArg in componentInstance && componentInstance.dependencesList.indexOf(pureArg) === -1) componentInstance.dependencesList.push(pureArg);
      });
    } else {
      const pureProps = pureMatchProps.split('.')[0];
      if (componentInstance && pureProps in componentInstance && componentInstance.dependencesList.indexOf(pureProps) === -1) componentInstance.dependencesList.push(pureProps);
    }
  });
}

/**
 * collect dependences from nv directives of @Component template
 *
 * @param {IComponent} componentInstance
 * @returns {void}
 */
function resolveDirective(componentInstance: IComponent): void {
  const templateMatchResult: string[] = componentInstance.template.match(/nv\-[a-z,A-Z]+\=\"((?!nv\-)(?!\=).)+\"/g);
  if (!templateMatchResult) return;
  templateMatchResult.forEach((matchProps) => {
    const pureMatchProps = matchProps.split('=')[1].replace(/^\"/, '').replace(/\"$/, '');
    if (/^.*\(.*\)$/.test(pureMatchProps)) {
      const args = pureMatchProps.replace(/^(\@)/, '').match(/\((.*)\)/)[1].replace(/\s+/g, '').split(',');
      args.forEach(arg => {
        const pureArg = arg.split('.')[0];
        if (componentInstance && pureArg in componentInstance && componentInstance.dependencesList.indexOf(pureArg) === -1) componentInstance.dependencesList.push(pureArg);
      });
    } else {
      let pureProps = null;
      if (/^nv-repeat=.*/.test(matchProps)) {
        const _value = pureMatchProps.split(' in ')[1];
        if (!_value) throw new Error(`directive nv-repeat 's expression ${pureMatchProps} is wrong!`);
        const value = _value.replace(/\s*/g, '');
        pureProps = value.split('.')[0];
      }
      if (!/^nv-repeat=.*/.test(matchProps)) pureProps = pureMatchProps.split('.')[0];
      if (componentInstance && pureProps in componentInstance && componentInstance.dependencesList.indexOf(pureProps) === -1) componentInstance.dependencesList.push(pureProps);
    }
  });
}

/**
 * collect dependences from {{ }} of @Component template
 *
 * @param {IComponent} componentInstance
 * @returns
 */
function resolveTemplateText(componentInstance: IComponent) {
  const templateMatchResult: string[] = componentInstance.template.match(/(\{\{[^\{\}]+?\}\})/g);
  if (!templateMatchResult) return;
  templateMatchResult.forEach((matchProps) => {
    const pureMatchProps = matchProps.replace(/^\{\{/, '').replace(/\}\}$/, '');
    if (/^.*\(.*\)$/.test(pureMatchProps)) {
      const args = pureMatchProps.match(/\((.*)\)/)[1].replace(/\s+/g, '').split(',');
      args.forEach(arg => {
        const pureArg = arg.split('.')[0];
        if (componentInstance && pureArg in componentInstance && componentInstance.dependencesList.indexOf(pureArg) === -1) componentInstance.dependencesList.push(pureArg);
      });
    } else {
      const pureProps = pureMatchProps.split('.')[0];
      if (componentInstance && pureProps in componentInstance && componentInstance.dependencesList.indexOf(pureProps) === -1) componentInstance.dependencesList.push(pureProps);
    }
  });
}

/**
 * collect dependences from @Component template
 *
 * @export
 * @param {IComponent} componentInstance
 */
export function collectDependencesFromViewModel(componentInstance: IComponent): void {
  resolveInputs(componentInstance);
  resolveDirective(componentInstance);
  resolveTemplateText(componentInstance);
}

/**
 * to build foundMap for @ViewChild @ViewChildren @ContentChild @ContentChildren
 *
 * @param {IComponent | IDirective} instance
 * @param {(string | Function)} selector
 * @returns {(ComponentList[] | DirectiveList[])}
 */
export function buildFoundMap(instance: IComponent | IDirective, selector: string | Function): ComponentList[] | DirectiveList[] {
  let toFindMap: ComponentList[] | DirectiveList[];
  if (typeof selector === 'string') {
    if ((instance.declarationMap.get(selector) as any).nvType === 'nvComponent') toFindMap = instance.componentList;
    if ((instance.declarationMap.get(selector) as any).nvType === 'nvDirective') toFindMap = instance.directiveList;
  }
  if (utils.isFunction(selector)) {
    if ((selector as any).nvType === 'nvComponent') toFindMap = instance.componentList;
    if ((selector as any).nvType === 'nvDirective') toFindMap = instance.directiveList;
  }
  return toFindMap;
}
