import { INvModule, TProviders } from '../types';
import { injected, rootInjector, providersFormater } from '../di';

export type TNvModuleOptions = {
  imports?: Function[];
  declarations?: Function[];
  providers?: TProviders;
  exports?: Function[];
  bootstrap?: Function;
};

/**
 * Decorator @NvModule
 * 
 * to decorate an InDiv NvModule
 * @NvModule is injectable, and will be injected in rootInjector
 * you can use NvModule as injectable token to get singleton instance of @NvModule in constructor
 *
 * @export
 * @param {TNvModuleOptions} options
 * @returns {(_constructor: Function) => void}
 */
export function NvModule(options: TNvModuleOptions): (_constructor: Function) => void {
  return function (_constructor: Function): void {
    injected(_constructor);
    rootInjector.setProvider(_constructor, _constructor);
    (_constructor as any).nvType = 'nvModule';
    const vm: INvModule = _constructor.prototype;
    vm.$declarationMap = new Map();
    if (!vm.$providers) vm.$providers = [];
    if (options.imports) vm.$imports = options.imports;
    if (options.declarations) vm.$declarations = options.declarations;
    if (options.providers) vm.$providers = providersFormater([...vm.$providers, ...options.providers]);
    if (options.exports) {
      vm.$exports = options.exports;
      vm.$exportsList = [];
    }
    if (options.bootstrap) vm.$bootstrap = options.bootstrap;
  };
}
