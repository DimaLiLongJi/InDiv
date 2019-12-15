## 依赖注入

依赖注入（DI）是一种重要的应用设计模式。 InDiv 有自己内置的 DI 框架，在设计应用时通常会用到它，以提升它们的开发效率和模块化程度。

首先关于这个概念：

  - 依赖，是当类需要执行其功能时，所需要的服务或对象。

  - DI 是一种编码模式，其中的类会从外部源中请求获取依赖，而不是自己创建它们。

  - 为了解决前端应用中大量的外部依赖，需求依赖的类应该将创建依赖的权力交出，因此依赖注入这是一种实现控制反转的应用设计模式。

  - 在 InDiv 中，DI 框架会在实例化该类时向其提供这个类所声明的依赖项。

关于依赖注入，其实大多数语言都有相应的实现，在 JavaScript 中也有基于 typescript 实现的 Angular 和 Nest，所以关于这个概念就不会再详细讲解。

为实现一个 IOC容器，通过类的构造函数获取需要注入的依赖，并按照懒汉模式去懒实例化依赖实例。

本章节介绍了 DI 在 InDiv 中的工作原理。


## 构造器注入与属性注入

一般来说依赖注入的几种注入方式主要就是 **构造器注入与属性注入**

- 构造器注入

上述通过在 `constructor` 中声明参数的方式，被称为构造器注入。

构造器注入通过在类实例化之前从 `IOC` 容器中获取依赖并通过参数的方式传入类构造函数实现注入。

```typescript
@Component({
  selector: 'docs-component-container',
  templateUrl: './template.html',
  providers: [
    {
      provide: TestService,
      useClass: TestService,
    },
  ],
})
export default class FactoryDemo {
  public content: Info[] = componentInfo();
  public subscribeToken: Subscription;

  constructor(
    private testService: TestService,
  ) {}
」
```

- 属性注入

**v4.1.0开始 `@Inject()` `@SkipSelf()` `@Self()` `@Host()` `@Optional()` 可以用作属性注入**

直接在属性上使用上述注解，在**类实例化之后**通过对属性赋值的方式实现注入。

所以上述的代码也可以这么写：

```typescript
@Component({
  selector: 'docs-component-container',
  templateUrl: './template.html',
  providers: [
    {
      provide: TestService,
      useClass: TestService,
    },
  ],
})
export default class FactoryDemo {
  public content: Info[] = componentInfo();
  public subscribeToken: Subscription;

  @Inject(TestService)
  private testService: TestService;

  constructor() {}
}
```


## IOC容器

相对于 IOC容器 和 需求资源的对象 来说，理解依赖注入（DI）的关键是：“谁依赖谁，为什么需要依赖，谁注入谁，注入了什么”：

  - 谁依赖于谁：当然是应用程序依赖于IOC容器

  - 为什么需要依赖：应用程序需要IOC容器来提供需求资源的对象需要的外部资源

  - 谁注入谁：很明显是IOC容器注入应用程序某个对象，应用程序依赖的对象

  - 注入了什么：就是注入某个对象所需要的外部资源的实例（包括对象、资源、常量数据）


首先实现了IOC容器`Injector`这个类，然后 DI 框架导出一个全局的IOC容器 `rootInjector` 。

每个`Injector`实例都拥有私有并且只读的`Map`属性 `providerMap`，用来存放服务提供商`provider`。

因为需要让服务成为单例服务，所以额外增加了个私有并且只读的`instanceMap`，用来存放单例服务的服务提供商实例`provider instance`。

**思考 为何选择Map而不是Object？**

InDiv 模仿了 Angular，实现了一套多级注入器。

实际上，应用程序中有一个与组件树平行的注入器树。 你可以在通过 组件的`@Component`的`providers` 上重新配置一个只属于该组件的注入器。

如果组件依赖了组件注入器中声明的服务提供商`provider`，该组件上的依赖服务实际上将成为仅仅在该组件上的单例服务，因此每个组件实例都会有一个独立而且不互相影响的服务。

> components/test-component/test-component.component.ts

```typescript
import { Component } from '@indiv/core';
import { PrivateService } from '../../services/private.services';

@Component({
  selector: 'test-component',
  template: (`
    <p>test-component</p>
  `),
  providers: [ PrivateService ],
})
class TestComponent {
  constructor(
    private privateService: PrivateService
  ) {
  }
}
```

此时，`PrivateService` 将作为该组件的依赖从组件的`privateInjector`取出并被注入组件实例。而且该服务是仅仅针对每个组件实例唯一。


## 多级注入器

你可以为注入器树中不同的注入器分别配置提供商。

所有运行中的应用都会共享同一个内部的平台级注入器。

`AppModule` 上的注入器是全应用级注入器树的根节点，在 `NvModule` 中，指令级模块级的注入器会遵循组件树的结构。

