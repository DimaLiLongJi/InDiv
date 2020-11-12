## OpenAPI

经过各个版本的抽象，从 **v5.0.0** 开始，抽离出一系列的OpenApi可供第三方开发者使用。

甚至本框架的一些包和功能也是通过OpenAPI实现的。


## DI

在**v5.0.0**之后，已将依赖注入模块从 `@indiv/core` 抽离，并独立出一个新的包 `@indiv/di`

原本 `@indiv/core` 中的一些依赖注入相关注解也按照 `@indiv/di` 提供的api进行实现

### Injector和rootInjector

`Injector` 为IOC容器，提供一些基础容器的方法：

> di/core/injector.ts

```typescript
class Injector {
  public parentInjector: Injector;
  public setProvider(key: any, value: any): void;
  public getProvider(key: any, bubblingLayer: number | 'always' = 'always');
  public setInstance(key: any, value: any): void;
  public getInstance(key: any, bubblingLayer: number | 'always' = 'always'): any;
  public setProviderAndInstance(key: any, provider: any, instance: any): void;
  public getParentInjectorOfProvider(key: any, bubblingLayer: number | 'always' = 'always'): Injector;
  public fork(): Injector;
}
```

1. `parentInjector: Injector` 该属性指向父IOC容器
2. `setProvider(key: any, value: any): void` 设置服务提供商,参数为它的key和值
3. `getProvider(key: any, bubblingLayer: number | 'always' = 'always')` 通过key获取服务提供商的值，参数为它的key和查找冒泡层级（**默认为`always` 永远向上传递，`number` 为向上传递的层数，0为本身，1为向上传递1层**）
4. `setInstance(key: any, value: any)` 通过服务提供商的key，设置一个该服务提供商的实例
5. `getInstance(key: any, bubblingLayer: number | 'always' = 'always'): void` 过服务提供商的key，获取该服务提供商的实例
6. `setProviderAndInstance(key: any, provider: any, instance: any): void` 过服务提供商的key，同时设置服务提供商和实例
7. `getParentInjectorOfProvider(key: any, bubblingLayer: number | 'always' = 'always'): Injector` 通过服务提供商的key，向上递归查找所在的IOC容器
8. `fork(): Injector` 创建一个该容器的子IOC容器

`rootInjector` 为indiv中使用的根IOC容器，可以直接从该容器通过 `fork` 方法构建出出一个父容器为 `rootInjector` 的子容器

### InjectDecoratorFactory

`InjectDecoratorFactory` 是实现关于 `indiv` 依赖注入注解的关键抽象类：

该抽象类主要有4个方法

  1. 构造函数 `constructor(parameterName?: string, propertyName?: string)`

      `parameterName` 为方法的参数注解名，`propertyName` 为实例属性注解名，**二者可全传入或2选1传入**，构造函数将把该注解名注册在DI系统中

  2. `resolveParameterInject(injectInfo: ParameterInjectInfoType, injector: Injector)` 
    
    实现方法的参数注解的关键，如不需要实现方法的参数注解可以直接返回 `null`

      - 参数 `injectInfo: ParameterInjectInfoType`：会携带需要注入依赖在IOC容器中的信息，`key` 为该依赖在 `Injector` 内的 `key` ，`argumentIndex` 为参数在方法中的索引位置，`decoratorArgument` 为注解使用时的参数，`bubblingLayer` 为该依赖在IOC容器内的冒泡等级（**`bubblingLayer: number | 'always' = 'always'` 默认为`always` 永远向上传递，`number` 为向上传递的层数，0为本身，1为向上传递1层**）

      - 参数 `injector: Injector`：为分配到的IOC容器

  3. `resolvePropertyInject(injectInfo: PropertyInjectInfoType, injector: Injector` 

    实现实例属性注解的关键，如不需要实现例属性注解可以直接返回 `null`

      - 参数 `injectInfo: PropertyInjectInfoType`：会携带需要注入依赖在IOC容器中的信息，`key` 为该依赖在 `Injector` 内的 `key` ，`property` 为实例的属性名，`decoratorArgument` 为注解使用时的参数，`bubblingLayer` 为该依赖在IOC容器内的冒泡等级（**`bubblingLayer: number | 'always' = 'always'` 默认为`always` 永远向上传递，`number` 为向上传递的层数，0为本身，1为向上传递1层**）

      - 参数 `injector: Injector`：为分配到的IOC容器

  4. `createInjectDecoratorFactory(): (value?: any) => (target: Object, propertyKey: string, parameterIndex?: number) => void`

    `public` 方法，实现了抽象类 `InjectDecoratorFactory` 的实例可以直接用过该方法返回一个类型为 `(value?: any) => (target: Object, propertyKey: string, parameterIndex?: number) => void` 的注解


