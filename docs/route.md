## 路由

类似于其他前端框架，InDiv 也提供了一套路由系统来帮助页面渲染。让用户从一个视图导航到另一个视图。它们应该聚焦于展示数据，而把数据访问的职责委托给某个服务。

InDiv 的 Router（即“路由器”）借鉴了这个浏览器的导航模型。

它把浏览器中的 URL 看做一个操作指南， 据此导航到一个由客户端生成的视图，并可以把参数传给支撑视图的相应组件，帮它决定具体该展现哪些内容。

你可以为页面中的链接绑定一个路由，这样，当用户点击链接时，就会导航到应用中相应的视图。

当用户点击按钮、从下拉框中选取，或响应来自任何地方的事件时，你也可以在代码控制下进行导航。

路由器还在浏览器的历史日志中记录下这些活动，这样浏览器的前进和后退按钮也能照常工作。


## 配置路由

InDiv 2.0.5+ 放弃以前使用插件构建路由，开始使用 NvModule 重构路由系统。

通过引入默认的路由模块，就可以快速搭建一个拥有路由导航的应用程序。

当引入`RouteModule` 时，仅仅导出`RouterTo, RouterFrom,`这两个指令和对全局Injector注入`NvLocation`提供商。但是当调用`RouteModule`的静态方法时，将返回一个开启路由监听的`RouteModule`。

> app.module.ts

```typescript
import { NvModule } from '@indiv/core';
import { RouteModule, TRouter } from '@indiv/router';
import AppComponent from './app.component';
import ShowAgeComponent from './components/show-age/show-age.component';
import ChangeColorDirective from './directives/change-color.directive';
import TestService from './provides/test.service';

const routes: TRouter[] = [
  {
    path: '/',
  },
];

@NvModule({
  imports: [
    RouteModule.forRoot({
      routes,
      rootPath: '/demo', // 根路径 如果该页面不是基于'/'的话需要手动填写
      routeChange: (lastRoute?: string, nextRoute?: string) => {},
    }),
  ],
  declarations: [ AppComponent, ShowAgeComponent, ChangeColorDirective ],
  providers: [
    {
      provide: TestService,
      useClass: TestService,
    }
  ],
  bootstrap: AppComponent,
  exports: [],
})
export default class AppModule {}
```

`routes` 是一个多维数组，数组的每一项都拥有下面五个key值：

  1. `path: string;` 定义路由的路径，在`routes`数组的第一层只允许拥有一个对象，相应地 `path` 应该为 `/`，该项只需要写在该层级的路径即可。
  2. `redirectTo?: string;` 当完整的路由到这一层级时，将被重定向到另外一个路径中，需要写除根路径之外的完整路径。该路由可以拥有 `children`
  3. `component?: string;` 路由到达该层级需要加载的组件`selector`，该`selector`需要是 在根模块中声明的组件`selector` 或是 被导入的组件`selector`
  4. `children?: TRouter[];` 该层级路由的子路由
  5. `loadChild?: { name: string; child: () => Promise<any>; } | () => Promise<any>;` 懒加载路由配置，如果文件`export`出一个模块，则使用`{ name: string; child: () => Promise<any>; `,如果文件使用`export defalut`则使用`() => Promise<any>;` loadChild 与 component 二者尽可保留一个

  ```typescript
  {
    path: '/C1',
    loadChild: {
      name: 'TestLoadchildModule',
      child: () => import('./loadChild'),
    },
  }
  ```

**需要注意的是位于数组最顶层的 `path: '/'` 必须指定，但是不能指定`component` 和 `loadChild`，因为根模块的`bootstrap`将取代这一项**

你也可以写动态路由`/:someId`,这样可以在 `NvLocation`的`get`方法返回的`params`里面找到`key`为`someId`的动态路由值。

现在让我们为路由多加一层 `/a` 并让根路径直接重定向到 `/a`，首先再写一个组件作为路由渲染的视图组件导入根模块并配置路由的`child`

> components/page-a/page-a.component.ts

