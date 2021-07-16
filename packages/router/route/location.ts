import { utils, InDiv } from '@indiv/core';
import { Injectable } from '@indiv/di';

export type NvRouteObject = {
  path: string;
  query?: {
    [props: string]: any;
  };
  data?: any;
};

export const nvRouteStatus: {
  nvRouteObject: NvRouteObject,
  nvRouteParmasObject: {
    [props: string]: any;
  },
  nvRootPath: string,
} = {
  nvRouteObject: {
    path: null,
    query: {},
    data: null,
  },
  nvRouteParmasObject: {},
  nvRootPath: '/',
};

const lastNvRouteObject: {
  path: string;
  params?: any;
  query?: {
    [props: string]: any;
  };
  data?: any;
  rootPath?: string;
} = {
  path: nvRouteStatus.nvRouteObject.path,
  query: nvRouteStatus.nvRouteObject.query,
  params: nvRouteStatus.nvRouteParmasObject,
  data: nvRouteStatus.nvRouteObject.data,
  rootPath: nvRouteStatus.nvRootPath,
};

@Injectable()
export class NvLocation {
  constructor(private indivInstance: InDiv) {}

  /**
   * get route in @Component or @Directive
   *
   * get nvRouteObject and nvRouteParmasObject in InDiv
   * 
   * @export
   * @returns {{ path?: string; query?: any; params?: any; data?: any; rootPath?: string; }}
   */
  public get = (): { path?: string; query?: any; params?: any; data?: any; rootPath?: string; } => {
    return {
      path: nvRouteStatus.nvRouteObject.path,
      query: nvRouteStatus.nvRouteObject.query,
      params: nvRouteStatus.nvRouteParmasObject,
      data: nvRouteStatus.nvRouteObject.data,
      rootPath: nvRouteStatus.nvRootPath,
    };
  }

  /**
   * set route in @Component or @Directive
   * 
   * set nvRouteObject in InDiv
   * 
   * @export
   * @param {string} path
   * @param {*} [query]
   * @param {*} [data]
   * @param {string} [title]
   * @returns {void}
   */
  public set = (path: string, query?: any, data?: any, title?: string): void => {
    const rootPath = nvRouteStatus.nvRootPath === '/' ? '' : nvRouteStatus.nvRootPath;
    if (!this.indivInstance.getIndivEnv.isServerRendering) {
      history.pushState(
        { path, query, data },
        title,
        `${rootPath}${path}${utils.buildQuery(query)}`,
      );
    }
    nvRouteStatus.nvRouteObject = { path, query, data };
  }

  /**
   * redirect route in @Component or @Directive
   *
   * set nvRouteObject in InDiv
   * 
   * @param {string} path
   * @param {*} [query]
   * @param {*} [data]
   * @param {string} [title]
   * @memberof NvLocation
   */
  public redirectTo = (path: string, query?: any, data?: any, title?: string): void => {
    const rootPath = nvRouteStatus.nvRootPath === '/' ? '' : nvRouteStatus.nvRootPath;
    if (!this.indivInstance.getIndivEnv.isServerRendering) {
      history.replaceState(
        { path, query, data },
        title,
        `${rootPath}${path}${utils.buildQuery(query)}`,
      );
    }
    nvRouteStatus.nvRouteObject = { path, query, data };
    nvRouteStatus.nvRouteParmasObject = {};
  }
}
