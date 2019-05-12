import { Injector } from '../di';
import { InDiv } from '../indiv';
import { TProviders } from './nv-module';

export type DirectiveList = {
    nativeElement: any;
    inputs: any;
    instanceScope: IDirective;
    constructorFunction: Function;
    isFromContent: boolean;
};

export enum HostBindingListType {
    property,
    attr,
    class,
    style,
}

export interface IDirective {
    [key: string]: any;
    $dependencesList?: string[];
    $saveInputs?: any;
    $nativeElement?: Element | any;
    $indivInstance?: InDiv;
    $declarationMap?: Map<string, Function>;
    $inputsList?: { propertyName: string; inputName: string; }[];
    $viewChildList?: { propertyName: string; selector: string | Function; }[];
    $viewChildrenList?: { propertyName: string; selector: string | Function; }[];
    $contentChildList?: { propertyName: string; selector: string | Function; }[];
    $contentChildrenList?: { propertyName: string; selector: string | Function; }[];
    $hostListenerList?: { eventName: string; propertyName: string; handler?: (e: Event) => void; args?: string[]; }[];
    $hostBindingList?: { type: HostBindingListType; name: string; propertyName: any; }[];
    $directiveList?: DirectiveList[];
    $privateInjector?: Injector;
    $privateProviders?: TProviders;

    nvOnInit?(): void;
    nvBeforeMount?(): void;
    nvAfterMount?(): void;
    nvOnDestory?(): void;
    nvHasRender?(): void;
    nvReceiveInputs?(nextInputs: any): void;
}
