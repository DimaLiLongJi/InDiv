import { Injector, TProviders } from '@indiv/di';

export interface INvModule {
  [key: string]: any;
  $declarationMap?: Map<string, Function>;
  $imports?: Function[];
  $declarations?: Function[];
  $providers?: TProviders;
  $exports?: Function[];
  $exportsList?: Function[];
  $bootstrap?: Function;
  $privateInjector?: Injector;
}
