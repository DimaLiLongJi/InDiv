import { IDirective, TProviders } from '../types';
import { injected, providersFormater } from '../di';

export type TDirectiveOptions = {
  selector: string;
  providers?: TProviders;
};

/**
 * Decorator @Directive
 * 
 * to decorate an InDiv Directive
 *
 * @param {TComponentOptions} options
 * @returns {(_constructor: Function) => void}
 */
export function Directive(options: TDirectiveOptions): (_constructor: Function) => void {
  return function (_constructor: Function): void {
    injected(_constructor);
    (_constructor as any).isSingletonMode = false;
    (_constructor as any).nvType = 'nvDirective';
    (_constructor as any).selector = options.selector;
    const vm: IDirective = _constructor.prototype;
    if (options.providers) vm.$privateProviders = providersFormater(options.providers);

    vm.$declarationMap = new Map();
  };
}

