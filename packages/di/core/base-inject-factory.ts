import { Injector } from './injector';

export type ParameterInjectInfoType = {
  key: any,
  argumentIndex?: number,
  decoratorArgument: any,
  bubblingLayer: number | 'always',
};

export type PropertyInjectInfoType = {
  key: any,
  property?: string,
  decoratorArgument: any,
  bubblingLayer: number | 'always',
};

export const resolveParameterInjectMap: Map<String, ((
  inject: ParameterInjectInfoType,
  injector: Injector) => any)> = new Map();

export const resolvePropertyInjectMap: Map<String, ((
  inject: PropertyInjectInfoType,
  injector: Injector) => any)> = new Map();

/**
 * need to extend for build a DI decorator
 *
 * @export
 * @abstract
 * @class InjectDecoratorFactory
 */
export abstract class InjectDecoratorFactory {
  public parameterName: String;
  public propertyName: String;

  /**
   * Creates an instance of InjectDecoratorFactory.
   * 
   * @param {string} [parameterName]
   * @param {string} [propertyName]
   * @memberof InjectDecoratorFactory
   */
  constructor(parameterName?: string, propertyName?: string) {
    if (parameterName) {
      this.parameterName = String(parameterName);
      resolveParameterInjectMap.set(this.parameterName, this.resolveParameterInject);
    }
    if (propertyName) {
      this.propertyName = String(propertyName);
      resolvePropertyInjectMap.set(this.propertyName, this.resolvePropertyInject);
    }
  }

  /**
   * for implementing a parameter of method for an inject decorator
   *
   * @abstract
   * @param {ParameterInjectInfoType} injectInfo
   * @param {Injector} injector
   * @returns {*}
   * @memberof InjectDecoratorFactory
   */
  public abstract resolveParameterInject(
    injectInfo: ParameterInjectInfoType,
    injector: Injector,
  ): any;

  /**
   * for implementing a property of instance for an inject decorator
   *
   *
   * @abstract
   * @param {PropertyInjectInfoType} injectInfo
   * @param {Injector} injector
   * @returns {*}
   * @memberof InjectDecoratorFactory
   */
  public abstract resolvePropertyInject(
    injectInfo: PropertyInjectInfoType,
    injector: Injector,
  ): any;

  /**
   * create decorator for inject
   *
   * @returns {(value?: any) => (target: Object, propertyKey: string, parameterIndex?: number) => void}
   * @memberof InjectDecoratorFactory
   */
  public createInjectDecoratorFactory(): (value?: any) => (target: Object, propertyKey: string, parameterIndex?: number) => void {
    return (value?: any): ((target: Object, propertyKey: string, parameterIndex?: number) => void) => {
      return (target: Object, propertyKey: string, parameterIndex?: number) => {
        if (!parameterIndex && parameterIndex !== 0) {
          const metadata: any[] = Reflect.getMetadata(this.propertyName, target.constructor) || [];
          metadata.push({ property: propertyKey, decoratorArgument: value });
          Reflect.defineMetadata(this.propertyName, metadata, target.constructor);
        } else {
          const metadata = Reflect.getMetadata(this.parameterName, target) || [];
          metadata.push({ argumentIndex: parameterIndex, decoratorArgument: value });
          Reflect.defineMetadata(this.parameterName, metadata, target);
        }
      };
    };
  }
}
