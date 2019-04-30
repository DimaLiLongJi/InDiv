import { IComponent, IDirective } from '../types';

const stopRenderLifecycles: string[] = ['nvOnInit', 'watchData', 'nvBeforeMount', 'nvHasRender', 'nvOnDestory'];

/**
 * clear prototypes when call nvOnDestory
 *
 * @param {(IComponent | IDirective)} vm
 */
function clearInstanceWhenDestory(vm: IComponent | IDirective): void {
  const type = (vm.constructor as any).nvType;
  vm.nativeElement = null;
  vm._save_inputs = null;
  vm.indivInstance = null;
  vm.declarationMap = null;
  vm.inputsList = null;
  vm.directiveList = null;
  vm.otherInjector = null;
  vm.privateInjector = null;
  vm.privateProviders = null;
  if (type === 'nvComponent') (vm as IComponent).dependencesList = null;
  if (type === 'nvComponent') (vm as IComponent).compileInstance = null;
  if (type === 'nvComponent') (vm as IComponent).viewChildList = null;
  if (type === 'nvComponent') (vm as IComponent).viewChildrenList = null;
  if (type === 'nvComponent') (vm as IComponent).contentChildList = null;
  if (type === 'nvComponent') (vm as IComponent).contentChildrenList = null;
  if (type === 'nvComponent') (vm as IComponent).componentList = null;
  if (type === 'nvComponent') (vm as IComponent).templateVnode = null;
  if (type === 'nvComponent') (vm as IComponent).saveVnode = null;
  if (type === 'nvComponent') (vm as IComponent).nvContent = null;
}

/**
 * call lifecycle hooks
 * 
 * if lifecycle is nvOnInit or watchData or nvBeforeMount or nvOnDestory, component won't render
 *
 * @export
 * @param {(IComponent | IDirective)} vm
 * @param {string} lifecycle
 * @returns {void}
 */
export function lifecycleCaller(vm: IComponent | IDirective, lifecycle: string): void {
  if (!(vm as any)[lifecycle]) return;
  // Component
  if ((vm.constructor as any).nvType === 'nvComponent') {
    const canRenderLifecycle = stopRenderLifecycles.indexOf(lifecycle) === -1;
    const saveWatchStatus = (vm as IComponent).watchStatus;

    if (!canRenderLifecycle) (vm as IComponent).watchStatus = 'pending';
    if (canRenderLifecycle && saveWatchStatus === 'available') (vm as IComponent).watchStatus = 'pending';

    (vm as IComponent)[lifecycle]();

    if (!canRenderLifecycle) {
      (vm as IComponent).watchStatus = 'available';
      (vm as IComponent).isWaitingRender = false;
    }
    if (canRenderLifecycle && saveWatchStatus === 'available') {
      (vm as IComponent).watchStatus = 'available';
      if ((vm as IComponent).isWaitingRender && (vm as IComponent).nvDoCheck) (vm as IComponent).nvDoCheck();
      if ((vm as IComponent).isWaitingRender) {
        (vm as IComponent).render();
        (vm as IComponent).isWaitingRender = false;
      }
    }
    if (lifecycle === 'nvOnDestory') clearInstanceWhenDestory(vm);
  }
  // Directive
  if ((vm.constructor as any).nvType === 'nvDirective') {
    (vm as IDirective)[lifecycle]();
    if (lifecycle === 'nvOnDestory') clearInstanceWhenDestory(vm);
  }
}