```typescript
import { Component, nvReceiveInputs } from '@indiv/core';

@Component({
    selector: 'page-a',
    template: (`<p>page A</p>`),
})
export default class PageAComponent {}
```

> app.module.ts

```typescript
import { NvModule } from '@indiv/core';
import { RouteModule, TRouter } from '@indiv/router';
import AppComponent from './app.component';
import ShowAgeComponent from './components/show-age/show-age.component';
import ChangeColorDirective from './directives/change-color.directive';
import TestService from './provides/test.service';
import PageAComponent from './components/page-a/page-a.component';

const routes: TRouter[] = [
  {
    path: '/',
    redirectTo: '/a',
    children: [
      path: '/a',
      component: 'page-a',
    ]
  },
];

@NvModule({
  imports: [
    RouteModule.forRoot({
      routes,
      rootPath: '/demo',
      routeChange: (lastRoute?: string, nextRoute?: string) => {},
    }),
  ],
  declarations: [ AppComponent, ShowAgeComponent, ChangeColorDirective, PageAComponent ],
  providers: [
    {
      provide: TestService,
      useClass: TestService,
    }
  ],
  bootstrap: AppComponent,
  exports: [],
})
export default class AppModule {}
```

回到根组件`app-component`，作为父级路由的组件，必须包括一个标签`<router-render></router-render>`，子路由组件渲染将渲染到父级路由组件的该元素内。

关于重定向 `redirectTo` ，它与 `component` `children` 或下文的 `loadChild` 都不冲突，因为只有当你访问完整的路径到达该路径才会触发重定向，因而拥有重定向 `redirectTo` 的路径依然可以拥有子路由`children``loadChild`。并且当路由渲染到子路由时，依然可以正确渲染而不会在中途就重定向出去。

> app.component.ts

```typescript
import { Component, StateSetter, SetState, Watch } from '@indiv/core';
import TestService from './provides/test.service';

@Component({
    selector: 'app-component',
    template: (`
        <div class="app-component-container">
          <input nv-model="name"/>
          <p nv-on:click="addAge()" change-color="{color}">name: {{name}}</p>
          <show-age age="{age}" uupDateAge="{@upDateAge}"></show-age>
        </div>
    `),
})
export default class AppComponent {
  public name: string = 'InDiv';
  @Watch() public age: number;
  public color: string = 'red';

  @StateSetter() public setState: SetState;

  constructor(
    private testService: TestService
  ) {
    console.log(this.testService.count); // 1
    this.testService.count = 2; // 2
  }

  public addAge(): void {
    this.setState({ age: 24 });
  }

  public upDateAge(age: number) {
    this.age = age;
    // this.setState({ age: 24 });
  }
}
```

此时可以浏览`/demo` 和 `/demo/a`


## 手动更改导航

如果引入`RouteModule`之后，根Injector中将拥有`NvLocation`这个提供商，通过依赖注入系统注入该服务商可以直接获得修改路由的权力。

```typescript
interface NvLocation {
  get(): { path?: string; query?: any; params?: any; data?: any; rootPath?: string; };
  set(path: string, query?: any, data?: any, title?: string): void;
  redirectTo(path: string, query?: any, data?: any, title?: string): void;
}
```

下面将添加点击事件，发生路由跳转。

> app.component.ts

```typescript
import { Component, StateSetter, SetState, Watch } from '@indiv/core';
import { NvLocation } from '@indiv/router';
import TestService from './provides/test.service';

@Component({
    selector: 'app-component',
    template: (`
        <div class="app-component-container">
          <input nv-model="name"/>
          <p nv-on:click="addAge()" change-color="{color}">name: {{name}}</p>
          <show-age age="{age}" uupDateAge="{@upDateAge}"></show-age>
          <router-render></router-render>
        </div>
    `),
})
export default class AppComponent {
  public name: string = 'InDiv';
  @Watch() public age: number;
  public color: string = 'red';

  @StateSetter() public setState: SetState;

  constructor(
    private testService: TestService,
    private nvLocation: NvLocation
  ) {
    console.log(this.testService.count); // 1
    this.testService.count = 2; // 2
  }

  public addAge(): void {
    this.setState({ age: 24 });
    this.nvLocation.set('/a');
    console.log('此时路由：', this.nvLocation.get());
  }

  public upDateAge(age: number) {
    this.age = age;
    // this.setState({ age: 24 });
  }
}
```

