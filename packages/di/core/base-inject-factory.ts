import { Injector } from './injector';

export const resolveParameterInjectMap: Map<String, ((
  inject: {
    key: any,
    argumentIndex?: number,
    property?: string,
    decoratorArgument: any,
    bubblingLayer: number | 'always',
  },
  injector: Injector) => any)> = new Map();

export const resolvePropertyInjectMap: Map<String, ((
  inject: {
    key: any,
    argumentIndex?: number,
    property?: string,
    decoratorArgument: any,
    bubblingLayer: number | 'always',
  },
  injector: Injector) => any)> = new Map();

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
      this.parameterName = new String(parameterName);
      resolveParameterInjectMap.set(this.parameterName, this.resolveInject);
    }
    if (propertyName) {
      this.propertyName = new String(propertyName);
      resolvePropertyInjectMap.set(this.propertyName, this.resolveInject);
    }
  }

  /**
   * resolve inject for decorator
   *
   * @abstract
   * @param {({
   *       key: any,
   *       argumentIndex: number,
   *       decoratorArgument: any,
   *       bubblingLayer: number | 'always',
   *     })} injectInfo
   * @param {Injector} injector
   * @returns {*}
   * @memberof InjectDecoratorFactory
   */
  public abstract resolveInject(
    injectInfo: {
      key: any,
      argumentIndex: number,
      decoratorArgument: any,
      bubblingLayer: number | 'always',
    },
    injector: Injector,
  ): any;

  /**
   * create decorator for inject
   *
   * @returns
   * @memberof InjectDecoratorFactory
   */
  public createInjectDecoratorFactory() {
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
