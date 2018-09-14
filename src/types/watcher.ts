import { IUtil } from './utils';

export type TFnWatcher = (newData: any) => void;
export type TFnRender = () => void;

export interface IWatcher {
    data: any;
    watcher: TFnWatcher;
    render: TFnRender;
    utils: IUtil;
    watchData(data: any): void;
}