或者我们可以使用指令来做到这件事

> app.component.ts

```typescript
import { Component, StateSetter, SetState, Watch } from '@indiv/core';
import TestService from './provides/test.service';

@Component({
    selector: 'app-component',
    template: (`
        <div class="app-component-container">
          <input nv-model="name"/>
          <a router-to="routeTo">点击跳转到/a</a>
          <p nv-on:click="addAge()" change-color="{color}">name: {{name}}</p>
          <show-age age="{age}" uupDateAge="{@upDateAge}"></show-age>
          <router-render></router-render>
        </div>
    `),
})
export default class AppComponent {
  public name: string = 'InDiv';
  @Watch() public age: number;
  public color: string = 'red';

  @StateSetter() public setState: SetState;

  constructor(
    private testService: TestService
  ) {
    console.log(this.testService.count); // 1
    this.testService.count = 2; // 2
  }

  public addAge(): void {
    this.setState({ age: 24 });
  }

  public upDateAge(age: number) {
    this.age = age;
    // this.setState({ age: 24 });
  }
}
```


## 路由懒加载

在继续构应用程序的过程中，应用的尺寸将会变得更大。在某一个时间点，你将达到一个顶点，应用将会需要过多的时间来加载。所以你不可能一下子把所有模块都 import 进根模块。

通过引进异步路由，可以获得在请求时才惰性加载特性模块的能力。

当然你需要优先修改你的打包程序，让其识别`import()`并可以根据动态引入进行代码切片，

像webpack parcel之类的都提供动态引入，因为我们仅仅使用 `import()`，因此并不需要像 angular 需要写loader去让编译器识别 `loadChildren`。

首先我们要把`PageAComponent` 从 根模块中删除。

> app.module.ts

```typescript
import { NvModule } from '@indiv/core';
import { RouteModule, TRouter } from '@indiv/router';
import AppComponent from './app.component';
import ShowAgeComponent from './components/show-age/show-age.component';
import ChangeColorDirective from './directives/change-color.directive';
import TestService from './provides/test.service';
// import PageAComponent from './components/page-a/page-a.component';

const routes: TRouter[] = [
  {
    path: '/',
    redirectTo: '/a',
    children: [
      path: '/a',
      component: 'page-a',
    ]
  },
];

@NvModule({
  imports: [
    RouteModule.forRoot({
      routes,
      rootPath: '/demo',
      routeChange: (lastRoute?: string, nextRoute?: string) => {},
    }),
  ],
  declarations: [
    AppComponent, 
    ShowAgeComponent,
    ChangeColorDirective,
    // PageAComponent
  ],
  providers: [
    {
      provide: TestService,
      useClass: TestService,
    }
  ],
  bootstrap: AppComponent,
  exports: [],
})
export default class AppModule {}
```

然后为了这个路由重新构建一个新的模块，在 `modules`中新建一个模块`page-a/page-a.lazy.module.ts`，并引入模块`PageAComponent`并设为`bootstrap`

> modules/page-a/page-a.lazy.module.ts

```typescript
import { NvModule } from '@indiv/core';
import PageAComponent from '../../components/page-a/page-a.component';

@NvModule({
  declarations: [
    PageAComponent,
  ],
  bootstrap: PageAComponent,
})
export default class PageALazyModule {}
```

最后我们回到根模块来修改下路由的配置

1. v0.0.0-v3.1.2以前的路由懒加载：

> app.module.ts

