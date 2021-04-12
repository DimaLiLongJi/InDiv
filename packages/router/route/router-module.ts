import { IComponent, INvModule, ComponentList, DirectiveList, NvModule, InDiv, Vnode, utils, IDirective, lifecycleCaller, NvModuleFactory, Type, ErrorHandler } from '@indiv/core';
import { nvRouteStatus, NvLocation } from './location';
import { RouterTo, RouterFrom } from './directives';
import { getService, rootInjector } from '@indiv/di';

export type TChildModule = () => Promise<Type<INvModule>>;

export interface IComponentWithRoute extends IComponent {
  nvRouteCanActive?: (lastRoute: string, newRoute: string) => boolean;
  nvRouteChange?: (lastRoute?: string, newRoute?: string) => void;
}
export interface IDirectiveWithRoute extends IDirective {
  nvRouteChange?: (lastRoute?: string, newRoute?: string) => void;
}

export type TRouter = {
  path: string;
  redirectTo?: string;
  component?: string;
  children?: TRouter[];
  loadChild?: TChildModule;
  routeCanActive?: (lastRoute: string, newRoute: string) => boolean;
  routeChange?: (lastRoute?: string, newRoute?: string) => void;
};

@NvModule({
  declarations: [
    RouterTo,
    RouterFrom,
  ],
  providers: [
    {
      useClass: NvLocation,
      provide: NvLocation,
    },
  ],
  exports: [
    RouterTo,
    RouterFrom,
  ],
})
export class RouteModule {
  public routeChange?: (lastRoute?: string, nextRoute?: string) => void;
  private routes: TRouter[];
  private routesList: TRouter[] = [];
  private currentUrl: string = '';
  private lastRoute: string = null;
  private hasRenderComponentList: IComponentWithRoute[] = [];
  private needRedirectPath: string = null;
  private isWatching: boolean = false;
  private renderRouteList: string[] = [];
  private loadModuleMap: Map<string, INvModule> = new Map();
  private canWatch: boolean = false;

  /**
   * Creates an instance of RouteModule.
   * 
   * if don't use static function forRoot, RouteModule.prototype.canWatch is false
   * if RouteModule.prototype.canWatch is false, don't watch router
   * if RouteModule.prototype.canWatch is true, watch router and reset RouteModule.prototype.canWatch
   * 
   * @param {InDiv} indivInstance
   * @param {NvLocation} nvLocation
   * @memberof RouteModule
   */
  constructor(
    private indivInstance: InDiv,
    private nvLocation: NvLocation,
  ) {
    if (!RouteModule.prototype.canWatch) return;
    RouteModule.prototype.canWatch = false;

    if (!this.routes) this.routes = [];
    if (!nvRouteStatus.nvRootPath) nvRouteStatus.nvRootPath = '/';
    this.indivInstance.setRouteDOMKey('router-render');

    // if isn't browser, will auto watch nvRouteStatus.nvRouteObject
    if (!utils.hasWindowAndDocument()) return;

    // if is browser, will watch nvRouteStatus.nvRouteObject by 'load' event of window
    window.addEventListener('load', () => this.refresh(), false);
    window.addEventListener('popstate', () => {
      let path;
      if (nvRouteStatus.nvRootPath === '/') {
        path = location.pathname || '/';
      } else {
        path = location.pathname.replace(nvRouteStatus.nvRootPath, '') === '' ? '/' : location.pathname.replace(nvRouteStatus.nvRootPath, '');
      }
      nvRouteStatus.nvRouteObject = {
        path,
        query: {},
        data: null,
      };
      nvRouteStatus.nvRouteParmasObject = {};
    }, false);
  }

