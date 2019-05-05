import { utils } from '../utils';
import { IComponent } from '../types';

export type TFnWatcher = (oldData?: any) => void;
export type TFnRender = () => any;

/**
 * Recursive watch data by Object.defineProperty
 * 
 * when watch data has been changed, will call watcher and render
 * but new property can't be watched, you can use setState
 *
 * @export
 * @param {*} data
 * @param {TFnWatcher} [watcher]
 * @param {TFnRender} [render]
 * @returns
 */
export function watchData(data: any, propertyName: string, target: IComponent, watcher?: TFnWatcher, render?: TFnRender) {
  if (!data || typeof data !== 'object') return;
  for (const key in data) {
    let val = data[key];
    watchData(val, propertyName, target, watcher, render);
    Object.defineProperty(data, key, {
      configurable: true,
      enumerable: true,
      get() {
        return val;
      },
      set(newVal: any) {
        if (utils.isEqual(newVal, val)) return;

        val = newVal;
        watchData(val, propertyName, target, watcher, render);

        if (target.$watchStatus === 'available') {
          if (watcher) watcher();
          if (render) render();
        } else target.$isWaitingRender = true;
      },
    });
  }
}

/**
 * watch data's one propertyName by Object.defineProperty
 * 
 * when watch data has been changed, will call watcher and render
 * but new property can't be watched, you can use setState
 * and it will only watch one propertyName and don't recursive watch children
 *
 * @export
 * @param {*} data
 * @param {string} propertyName
 * @param {TFnWatcher} [watcher]
 * @param {TFnRender} [render]
 * @returns {void}
 */
export function watchDataByKey(target: IComponent, propertyName: string, watcher?: TFnWatcher, render?: TFnRender): void {
  if (!target || typeof target !== 'object') return;
  let data = target[propertyName];
  Object.defineProperty(target, propertyName, {
    configurable: true,
    enumerable: true,
    get() {
      return data;
    },
    set(newValue: any) {
      if (utils.isEqual(newValue, data)) return;

      data = newValue;
      if (target.$watchStatus === 'available') {
        if (watcher) watcher();
        if (render) render();
      } else target.$isWaitingRender = true;
    },
  });
}

/**
 * recursive watch dependens in target
 *
 * @export
 * @param {IComponent} target
 * @param {string} propertyName
 */
export function WatcherDependences(target: IComponent, propertyName: string) {
  const data = target[propertyName];

  if (!target.render) throw new Error(`function WatcherDependences can only be used in @Component!`);

  if (target.nvDoCheck) {
    watchDataByKey(target, propertyName, target.nvDoCheck.bind(target), target.render.bind(target));
    watchData(data, propertyName, target, target.nvDoCheck.bind(target), target.render.bind(target));
  }
  if (!target.nvDoCheck) {
    watchDataByKey(target, propertyName, null, target.render.bind(target));
    watchData(data, propertyName, target, null, target.render.bind(target));
  }
  if (target.$dependencesList && target.$dependencesList.indexOf(propertyName) === -1) target.$dependencesList.push(propertyName);
  if (!target.$dependencesList) target.$dependencesList = [propertyName];
}

/**
 * Decorator @Watch in @Component
 * 
 * add watch property in prototype chain of instance
 *
 * @export
 * @returns {(target: IComponent, propertyName: string) => any}
 */
export function Watch(): (target: IComponent, propertyName: string) => any {
  return function (target: IComponent, propertyName: string): any {
    if (target.$dependencesList && target.$dependencesList.indexOf(propertyName) === -1) target.$dependencesList.push(propertyName);
    if (!target.$dependencesList) target.$dependencesList = [propertyName];
    return target[propertyName];
  };
}
