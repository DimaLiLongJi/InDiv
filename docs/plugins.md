## 插件

插件通常会为 InDiv 添加全局功能。插件的范围没有限制——一般有下面几种：

  - 添加全局方法或者属性

  - 通过 InDiv 的方法添加全局资源：如 `@indiv/platform-browser` 中的 `PlatformBrowser` 通过调用 InDiv实例 上的 `setRenderer` 来为组件 增加一个 浏览器平台的渲染器

  - 添加 InDiv 实例方法，通过 中间件方法`bootstrap` 的 参数 `indivInstance`，它们添加到 InDiv.prototype 上实现

  - 一个库，提供自己的 API，同时提供上面提到的一个或多个功能


## 使用插件

1. v0.0.0 - v3.1.2 的用法：

通过全局方法 InDiv 实例的 `use(Plugin: Type<IPlugin>): number` 使用插件。它需要在你调用 InDiv 实例的 `init()` 启动应用之前完成。

例如，我们使用 `PlatformBrowser` 去为 InDiv 的组件添加编译器时，

在`init()`之前就使用`use`方法去实例化 `PlatformBrowser`插件类，

在`PlatformBrowser`插件类中，先是通过`setIndivEnv` 设置了环境及是否服务端渲染，并调用了 `PlatformBrowser` 实例的 `bootstrap(indivInstance: InDiv): void` 方法并调用 参数InDiv实例的 `setRenderer` 来添加渲染器和InDiv实例的`setRootElement`设置根元素来为渲染器指定一个在浏览器环境可用的根元素。

> main.ts

```typescript
import { InDiv } from from '@indiv/core';
import { PlatformBrowser } from '@indiv/platform-browser';

import RootModule from './modules';

const inDiv = new InDiv();
inDiv.bootstrapModule(RootModule);
inDiv.use(PlatformBrowser);
inDiv.init();
```

关于中间件的`bootstrap`方法中参数 `indivInstance: InDiv` 提供的方法，可以参考 <a href="#/indiv" target="_blank">`InDiv`</a> 提供的方法。

或是将`indivInstance` 的类型 `as` 为 `any`，并添加到自定义的属性或方法api。

2. v4.0.0 的新用法：

> main.ts

```typescript
import { InDiv } from from '@indiv/core';
import { PlatformBrowser } from '@indiv/platform-browser';

import RootModule from './modules';

InDiv.bootstrapFactory(RootModule, {
  plugins: [
    PlatformBrowser,
  ],
});
```

通过在静态方法 `bootstrap` 引导创建应用时配置 `plugins`，应用会遍历逐一安装插件。
