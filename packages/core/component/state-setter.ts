import { IComponent } from '../types';
import { WatcherDependences } from './watch';
import { ChangeDetectionStrategy } from './change-detection';
import { utils } from '../utils';

export type SetState = (newState: any) => void;

/**
 * set dependences states from @Component instance
 *
 * merge multiple changes like remove properties or add properties or change Array to once render
 * 
 * if Componet's $watchStatus is 'available', firstly changer $watchStatus to 'pending' and at last change back to 'available'
 * if Componet's $watchStatus has been 'pending', only to change instance
 *
 * @export
 * @param {*} newState
 * @returns {void}
 */
export function setState(newState: any): void {
  let _newState = null;

  if (newState && utils.isFunction(newState)) _newState = newState();
  if (newState && newState instanceof Object) _newState = newState;

  const saveWatchStatus = (this as IComponent).$watchStatus;

  if (saveWatchStatus === 'available') (this as IComponent).$watchStatus = 'pending';

  for (const key in _newState) {
    // 逐个更新状态
    this[key] = _newState[key];
    // 非 OnPush 模式下，才允许添加监听
    if ((this as IComponent).$nvChangeDetection !== ChangeDetectionStrategy.OnPush) WatcherDependences(this as IComponent, key);
  }

  if (saveWatchStatus === 'available') {
    (this as IComponent).$watchStatus = 'available';
    if ((this as IComponent).nvDoCheck) (this as IComponent).nvDoCheck();
    (this as IComponent).render();
  }
}

/**
 * Decorator @StateSetter in @Component
 * 
 * use Decorator @StateSetter to map setState
 *
 * @export
 * @returns {(target: IComponent, propertyName: string) => any}
 */
export function StateSetter(): (target: IComponent, propertyName: string) => any {
  return function (target: IComponent, propertyName: string): any {
    target[propertyName] = setState;
    return target[propertyName];
  };
}
