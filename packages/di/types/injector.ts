import { Injector } from "../core";

export interface Type<T = any> extends Function {
  [key: string]: any;
  new(...args: any[]): T;
}

export type TInjectTokenProvider = {
  [props: string]: any | Function;
  provide: any;
  useClass?: Function;
  useValue?: any;
  useFactory?: any;
  deps?: any[];
};

export type TUseClassProvider = {
  provide: any;
  useClass?: Function;
  deps?: any[];
};

export type TUseValueProvider = {
  provide: any;
  useValue: any;
  deps?: any[];
};

export type TUseFactoryProvider = {
  provide: any;
  useFactory: Function;
  deps?: any[];
};

export type TProvider = Function | TUseClassProvider | TUseValueProvider | TUseFactoryProvider;

export type TProviders = TProvider[];

export interface IProviderClass {
  $providers?: TProviders;
  $privateProviders?: TProviders;
  $privateInjector?: Injector;
}

export type TInjectItem = {
  property?: string,
  index?: number,
  token?: any,
  injector?: Injector,
};
