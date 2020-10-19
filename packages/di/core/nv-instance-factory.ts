import 'reflect-metadata';
import { Injector, rootInjector } from './injector';
import {
    TInjectTokenProvider,
    IProviderClass,
    TProviders,
    TInjectItem,
    Type,
} from '../types';
import {
    metadataOfInjectable,
    metadataOfOptional,
    metadataOfHost,
    metadataOfSelf,
    metadataOfSkipSelf,
    metadataOfInject,
    metadataOfPropInject,
    metadataOfPropHost,
    metadataOfPropOptional,
    metadataOfPropSelf,
    metadataOfPropSkipSelf,
} from './metadata';
import { resolveParameterInjectMap, resolvePropertyInjectMap } from './base-inject-factory';

/**
 * bind property for @Inject
 *
 * @param {Function} _constructor
 * @param {*} factoryInstance
 * @param {Injector} [injector]
 */
function bindProperty(_constructor: Function, factoryInstance: any, injector?: Injector) {
    // @Inject 属性注入
    const injectList: TInjectItem[] = Reflect.getMetadata(metadataOfPropInject, _constructor) || [];
    // 干预等级 @SkipSelf > @Self > @Host > @Optional
    const skipSelfList: string[] = Reflect.getMetadata(metadataOfPropSkipSelf, _constructor) || [];
    const selfList: string[] = Reflect.getMetadata(metadataOfPropSelf, _constructor) || [];
    const hostList: string[] = Reflect.getMetadata(metadataOfPropHost, _constructor) || [];
    const optionalList: string[] = Reflect.getMetadata(metadataOfPropOptional, _constructor) || [];

    // 使用自定义注解，还可以定义是否解决注入
    resolvePropertyInjectMap.forEach((resolveInject, key) => {
        const list: { property: string, decoratorArgument: any }[] = Reflect.getMetadata(key, _constructor) || [];

        list.forEach(inject => {
            let bubblingLayer: number | 'always' = 'always';
            if (hostList.indexOf(inject.property) !== -1) bubblingLayer = 1;
            if (selfList.indexOf(inject.property) !== -1) bubblingLayer = 0;

            let findInjector = injector;
            if (skipSelfList.indexOf(inject.property) !== -1) findInjector = injector.parentInjector;

            const findProvider = resolveInject({
                key,
                property: inject.property,
                decoratorArgument: inject.decoratorArgument,
                bubblingLayer,
            }, findInjector);

            if (!findProvider) {
                // use @Optional will return null
                if (optionalList.indexOf(inject.property) !== -1) {
                    factoryInstance[inject.property] = null;
                    return;
                }
                throw new Error(`Instance of ${key} can't be ${findProvider}`);
            }

            factoryInstance[inject.property] = findProvider;
        });
    });
    
    if (injectList && injectList.length > 0) {
        injectList.forEach(inject => {
            let bubblingLayer: number | 'always' = 'always';
            if (hostList.indexOf(inject.property) !== -1) bubblingLayer = 1;
            if (selfList.indexOf(inject.property) !== -1) bubblingLayer = 0;

            // 构建冒泡开始的injector
            let findInjector = injector;
            if (skipSelfList.indexOf(inject.property) !== -1) findInjector = injector.parentInjector;
            if (inject && inject.injector) findInjector = inject.injector;

            let findProvider = findInjector.getInstance(inject.token, bubblingLayer);
            if (!findProvider) {
                // use @Optional will return null
                if (optionalList.indexOf(inject.property) !== -1) {
                    factoryInstance[inject.property] = null;
                    return;
                }
                findProvider = getService(findInjector, inject.token, _constructor, bubblingLayer);
            }

            factoryInstance[inject.property] = findProvider;
        });
    }
}

/**
 * get service from Injector
 *
 * @param {Injector} [injector]
 * @param {*} [key]
 * @param {*} [_constructor]
 * @param {(number | 'always')} [bubblingLayer='always']
 * @returns
 */
function getService(injector?: Injector, key?: any, _constructor?: any, bubblingLayer: number | 'always' = 'always') {
    const findProvider: TInjectTokenProvider = injector.getProvider(key, bubblingLayer);

    if (findProvider) {
        let findService: any;
        if (findProvider.useClass) findService = findProvider.useClass;
        else if (findProvider.useValue) {
            return findProvider.useValue;
        } else if (findProvider.useFactory) {
            const factoryArgs = argumentsCreator(_constructor, injector, findProvider.deps);
            return findProvider.useFactory(...factoryArgs);
        } else findService = findProvider;

        const serviceParentInjector = injector.getParentInjectorOfProvider(findService, bubblingLayer);
        const serviceInjector = serviceParentInjector.fork();

        if (findService.isSingletonMode === false) {
            return NvInstanceFactory(findService, null, serviceInjector, findProvider.deps);
        } else {
            const serviceInStance = NvInstanceFactory(findService, null, serviceInjector, findProvider.deps);
            injector.setInstance(key, serviceInStance);
            return serviceInStance;
        }
    } else {
        throw new Error(`In injector could'nt find ${key}`);
    }
}

/**
 * format providers for @NvModule @Directive @Component
 *
 * @export
 * @param {TProviders} [providers]
 * @returns {TProviders}
 */
export function providersFormater(providers: TProviders): TProviders {
    if (!providers) return [];
    return providers.map(provider => {
        if ((provider as TInjectTokenProvider).provide) {
            if (!(provider as TInjectTokenProvider).useClass && !(provider as TInjectTokenProvider).useValue && !(provider as TInjectTokenProvider).useFactory) return { ...provider, useClass: (provider as TInjectTokenProvider).provide };
            else return provider;
        } else return { provide: provider as Function, useClass: provider as Function };
    });
}

