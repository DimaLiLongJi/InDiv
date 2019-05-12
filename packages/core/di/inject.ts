import 'reflect-metadata';
import { metadataOfInject } from './metadata';

export type TInjectItem = {
  index: number,
  token: any,
};

/**
 * Creates a token that can be used in a DI Provider.
 *
 * @export
 * @class InjectionToken
 */
export class InjectionToken {
  private _desc: string;
  constructor(_desc: string) {
    this._desc = _desc;
  }
  public toString(): string {
    return `InjectionToken ${this._desc}`;
  }
}

/**
 * use @Inject to declare a provider token
 * 
 * A parameter decorator on a dependency parameter of a class constructor that specifies a custom provider of the dependency.
 *
 * @export
 * @param {InjectionToken} token
 * @returns {(target: Object, propertyKey: string, parameterIndex: number) => void}
 */
export function Inject(token: any): (target: Object, propertyKey: string, parameterIndex: number) => void {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    const metadata: TInjectItem[] = Reflect.getMetadata(metadataOfInject, target) || [];
    metadata.push({ index: parameterIndex, token });
    Reflect.defineMetadata(metadataOfInject, metadata, target);
  };
}
