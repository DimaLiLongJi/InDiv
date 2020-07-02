import { IComponent } from '../types';

import { WatcherDependences } from './watch';
import { injected, providersFormater, TProviders } from '@indiv/di';
import { collectDependencesFromViewModel } from './utils';
import { componentCompiler } from '../compile';
import { ChangeDetectionStrategy } from './change-detection';

export type TComponentOptions = {
  selector: string;
  template?: string;
  templateUrl?: string;
  providers?: TProviders;
  changeDetection?: ChangeDetectionStrategy,
};

/**
 * Decorator @Component
 * 
 * to decorate an InDiv component
 * render function comes from InDiv instance, you can set it by youself
 * 
 * $watchStatus: 'pending' | 'available', to controll watcher and render will be called or not in $dependencesList
 *
 * @template Props
 * @template Vm
 * @param {TComponentOptions} options
 * @returns {(_constructor: Function) => void}
 */
export function Component(options: TComponentOptions): (_constructor: Function) => void {
  return function (_constructor: Function): void {
    injected(_constructor);
    (_constructor as any).isSingletonMode = false;
    (_constructor as any).nvType = 'nvComponent';
    (_constructor as any).selector = options.selector;
    const vm: IComponent = _constructor.prototype;
    if (options.template) vm.$template = options.template;
    if (options.templateUrl) vm.$templateUrl = options.templateUrl;
    if (options.providers) vm.$privateProviders = providersFormater(options.providers);

    // 变更策略
    if (options.changeDetection === ChangeDetectionStrategy.Default) {
      vm.$nvChangeDetection = options.changeDetection;
      vm.$watchStatus = 'available';
      vm.$isWaitingRender = false;
    } else {
      vm.$nvChangeDetection = options.changeDetection;
      vm.$watchStatus = 'disable';
      vm.$isWaitingRender = false;
    }

    vm.$declarationMap = new Map();
    // for Component
    vm.$componentList = [];
    // for Directive
    vm.$directiveList = [];

    vm.watchData = function (): void {
      // call templateChecker,when env is ssr,will render $templateUrl to $template first
      (this as IComponent).$indivInstance.templateChecker(this as IComponent);
      // OnPush 模式只能通过 inputs 触发更新，所以直接跳出
      if ((this as IComponent).$nvChangeDetection === ChangeDetectionStrategy.OnPush) return;

      if (!(this as IComponent).$dependencesList) (this as IComponent).$dependencesList = [];
      collectDependencesFromViewModel(this);
      (this as IComponent).$dependencesList.forEach(dependence => WatcherDependences(this as IComponent, dependence));
    };

    vm.render = async function (): Promise<IComponent> {
      const nativeElement = (this as IComponent).$nativeElement;
      return Promise.resolve().then(() => {
        return (this as IComponent).compiler(nativeElement, this);
      });
    };
    vm.compiler = componentCompiler;
  };
}