举个例子，官方的 `@Attribute` 就借助于 `InjectDecoratorFactory` 分别实现了方法的参数注解和实例属性注解：

> core/directive/attribute.ts

```typescript
import { InjectDecoratorFactory, Injector, ParameterInjectInfoType, PropertyInjectInfoType } from '@indiv/di';
import { ElementRef } from '../component';
import { Renderer } from '../vnode';

export const metadataOfAttribute = 'nvMetadataOfAttribute';
export const metadataOfPropAttribute = 'nvMetadataOfPropAttribute';
/**
 *
 *
 * @class AttributeDecorator
 * @extends {InjectDecoratorFactory}
 */
class AttributeDecorator extends InjectDecoratorFactory {
  constructor(parameterName?: string, propertyName?: string) {
    super(parameterName, propertyName);
  }

  /**
   * @Attribute for parameter of method
   *
   * @param {ParameterInjectInfoType} injectInfo
   * @param {Injector} injector
   * @returns
   * @memberof AttributeDecorator
   */
  public resolveParameterInject(injectInfo: ParameterInjectInfoType, injector: Injector) {
    const elementRef: ElementRef = injector.getInstance(ElementRef);
    const renderer: Renderer = injector.getInstance(Renderer);
    return renderer.getAttribute(elementRef.nativeElement, injectInfo.decoratorArgument);
  }

  /**
   * @Attribute for property of instance
   *
   * @param {PropertyInjectInfoType} injectInfo
   * @param {Injector} injector
   * @returns
   * @memberof AttributeDecorator
   */
  public resolvePropertyInject(injectInfo: PropertyInjectInfoType, injector: Injector) {
    const elementRef: ElementRef = injector.getInstance(ElementRef);
    const renderer: Renderer = injector.getInstance(Renderer);
    return renderer.getAttribute(elementRef.nativeElement, injectInfo.decoratorArgument);
  }
}

export const Attribute = new AttributeDecorator(metadataOfAttribute, metadataOfPropAttribute).createInjectDecoratorFactory();
```

1. 首先实现一个继承抽象类 `InjectDecoratorFactory` 的类 `AttributeDecorator`，实现2个抽象方法 `resolveParameterInject` `resolvePropertyInject` 和构造函数
  2. 实例化 `AttributeDecorator` ，获得一个DI注解工厂实例
  3. 通过DI注解工厂实例的 `createInjectDecoratorFactory` 方法获得一个可同时作为方法的参数注解和实例属性注解的DI注解


### NvInstanceFactory

实例化一个**属性或者方法参数受到IOC容器控制的对象**的工厂方法。


例如单独使用 `@indiv/di` 的时候，如果需要来自di系统内依赖的实例，需要使用该方法替代 `new` 来实例化。

`function NvInstanceFactory<T = any>(_constructor: Function, deps?: any[], injector: Injector = rootInjector, depsToken?: any[]): T `

该工厂方法接受几个参数和泛型：

1. `_constructor: Function` 需要实例化的类
2. `deps?: any[]` 可以作为确定参数传入构造函数的参数数组，例如 `[1,'1']`，**该项与 `depsToken` 互斥**
3. `injector: Injector = rootInjector` 指定的IOC容器，默认使用 `rootInjector`
4. `depsToken?: any[]` 如构造函数的参数是来自IOC容器中的依赖，则需要指定服务提供商的 `provide` 作为token提供给IOC容器查找依赖
5. 泛型 `<T = any>` 为工厂方法实例化兑现之后返回的类型

例如下面的例子：

> demo/di.ts

