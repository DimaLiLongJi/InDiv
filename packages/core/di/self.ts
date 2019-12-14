import 'reflect-metadata';
import { metadataOfSelf, metadataOfPropSelf } from './metadata';


/**
 * add @Self in constructor arguments or property which only can be serached in the injector of the current component
 * 
 * A parameter decorator to be used on constructor parameters, which tells the DI framework to start dependency resolution from the local injector.
 * 
 *
 * @export
 * @returns {(target: Object, propertyKey: string, parameterIndex?: number) => void}
 */
export function Self(): (target: Object, propertyKey: string, parameterIndex?: number) => void {
  return function (target: Object, propertyKey: string, parameterIndex?: number) {
    if (!parameterIndex && parameterIndex !== 0) {
      const metadata: any[] = Reflect.getMetadata(metadataOfPropSelf, target.constructor) || [];
      metadata.push(propertyKey);
      Reflect.defineMetadata(metadataOfPropSelf, metadata, target.constructor);
    } else {
      const metadata = Reflect.getMetadata(metadataOfSelf, target) || [];
      metadata.push(parameterIndex);
      Reflect.defineMetadata(metadataOfSelf, metadata, target);
    }
  };
}