至此，配置依赖提供商的地方有4个

  - 根 `NvModule` 及非懒加载 `NvModule` 的 `provides`

  - 懒加载 `NvModule` 的 `provides`

  - 指令组件的 `provides`

  - 服务自身的 `@Injectable()` 的 `providedIn`

关于在哪里配置提供商的不同选择将导致一些差异：最终包的大小、服务的范围和服务的生命周期。

  - 根 `NvModule` 及非懒加载 `NvModule` 的 `provides` 中声明提供商时，将被注入到全局的注入器（全局IOC容器）`rootInjector: Injector`，整个应用都可以直接依赖该服务并且如果服务提供商被指定为单例时，将成为全局单例

  - 懒加载 `NvModule` 的 `provides` 中声明提供商时，将被注入到模块级别的注入器（全局IOC容器）`privateInjector: Injector`，每个来自懒加载模块的组件指定都可以注入来自懒加载模块注入器的单例服务，并且该服务在模块级别的注入器中将成为单例且不会影响到全局注入器

  - 指令组件的 `provides` 将被注入到指令组件级的注入器 `privateInjector: Injector`，每个组件指令实例将拥有独立的服务提供商实例

  - 当你在服务自身的 `@Injectable()` 装饰器 `providedIn` 中指定提供商时，如果 `providedIn` 为 `root` 将直接注入到全局的注入器 `rootInjector: Injector`；如果 `providedIn` 为某个模块，将直接注入到该模块的 `provides`

假设现在我们有个用户服务 `UserService` ，并且在多个地方我们都使用并且希望注入的是同一个服务实例。

这种情况下，通过指定 `UserService` 的 `providedIn: root` 来提供 `UserService` 就是不错的选择。

所以总结一下，我们现在拥有三级注入器，第一级为 `rootInjector`，第二级为懒加载模块的 `privateInjector`，第三级为组件的注入器 `privateInjector`


## 注入器冒泡

考虑下最极端的情况：

拥有多级的注入器之后，如果一个服务提供商在 组件`AComponent`的注入器`privateInjector` 中存在，又在 懒加载模块的注入器`privateInjector` 存在，并且在 全局的注入器`rootInjector` 也存在，那么现在组件`AComponent`中注入的该服务应该是来自 哪个注入器的实例？

伟大的分割线
***

1. 当一个子组件申请获得一个依赖时，`InDiv` 先尝试用 **该组件自己的注入器** 来满足它
2. 如果组件自己的注入器并不存在对应的依赖时，将向 **父元素的注入器** 中请求依赖
3. 一路沿着组件树向上请求依赖，如果直到顶层组件都没有时，将向 **初始化组件的模块的注入器** 中请求依赖
4. 懒加载的模块拥有 **自己的模块级注入器** ，而从根模块开始的模块都 **共享全局注入器`rootInjector`**
5. 如果仍旧没找到需要的依赖，最终 `InDiv` 会去 **全局注入器`rootInjector`** 中寻找依赖
6. 如果最终都没找到，则会抛出一个异常。

其实推荐将服务直接写入根模块 `AppModule` 或是指定服务的 `providedIn: root`。



## 干预注入器冒泡

**v3.0.0新增**

indiv 模仿 angular 提供了4种可以**干预注入器冒泡优先级**的**构造函数参数装饰器**：

1. `@SkipSelf()` ：寻找被注解的依赖时将**跳过本组件的注入器容器**，直接像父级请求依赖
2. `@Self()` ：寻找该被注解的依赖时只能**在本组件的注入器容器**请求依赖
3. `@Host()` ：寻找该被注解的依赖时只能**在本组件的注入器容器和父组件的注入器中**请求依赖
4. `@Optional()` ：声明该依赖即使找不到也不抛出错误，并返回个 `null`

**v4.1.0开始上述四个组件可以用作属性注入**

干预等级依次为 `@SkipSelf()` > `@Self()` > `@Host()` > `@Optional()`

下面来实现个简单的需求：组件请求一个依赖 `PrivateService` 时，跳过组件的容器，并只能像父组件的注入器请求，并且在未实例化时（既注入器里并不存在该实例）时返回 `null`

> components/test-component/test-component.component.ts

```typescript
import { Component, SkipSelf, Host, Optional } from '@indiv/core';
import { PrivateService } from '../../services/private.services';

@Component({
  selector: 'test-component',
  template: (`
    <p>test-component</p>
  `),
  providers: [ PrivateService ],
})
class TestComponent {
  constructor(
    @Optional() @Host() @SkipSelf() private privateService: PrivateService
  ) {
  }
}
```

利用三个注入器注解：`@Optional() @Host() @SkipSelf()`，将冒泡范围定义在子组件和父组件并跳过子组件的注入器就可以实现！
