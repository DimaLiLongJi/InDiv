import { IComponent, IDirective } from '../types';
import { addHostListener, removeHostListener, addHostBinding, removeHostBinding } from '../directive';

const stopRenderLifecycles: string[] = ['nvOnInit', 'watchData', 'nvBeforeMount', 'nvHasRender', 'nvOnDestory'];

/**
 * clear prototypes after nvOnDestory
 *
 * @param {(IComponent | IDirective)} instance
 */
function clearInstanceAfterDestory(instance: IComponent | IDirective): void {
  const type = (instance.constructor as any).nvType;
  instance.$nativeElement = null;
  instance.$saveInputs = null;
  instance.$indivInstance = null;
  instance.$declarationMap = null;
  instance.$directiveList = null;
  instance.$privateInjector.parentInjector = null;
  instance.$privateInjector = null;
  instance.$privateProviders = null;
  instance.$inputsList = null;
  instance.$viewChildList = null;
  instance.$viewChildrenList = null;
  instance.$contentChildList = null;
  instance.$contentChildrenList = null;
  instance.$hostListenerList = null;
  instance.$hostBindingList = null;
  instance.$dependencesList = null;
  if (type === 'nvComponent') {
    (instance as IComponent).$compileInstance = null;
    (instance as IComponent).$componentList = null;
    (instance as IComponent).$templateVnode = null;
    (instance as IComponent).$saveVnode = null;
    (instance as IComponent).$nvContent = null;
    (instance as IComponent).$parseVnodeOptions = null;
    (instance as IComponent).$template = null;
    (instance as IComponent).$temptemplatelate = null;
    (instance as IComponent).$nvChangeDetection = null;
  }
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
  // before call
  if (lifecycle === 'nvAfterMount') addHostListener(instance);
  if (lifecycle === 'nvOnDestory') {
    removeHostListener(instance);
    removeHostBinding(instance);
  }

  // Component
  if ((instance.constructor as any).nvType === 'nvComponent') {
    const canRender = stopRenderLifecycles.indexOf(lifecycle) === -1;
    const saveWatchStatus = (instance as IComponent).$watchStatus;

    if (!canRender) (instance as IComponent).$watchStatus = 'pending';
    if (canRender && saveWatchStatus === 'available') (instance as IComponent).$watchStatus = 'pending';

    if (instance[lifecycle]) (instance as IComponent)[lifecycle]();

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
  }
  // Directive
  if ((instance.constructor as any).nvType === 'nvDirective') {
    if (instance[lifecycle]) (instance as IDirective)[lifecycle]();
  }

  // after call
  if (lifecycle === 'nvHasRender') addHostBinding(instance);
  if (lifecycle === 'nvOnDestory') clearInstanceAfterDestory(instance);
}
