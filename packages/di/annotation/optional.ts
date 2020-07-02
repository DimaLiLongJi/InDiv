import 'reflect-metadata';
import { metadataOfOptional, metadataOfPropOptional } from '../core';


/**
 * add @Optional in constructor arguments or property which can be null
 * 
 * A parameter decorator to be used on constructor parameters, which marks the parameter as being an optional dependency.
 * The DI framework provides null if the dependency is not found.
 * 
 * 当找不到依赖时，@Optional装饰器会告诉indiv继续执行，indiv会把此注入参数设置为null（而不是默认的抛出错误的行为）
 *
 * @export
 * @returns {(target: Object, propertyKey: string, parameterIndex?: number) => void}
 */
export function Optional(): (target: Object, propertyKey: string, parameterIndex?: number) => void {
  return function (target: Object, propertyKey: string, parameterIndex?: number) {
    if (!parameterIndex && parameterIndex !== 0) {
      const metadata: any[] = Reflect.getMetadata(metadataOfPropOptional, target.constructor) || [];
      metadata.push(propertyKey);
      Reflect.defineMetadata(metadataOfPropOptional, metadata, target.constructor);
    } else {
      const metadata = Reflect.getMetadata(metadataOfOptional, target) || [];
      metadata.push(parameterIndex);
      Reflect.defineMetadata(metadataOfOptional, metadata, target);
    }
  };
}
