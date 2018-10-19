export interface IVnode {
    tagName?: string;
    node?: DocumentFragment | Element;
    parentNode?: Node;
    attributes?: TAttributes[];
    nodeValue?: string;
    childNodes?: IVnode[];
    type?: string;
    value?: string | number;
    repeatData?: any;
    eventTypes?: string;
    key?: any;
    checked?: boolean;
}

export type TAttributes = {
    name: string;
    value: string;
};

export interface IPatchList {
    type?: number;
    node?: DocumentFragment | Element;
    parentNode?: Node;
    newNode?: DocumentFragment | Element;
    oldVnode?: DocumentFragment | Element;
    newValue?: TAttributes | string | number | boolean | Function;
    oldValue?: TAttributes | string | number | boolean | Function;
    eventType?: string;
    newIndex?: number;
}