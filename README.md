# 关于 InDiv

本库版本对应 InDiv 2.0.5 + 版本（@indiv）[文档](https://dimalilongji.github.io/InDiv/)
旧版本indiv v1.20 + 移至[markdown](https://github.com/DimaLiLongJi/InDiv/blob/master/version1.2%2B.md)

@indiv 2.0.5以下版本 已经废除，请使用 @indiv v2.0.5+

## 什么是InDiv

#### InDiv 是一个类 angular mvvm库

它能帮你构建 Web 应用。InDiv 集字符串模板、HTML模板、依赖注入和一些其他实践于一身。

InDiv 采用与 angular 类似的项目结构，提供相似的概念和 api 以减少学习成本。

* InDiv 是单词 individual 的缩写，我撸它的时候借鉴了很多 angular，react，vue 的模式与概念
* 本文档版本对应 InDiv 2.0.5 + 版本
* 在此致敬 angular，react 和 vue的大佬开发者们。感谢他们为前端做出的巨大贡献

#### 基本假设

* 本文档假设你已经熟悉了 JavaScript，TypeScript，和来自最新标准的一些知识，比如 class 和 模块
* 下列代码范例都是用最新版本的 TypeScript 写的，利用 类型 实现依赖注入，并使用装饰器来提供元数据

#### Demo

逻辑文件

```typescript
import { InDiv, Component, AfterMount, ReceiveInputs, OnDestory, ElementRef, HasRender, Input, ContentChild, ContentChildren } from '@indiv/core';
import { HttpClient } from '@indiv/common';

import { TestContentComponent } from '@/test-content-component';
import { TestDirective } from '@/directives/test-directive';

@Component({
  selector: 'test-component',
  templateUrl: './template.html',
})
export class TestComponent implements OnDestory, ReceiveInputs, AfterMount, HasRender {
  public state: any;
  @Input() public manName: any;

  public man: {name: string} = {
    name: 'ajiaxi',
  };

  @ContentChild('test-content-component') private testComponent: TestContentComponent;
  @ContentChild('a') private tagA: HTMLElement;
  @ContentChildren('test-directive') private testDirectiveString: TestDirective[];
  @ContentChildren('a') private tagAs: TestDirective[];
  @ContentChildren(TestDirective) private testDirective: TestDirective[];

  constructor(
    private httpClient: HttpClient,
    private indiv: InDiv,
    private element: ElementRef,
  ) {
    this.httpClient.get('/success').subscribe({
      next: (value: any) => { console.log('repsonse', value); },
    });
  }

  public click() {
    this.manName = 'li junhe';
  }

  public nvHasRender() {
    console.log('TestComponent HasRender', this.tagA, this.tagAs, this.testDirectiveString);
  }

  public nvAfterMount() {
    console.log('TestComponent AfterMount');
  }
  public nvOnDestory() {
    console.log('TestComponent OnDestory');
  }

  public nvReceiveInputs(p: any) {
    console.log('test-component nvReceiveInputs', p);
  }
}
```

模板


```html
<!-- container: {{countState(color)}} -->
<div class="fucck" nv-class="test.b" nv-id="'cc'">
  <p>{{testNumber}}</p>
  <input nv-model="test.a" nv-on:click="show(test)" />
  <p test-directive="{test.a}" nv-id="232" nv-if="countState(a)" nv-on:click="changeInput()">{{a}}</p>
  <test-component nv-on:click="changeName(man)" nv-repeat="man in testArray" nv-key="man.name" manName="{countState(man.name)}" nv-if="a">
    <a>this is {{man.name}}</a>
    <test-content-component test-directive="{test.a}"></test-content-component>
  </test-component>
  <p nv-on:click="go()">
    <!-- container: {{countState(color)}} -->
    container: {{countState(color)}}
  </p>
  <input type="number" nv-model="a" />
  <div nv-repeat="man in testArray" nv-key="man.name">
    <div nv-on:click="show(testArray2, '你111')" nv-text="man.name"></div>
    <div>
      <p>性别：{{countState(man.sex, $index)}}</p>
    </div>
  </div>
  <router-render></router-render>
</div>
```


#### 未来

该项目创建的目的是为了学习下 angular 的架构，并尝试用自己的想法实现，因为目标为实现 angular 的一些装饰器和功能。

- [ ] angular decorators
  - [x] [Component](https://www.angular.cn/api/core/Component)
  - [x] [Directive](https://www.angular.cn/api/core/Pipe)
  - [ ] [Pipe](https://www.angular.cn/api/core/Pipe)
  - [x] [Injectable](https://www.angular.cn/api/core/NgModule)
  - [x] [NgModule as NvModule](https://www.angular.cn/api/core/NgModule)
  - [x] [ContentChild](https://www.angular.cn/api/core/ContentChild)
  - [x] [ContentChildren](https://www.angular.cn/api/core/ContentChildren)
  - [x] [ViewChild](https://www.angular.cn/api/core/ViewChild)
  - [x] [ViewChildren](https://www.angular.cn/api/core/ViewChildren)
  - [x] [Input](https://www.angular.cn/api/core/Input)
  - [ ] [Output](https://www.angular.cn/api/core/Output)
  - [ ] [HostBinding](https://www.angular.cn/api/core/HostBinding)
  - [ ] [HostListener](https://www.angular.cn/api/core/HostListener)
  - [ ] [Host](https://www.angular.cn/api/core/Host)
  - [ ] [Inject](https://www.angular.cn/api/core/Inject)
  - [ ] [SkipSelf](https://www.angular.cn/api/core/SkipSelf)
  - [ ] [Self](https://www.angular.cn/api/core/Self)
  - [ ] [Optional](https://www.angular.cn/api/core/Optional)
  - [ ] [Attribute](https://www.angular.cn/api/core/Attribute)


#### 反馈

* 你可以和我一起做贡献！你可以到 [Github](https://github.com/DimaLiLongJi/InDiv) 上的仓库中提出文档方面的问题，并创建Pull Requests
* 或者通过邮箱直接联系我：woshililongji@163.com
