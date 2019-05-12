import { IDirective, IComponent, HostBindingListType } from '../types';

/**
 * add HostBinding into nativeElement
 *
 * @export
 * @param {(IComponent | IDirective)} instance
 * @returns {void}
 */
export function addHostBinding(instance: IComponent | IDirective): void {
    if (!instance.$hostBindingList || instance.$hostBindingList.length === 0) return;
    instance.$hostBindingList.forEach(({type, name, propertyName}) => {
      const value = instance[propertyName];
      if (type === HostBindingListType.property) {
        instance.$nativeElement[name] = value;
      }
      if (type === HostBindingListType.attr) {
        instance.$indivInstance.getRenderer.setAttribute(instance.$nativeElement, name, value);
      }
      if (type === HostBindingListType.style) {
        instance.$indivInstance.getRenderer.setStyle(instance.$nativeElement, name, value);
      }
      if (type === HostBindingListType.class) {
        if (value) instance.$indivInstance.getRenderer.setNvAttribute(instance.$nativeElement, 'nv-class', name);
        else instance.$indivInstance.getRenderer.removeNvAttribute(instance.$nativeElement, 'nv-class', name);
      }
    });
}

/**
 * remove HostBinding from nativeElement
 *
 * @export
 * @param {(IComponent | IDirective)} instance
 * @returns {void}
 */
export function removeHostBinding(instance: IComponent | IDirective): void {
  if (!instance.$hostBindingList || instance.$hostBindingList.length === 0) return;
  instance.$hostBindingList.forEach(({type, name, propertyName}) => {
    const value = instance[propertyName];
    if (type === HostBindingListType.property) {
      instance.$nativeElement[name] = null;
    }
    if (type === HostBindingListType.attr) {
      instance.$indivInstance.getRenderer.removeAttribute(instance.$nativeElement, name, value);
    }
    if (type === HostBindingListType.style) {
      instance.$indivInstance.getRenderer.removeStyle(instance.$nativeElement, name);
    }
    if (type === HostBindingListType.class) {
      if (value) instance.$indivInstance.getRenderer.removeNvAttribute(instance.$nativeElement, 'nv-class', name);
    }
  });
}

/**
 * @HostBinding binding for mounted nativeElement of Component or Driective
 * 
 * 1. propertyName: @HostBinding('value') value: any;
 * 2. attr.attributeName: @HostBinding('attr.someAttributeName') role: string;
 * 3. style.styleName: @HostBinding('style.width') width: string;
 * 4. class.classNameEnable: @HostBinding('class.someClass') classNameEnable: boolean;
 *
 * @export
 * @param {string} hostPropertyName
 * @returns {((target: IComponent | IDirective, propertyName: string) => any)}
 */
export function HostBinding(hostPropertyName: string): (target: IComponent | IDirective, propertyName: string) => any {
  return function (target: IComponent | IDirective, propertyName: string): any {
    // add into $dependencesList
    if (target.$dependencesList && target.$dependencesList.indexOf(propertyName) === -1) target.$dependencesList.push(propertyName);
    if (!target.$dependencesList) target.$dependencesList = [propertyName];

    if (!target.$hostBindingList) target.$hostBindingList = [];
    let type = HostBindingListType.property;
    let name = hostPropertyName;
    if (/^attr\..+/.test(hostPropertyName)) {
      type = HostBindingListType.attr;
      name = name.split('.')[1];
    }
    if (/^style\..+/.test(hostPropertyName)) {
      type = HostBindingListType.style;
      name = name.split('.')[1];
    }
    if (/^class\..+/.test(hostPropertyName)) {
      type = HostBindingListType.class;
      name = name.split('.')[1];
    }
    target.$hostBindingList.push({ type, name, propertyName });
    return target[propertyName];
  };
}
