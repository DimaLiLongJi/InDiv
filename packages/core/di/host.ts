import 'reflect-metadata';
import { metadataOfHost, metadataOfPropHost } from './metadata';


/**
 * add @Host in constructor arguments or property which only can be serached until he host element of the current component
 * 
 * A parameter decorator on a view-provider parameter of a class constructor that tells the DI framework to resolve the view by checking injectors of child elements.
 * And stop when reaching the host element of the current component.
 *
 * @export
 * @returns {(target: Object, propertyKey: string, parameterIndex?: number) => void}
 */
export function Host(): (target: Object, propertyKey: string, parameterIndex?: number) => void {
  return function (target: Object, propertyKey: string, parameterIndex?: number) {
    if (!parameterIndex && parameterIndex !== 0) {
      const metadata: any[] = Reflect.getMetadata(metadataOfPropHost, target.constructor) || [];
      metadata.push(propertyKey);
      Reflect.defineMetadata(metadataOfPropHost, metadata, target.constructor);
    } else {
      const metadata = Reflect.getMetadata(metadataOfHost, target) || [];
      metadata.push(parameterIndex);
      Reflect.defineMetadata(metadataOfHost, metadata, target);
    }
  };
}
