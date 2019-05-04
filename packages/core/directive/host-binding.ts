import { IDirective, IComponent } from '../types';

// todo

/**
 * @HostBinding binding for mounted nativeElement of Component or Driective
 * 
 * 1. propertyName: @HostBinding('value') value:any;
 * 2. attr.attributeName: @HostBinding('attr.someAttributeName') role:string;
 * 3. style.styleName: @HostBinding('style.width') width:string;
 * 4. class: @HostBinding('class') className: string;
 * 5. class.classNameEnable: @HostBinding('class.someClass') classNameEnable:boolean;
 *
 * @export
 * @param {string} hostPropertyName
 * @returns {((target: IComponent | IDirective, propertyName: string) => any)}
 */
export function HostBinding(hostPropertyName: string): (target: IComponent | IDirective, propertyName: string) => any {
  return function (target: IComponent | IDirective, propertyName: string): any {
    if (!target.hostBindingList) target.hostBindingList = [];
    return target[propertyName];
  };
}
