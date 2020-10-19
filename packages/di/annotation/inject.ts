import 'reflect-metadata';
import { Type, IProviderClass, TInjectItem } from '../types';
import { Injector, metadataOfInject, metadataOfPropInject } from '../core';
import { rootInjector } from '../core';


/**
 * Creates a token that can be used in a DI Provider.
 *
 * @export
 * @class InjectionToken
 */
export class InjectionToken<T = any> {
  private _desc: string;
  constructor(_desc: string, options?: {
    providedIn?: Type<any> | 'root' | null;
    factory: () => T;
  }) {
    this._desc = _desc;
    if (options && options.factory) {
      if (options.providedIn === 'root') rootInjector.setProvider(this, { provide: this, useFactory: options.factory });
      if (options.providedIn && (options.providedIn as any).nvType === 'nvModule') {
        ((options.providedIn as any).prototype as IProviderClass).$providers.push({ provide: this, useFactory: options.factory });
      }
      if (!options.providedIn) {
        rootInjector.setProvider(this, { provide: this, useFactory: options.factory });
      }
    }
  }
  public toString(): string {
    return `InjectionToken ${this._desc}`;
  }
}

/**
 * use @Inject to declare a provider token
 * 
 * A parameter decorator on a dependency parameter of a class constructor or property that specifies a custom provider of the dependency.
 *
 * @export
 * @param {*} [token]
 * @returns {(target: Object, propertyKey: string, parameterIndex?: number) => void}
 */
export function Inject(options?: {
  injector: Injector,
  token: Injector,
} | any): (target: Object, propertyKey: string, parameterIndex?: number) => void {
  return function (target: any, propertyKey: string, parameterIndex?: number) {
    // 属性注解，先获取token，没有拿属性的类型
    if (!parameterIndex && parameterIndex !== 0) {
      const propertyType = Reflect.getMetadata('design:type', target, propertyKey);
      if (!options && !propertyType) throw new Error(`attribute of ${target} : ${propertyKey} can't be injected because that '@Inject' can't find token and type of attribute!`);
      
      const findToken: any = (options && options.token) ? options.token : (options && options.injector ? propertyType : options);
      const findInjector: any = (options && options.injector) ? options.injector : null;
      const metadata: TInjectItem[] = Reflect.getMetadata(metadataOfPropInject, target.constructor) || [];
      const data: TInjectItem = { property: propertyKey, token: findToken, injector: findInjector };

      metadata.push(data);
      Reflect.defineMetadata(metadataOfPropInject, metadata, target.constructor);
    } else {
      // 构造函数参数注解，先获取token，没有拿参数属性的类型
      const propertyTypeList = Reflect.getMetadata('design:paramtypes', target, propertyKey);
      if (!options && (!propertyTypeList || !propertyTypeList[parameterIndex])) throw new Error(`constructor's attribute of ${target} : ${propertyKey} can't be injected because that '@Inject' can't find token and type of attribute!`);

      const findToken: any = (options && options.token) ? options.token :  (options && options.injector ? propertyTypeList[parameterIndex] : options);
      const findInjector: any = (options && options.injector) ? options.injector : null;
      const metadata: TInjectItem[] = Reflect.getMetadata(metadataOfInject, target) || [];

      const data: TInjectItem = { index: parameterIndex, token: findToken, injector: findInjector };
      metadata.push(data);
      Reflect.defineMetadata(metadataOfInject, metadata, target);
    }
  };
}
