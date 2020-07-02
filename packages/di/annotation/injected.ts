import 'reflect-metadata';
import { metadataOfInjectable } from '../core';

/**
 * Decorator @injected or Function injected
 * declare Class which need be injected
 *
 * @export
 * @param {Function} _constructor
 */
export function injected(_constructor: Function): void {
  // through Reflect to get params types
  const paramsTypes: Function[] = Reflect.getMetadata('design:paramtypes', _constructor);
  if (paramsTypes && paramsTypes.length) Reflect.defineMetadata(metadataOfInjectable, paramsTypes, _constructor);
}
