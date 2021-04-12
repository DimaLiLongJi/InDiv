import { Injector, TProviders } from "@indiv/di";
import { PipeTransform } from '../pipe';
import { InDiv } from '../indiv';

export interface IPipe extends PipeTransform {
  [key: string]: any;
  $nativeElement: Element;
  $dependencesList?: string[];
  $indivInstance?: InDiv;
  $declarationMap?: Map<string, Function>;
  $privateInjector?: Injector;
  $privateProviders?: TProviders;
}



