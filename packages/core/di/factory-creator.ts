import 'reflect-metadata';
import { TProviders, TInjectTokenProvider, TUseClassProvider, TUseValueProvider } from '../types';
import { Injector } from './injector';
import { metadataOfInjectable, metadataOfOptional, metadataOfHost, metadataOfSelf, metadataOfSkipSelf, metadataOfInject } from './metadata';
import { TInjectItem } from './inject';

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
    if ((_constructor as any).injectTokens) _needInjectedClass = (_constructor as any).injectTokens;
    else _needInjectedClass = Reflect.getMetadata(metadataOfInjectable, _constructor) || [];

    // build $privateProviders into injector of component
    if ((_constructor.prototype as any).$privateProviders as TProviders) {
        const length = (_constructor.prototype as any).$privateProviders.length;
        for (let i = 0; i < length; i++) {
            const service = (_constructor.prototype as any).$privateProviders[i];
            if ((service as TInjectTokenProvider).provide) {
                if ((service as TUseClassProvider).useClass || (service as TUseValueProvider).useValue) injector.setProvider((service as TInjectTokenProvider).provide, service);
            } else {
                injector.setProvider(service as Function, service as Function);
            }
        }
    }

    // 干预等级 @SkipSelf > @Self > @Host > @Optional
    const skipSelfList: number[] = Reflect.getMetadata(metadataOfSkipSelf, _constructor) || [];
    const selfList: number[] = Reflect.getMetadata(metadataOfSelf, _constructor) || [];
    const hostList: number[] = Reflect.getMetadata(metadataOfHost, _constructor) || [];
    const optionalList: number[] = Reflect.getMetadata(metadataOfOptional, _constructor) || [];
    // 使用 @Inject 代替获取类型
    const injectTokenList: TInjectItem[] = Reflect.getMetadata(metadataOfInject, _constructor) || [];

    // find instance from provider
    const needInjectedClassLength = _needInjectedClass.length;
    for (let i = 0; i < needInjectedClassLength; i++) {
        // 构建冒泡层数
        let bubblingLayer: number | 'always' = 'always'; 
        if (hostList.indexOf(i) !== -1) bubblingLayer = 1;
        if (selfList.indexOf(i) !== -1) bubblingLayer = 0;

        // 构建冒泡开始的injector
        let findInjector = injector;
        if (skipSelfList.indexOf(i) !== -1) findInjector = injector.parentInjector;
        
        const findTnjectToken = injectTokenList.find((value) => value.index === i);
        const key = findTnjectToken ? findTnjectToken.token : _needInjectedClass[i];

        if (findInjector.getInstance(key, bubblingLayer)) {
            args.push(findInjector.getInstance(key, bubblingLayer));
            continue;
        } else {
            // use @Optional will return null
            if (optionalList.indexOf(i) !== -1) {
                args.push(null);
                continue;
            }

            let findService = findInjector.getProvider(key, bubblingLayer);

            if (findService) {
                if (!findService.useClass && !findService.useValue) findService = findService;
                if (findService.useClass) findService = findService.useClass;
                if (findService.useValue) {
                    args.push(findService.useValue);
                    continue;
                }

                const serviceParentInjector = findInjector.getParentInjectorOfProvider(findService, bubblingLayer);
                const serviceInjector = serviceParentInjector.fork();

                if (findService.isSingletonMode === false) {
                    args.push(factoryCreator(findService, serviceInjector));
                    continue;
                } else {
                    const serviceInStance = factoryCreator(findService, serviceInjector);
                    findInjector.setInstance(key, serviceInStance);
                    args.push(serviceInStance);
                    continue;
                }
            } else {
                throw new Error(`In injector could'nt find ${key}`);
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