```typescript
import { NvModule } from '@indiv/core';
import { TRouter, RouteModule } from '@indiv/router';
import AppComponent from './app.component';
import ShowAgeComponent from './components/show-age/show-age.component';
import ChangeColorDirective from './directives/change-color.directive';
import TestService from './provides/test.service';

const routes: TRouter[] = [
  {
    path: '/',
    redirectTo: '/a',
    children: [
      path: '/a',
      // 使用 export default 打包
      loadChild: () => import('./components/page-a/page-a.component'),
      // 使用 export 打包 需要指定导出的模块名
      // loadChild: {
      //   name: 'PageALazyModule',
      //   child: () => import('./components/page-a/page-a.component'),
      // },
    ]
  },
];

@NvModule({
  imports: [
    RouteModule.forRoot({
      routes,
      rootPath: '/demo',
      routeChange: (lastRoute?: string, nextRoute?: string) => {},
    }),
  ],
  declarations: [
    AppComponent, 
    ShowAgeComponent,
    ChangeColorDirective,
  ],
  providers: [
    {
      provide: TestService,
      useClass: TestService,
    }
  ],
  bootstrap: AppComponent,
  exports: [],
})
export default class AppModule {}
```

注意模块导出的方法

如果使用 `export default` 的方式：

```typescript
loadChild: () => import('./components/page-a/page-a.component'),
```

如果使用 `export` 的方式：loadChild则是个对象，name 为模块名

```typescript
loadChild: {
  name: 'PageALazyModule',
  child: () => import('./components/page-a/page-a.component'),
},
```

2. v4.0.0同步angular的路由懒加载：

> app.module.ts

```typescript
import { NvModule } from '@indiv/core';
import { TRouter, RouteModule } from '@indiv/router';
import AppComponent from './app.component';
import ShowAgeComponent from './components/show-age/show-age.component';
import ChangeColorDirective from './directives/change-color.directive';
import TestService from './provides/test.service';

const routes: TRouter[] = [
  {
    path: '/',
    redirectTo: '/a',
    children: [
      path: '/a',
      // 使用 export default 打包
      loadChild: () => import('./components/page-a/page-a.component').then(mod => mod.default),
      // 使用 export 打包 需要指定导出的模块名
      // loadChild: () => import('./components/page-a/page-a.component').then(mod => mod.PageAComponent),
    ]
  },
];

@NvModule({
  imports: [
    RouteModule.forRoot({
      routes,
      rootPath: '/demo',
      routeChange: (lastRoute?: string, nextRoute?: string) => {},
    }),
  ],
  declarations: [
    AppComponent, 
    ShowAgeComponent,
    ChangeColorDirective,
  ],
  providers: [
    {
      provide: TestService,
      useClass: TestService,
    }
  ],
  bootstrap: AppComponent,
  exports: [],
})
export default class AppModule {}
```


最后懒加载模块之后的 `children`子路 由可以继续像普通的方法（定义`component`等方式）定义，但如果懒加载模块之后的子路由中并不存在对应的组件，则 `RouteModule` 会去 **根模块中寻找对应的组件** 渲染路由，并从 **根模块和根注入器** 寻找组件，指令及依赖提供商。

`RouteModule.forRoot` 仅仅是一个静态方法，参数类型`{ routes: TRouter[], rootPath?: string, routeChange?: (lastRoute?: string, nextRoute?: string) => void }`，返回一个开启监听路由的`RouteModule`，当工厂函数开始实例化的时候，


## 懒加载模块的依赖提供商

NvModule 级的依赖提供商可以在 `@NgModule()` `providers` 元数据中指定，但是其实全局只有一个根注入器 `rootInjector` ，他负责全局的依赖收集。

在整个服务启动之后，根注入器便停止收集新的 `providers`，因此懒加载的模块中的 `providers` 依赖提供商并不会被收集到根注入器中。

`RouteModule` 为懒加载请求到的模块重新配置了新的`injector`，并且与懒加载模块同级存在。

但一旦 懒加载的模块中的 `providers` 依赖提供商 并不存在对应的 DI令牌 ，则 `RouteModule` 会去 根注入器 继续寻找依赖及实例。

所以，想要在 **懒加载模块与根模块之间的组件** 实现通信，请不要在懒加载模块中声明 **公用的依赖提供商**。


## 路由守卫

