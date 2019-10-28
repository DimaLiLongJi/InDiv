## InDiv

作为整个应用的入口，InDiv 负责启动整个应用并存储一些全局变量，并通过在模块或是组件指令上通过注入 class `InDiv` 来获取当前实例及方法。


## 公开方法

1. `public use(Plugin: Type<IPlugin>): number` InDiv实例调用 插件 的入口，传入实现了`IPlugin`的类，InDiv 负责实例化插件并将在调用插件实例的的方法 `bootstrap(indivInstance: InDiv)` 将 InDiv 实例传入插件(将在插件中详细讲解)。

2. `bootstrapModule(Nvmodule: Function): void` InDiv实例启动引导 根模块app.module.ts 的入口。传入根模块并开始相关模块的初始化。

3. `init<R = Element>(): Promise<IComponent>` 初始化 InDiv 应用会先渲染根模块的`bootstrap`，整个应用中的初始化方法。

4. `renderComponent<R = Element>(BootstrapComponent: Function, nativeElement: R, otherModule?: INvModule, initVnode?: Vnode[]): Promise<IComponent>` 渲染组件的公共方法，`RouteModule`中 多次使用。可以为即将实例化的组件指定其他的模块及被提前分配的虚拟DOM结构。

  - `BootstrapComponent: Function` 需要实例化的组件类
  - `renderDOM: Element` 实例化的地方
  - `otherModule?: INvModule` 如果来自非根模块，在这里指定，并使用`otherModule`的 IOC容器`injector` 去注入服务给组件
  - `initVnode?: Vnode[]` 其他被分配给组件的初始vnode状态 `Vnode`
  - 返回 `Promise<IComponent>` 返回 promise 组件实例

5. `setRenderer(NewRenderer: any): void` 设置 InDiv 组件渲染类，该方法接收1个参数，为即将在组件中使用的渲染类。该方法可用于 **跨平台渲染** 修改渲染方法。

6. `get getRenderer(): Renderer` 返回 InDiv 组件渲染类的实例。

7. `get getBootstrapComponent(): IComponent` 获取引导根组件是获得的根组件的`bootstrap`组件实例。

8. `setRouteDOMKey(routeDOMKey: string): void` 设置 InDiv 的路由出口 tag name。

9. `get getRouteDOMKey(): string` 获取 InDiv 的路由出口 tag name。

10. `get getRootModule(): INvModule` 获取根模块

11. `get getDeclarations(): Function[]` 获取根模块上包括`imports`在内所有的`declarations`的组件和指令。

12. `setRootElement(node: any): void` 设置整个应用挂载的节点，不一定是Element类型，可以是任意类型仅仅为编译器使用，常用用于跨平台渲染

13. `get getRootElement(): any` 获取整个应用挂载的节点，不一定是Element类型，可以是任意类型仅仅为编译器使用，常用用于跨平台渲染

14. `setIndivEnv(env: string, isServerRendering?: boolean): void` 设置env环境变量及是否服务端渲染

15. `get getIndivEnv(): { isServerRendering: boolean; indivEnv: string; }` 获取env环境变量及是否服务端渲染

16. `initComponent<R = Element>(BootstrapComponent: Function, nativeElement: R, otherModule?: INvModule): IComponent` 实例化组件，并开启数据监听， 触发`OnInit`

17. `async runComponentRenderer<R = Element>(component: IComponent, nativeElement: R, initVnode?: Vnode[]): Promise<IComponent>` 异步渲染组件，`BeforeMount HasRender AfterMount`

18. v4.0.0新增静态方法：`public static bootstrap(Nvmodule: Type<INvModule>, bootstrapOptions: { plugins?: Type<IPlugin>[], } = {}): Promise<IComponent>` 初始化 InDiv 应用，挂在根模块和插件
