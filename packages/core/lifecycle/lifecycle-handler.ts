import { IComponent, IDirective } from '../types';
import { addHostListener, removeHostListener, bindHostBinding } from '../directive';

const stopRenderLifecycles: string[] = ['nvOnInit', 'watchData', 'nvBeforeMount', 'nvHasRender', 'nvOnDestory'];

/**
 * clear prototypes when call nvOnDestory
 *
 * @param {(IComponent | IDirective)} instance
 */
function clearInstanceWhenDestory(instance: IComponent | IDirective): void {
  const type = (instance.constructor as any).nvType;
  instance.$nativeElement = null;
  instance.$saveInputs = null;
  instance.$indivInstance = null;
  instance.$declarationMap = null;
  instance.$directiveList = null;
  instance.$privateInjector.parentInjector = null;
  instance.$privateInjector = null;
  instance.$inputsList = null;
  instance.$viewChildList = null;
  instance.$viewChildrenList = null;
  instance.$contentChildList = null;
  instance.$contentChildrenList = null;
  instance.$hostListenerList = null;
  instance.$hostBindingList = null;
  if (type === 'nvComponent') (instance as IComponent).$dependencesList = null;
  if (type === 'nvComponent') (instance as IComponent).$compileInstance = null;
  if (type === 'nvComponent') (instance as IComponent).$componentList = null;
  if (type === 'nvComponent') (instance as IComponent).$templateVnode = null;
  if (type === 'nvComponent') (instance as IComponent).$saveVnode = null;
  if (type === 'nvComponent') (instance as IComponent).$nvContent = null;
}

/**
 * call lifecycle hooks
 * 
 * if lifecycle is nvOnInit or watchData or nvBeforeMount or nvOnDestory, component won't render
 *
 * @export
 * @param {(IComponent | IDirective)} instance
 * @param {string} lifecycle
 * @returns {void}
 */
export function lifecycleCaller(instance: IComponent | IDirective, lifecycle: string): void {
  if (lifecycle === 'nvAfterMount') {
    addHostListener(instance);
    bindHostBinding(instance);
  }
  if (lifecycle === 'nvOnDestory') removeHostListener(instance);

  if (!(instance as any)[lifecycle]) return;
  // Component
  if ((instance.constructor as any).nvType === 'nvComponent') {
    const canRender = stopRenderLifecycles.indexOf(lifecycle) === -1;
    const saveWatchStatus = (instance as IComponent).$watchStatus;

    if (!canRender) (instance as IComponent).$watchStatus = 'pending';
    if (canRender && saveWatchStatus === 'available') (instance as IComponent).$watchStatus = 'pending';

    (instance as IComponent)[lifecycle]();

    if (!canRender) {
      (instance as IComponent).$watchStatus = 'available';
      (instance as IComponent).$isWaitingRender = false;
    }
    if (canRender && saveWatchStatus === 'available') {
      (instance as IComponent).$watchStatus = 'available';
      if ((instance as IComponent).$isWaitingRender && (instance as IComponent).nvDoCheck) (instance as IComponent).nvDoCheck();
      if ((instance as IComponent).$isWaitingRender) {
        (instance as IComponent).render();
        (instance as IComponent).$isWaitingRender = false;
      }
    }
    if (lifecycle === 'nvOnDestory') clearInstanceWhenDestory(instance);
  }
  // Directive
  if ((instance.constructor as any).nvType === 'nvDirective') {
    (instance as IDirective)[lifecycle]();
    if (lifecycle === 'nvOnDestory') clearInstanceWhenDestory(instance);
  }
}