  /**
   * init root data
   *
   * @static
   * @param {{
   *     routes: TRouter[],
   *     rootPath?: string,
   *     routeChange?: (lastRoute?: string, nextRoute?: string) => void,
   *   }} routeData
   * @returns {Function}
   * @memberof RouteModule
   */
  public static forRoot(routeData: {
    routes: TRouter[],
    rootPath?: string,
    routeChange?: (lastRoute?: string, nextRoute?: string) => void,
  }): Function {
    if (routeData.rootPath) nvRouteStatus.nvRootPath = routeData.rootPath;
    if (routeData.routeChange) RouteModule.prototype.routeChange = routeData.routeChange;
    if (routeData.routes && routeData.routes instanceof Array) {
      RouteModule.prototype.routes = routeData.routes;
    } else {
      throw new Error(`route error: no routes exit`);
    }

    RouteModule.prototype.canWatch = true;
    return RouteModule;
  }

  /**
   * build object by location.search
   *
   * @returns
   * @memberof Utils
   */
  private buildObjectFromLocationSearch(): Object {
    if (!location.search) return {};
    const returnValue: any = {};
    const queryList = location.search.split('?')[1].split('&');
    queryList.forEach(query => returnValue[query.split('=')[0]] = query.split('=')[1]);
    return returnValue;
  }

  /**
   * refresh if not watch $nvRouteObject
   *
   * @private
   * @memberof Router
   */
  private refresh(): void {
    if (!nvRouteStatus.nvRouteObject || !this.isWatching) {
      let path;
      if (nvRouteStatus.nvRootPath === '/') path = location.pathname || '/';
      else path = location.pathname.replace(nvRouteStatus.nvRootPath, '') === '' ? '/' : location.pathname.replace(nvRouteStatus.nvRootPath, '');

      nvRouteStatus.nvRouteObject = {
        path,
        query: this.buildObjectFromLocationSearch(),
        data: null,
      };
      nvRouteStatus.nvRouteParmasObject = {};

      this.routeWatcher();
    }
    this.currentUrl = nvRouteStatus.nvRouteObject.path || '/';
    this.routesList = [];
    this.renderRouteList = this.currentUrl === '/' ? ['/'] : this.currentUrl.split('/');
    this.renderRouteList[0] = '/';
    this.distributeRoutes();
  }

  /**
   * open watcher on nvRouteStatus.nvRouteObject
   *
   * @private
   * @returns
   * @memberof RouteModule
   */
  private routeWatcher(): void {
    const routeModuleInstance = this;
    let val = nvRouteStatus.nvRouteObject;
    Object.defineProperty(nvRouteStatus, 'nvRouteObject', {
      configurable: true,
      enumerable: true,
      get() {
        return val;
      },
      set(newVal: any) {
        const _val = JSON.parse(JSON.stringify(val));
        val = newVal;
        if (newVal.path !== _val.path) routeModuleInstance.refresh();
      },
    });
    this.isWatching = true;
  }

  /**
   * distribute routes and decide insert or general Routes
   * 
   * @private
   * @returns {Promise<void>}
   * @memberof Router
   */
  private async distributeRoutes(): Promise<void> {
    if (this.lastRoute && this.lastRoute !== this.currentUrl) {
      // has rendered
      nvRouteStatus.nvRouteParmasObject = {};
      await this.insertRenderRoutes();
    } else {
      // first render child
      await this.generalDistributeRoutes();
    }
    if (this.routeChange) this.routeChange(this.lastRoute, this.currentUrl);
    this.lastRoute = this.currentUrl;
    if (this.needRedirectPath) {
      this.nvLocation.redirectTo(this.needRedirectPath, {}, null, null);
      this.needRedirectPath = null;
    }
  }

