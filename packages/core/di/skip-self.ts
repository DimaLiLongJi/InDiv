import 'reflect-metadata';
import { metadataOfSkipSelf, metadataOfPropSkipSelf } from './metadata';


/**
 * add @SkipSelf in constructor arguments or property which only can be serached outside of the injector of the current component
 * 
 * A parameter decorator to be used on constructor parameters, which tells the DI framework to start dependency resolution from the parent injector.
 * Resolution works upward through the injector hierarchy, so the local injector is not checked for a provider.
 * 
 *
 * @export
 * @returns {(target: Object, propertyKey: string, parameterIndex?: number) => void}
 */
export function SkipSelf(): (target: Object, propertyKey: string, parameterIndex?: number) => void {
  return function (target: Object, propertyKey: string, parameterIndex?: number) {
    if (!parameterIndex && parameterIndex !== 0) {
      const metadata: any[] = Reflect.getMetadata(metadataOfPropSkipSelf, target.constructor) || [];
      metadata.push(propertyKey);
      Reflect.defineMetadata(metadataOfPropSkipSelf, metadata, target.constructor);
    } else {
      const metadata = Reflect.getMetadata(metadataOfSkipSelf, target) || [];
      metadata.push(parameterIndex);
      Reflect.defineMetadata(metadataOfSkipSelf, metadata, target);
    }
  };
}
