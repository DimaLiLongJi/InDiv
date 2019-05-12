import 'reflect-metadata';
import { metadataOfAttribute } from '../di';


/**
 * Specifies that a constant attribute value should be injected.
 *
 * @export
 * @param {string} attributeName
 * @returns {(target: Object, propertyKey: string, parameterIndex: number) => void}
 */
export function Attribute(attributeName: string): (target: Object, propertyKey: string, parameterIndex: number) => void {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    const metadata = Reflect.getMetadata(metadataOfAttribute, target) || [];
    metadata.push({ index: parameterIndex, attributeName });
    Reflect.defineMetadata(metadataOfAttribute, metadata, target);
  };
}