  /**
   * insert Routes and render
   * 
   * if has rendered Routes, it will find which is different and render it
   *  
   * @private
   * @returns {Promise<void>}
   * @memberof Router
   */
  private async insertRenderRoutes(): Promise<void> {
    const lastRouteList = this.lastRoute === '/' ? ['/'] : this.lastRoute.split('/');
    lastRouteList[0] = '/';

    for (let index = 0; index < this.renderRouteList.length; index++) {
      const path = this.renderRouteList[index];
      if (index === 0) {
        const rootRoute = this.routes.find(route => route.path === `${path}` || `${path}/` || /^\/\:.+/.test(route.path));
        if (!rootRoute) throw new Error(`route error: wrong route instantiation in insertRenderRoutes: ${this.currentUrl}`);
        this.routesList.push(rootRoute);
      } else {
        const lastRoute = this.routesList[index - 1].children;
        if (!lastRoute || !(lastRoute instanceof Array)) throw new Error('route error: routes not exit or routes must be an array!');
        const route = lastRoute.find((r: TRouter) => r.path === `/${path}` || `/${path}/` || /^\/\:.+/.test(r.path));
        if (!route) throw new Error(`route error: wrong route instantiation: ${this.currentUrl}`);
        this.routesList.push(route);
      }

      if (path !== lastRouteList[index]) {
        const needRenderRoute = this.routesList[index];
        if (!needRenderRoute) throw new Error(`route error: wrong route instantiation in insertRenderRoutes: ${this.currentUrl}`);

        const nativeElement = this.indivInstance.getRenderer.getElementsByTagName('router-render')[index - 1];

        let initVnode: Vnode[] = null;
        if (this.hasRenderComponentList[index]) initVnode = this.hasRenderComponentList[index].$saveVnode;

        if (!needRenderRoute.component && !needRenderRoute.redirectTo && !needRenderRoute.loadChild) throw new Error(`route error: path ${needRenderRoute.path} need a component which has children path or need a redirectTo which has't children path`);

        if (/^\/\:.+/.test(needRenderRoute.path) && !needRenderRoute.redirectTo) {
          const key = needRenderRoute.path.split('/:')[1];
          nvRouteStatus.nvRouteParmasObject[key] = path;
        }

        let FindComponent = null;
        let component = null;
        let currentUrlPath = '';

        // build current url with route.path
        // because route has been pushed to this.routesList, don't use to += path
        this.routesList.forEach((r, index) => { if (index !== 0) currentUrlPath += r.path; });

        if (needRenderRoute.component) {
          const findComponentFromModuleResult = this.findComponentFromModule(needRenderRoute.component, currentUrlPath);
          FindComponent = findComponentFromModuleResult.component;
          component = this.initComponent(FindComponent, nativeElement, findComponentFromModuleResult.loadModule);
        }
        if (needRenderRoute.loadChild) {
          const loadModule = await this.NvModuleFactoryLoader(needRenderRoute.loadChild as TChildModule, currentUrlPath);
          FindComponent = loadModule.$bootstrap;
          component = this.initComponent(FindComponent, nativeElement, loadModule);
        }

        // navigation guards: route.routeCanActive component.nvRouteCanActive
        if (needRenderRoute.routeCanActive && !needRenderRoute.routeCanActive(this.lastRoute, this.currentUrl)) break;

        if (FindComponent) {
          // insert needRenderComponent on index in this.hasRenderComponentList
          // and remove other component which index >= index of FindComponent
          if (component) {
            if (component.nvRouteCanActive && !component.nvRouteCanActive(this.lastRoute, this.currentUrl)) break;
            await this.runRender(component, nativeElement, initVnode);
            if (this.hasRenderComponentList[index]) this.hasRenderComponentList.splice(index, 0, component);
            else this.hasRenderComponentList[index] = component;
          } else {
            throw new Error(`route error: path ${needRenderRoute.path} need a component`);
          }

          this.routerChangeEvent(index);
        }

        if (needRenderRoute.redirectTo && /^\/.*/.test(needRenderRoute.redirectTo) && (index + 1) === this.renderRouteList.length) {
          this.needRedirectPath = needRenderRoute.redirectTo;
          return;
        }
      }

      // add parmas in $nvRouteParmasObject
      if (path === lastRouteList[index]) {
        const needRenderRoute = this.routesList[index];
        if (/^\/\:.+/.test(needRenderRoute.path) && !needRenderRoute.redirectTo) {
          const key = needRenderRoute.path.split('/:')[1];
          nvRouteStatus.nvRouteParmasObject[key] = path;
        }
      }

      if (index === (this.renderRouteList.length - 1) && index < (lastRouteList.length - 1)) {
        const nativeElement = this.indivInstance.getRenderer.getElementsByTagName('router-render')[index];
        this.routerChangeEvent(index);

        if (nativeElement && this.indivInstance.getRenderer.hasChildNodes(nativeElement)) this.indivInstance.getRenderer.getChildNodes(nativeElement).forEach(child => this.indivInstance.getRenderer.removeChild(nativeElement, child));

        const needRenderRoute = this.routesList[index];
        if (needRenderRoute.redirectTo && /^\/.*/.test(needRenderRoute.redirectTo) && (index + 1) === this.renderRouteList.length) {
          this.needRedirectPath = needRenderRoute.redirectTo;
          return;
        }
      }
    }
  }

