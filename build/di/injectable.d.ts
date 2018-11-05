declare type TInjectableOptions = {
    isSingletonMode?: boolean;
};
/**
 * Decorator @Injectable
 *
 * to decorate an InDiv Service
 *
 * @param {TInjectableOptions} [options]
 * @returns {(_constructor: Function) => void}
 */
export declare function Injectable(options?: TInjectableOptions): (_constructor: Function) => void;
export {};