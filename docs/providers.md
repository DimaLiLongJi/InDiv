## 依赖提供商

几乎所有的东西都可以被认为是提供伤 - service等等。他们都可以通过 constructor 注入依赖关系，也就是说，他们可以创建各种关系。但事实上，提供者不过是一个用`@Injectable()` 装饰器注解的简单类。

组件和指令不应该直接获取或保存数据，它们不应该了解是否在展示假数据。它们应该聚焦于展示数据，而把数据访问的职责委托给某个服务。

不要使用 new 来创建服务，而要依靠 InDiv 的 依赖注入(DI) 机制把它注入到 组件或服务的 的构造函数中

在 InDiv 中，所有用`@Injectable()` 装饰器并没有特殊定义的提供者都为单例服务。即在同一个 `Injector` 中仅仅存在一个实例。

如果未使用`@Injectable()` 装饰器定义依赖提供商，该服务则无法注入其他服务，并且不会被当做单例服务创建。


## 装饰器`Injectable`

首项我们先创建个文件夹 providers 用来保存所有的依赖提供商

此时的项目目录应该为

```
src
|
├── providers
├── directives
├── components
├── modules
├── app.component.ts
├── app.style.less
├── app.module.ts
├── index.html
└── main.ts
```

我们在 providers 下创建一个文件 `test.service.ts`

这是一个 TestService 仅仅带有`count`一个属性的基本类。唯一的新特点是它使用 @Injectable() 装饰器。该 @Injectable() 附加的元数据，从而 InDiv 知道这个类是一个 InDiv 提供者。

Injectable 符号，并且给服务类添加了 @Injectable() 装饰器。 它把这个类标记为依赖注入系统的参与者之一。标志着服务类类将会提供一个可注入的服务，并且它还可以拥有自己的待注入的依赖。

`@Injectable` 接收 1个对象: `{ isSingletonMode?: boolean; providedIn?: Type<any> | 'root' | null; }`

`isSingletonMode` 默认为 true，则该服务为单例服务。

当 `isSingletonMode` 为 `false`时，IOC容器将不会创建单例服务。

`providedIn`: 服务被直接注入哪个 `Injector`。

  1. 如果是`'root'`，该服务将直接被注入至根注入器 `rootInjector`，全局都可以直接使用该服务。
  2. 如果是一个具体的模块类，那么该服务将被注入该具体模块类的 `provides` 中。 

关于 `providedIn`, **使用该方法时要注意模块的循环引用，更建议使用`providedIn: root`和模块的元数据 `provides` 手动指定服务提供商**

更建议使用在懒加载模块中，创建一个共享的模块，然后将服务的`providedIn`指定为该共享模块，再导入该共享模块到指定的懒加载模块中。

> providers/test.service.ts

```typescript
import { Injectable } from '@indiv/core';

@Injectable()
export class TestService {
  puiblic count: number = 1;
}
```


## 依赖提供商

- 模块提供商
  
把 `TestService` 直接在 `app.module.ts` 的 `providers` 中声明，那么现在该模块下所有的组件与指令都可以通过依赖注入的方式获得该提供者的实例。

直接打印一下，打印出 1，然后更改一下，现在 `TestService` 实例上的 `count` 应该为2。

> app.module.ts

```typescript
import { NvModule } from '@indiv/core';
import AppComponent from './app.component';
import ShowAgeComponent from './components/show-age/show-age.component';
import ChangeColorDirective from './directives/change-color.directive';
import TestService from './provides/test.service';

@NvModule({
  imports: [],
  declarations: [ AppComponent, ShowAgeComponent, ChangeColorDirective ],
  providers: [ TestService ],
  bootstrap: AppComponent,
  exports: [],
})
export default class AppModule {}
```

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


- 组件提供商

接下来我们把 TestService 直接在 `components/show-age/show-age.component.ts` 的 组件`providers` 中声明，那么现在该组件也可以通过依赖注入的方式获得该提供者的实例。
直接打印一下，打印出 1。

> components/show-age/show-age.component.ts

```typescript
import { Component, StateSetter, SetState, nvReceiveInputs, Input } from '@indiv/core';
import TestService from '../provides/test.service';

@Component({
    selector: 'show-age',
    template: (`<p nv-on:click="updateAge()">age: {{age}}</p>`),
    providers: [ TestService ],
})
export default class ShowAgeComponent implements nvReceiveInputs {
  @Input('age') public age: number;
  @Input('upDateAge') public changeAge: (age: number) => void;

  @StateSetter() public setState: SetState;

  constructor(
    private testService: TestService
  ) {
    console.log(this.testService.count); // 1
  }

  public nvReceiveInputs(nextInputs: { age: number }): void {
    this.age = nextInputs.age;
  }

  public updateAge() {
    this.changeAge(3);
  }
}
```

但是我们已经在父组件`app.component.ts`将 服务实例上的count 更改为2了，为什么此时却是1呢？

这是因为在非懒加载模块的`providers`里被声明的提供者会直接被注入到全局的IOC容器根 Injector `rootInjector`中，而在组件的`providers`中声明的提供者会在该组件的实例上生成另外的实例。

所以两个 `testService` 并不是用一个实例。

当然在模块提供商里也可以用依赖注入注入其他的提供商实例。


