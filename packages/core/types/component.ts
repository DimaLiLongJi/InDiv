import { DirectiveList, IDirective } from './directive';
import { Vnode, ParseOptions } from '../vnode';
import { Compile } from '../compile';
import { ChangeDetectionStrategy } from '../component';

export type TComAndDir = {
  components: {
    nativeElement: any;
    inputs: any;
    name: string;
    content?: Vnode[];
    isFromContent: boolean;
  }[];
  directives: {
    nativeElement: any;
    inputs: any;
    name: string;
    isFromContent: boolean;
  }[];
};


export type ComponentList = {
  instanceScope: IComponent;
  content: Vnode[];
  isDirty: boolean;
} & DirectiveList;

export interface IComponent extends IDirective {
  [key: string]: any;
  $watchStatus?: 'pending' | 'available' | 'disable';
  $isWaitingRender?: boolean;
  $compileInstance?: Compile;

  $template?: string;
  $templateUrl?: string;
  $nvChangeDetection?: ChangeDetectionStrategy;
  $componentList?: ComponentList[];

  // compile template from string to templateVnode
  $parseVnodeOptions?: ParseOptions;
  $templateVnode?: Vnode[];
  $saveVnode?: Vnode[];
  $nvContent?: Vnode[];

  watchData?(): void;
  render?(): Promise<IComponent>;
  nvDoCheck?(): void;
  compiler?(nativeElement: Element | any, componentInstace: IComponent): Promise<IComponent>;
}