```typescript
import { Inject, Injectable, NvInstanceFactory, rootInjector } from "@indiv/di";

const privateInjector = rootInjector.fork();

@Injectable({
  injector: privateInjector,
})
class TestService {}

// privateInjector.setProvider(TestService, TestService)

class Demo {
  @Inject({ injector: privateInjector })
  public testService: TestService;

  constructor(private a: string) {
    console.log('aaaa =>>', this.testService);
  }
}

const demo = NvInstanceFactory<Demo>(Demo, ["1"]);

console.log(66666666, demo, demo.testService);
```

在该例子中，通过 `rootInjector.fork()` 创建出一个子IOC容器，

接下来通过 `@Injectable({injector: privateInjector})` 将 `TestService` 注入至 `privateInjector` 这个容器内（当然也可以通过 `privateInjector.setProvider(TestService, TestService)` 达到相同的效果）

`Demo` 中有一个属性 `testService` 是并非通过构造函数注入的依赖，而是通过属性注入。因此需要使用 `@Inject({ injector: privateInjector })` 注解并赋值给 `injector` 来指定依赖自哪个IOC容器

最后通过 `NvInstanceFactory` 代替 `new` ，例子中需要传入一个构造函数参数 `private a: string`，因此需要传入参数 `["1"]`


## 插件

插件通常会为 InDiv 添加全局功能。插件的范围没有限制——一般有下面几种：

  - 添加全局方法或者属性

  - 通过 InDiv 的方法添加全局资源：如 `@indiv/platform-browser` 中的 `PlatformBrowser` 通过调用 InDiv实例 上的 `setRenderer` 来为组件 增加一个 浏览器平台的渲染器

  - 添加 InDiv 实例方法，通过 中间件方法`bootstrap` 的 参数 `indivInstance`，它们添加到 InDiv.prototype 上实现

  - 一个库，提供自己的 API，同时提供上面提到的一个或多个功能

插件的使用方法请见[插件](plugins)

### 编写自己的插件

仅需要实现一个来自 `@indiv/core` 的接口 `IPlugin` ，实现 `bootstrap` 方法即可。

`bootstrap` 方法只有一个参数：`application: InDiv` ，接受当前indiv应用的实例。

可以用过这个indiv实例来对应用进行修改拦截或者实现其他方法。

> core/indiv/index.ts

```typescript
import { IPlugin } from '@indiv/core';

export interface IPlugin {
  bootstrap(application: InDiv): void;
}
```

举个例子，下面是浏览器端的平台插件，实现了一些浏览器平台的方法和 `Renderer`：

> platform-browser/plugins/index.ts

```typescript
import { InDiv, IPlugin } from '@indiv/core';
import { PlatfromBrowserRenderer } from '../renderer';

export class PlatformBrowser implements IPlugin {
  public bootstrap(application: InDiv): void {
    application.setIndivEnv('browser', false);
    application.setRootElement(document.getElementById('root'));
    application.setRenderer(PlatfromBrowserRenderer);

    // 浏览器端增加下错误处理
    if (utils.hasWindowAndDocument()) {
      let errorHandler: ErrorHandler = null;
      // 同步错误
      window.addEventListener('error', (ev) => {
        if (!errorHandler && application.getRootModule) {
          const injector = application.getRootModule.$privateInjector || rootInjector;
          // 在这里处理全局的handler
          if (!injector.getProvider(ErrorHandler)) return;
          errorHandler = getService(injector, ErrorHandler);
        }
        if (errorHandler) errorHandler.handleError(ev);
      }, true);
      // 异步错误
      window.addEventListener("unhandledrejection", (ev) => {
        if (!errorHandler && application.getRootModule) {
          const injector = application.getRootModule.$privateInjector || rootInjector;
          // 在这里处理全局的handler
          if (!injector.getProvider(ErrorHandler)) return;
          errorHandler = getService(injector, ErrorHandler);
        }
        if (errorHandler) errorHandler.handleError(ev);
      }, true);
    }
  }
}
```

该插件接收当前应用的实例，设置应用环境，创建应用的根路径，设置渲染器并增加全局的异常处理。

插件通常会为 InDiv 添加全局功能。

插件的范围没有限制，可以在安全范围内随意使用。

