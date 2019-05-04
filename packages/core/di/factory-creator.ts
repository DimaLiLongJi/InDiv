import { TProviders, TInjectTokenProvider, TUseClassProvider, TUseValueProvider } from '../types';
import { Injector } from './injector';

/**
 * use injector to create arguments for constructor
 *
 * @export
 * @param {Function} _constructor
 * @param {Injector} [injector]
 * @returns {any[]}
 */
export function injectionCreator(_constructor: Function, injector?: Injector): any[] {
    const args: any[] = [];

    let _needInjectedClass: any[] = [];
    if ((_constructor as any)._needInjectedClass) _needInjectedClass = (_constructor as any)._needInjectedClass;
    if ((_constructor as any).injectTokens) _needInjectedClass = (_constructor as any).injectTokens;

    // build privateProviders into injector of component
    if ((_constructor.prototype as any).privateProviders as TProviders) {
        const length = (_constructor.prototype as any).privateProviders.length;
        for (let i = 0; i < length; i++) {
            const service = (_constructor.prototype as any).privateProviders[i];
            if ((service as TInjectTokenProvider).provide) {
                if ((service as TUseClassProvider).useClass || (service as TUseValueProvider).useValue) injector.setProvider((service as TInjectTokenProvider).provide, service);
            } else {
                injector.setProvider(service as Function, service as Function);
            }
        }
    }

    const needInjectedClassLength = _needInjectedClass.length;
    for (let i = 0; i < needInjectedClassLength; i++) {
        const key = _needInjectedClass[i];
        if (injector) {
            if (injector.getInstance(key)) {
                args.push(injector.getInstance(key));
                continue;
            } else {
                let findService = injector.getProvider(key);

                if (findService) {
                    if (!findService.useClass && !findService.useValue) findService = findService;
                    if (findService.useClass) findService = findService.useClass;
                    if (findService.useValue) {
                        args.push(findService.useValue);
                        continue;
                    }

                    const serviceParentInjector = injector.getParentInjectorOfProvider(findService);
                    const serviceInjector = serviceParentInjector.fork();

                    if (findService.isSingletonMode === false) {
                        args.push(factoryCreator(findService, serviceInjector));
                        continue;
                    } else {
                        const serviceInStance = factoryCreator(findService, serviceInjector);
                        injector.setInstance(key, serviceInStance);
                        args.push(serviceInStance);
                        continue;
                    }
                }
            }
        }
    }

    return args;
}

/**
 * create an instance with factory method
 * 
 * use injectionCreator to get arguments from Injector
 *
 * @export
 * @param {Function} _constructor
 * @param {Injector} [injector]
 * @returns {*}
 */
export function factoryCreator(_constructor: Function, injector?: Injector): any {
    const args = injectionCreator(_constructor, injector);
    const factoryInstance = new (_constructor as any)(...args);
    factoryInstance.$privateInjector = injector;
    return factoryInstance;
}