  /**
   * render Routes
   * 
   * first render
   *  
   * @private
   * @returns {Promise<void>}
   * @memberof Router
   */
  private async generalDistributeRoutes(): Promise<void> {
    for (let index = 0; index < this.renderRouteList.length; index++) {
      const path = this.renderRouteList[index];
      if (index === 0) {
        const rootRoute = this.routes.find(route => route.path === `${path}` || `${path}/` || /^\/\:.+/.test(route.path));
        if (!rootRoute) throw new Error(`route error: wrong route instantiation in generalDistributeRoutes: ${this.currentUrl}`);

        if (/^\/\:.+/.test(rootRoute.path)) {
          const key = rootRoute.path.split('/:')[1];
          nvRouteStatus.nvRouteParmasObject[key] = path;
        }

        this.routesList.push(rootRoute);

        // push root component in InDiv instance
        this.hasRenderComponentList.push(this.indivInstance.getBootstrapComponent);

        if (rootRoute.routeCanActive) rootRoute.routeCanActive(this.lastRoute, this.currentUrl);
        if ((this.indivInstance.getBootstrapComponent as IComponentWithRoute).nvRouteCanActive) (this.indivInstance.getBootstrapComponent as IComponentWithRoute).nvRouteCanActive(this.lastRoute, this.currentUrl);
        if (index === this.renderRouteList.length - 1) this.routerChangeEvent(index);

        if (rootRoute.redirectTo && /^\/.*/.test(rootRoute.redirectTo) && (index + 1) === this.renderRouteList.length) {
          this.needRedirectPath = rootRoute.redirectTo;
          this.renderRouteList.push(rootRoute.redirectTo);
          return;
        }
      } else {
        const lastRoute = this.routesList[index - 1].children;
        if (!lastRoute || !(lastRoute instanceof Array)) throw new Error('route error: routes not exit or routes must be an array!');
        const route = lastRoute.find(r => r.path === `/${path}` || `/${path}/` || /^\/\:.+/.test(r.path));

        if (!route) throw new Error(`route error: wrong route instantiation: ${this.currentUrl}`);

        const nativeElement = this.indivInstance.getRenderer.getElementsByTagName('router-render')[index - 1];

        let initVnode: Vnode[] = null;
        if (this.hasRenderComponentList[index]) initVnode = this.hasRenderComponentList[index].$saveVnode;

        let FindComponent = null;
        let component = null;
        let currentUrlPath = '';

        // build current url with route.path
        // because rootRoute hasn't been pushed to this.routesList, we need to += route.path
        this.routesList.forEach((r, index) => { if (index !== 0) currentUrlPath += r.path; });
        currentUrlPath += route.path;

        if (route.component) {
          const findComponentFromModuleResult = this.findComponentFromModule(route.component, currentUrlPath);
          FindComponent = findComponentFromModuleResult.component;
          component = this.initComponent(FindComponent, nativeElement, findComponentFromModuleResult.loadModule);
        }
        if (route.loadChild) {
          const loadModule = await this.NvModuleFactoryLoader(route.loadChild as TChildModule, currentUrlPath);
          FindComponent = loadModule.$bootstrap;
          component = this.initComponent(FindComponent, nativeElement, loadModule);
        }

        // navigation guards: route.routeCanActive component.nvRouteCanActive
        if (route.routeCanActive && !route.routeCanActive(this.lastRoute, this.currentUrl)) break;

        if (!route.component && !route.redirectTo && !route.loadChild) throw new Error(`route error: path ${route.path} need a component which has children path or need a  redirectTo which has't children path`);

        if (/^\/\:.+/.test(route.path)) {
          const key = route.path.split('/:')[1];
          nvRouteStatus.nvRouteParmasObject[key] = path;
        }
        this.routesList.push(route);

        if (component) {
          if (component.nvRouteCanActive && !component.nvRouteCanActive(this.lastRoute, this.currentUrl)) break;
          await this.runRender(component, nativeElement, initVnode);
          this.hasRenderComponentList.push(component);
        }
        
        if (index === this.renderRouteList.length - 1) this.routerChangeEvent(index);

        if (route.redirectTo && /^\/.*/.test(route.redirectTo) && (index + 1) === this.renderRouteList.length) {
          this.needRedirectPath = route.redirectTo;
          return;
        }
      }
    }
  }

