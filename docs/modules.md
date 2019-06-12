## 构建一个模块

在这一组文章中, 您将了解 InDiv 的模块`NvModule`。主要是了解基本的 InDiv 应用程序模块化是如何建立的。您将构建一个基本的根模块和一个共享模块。


## 模块

模块是具有 @NvModule() 装饰器的类。 @NvModule() 装饰器提供了元数据，InDiv 用它来组织应用程序结构。

![图1](https://docs.nestjs.com/assets/Modules_1.png)

首项我们先创建个文件夹 modules 用来保存所有的模块 

此时的项目目录应该为

```
src
|
├── modules
├── app.component.ts
├── app.style.less
├── app.module.ts
├── index.html
└── main.ts
```


## 装饰器`@NvModule`

让我们先用 装饰器`@NvModule` 编写根模块

> app.module.ts

```typescript
import { NvModule } from '@indiv/core';

@NvModule({
  imports: [],
  declarations: [],
  providers: [],
  bootstrap: null,
  exports: [],
})
export default class AppModule {}
```

每个 InDiv 应用程序至少有一个模块，即根模块。根模块是 InDiv 开始安排应用程序树的地方。事实上，根模块可能是应用程序中唯一的模块，特别是当应用程序很小时，但是对于大型程序来说这是没有意义的。在大多数情况下，您将拥有多个模块，每个模块都有一组紧密相关的功能。


`@NvModule` 接收五个参数：

* `imports?: Function[];` 导入模块，告诉 InDiv 哪些其它的模块是当前模块所需的，可以将一些在各个模块经常导入的模块抽离成为 共享模块 。被导入的模块一定要有 exports，否则将无效。
* `declarations?: Function[];` 声明组件和指令。在该模块中被声明的组件里，可以直接使用该模块中 声明过的组件和指令 和 被导入模块导出的 组件和指令。
* `providers?: (Function | TUseClassProvider | TUseValueProvider | TUseFactoryProvider)[];` providers 用来声明被提供的服务。在非懒加载的模块中声明的服务将直接被注入 根Injector。此处涉及到 InDiv的依赖注入 不详细讲解。
* `exports?: Function[];` 声明模块被导出的组件和指令。
* `bootstrap?: Function;` 引导启动，只有在根模块中才会被用到，声明启动是被渲染的组件。之后我们会把 `app.component.ts` 导出的组件放在这里。

模块中依然可以注入 当前模块拥有的服务 或 当前模块中被导入的模块中的服务，

除此以外还可以通过直接指定 `constructor` 参数为 `InDiv` 导入 InDiv实例。


## 共享模块

创建共享模块能让你更好地组织和梳理代码。你可以把常用的指令和组件放进一个模块中，然后在应用中其它需要这些的地方导入该模块。

例如 InDiv 提供的 `RouteModule` 就作为一个共享模块导出了一些指令，组件和注入到 根Injector 的服务。

> indiv/route/index.ts

```typescript
import { NvModule} from '@indiv/core';
import { NvLocation } from './location';
import { RouterTo, RouterFrom } from './directives'

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
export class RouteModule {}
```
