## 开始第一步

在这一组文章中, 您将了解 InDiv 的核心基础知识。主要是了解基本的 InDiv 应用程序构建模块。您将构建一个基本的网页应用程序, 其中的功能涵盖了大量的入门基础。

## 语言

 我爱上了 [TypeScript](https://www.tslang.cn)，但最重要的是，我喜欢 JavaScript。 这就是为什么 InDiv 兼容 TypeScript 和纯 JavaScript 。 InDiv 正利用最新的语言功能，所以要使用简单的 JavaScript 框架。当然我推荐你使用 TypeScript，因为 JavaScript 版本会有些不同。

 在文章中，我们主要使用 TypeScript ，但是当它包含一些 Typescript 特定的表达式时，您总是可以将代码片段切换到 JavaScript 版本。

## 先决条件

 请确保您的操作系统上安装了 [Node.js](http://nodejs.cn/download/)（> = 6.11.0）。

## 开始

只要确保你已经安装了 npm，然后在你的 OS 终端中使用以下命令：

```
$ npm i --save @indiv/core @indiv/common @indiv/platform-browser @indiv/router
```

关于 `@indiv/core` `@indiv/common` `@indiv/platform-browser` `@indiv/router` 等npm包，

在 InDiv v2.0.5 开始，将使用分包代替原来的 `indiv` npm包，因此 npm包`indiv` 最高的版本号只到 v1.2.1。

而新的分包 `@indiv/core` `@indiv/common` `@indiv/platform-browser` `@indiv/router` 为保持版本号统一将从 v2.0.5 开始迭代。

关于新的包：

  1. `@indiv/core` InDiv 核心，包括 compile 与 vnode 等几乎所有核心都来自该包的导出，**v5.0.0以后**将不提供 `@Inject @Injectable @Injected` 等依赖注入相关
  2. `@indiv/common` InDiv 提供的一些普通组件指令服务模块等，目前仅含有 `HttpClient`
  3. `@indiv/platform-browser` InDiv 的 render 方法，compile类及一些浏览器平台核心特性，`InDiv` 实例需要使用该包的 `PlatformBrowser` 插件完成一个浏览器应用的初始化
  4. `@indiv/router` InDiv 路由，提供基础的 `RouteModule`模块，`NvLocation`服务，和其他一些组件指令
  5. `@indiv/platform-server` InDiv 的 render 方法，compile类及一些浏览器平台核心特性的 Node 平台实现
  6. `@indiv/indiv-loader` InDiv 的 webpack loader，用来编译组件 `templateUrl` 视图模板
  7. `@indiv/di` **v5.0.0以后**，所有关于依赖注入的依赖（例如 `@Inject @Injectable @Injected` 等）都已抽离到该包

由于使用了 TypeScript 或是 其他 JavaScript 最新的特性，你需要先为教程配置一个编译工具。

本示例选择 [webpack]([webpack](https://webpack.js.org/))

> webpack.config.js

```javascript
{
  test: [ /\.js$/, /\.jsx$/ ],
  exclude: [path.resolve(__dirname, 'node_modules')],
  use: [{
    loader: 'babel-loader',
    options: {
      presets: [ '@babel/preset-env' ],
      plugins: [
        '@babel/plugin-syntax-dynamic-import',
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }],
        'dynamic-import-webpack',
      ],
    },
  }, ],
},
{
  test: [
    /\.ts$/, /\.tsx$/,
  ],
  exclude: [path.resolve(__dirname, 'node_modules')],
  use: [{
      loader: 'babel-loader',
      options: {
        presets: [
          '@babel/preset-env',
        ],
        plugins: [
          '@babel/plugin-syntax-dynamic-import',
          'dynamic-import-webpack',
        ],
      },
    },
    "awesome-typescript-loader",
  ],
},
```


## 建立

 项目的`src` 目录中应该包含几个核心文件。

```
src
|
├── app.component.ts
├── app.style.less
├── app.module.ts
├── index.html
└── main.ts
```

按照约定，新创建的模块应该有一个专用目录。

|      |           |   
| ------------- |:-------------:| 
| main.ts     | 应用程序入口文件。实例化 `InDiv` 并使用  `bootstrapModule` 用来启动根模块。 | 
| index.html     | 应用程序入口HTML文件，应包含一个 `id="root"` 的 `<div>` | 
| app.module.ts      | 定义 `AppModule` 应用程序的根模块。      |   
| app.component.ts | 根模块的根组件，用于 `bootstrap`。     |   
| app.style.less | 根模块的根组件的样式文件。     |   


`main.ts` 负责引导创建我们的应用程序

1. v0.0.0 - v3.1.2 的用法：

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


要创建一个 InDiv 应用实例，我们使用了 `bootstrapModule`  和 `init`。
 
`bootstrapModule(RootModule)` 方法引导了根模块创建。
 
`use()` 方法实例插件，比如实现一个浏览器应用，我们必须实现`PlatformBrowser`这个插件。

`init()` 将在创建完根模块之后初始化整个应用并将组件渲染到页面中，在后面的章节中将对此进行详细描述。

2. v4.0.0推荐新的用法：

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

`InDiv` 的静态方法 `bootstrap` 会创建 `Indiv` 实例，挂在插件，初始化根模块并返回 `Promise<Indiv>`。

