import { IDirective, IComponent } from '../types';
import { isFromVM, getVMVal } from '../compile';

/**
 * add listener in instance.$nativeElement
 *
 * @export
 * @param {(IComponent | IDirective)} instance
 * @returns {void}
 */
export function addHostListener(instance: IComponent | IDirective): void {
  if (!instance.$hostListenerList) return;
  instance.$hostListenerList.forEach(listener => {
    listener.handler = (event: Event) => {
      const handlerArgs: any[] = [];
      if (listener.args) {
        listener.args.forEach(arg => {
          if (arg === '') return handlerArgs.push('');
          if (arg === '$element') return handlerArgs.push(instance.$nativeElement);
          if (arg === '$event') return handlerArgs.push(event);
          if (/^\$event\.+/.test(arg)) return handlerArgs.push(getVMVal(event, arg.replace(/^\$event\./, '')));
          if (arg === 'true' || arg === 'false') return handlerArgs.push(arg === 'true');
          if (arg === 'null') return handlerArgs.push(null);
          if (arg === 'undefined') return handlerArgs.push(undefined);
          if (/^\'.*\'$/.test(arg) || /^\".*\"$/.test(arg)) return arg;
          if (/(^[-,+]?\d+$)|(^[-, +]?\d+\.\d+$)/.test(arg)) return Number(arg);
          if (isFromVM(instance, arg)) return handlerArgs.push(getVMVal(instance, arg));
        });
      }
      instance[listener.propertyName].apply(instance, handlerArgs);
    };
    instance.$indivInstance.getRenderer.addEventListener(instance.$nativeElement, listener.eventName, listener.handler);
  });
}

/**
 * add listener in instance.nativeElement
 *
 * @export
 * @param {(IComponent | IDirective)} instance
 * @returns {void}
 */
export function removeHostListener(instance: IComponent | IDirective): void {
  if (!instance.$hostListenerList || !instance.$nativeElement) return;
  instance.$hostListenerList.forEach(listener => {
    instance.$indivInstance.getRenderer.removeEventListener(instance.$nativeElement, listener.eventName, listener.handler);
  });
}

/**
 * @HostListener handle event for mounted nativeElement of Component or Driective
 *
 * @export
 * @param {string} eventName
 * @param {string[]} [args]
 * @returns {((target: IComponent | IDirective, propertyName: string) => any)}
 */
export function HostListener(eventName: string, args?: string[]): (target: IComponent | IDirective, propertyName: string) => any {
  return function (target: IComponent | IDirective, propertyName: string): any {
    if (!target.$hostListenerList) target.$hostListenerList = [];
    target.$hostListenerList.push({ eventName, propertyName, args: args || [], handler: null });
    return target[propertyName];
  };
}