/**
 * Create arguments for injectionCreator with injector and depsToken
 *
 * @param {Function} _constructor
 * @param {Injector} [injector]
 * @param {any[]} [depsToken]
 * @returns {any[]}
 */
function argumentsCreator(_constructor: Function, injector?: Injector, depsToken?: any[]): any[] {
    if (!depsToken || (Array.isArray(depsToken) && depsToken.length === 0)) return [];

    const args: any[] = [];
    // 干预等级 @SkipSelf > @Self > @Host > @Optional
    const skipSelfList: number[] = Reflect.getMetadata(metadataOfSkipSelf, _constructor) || [];
    const selfList: number[] = Reflect.getMetadata(metadataOfSelf, _constructor) || [];
    const hostList: number[] = Reflect.getMetadata(metadataOfHost, _constructor) || [];
    const optionalList: number[] = Reflect.getMetadata(metadataOfOptional, _constructor) || [];
    // 使用 @Inject 代替获取类型
    const injectTokenList: TInjectItem[] = Reflect.getMetadata(metadataOfInject, _constructor) || [];

    // find instance from provider
    const needInjectedClassLength = depsToken.length;
    for (let i = 0; i < needInjectedClassLength; i++) {
        // 构建冒泡层数
        let bubblingLayer: number | 'always' = 'always';
        if (hostList.indexOf(i) !== -1) bubblingLayer = 1;
        if (selfList.indexOf(i) !== -1) bubblingLayer = 0;

        const findInjectToken = injectTokenList.find((value) => value.index === i);

        // 构建冒泡开始的injector
        let findInjector = injector;
        if (skipSelfList.indexOf(i) !== -1) findInjector = injector.parentInjector;
        if (findInjectToken && findInjectToken.injector) findInjector = findInjectToken.injector;

        const key = (findInjectToken && findInjectToken.token) ? findInjectToken.token : depsToken[i];
        const isOptional = optionalList.indexOf(i) !== -1;

        let findProvider = null;

        // 使用自定义注解，还可以定义是否解决注入
        let canJump = false;
        resolveParameterInjectMap.forEach((resolveInject, key) => {
            const list: { argumentIndex: number; decoratorArgument: string; }[] = Reflect.getMetadata(key, _constructor) || [];
            const findInject = list.find((value) => value.argumentIndex === i);
            if (findInject) {
                findProvider = resolveInject({
                    key,
                    argumentIndex: findInject.argumentIndex,
                    decoratorArgument: findInject.decoratorArgument,
                    bubblingLayer,
                }, findInjector);
                canJump = true;
            }
        });
        if (canJump) {
            if (!isOptional && (findProvider === undefined || findProvider === null)) throw new Error(`Instance of ${key} can't be ${findProvider}`);
            args.push(findProvider);
            continue;
        }

        // 默认注解，使用构造函数或@Inject
        if (findInjector.getInstance(key, bubblingLayer)) {
            args.push(findInjector.getInstance(key, bubblingLayer));
            continue;
        } else {
            // use @Optional will return null
            if (isOptional) {
                args.push(null);
                continue;
            }
            findProvider = getService(findInjector, key, _constructor, bubblingLayer);
            args.push(findProvider);
            continue;
        }
    }

    return args;
}

/**
 * use injector to create arguments for constructor
 * 
 * only building providers which need depsToken
 *
 * @export
 * @param {Function} _constructor
 * @param {Injector} [injector]
 * @param {any[]} [depsToken]
 * @returns {any[]}
 */
export function injectionCreator(_constructor: Function, injector?: Injector, depsToken?: any[]): any[] {
    let _depsToken: any[] = depsToken || [];
    if ((_constructor as any).injectTokens) _depsToken = (_constructor as any).injectTokens;
    else _depsToken = Reflect.getMetadata(metadataOfInjectable, _constructor) || [];

    // build $privateProviders into injector of @Component and @Directive
    if ((_constructor.prototype as IProviderClass).$privateProviders) {
        const length = (_constructor.prototype as IProviderClass).$privateProviders.length;
        for (let i = 0; i < length; i++) {
            const service = (_constructor.prototype as IProviderClass).$privateProviders[i];
            if ((service as TInjectTokenProvider).provide) injector.setProvider((service as TInjectTokenProvider).provide, service);
            else injector.setProvider(service as Function, service as Function);
        }
    }

    return argumentsCreator(_constructor, injector, _depsToken);
}

/**
 * create an instance with factory method
 * 
 * use injectionCreator to get arguments from Injector
 * only building provider need depsToken
 *
 * @export
 * @template T
 * @param {Function} _constructor
 * @param {any[]} [deps]
 * @param {Injector} [injector]
 * @param {any[]} [depsToken]
 * @returns {T}
 */
export function NvInstanceFactory<T = any>(_constructor: Function, deps?: any[], injector?: Injector, depsToken?: any[]): T {
    let findInjector = injector;
    if (!injector) findInjector =  rootInjector;
    const args = (deps && deps instanceof Array) ? deps : injectionCreator(_constructor, findInjector, depsToken);
    const factoryInstance = (new (_constructor as any)(...args)) as T;
    (factoryInstance as any).$privateInjector = findInjector;
    bindProperty(_constructor, factoryInstance, findInjector);
    return factoryInstance;
}
