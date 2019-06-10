import { TRouter, NvLocation, IComponentWithRoute } from '@indiv/router';
import { InDiv, INvModule, factoryModule } from '@indiv/core';

export type RouteCongfig = {
  path?: string,
  query?: any,
  routes?: TRouter[],
  nvRootPath?: string,
};

/**
 * build path to route
 *
 * @export
 * @param {string} url
 * @returns {string[]}
 */
export function buildPath(url: string): string[] {
  const renderRouteList = (url === '/') ? ['/'] : url.split('/');
  renderRouteList[0] = '/';
  return renderRouteList;
}

/**
 * find route via rootModule
 *
 * @export
 * @param {RouteCongfig} routeConfig
 * @param {TRouter[]} routesList
 * @param {string[]} renderRouteList
 * @param {InDiv} indiv
 * @param {Map<string, INvModule>} loadModuleMap
 * @returns {Promise<void>}
 */
export async function generalDistributeRoutes(routeConfig: RouteCongfig, routesList: TRouter[], renderRouteList: string[], indiv: InDiv, loadModuleMap: Map<string, INvModule>): Promise<void> {
  const nvLocation = new NvLocation(indiv);

  for (let index = 0; index < renderRouteList.length; index++) {
    const path = renderRouteList[index];
    if (index === 0) {
      const rootRoute = routeConfig.routes.find(route => route.path === `${path}` || /^\/\:.+/.test(route.path));
      if (!rootRoute) throw new Error(`route error: wrong route instantiation in generalDistributeRoutes: ${routeConfig.path}`);

      if (/^\/\:.+/.test(rootRoute.path)) {
        const key = rootRoute.path.split('/:')[1];
        nvLocation.get().params[key] = path;
      }

      routesList.push(rootRoute);

      if (rootRoute.routeCanActive) rootRoute.routeCanActive('/', routeConfig.path);
      if ((indiv.getBootstrapComponent as IComponentWithRoute).nvRouteCanActive) (indiv.getBootstrapComponent as IComponentWithRoute).nvRouteCanActive('/', routeConfig.path);

      if (rootRoute.redirectTo && /^\/.*/.test(rootRoute.redirectTo) && (index + 1) === renderRouteList.length) {
        await generalDistributeRoutes(routeConfig, routesList, buildPath(rootRoute.redirectTo), indiv, loadModuleMap);
        return;
      }
    } else {
      const lastRoute = routesList[index - 1].children;
      if (!lastRoute || !(lastRoute instanceof Array)) throw new Error('route error: routes not exit or routes must be an array!');
      const route = lastRoute.find(r => r.path === `/${path}` || /^\/\:.+/.test(r.path));
      if (!route) throw new Error(`route error: wrong route instantiation: ${routeConfig.path}`);

      const nativeElement = indiv.getRenderer.getElementsByTagName('router-render')[index - 1];

      let FindComponent = null;
      let component: IComponentWithRoute = null;
      let currentUrlPath = '';

      // build current url with route.path
      // because rootRoute hasn't been pushed to routesList, we need to += route.path
      routesList.forEach((r, index) => { if (index !== 0) currentUrlPath += r.path; });
      currentUrlPath += route.path;

      if (route.component) {
        const findComponentFromModuleResult = findComponentFromModule(route.component, currentUrlPath, indiv, loadModuleMap);
        FindComponent = findComponentFromModuleResult.component;
        component = indiv.initComponent(FindComponent, nativeElement, findComponentFromModuleResult.loadModule);
      }
      if (route.loadChild) {
        const loadModule = NvModuleFactoryLoader((route.loadChild as Function), currentUrlPath, loadModuleMap);
        FindComponent = loadModule.$bootstrap;
        component = indiv.initComponent(FindComponent, nativeElement, loadModule);
      }

      // navigation guards: route.routeCanActive component.nvRouteCanActive
      if (route.routeCanActive && !route.routeCanActive('/', routeConfig.path)) break;
      if (component.nvRouteCanActive && !component.nvRouteCanActive('/', routeConfig.path)) break;
      await indiv.runComponentRenderer(component, nativeElement);

      if (!route.component && !route.redirectTo && !route.loadChild) throw new Error(`route error: path ${route.path} need a component which has children path or need a  redirectTo which has't children path`);

      if (/^\/\:.+/.test(route.path)) {
        const key = route.path.split('/:')[1];
        nvLocation.get().params[key] = path;
      }
      routesList.push(route);

      if (route.redirectTo && /^\/.*/.test(route.redirectTo) && (index + 1) === renderRouteList.length) {
        await generalDistributeRoutes(routeConfig, routesList, buildPath(route.redirectTo), indiv, loadModuleMap);
        return;
      }
    }
  }
}

/**
 * find component from loadModule or rootModule
 * 
 * if loadModuleMap.size === 0, only in rootModule
 * if has loadModule, return component in loadModule firstly
 *
 * @export
 * @param {string} selector
 * @param {string} currentUrlPath
 * @param {InDiv} indiv
 * @param {Map<string, INvModule>} loadModuleMap
 * @returns {{ component: Function, loadModule: INvModule }}
 */
export function findComponentFromModule(selector: string, currentUrlPath: string, indiv: InDiv, loadModuleMap: Map<string, INvModule>): { component: Function, loadModule: INvModule } {
  if (loadModuleMap.size === 0) return {
    component: indiv.getDeclarations.find((component: any) => component.selector === selector && component.nvType === 'nvComponent'),
    loadModule: null,
  };

  let component = null;
  let loadModule = null;
  loadModuleMap.forEach((value, key) => {
    if (new RegExp(`^${key}.*`).test(currentUrlPath)) {
      component = value.$declarations.find((component: any) => component.selector === selector && component.nvType === 'nvComponent');
      loadModule = value;
    }
  });
  if (!component) {
    component = indiv.getDeclarations.find((component: any) => component.selector === selector && component.nvType === 'nvComponent');
    loadModule = null;
  }

  return { component, loadModule };
}

/**
 * build Module and return Component for route.loadChild
 *
 * @export
 * @param {Function} loadChild
 * @param {string} currentUrlPath
 * @param {Map<string, INvModule>} loadModuleMap
 * @returns {INvModule}
 */
export function NvModuleFactoryLoader(loadChild: Function, currentUrlPath: string, loadModuleMap: Map<string, INvModule>): INvModule {
  if (loadModuleMap.has(currentUrlPath)) return loadModuleMap.get(currentUrlPath);

  const loadModule = loadChild;

  if (!loadModule) throw new Error('load child failed, please check your routes.');

  const loadModuleInstance = factoryModule(loadModule);
  loadModuleMap.set(currentUrlPath, loadModuleInstance);

  return loadModuleInstance;
}