通过路由，任何用户都能在任何时候导航到任何地方。 但有时候这样是不对的。

  - 该用户可能无权导航到目标组件。
  - 可能用户得先登录（认证）。
  - 在显示目标组件前，你可能得先获取某些数据。
  - 你可能要询问用户：你是否要放弃本次更改，而不用保存它们？

1. 你可以往路由配置中添加守卫，来处理这些场景。

  在路由配置中添加 `routeCanActive?: (lastRoute: string, newRoute: string) => boolean;` 和 `routeChange?: (lastRoute?: string, newRoute?: string) => void;`

  `routeCanActive` 守卫返回一个值，以控制路由器的行为：如果它返回 true，导航过程会继续。如果它返回 false，导航过程就会终止，且用户留在原地，在路由守卫中处理该用户到该去的地方。

  `routeChange` 当前路由组件实例化之后，路由变化会触发该方法，可以在该方法里记录用户导航记录。


  > app.module.ts

  ```typescript
  import { NvModule } from '@indiv/core';
  import { TRouter, RouteModule } from '@indiv/router';
  import AppComponent from './app.component';
  import ShowAgeComponent from './components/show-age/show-age.component';
  import ChangeColorDirective from './directives/change-color.directive';
  import TestService from './provides/test.service';

  const routes: TRouter[] = [
    {
      path: '/',
      redirectTo: '/a',
      routeCanActive: (lastRoute: string, newRoute: string) => {
        console.log('path / can be active');
        return true;
      },
      nvRouteChange: (lastRoute: string, newRoute: string) => {
        console.log('path / has changed');
      },
      children: [
        path: '/a',
        loadChild: () => import('./components/page-a/page-a.component'),
      ]
    },
  ];
  ```

2. 组件路由生命周期

  通过实现 `RouteChange` `RouteCanActive` 接口，实现 `nvRouteChange(lastRoute: string, newRoute: string): void;` 和 `nvRouteCanActive(lastRoute: string, newRoute: string): boolean;` 两个路由生命周期来实现上面相同的作用。


  `nvRouteCanActive` 守卫返回一个值，以控制路由器的行为：如果它返回 true，导航过程会继续。如果它返回 false，导航过程就会终止，且用户留在原地，在路由守卫中处理该用户到该去的地方。 **根模块`bootstrap`引导组件的`nvRouteCanActive`会触发，但无论返回true false都不会影响根路由的渲染**

  `nvRouteChange` 当前路由挂载组件实例化之后，路由变化会触发该方法，可以在该方法里记录用户导航记录。并且**该路由组件内所有指令和组件都会触发该生命周期**。

  > app.component.ts

  ```typescript
  import { Component, StateSetter, SetState, Watch } from '@indiv/core';
  import { RouteChange, RouteCanActive } from '@indiv/router';
  import TestService from './provides/test.service';

  @Component({
      selector: 'app-component',
      template: (`
          <div class="app-component-container">
            <input nv-model="name"/>
            <a router-to="routeTo">点击跳转到/a</a>
            <p nv-on:click="addAge()" change-color="{color}">name: {{name}}</p>
            <show-age age="{age}" uupDateAge="{@upDateAge}"></show-age>
            <router-render></router-render>
          </div>
      `),
  })
  export default class AppComponent implements RouteChange, RouteCanActive {
    public name: string = 'InDiv';
    @Watch() public age: number;
    public color: string = 'red';

    @StateSetter() public setState: SetState;

    constructor(
      private testService: TestService
    ) {
      console.log(this.testService.count); // 1
      this.testService.count = 2; // 2
    }

    public nvRouteChange(lastRoute: string, newRoute: string) {
      console.log('AppComponent is nvRouteChange', lastRoute, newRoute);
    }

    public nvRouteCanActive(lastRoute: string, newRoute: string): boolean {
      console.log('AppComponent is nvRouteCanActive', lastRoute, newRoute);
      return true;
    }

    public addAge(): void {
      this.setState({ age: 24 });
    }

    public upDateAge(age: number) {
      this.age = age;
      // this.setState({ age: 24 });
    }
  }
  ```

  建议使用组件的路由生命周期，因为可以通过组件实例或服务获得数据。