  /**
   * emit nvRouteChange and nvOnDestory for Components
   *
   * @private
   * @param {number} index
   * @memberof Router
   */
  private routerChangeEvent(index: number): void {
    try {
      this.hasRenderComponentList.forEach((component, i) => {
        if (component.nvRouteChange) component.nvRouteChange(this.lastRoute, this.currentUrl);
        this.emitDirectiveEvent(component.$directiveList, 'nvRouteChange');
        this.emitComponentEvent(component.$componentList, 'nvRouteChange');
        if (i >= index + 1) {
          this.emitDirectiveEvent(component.$directiveList, 'nvOnDestory');
          this.emitComponentEvent(component.$componentList, 'nvOnDestory');
          lifecycleCaller(component, 'nvOnDestory');
        }
      });
    } catch (e) {
      // 增加下错误处理，使用ErrorHandler
      let errorHandler: ErrorHandler = null;
      if (!errorHandler && this.indivInstance.getRootModule) {
        const injector = this.indivInstance.getRootModule.$privateInjector || rootInjector;
        // 在这里处理全局的handler
        if (!injector.getProvider(ErrorHandler)) return;
        errorHandler = getService(injector, ErrorHandler);
      }
      if (errorHandler) errorHandler.handleError(e);
      else console.error('route error: call route event: ', e);
    } finally {
      this.hasRenderComponentList.length = index + 1;
    }
  }

  /**
   * emit nvRouteChange and nvOnDestory for Components with recursion
   * 
   * @private
   * @param {ComponentList[]} componentList
   * @param {string} event
   * @memberof Router
   */
  private emitComponentEvent(componentList: ComponentList[], event: string): void {
    if (event === 'nvRouteChange') {
      componentList.forEach(component => {
        if ((component.instanceScope as IComponentWithRoute).nvRouteChange) (component.instanceScope as IComponentWithRoute).nvRouteChange(this.lastRoute, this.currentUrl);
      });
    }
    if (event === 'nvOnDestory') {
      componentList.forEach(component => {
        this.emitDirectiveEvent(component.instanceScope.$directiveList, event);
        this.emitComponentEvent(component.instanceScope.$componentList, event);
        lifecycleCaller(component.instanceScope, 'nvOnDestory');
      });
    }
  }

