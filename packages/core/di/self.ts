import 'reflect-metadata';
import { metadataOfSelf } from './metadata';


/**
 * add @Self in constructor arguments which only can be serached in the injector of the current component
 * 
 * A parameter decorator to be used on constructor parameters, which tells the DI framework to start dependency resolution from the local injector.
 * 
 *
 * @export
 * @returns {(target: Object, propertyKey: string, parameterIndex: number) => void}
 */
export function Self(): (target: Object, propertyKey: string, parameterIndex: number) => void {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    const metadata = Reflect.getMetadata(metadataOfSelf, target) || [];
    metadata.push(parameterIndex);
    Reflect.defineMetadata(metadataOfSelf, metadata, target);
  };
}
