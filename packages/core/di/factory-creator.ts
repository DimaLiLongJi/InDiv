import 'reflect-metadata';
import { TInjectTokenProvider, IDirective, TProviders } from '../types';
import { Injector } from './injector';
import {
    metadataOfInjectable,
    metadataOfOptional,
    metadataOfHost,
    metadataOfSelf,
    metadataOfSkipSelf,
    metadataOfInject,
    metadataOfAttribute,
    metadataOfPropInject,
    metadataOfPropHost,
    metadataOfPropOptional,
    metadataOfPropSelf,
    metadataOfPropSkipSelf,
} from './metadata';
import { TInjectItem } from './inject';
import { ElementRef } from '../component';
import { Renderer } from '../vnode';

function bindProperty(_constructor: Function, factoryInstance: any, injector?: Injector) {
    // @Inject 属性注入
    const injectList: { property: string, token: any }[] = Reflect.getMetadata(metadataOfPropInject, _constructor) || [];
    // 干预等级 @SkipSelf > @Self > @Host > @Optional
    const skipSelfList: string[] = Reflect.getMetadata(metadataOfPropSkipSelf, _constructor) || [];
    const selfList: string[] = Reflect.getMetadata(metadataOfPropSelf, _constructor) || [];
    const hostList: string[] = Reflect.getMetadata(metadataOfPropHost, _constructor) || [];
    const optionalList: string[] = Reflect.getMetadata(metadataOfPropOptional, _constructor) || [];
    if (injectList && injectList.length > 0) {
        injectList.forEach(inject => {
            let bubblingLayer: number | 'always' = 'always';
            if (hostList.indexOf(inject.property) !== -1) bubblingLayer = 1;
            if (selfList.indexOf(inject.property) !== -1) bubblingLayer = 0;
            // 构建冒泡开始的injector
            let findInjector = injector;
            if (skipSelfList.indexOf(inject.property) !== -1) findInjector = injector.parentInjector;

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
            return NvInstanceFactory(findService, serviceInjector, findProvider.deps);
        } else {
            const serviceInStance = NvInstanceFactory(findService, serviceInjector, findProvider.deps);
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
 * Create arguments for injectionCreator with injector and deps
 *
 * @param {Function} _constructor
 * @param {Injector} [injector]
 * @param {any[]} [deps]
 * @returns {any[]}
 */
function argumentsCreator(_constructor: Function, injector?: Injector, deps?: any[]): any[] {
    if (!deps || (Array.isArray(deps) && deps.length === 0)) return [];

    const args = [];
    // 干预等级 @SkipSelf > @Self > @Host > @Optional
    const skipSelfList: number[] = Reflect.getMetadata(metadataOfSkipSelf, _constructor) || [];
    const selfList: number[] = Reflect.getMetadata(metadataOfSelf, _constructor) || [];
    const hostList: number[] = Reflect.getMetadata(metadataOfHost, _constructor) || [];
    const optionalList: number[] = Reflect.getMetadata(metadataOfOptional, _constructor) || [];
    // 使用 @Inject 代替获取类型
    const injectTokenList: TInjectItem[] = Reflect.getMetadata(metadataOfInject, _constructor) || [];
    const attributeList: { index: number; attributeName: string; }[] = Reflect.getMetadata(metadataOfAttribute, _constructor) || [];

    // find instance from provider
    const needInjectedClassLength = deps.length;
    for (let i = 0; i < needInjectedClassLength; i++) {
        // 构建冒泡层数
        let bubblingLayer: number | 'always' = 'always';
        if (hostList.indexOf(i) !== -1) bubblingLayer = 1;
        if (selfList.indexOf(i) !== -1) bubblingLayer = 0;

        // 构建冒泡开始的injector
        let findInjector = injector;
        if (skipSelfList.indexOf(i) !== -1) findInjector = injector.parentInjector;

        // 构建@Attribute
        const findAttribute = attributeList.find((value) => value.index === i);
        if (findAttribute && ((_constructor as any).nvType === 'nvComponent' || (_constructor as any).nvType === 'nvDirective')) {
            const elementRef: ElementRef = findInjector.getInstance(ElementRef);
            const renderer: Renderer = findInjector.getInstance(Renderer);
            args.push(renderer.getAttribute(elementRef.nativeElement, findAttribute.attributeName));
            continue;
        }

        // @Inject 构建
        const findInjectToken = injectTokenList.find((value) => value.index === i);
        const key = findInjectToken ? findInjectToken.token : deps[i];

        if (findInjector.getInstance(key, bubblingLayer)) {
            args.push(findInjector.getInstance(key, bubblingLayer));
            continue;
        } else {
            // use @Optional will return null
            if (optionalList.indexOf(i) !== -1) {
                args.push(null);
                continue;
            }
            const findProvider = getService(findInjector, key, _constructor, bubblingLayer);
            args.push(findProvider);
            continue;
        }
    }

    return args;
}

/**
 * use injector to create arguments for constructor
 * 
 * only building provider need deps
 *
 * @export
 * @param {Function} _constructor
 * @param {Injector} [injector]
 * @param {any[]} [deps]
 * @returns {any[]}
 */
export function injectionCreator(_constructor: Function, injector?: Injector, deps?: any[]): any[] {
    let _deps: any[] = deps || [];
    if ((_constructor as any).injectTokens) _deps = (_constructor as any).injectTokens;
    else _deps = Reflect.getMetadata(metadataOfInjectable, _constructor) || [];

    // build $privateProviders into injector of @Component and @Directive
    if ((_constructor.prototype as IDirective).$privateProviders) {
        const length = (_constructor.prototype as IDirective).$privateProviders.length;
        for (let i = 0; i < length; i++) {
            const service = (_constructor.prototype as IDirective).$privateProviders[i];
            if ((service as TInjectTokenProvider).provide) injector.setProvider((service as TInjectTokenProvider).provide, service);
            else injector.setProvider(service as Function, service as Function);
        }
    }

    return argumentsCreator(_constructor, injector, _deps);
}

/**
 * create an instance with factory method
 * 
 * use injectionCreator to get arguments from Injector
 * only building provider need deps
 *
 * @export
 * @param {Function} _constructor
 * @param {Injector} [injector]
 * @param {any[]} [deps]
 * @returns {*}
 */
export function NvInstanceFactory(_constructor: Function, injector?: Injector, deps?: any[]): any {
    const args = injectionCreator(_constructor, injector, deps);
    const factoryInstance = new (_constructor as any)(...args);
    factoryInstance.$privateInjector = injector;
    bindProperty(_constructor, factoryInstance, injector);
    return factoryInstance;
}
