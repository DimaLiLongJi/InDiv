import { IComponent, ComponentList } from '../types';

import Compile from '../Compile';
import Watcher from '../Watcher';
import Utils from '../Utils';
import { CompileUtil } from '../CompileUtils';
import { factoryCreator } from '../Injectable';


type TComponentOptions = {
  selector: string;
  template: string;
};

/**
 * Decorator @Component
 * 
 * to decorate an InDiv component
 *
 * @template State
 * @template Props
 * @template Vm
 * @param {TComponentOptions} options
 * @returns {(_constructor: Function) => void}
 */
function Component<State = any, Props = any, Vm = any>(options: TComponentOptions): (_constructor: Function) => void {
  return function (_constructor: Function): void {
    (_constructor as any).$selector = options.selector;
    const vm: IComponent<State, Props, Vm> = _constructor.prototype;
    vm.$template = options.template;

    vm.utils = new Utils();
    vm.compileUtil = new CompileUtil();
    vm.$components = [];
    vm.$componentList = [];

    vm.getLocation = function (): {
      path?: string;
      query?: any;
      params?: any;
      data?: any;
    } {
      if (!this.utils.isBrowser()) return {};
      return {
        path: (this as IComponent<State, Props, Vm>).$vm.$esRouteObject.path,
        query: (this as IComponent<State, Props, Vm>).$vm.$esRouteObject.query,
        params: (this as IComponent<State, Props, Vm>).$vm.$esRouteParmasObject,
        data: (this as IComponent<State, Props, Vm>).$vm.$esRouteObject.data,
      };
    };

    vm.setLocation = function (path: string, query?: any, data?: any, title?: string): void {
      if (!this.utils.isBrowser()) return;
      const rootPath = (this as IComponent<State, Props, Vm>).$vm.$rootPath === '/' ? '' : (this as IComponent<State, Props, Vm>).$vm.$rootPath;
      history.pushState(
        { path, query, data },
        title,
        `${rootPath}${path}${(this as IComponent<State, Props, Vm>).utils.buildQuery(query)}`,
      );
      (this as IComponent<State, Props, Vm>).$vm.$esRouteObject = { path, query, data };
    };

    vm.watchData = function (): void {
      if (this.state) {
        if ((this as IComponent<State, Props, Vm>).nvWatchState) (this as IComponent<State, Props, Vm>).stateWatcher = new Watcher((this as IComponent<State, Props, Vm>).state, (this as IComponent<State, Props, Vm>).nvWatchState.bind(this as IComponent<State, Props, Vm>), (this as IComponent<State, Props, Vm>).reRender.bind(this as IComponent<State, Props, Vm>));
        if (!(this as IComponent<State, Props, Vm>).nvWatchState) (this as IComponent<State, Props, Vm>).stateWatcher = new Watcher((this as IComponent<State, Props, Vm>).state, null, (this as IComponent<State, Props, Vm>).reRender.bind(this as IComponent<State, Props, Vm>));
      }
    };

    vm.render = function () {
      const dom = (this as IComponent<State, Props, Vm>).renderDom;
      const compile = new Compile(dom, this as IComponent<State, Props, Vm>);
      (this as IComponent<State, Props, Vm>).mountComponent(dom, true);
      (this as IComponent<State, Props, Vm>).$componentList.forEach(component => {
        if (component.scope.render) component.scope.render();
        if (component.scope.nvAfterMount) component.scope.nvAfterMount();
      });
      if (this.nvHasRender) this.nvHasRender();
    };

    vm.reRender = function (): void {
      const dom = (this as IComponent<State, Props, Vm>).renderDom;
      const routerRenderDom = dom.querySelectorAll((this as IComponent<State, Props, Vm>).$vm.$routeDOMKey)[0];
      const compile = new Compile(dom, (this as IComponent<State, Props, Vm>), routerRenderDom);
      (this as IComponent<State, Props, Vm>).mountComponent(dom, false);
      // (this as IComponent<State, Props, Vm>).$componentList.forEach(component => {
      //   if (component.scope.render) component.scope.reRender();
      //   if (component.scope.nvAfterMount) component.scope.nvAfterMount();
      // });
      // if ((this as IComponent<State, Props, Vm>).nvHasRender) (this as IComponent<State, Props, Vm>).nvHasRender();
    };

    vm.mountComponent = function (dom: Element, isFirstRender?: boolean): void {
      const saveStates: ComponentList<IComponent<State, Props, Vm>>[] = [];
      (this as IComponent<State, Props, Vm>).$componentList.forEach(component => {
        saveStates.push(component);
      });
      (this as IComponent<State, Props, Vm>).componentsConstructor(dom);
      (this as IComponent<State, Props, Vm>).$componentList.forEach(component => {
        const saveComponent = saveStates.find(save => save.dom === component.dom);
        // const saveComponent = saveStates.find(save => save.dom.tagName === component.dom.tagName && save.dom.index === component.dom.index);
        if (saveComponent) {
          // saveComponent.scope.renderDom = component.scope.renderDom;
          component.scope = saveComponent.scope;
          // old props: component.scope.props
          // new props: component.props
          if (!this.utils.isEqual(component.scope.props, component.props)) {
            if (component.scope.nvReceiveProps) component.scope.nvReceiveProps(component.props);
            component.scope.props = component.props;
          }
        }
        component.scope.$vm = (this as IComponent<State, Props, Vm>).$vm;
        component.scope.$components = (this as IComponent<State, Props, Vm>).$components;
        // if (component.scope.nvOnInit && isFirstRender) component.scope.nvOnInit();
        if (component.scope.nvOnInit && !saveComponent) component.scope.nvOnInit();
        if (component.scope.watchData) component.scope.watchData();
        if (component.scope.nvBeforeMount) component.scope.nvBeforeMount();
      });
    };

    vm.componentsConstructor = function (dom: Element): void {
      (this as IComponent<State, Props, Vm>).$componentList = [];
      const routerRenderDom = dom.querySelectorAll((this as IComponent<State, Props, Vm>).$vm.$routeDOMKey)[0];
      ((this as IComponent<State, Props, Vm>).constructor as any)._injectedComponents.forEach((injectedComponent: any) => {
        if (!(this as IComponent<State, Props, Vm>).$components.find((component: any) => component.$selector === injectedComponent.$selector)) (this as IComponent<State, Props, Vm>).$components.push(injectedComponent);
      });
      for (let i = 0; i <= (this as IComponent<State, Props, Vm>).$components.length - 1 ; i ++) {
        const name = (((this as IComponent<State, Props, Vm>).$components[i]) as any).$selector;
        const tags = dom.getElementsByTagName(name);
        Array.from(tags).forEach((node, index) => {
          //  protect component in <router-render>
          if (routerRenderDom && routerRenderDom.contains(node)) return;

          const nodeAttrs = node.attributes;
          const props: any = {};

          if (nodeAttrs) {
            const attrList = Array.from(nodeAttrs);
            const _propsKeys: any = {};

            attrList.forEach((attr: any) => {
              if (/^\_prop\-(.+)/.test(attr.name)) _propsKeys[attr.name.replace('_prop-', '')] = JSON.parse(attr.value);
            });

            attrList.forEach((attr: any) => {
              const attrName = attr.name;
              if ((/^\_prop\-(.+)/.test(attr.name))) {
                node.removeAttribute(attrName);
                return;
              }
              const prop = /^\{(.+)\}$/.exec(attr.value);
              if (prop) {
                const valueList = prop[1].split('.');
                const key = valueList[0];
                let _prop = null;
                if (/^(state.).*/g.test(prop[1])) _prop = (this as IComponent<State, Props, Vm>).compileUtil._getVMVal(this as IComponent<State, Props, Vm>, prop[1]);
                if (/^(\@.).*/g.test(prop[1])) _prop = (this as IComponent<State, Props, Vm>).compileUtil._getVMVal(this as IComponent<State, Props, Vm>, prop[1].replace(/^(\@)/, ''));
                if (_propsKeys.hasOwnProperty(key)) _prop = (this as IComponent<State, Props, Vm>).getPropsValue(valueList, _propsKeys[key]);
                if (node.repeatData[key]) _prop = (this as IComponent<State, Props, Vm>).compileUtil._getValueByValue(node.repeatData[key], prop[1], key);
                props[attrName] = (this as IComponent<State, Props, Vm>).buildProps(_prop);
              }
              node.removeAttribute(attrName);
            });
          }
          (this as IComponent<State, Props, Vm>).$componentList.push({
            dom: node,
            // dom: {
            //   tagName: name,
            //   index,
            // },
            props,
            scope: (this as IComponent<State, Props, Vm>).buildComponentScope((this as IComponent<State, Props, Vm>).$components[i], props, node),
          });
        });
      }
    };

    vm.setState = function (newState: any): void {
      if (newState && (this as IComponent<State, Props, Vm>).utils.isFunction(newState)) {
        const _newState = newState();
        if (_newState && _newState instanceof Object) {
          for (const key in _newState) {
            if ((this as IComponent<State, Props, Vm>).state.hasOwnProperty(key) && (this as IComponent<State, Props, Vm>).state[key] !== _newState[key]) (this as IComponent<State, Props, Vm>).state[key] = _newState[key];
            if (!(this as IComponent<State, Props, Vm>).state.hasOwnProperty(key)) (this as IComponent<State, Props, Vm>).state[key] = _newState[key];
          }
          (this as IComponent<State, Props, Vm>).reRender();
        }
      }
      if (newState && newState instanceof Object) {
        for (const key in newState) {
          if ((this as IComponent<State, Props, Vm>).state.hasOwnProperty(key) && (this as IComponent<State, Props, Vm>).state[key] !== newState[key]) (this as IComponent<State, Props, Vm>).state[key] = newState[key];
          if (!(this as IComponent<State, Props, Vm>).state.hasOwnProperty(key)) (this as IComponent<State, Props, Vm>).state[key] = newState[key];
        }
        (this as IComponent<State, Props, Vm>).reRender();
      }
    };

    vm.getPropsValue = function (valueList: any[], value: any): void {
      let val = value;
      valueList.forEach((v, index: number) => {
        if (index === 0) return;
        val = val[v];
      });
      return val;
    };

    vm.buildProps = function (prop: any): any {
      if ((this as IComponent<State, Props, Vm>).utils.isFunction(prop)) {
        return prop.bind(this as IComponent<State, Props, Vm>);
      } else {
        return prop;
      }
    };

    vm.buildComponentScope = function (ComponentClass: Function, props: any, dom: Element): IComponent<State, Props, Vm> {
      const _component = factoryCreator(ComponentClass, (this as IComponent<State, Props, Vm>).$vm.$rootModule);
      _component.props = props;
      _component.renderDom = dom;
      _component.$components = (this as IComponent<State, Props, Vm>).$components;
      return _component;
    };
  };
}

export default Component;
