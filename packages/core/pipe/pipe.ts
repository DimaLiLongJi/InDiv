import { injected } from "@indiv/di";

/**
 *
 *
 * @export
 * @interface PipeTransform
 */
export interface PipeTransform {
  transform(value: any, ...args: any[]): any
}


export type TPipeOptions = {
  name: string;
  pure?: boolean;
};


export function Pipe(options: TPipeOptions): (_constructor: Function) => void {
  return function (_constructor: Function): void {
    injected(_constructor);
    (_constructor as any).isSingletonMode = false;
    (_constructor as any).nvType = 'nvPipe';
    (_constructor as any).selector = options.name;
    (_constructor as any).pure = options.pure;
    const vm: any = _constructor.prototype;
    vm.$declarationMap = new Map();
  }
}