  /**
   * emit nvRouteChange and nvOnDestory for Directives with recursion
   *
   * @private
   * @param {DirectiveList[]} directiveList
   * @param {string} event
   * @memberof RouteModule
   */
  private emitDirectiveEvent(directiveList: DirectiveList[], event: string): void {
    if (event === 'nvRouteChange') {
      directiveList.forEach(directive => {
        if ((directive.instanceScope as IDirectiveWithRoute).nvRouteChange) (directive.instanceScope as IDirectiveWithRoute).nvRouteChange(this.lastRoute, this.currentUrl);
      });
    }
    if (event === 'nvOnDestory') {
      directiveList.forEach(directive => {
        lifecycleCaller(directive.instanceScope, 'nvOnDestory');
      });
    }
  }

  /**
   * instantiate Component
   * 
   * use InDiv initComponent
   * 
   * if argument has loadModule, use loadModule
   * if argument has'nt loadModule, use rootModule in InDiv
   *
   * @private
   * @param {Function} FindComponent
   * @param {Element} nativeElement
   * @param {INvModule} loadModule
   * @returns {IComponentWithRoute}
   * @memberof RouteModule
   */
  private initComponent(FindComponent: Function, nativeElement: Element, loadModule: INvModule): IComponentWithRoute {
    return this.indivInstance.initComponent(FindComponent, nativeElement, loadModule);
  }

  /**
   * run renderer of Component
   * 
   * if argument has initVnode, will use initVnode fro new Component instance
   *
   * @private
   * @template R
   * @param {IComponentWithRoute} FindComponent
   * @param {R} nativeElement
   * @param {Vnode[]} [initVnode]
   * @returns {Promise<IComponentWithRoute>}
   * @memberof RouteModule
   */
  private runRender<R = Element>(FindComponent: IComponentWithRoute, nativeElement: R, initVnode?: Vnode[]): Promise<IComponentWithRoute> {
    return this.indivInstance.runComponentRenderer(FindComponent, nativeElement, initVnode);
  }

  /**
   * build Module and return Component for route.loadChild
   *
   * @private
   * @param {(TChildModule)} loadChild
   * @returns {Promise<INvModule>}
   * @memberof Router
   */
  private async NvModuleFactoryLoader(loadChild: TChildModule, currentUrlPath: string): Promise<INvModule> {
    if (this.loadModuleMap.has(currentUrlPath)) return this.loadModuleMap.get(currentUrlPath);

    const loadModule = await loadChild();

    if (!loadModule) throw new Error('load child failed, please check your routes.');

    const loadModuleInstance = NvModuleFactory(loadModule);
    this.loadModuleMap.set(currentUrlPath, loadModuleInstance);

    return loadModuleInstance;
  }

  /**
   * find component from loadModule or rootModule
   * 
   * if this.loadModuleMap.size === 0, only in rootModule
   * if has loadModule, return component in loadModule firstly
   * 
   *
   * @private
   * @param {string} selector
   * @param {string} currentUrlPath
   * @returns {{ component: Function, loadModule: INvModule }}
   * @memberof Router
   */
  private findComponentFromModule(selector: string, currentUrlPath: string): { component: Function, loadModule: INvModule } {
    if (this.loadModuleMap.size === 0) return {
      component: this.indivInstance.getDeclarations.find((component: any) => component.selector === selector && component.nvType === 'nvComponent'),
      loadModule: null,
    };

    let component = null;
    let loadModule = null;
    this.loadModuleMap.forEach((value, key) => {
      if (new RegExp(`^${key}.*`).test(currentUrlPath)) {
        component = value.$declarations.find((component: any) => component.selector === selector && component.nvType === 'nvComponent');
        loadModule = value;
      }
    });
    if (!component) {
      component = this.indivInstance.getDeclarations.find((component: any) => component.selector === selector && component.nvType === 'nvComponent');
      loadModule = null;
    }

    return { component, loadModule };
  }
}