## DI 令牌（Token）

DI 令牌一种用来查阅的令牌，它关联到一个依赖提供商，用于依赖注入系统中。

像上面的声明服务提供者的方式其实是简写，其实可以通过令牌的方式重写。

> app.module.ts

```typescript
import { NvModule } from '@indiv/core';
import AppComponent from './app.component';
import ShowAgeComponent from './components/show-age/show-age.component';
import ChangeColorDirective from './directives/change-color.directive';
import TestService from './provides/test.service';

@NvModule({
  imports: [],
  declarations: [ AppComponent, ShowAgeComponent, ChangeColorDirective ],
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

模块和组件的`providers`可以接受三种依赖提供商：

1. `Function`: TestService。最普通的方法，编译时会被拓展成下面的形式。
2. `{ provide: any; useClass: Function; }` : `{ provide: TestService, useClass: TestService }`。 基本形式。
3. `{ provide: any; useValue: any; }` : `{ provide: TestService, useValue: '111' }`。会在模块组件或服务中注入一个常量。

- 非 `Class` 类型 `provide`

**v3.0.0新增**

当使用非 `Class` 类型的 `provide` 时，推荐使用 `@Inject(token: any)` 和 `InjectionToken`。

下面指定一个url常量作为依赖注入的 `provider` 并使用：

> providers/url.ts

```typescript
import { InjectionToken } from '@indiv/core';

export const indivUrlToken = new InjectionToken('indivUrlToken');
```

> app.module.ts

```typescript
import { NvModule } from '@indiv/core';
import AppComponent from './app.component';
import ShowAgeComponent from './components/show-age/show-age.component';
import ChangeColorDirective from './directives/change-color.directive';
import TestService from './provides/test.service';
import { indivUrlToken } from './provides/url';

@NvModule({
  imports: [],
  declarations: [ AppComponent, ShowAgeComponent, ChangeColorDirective ],
  providers: [
    {
      provide: TestService,
      useClass: TestService,
    },
    {
      provide: 'githubUrl',
      useValue: 'https://github.com/DimaLiLongJi',
    },
    {
      provide: indivUrlToken,
      useValue: 'https://github.com/DimaLiLongJi/InDiv',
    }
  ],
  bootstrap: AppComponent,
  exports: [],
})
export default class AppModule {}
```

在 `AppComponent` 中使用下这两个 provider：

> app.component.ts

```typescript
import { Component, StateSetter, SetState, Watch, Inject } from '@indiv/core';
import TestService from './provides/test.service';
import { indivUrlToken } from './provides/url';

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
    private testService: TestService,
    @Inject('githubUrl') private githubUrl: string,
    @Inject(indivUrlToken) private indivUrl: string,
  ) {
    console.log(this.testService.count, githubUrl, indivUrl); // 1 https://github.com/DimaLiLongJi https://github.com/DimaLiLongJi/InDiv
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


## 依赖注入

InDiv 是建立在强大的设计模式, 通常称为依赖注入。我们建议在官方的 [Angular文档](https://angular.cn/guide/architecture-services#dependency-injection-di)中阅读关于依赖注入概念的伟大文章。

在 InDiv 中，由于 TypeScript 的缘故，管理依赖关系非常简单，因为它们只是按类型解决，然后注入控制器的构造函数中：

```typescript
constructor(private testService: TestService)
```

但是在 JavaScript 中，因为无法通过类型获得 DI令牌 ，所以需要变通一下。
我们引入新的类静态属性 `injectTokens: (Function | any)[]`来获取对应令牌，让我们来改造下在 JavaScript 中的写法：

> components/show-age/show-age.component.ts

```javascript
import { Component, Input, StateSetter } from '@indiv/core';
import TestService from '../provides/test.service';

@Component({
    selector: 'show-age',
    template: (`<p nv-on:click="@updateAge()">age: {{age}}</p>`),
    providers: [ TestService ],
})
export default class ShowAgeComponent {
  @Input('age') age;
  @Input('upDateAge') changeAge;
  @StateSetter() setState;

  static injectTokens = [
    TestService
  ];

  constructor(testService) {
    this.testService = testService;
    console.log(this.testService.count); // 1
  }

  nvReceiveInputs(nextInputs) {
    this.age = nextInputs.age;
  }

  updateAge() {
    this.upDateAge(3);
  }
}
```

`injectTokens`数组中值的顺序与类`constructor`参数的顺序一致。


## 可被注入的依赖

现在服务，模块等都可以使用依赖注入系统来从 **IOC容器** 中获得依赖实例。

可被注入的依赖主要分为下面几类：

1. 默认依赖

  - `InDiv`： 获取整个应用的 `InDiv` 实例，来使用一些方法
  - `Renderer`： 获取整个应用的渲染器实例，可以用来操作视图
  - `ElementRef`： 获取组件或指令绑定的具体视图

2. 服务，被 `Injectable` 注解过的实例，可以为单例也可以为非单例

3. 模块，被 `NvModule` 注解过的全局模块单例

4. 其他依赖
   
   - `NvLocation`： `@indiv/router` 提供的路由服务
   - `HttpClient`： `@indiv/common` 提供的http服务

**组件和指令因为是非单例，可以同时存在多个，所以未被放入IOC容器内**
