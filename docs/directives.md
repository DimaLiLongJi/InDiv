## 构建一个指令

在这一组文章中, 您将了解 InDiv 的组件`Directive`。主要是了解基本的 InDiv 应用程序的指令是如何建立的。您将构建一个基本的指令。


## 指令

指令用于改变一个 DOM 元素的外观或行为。

其实上文提到的组件也是个特殊的指令。

首项我们先创建个文件夹 directives 用来保存所有的组件 

此时的项目目录应该为

```
src
|
├── directives
├── components
├── modules
├── app.component.ts
├── app.style.less
├── app.module.ts
├── index.html
└── main.ts
```


## 装饰器`@Directive`

让我们先用 装饰器 `@Directive` 写个简单的指令，当鼠标悬浮时，文字颜色将变为红色，当鼠标移除时显示绿色。

为此我们需要引入内置依赖 `ElementRef` 来让 InDiv 知道我们需要注入该指令所绑定的元素。

除此以外像组件一样，还可以通过直接指定 `constructor` 参数为 `InDiv` 导入 InDiv实例。

因为我们可以通过 `ElementRef` 来获得挂载的 nativeElement，因为要考虑到跨平台实现，所以不推荐直接使用`ElementRef`的`nativeElement` api，我们可以引入 `Renderer` 来操作Element。

> directives/change-color.directive.ts

```typescript
import { Directive, ElementRef, Renderer } from '@indiv/core';

@Directive({
    selector: 'change-color',
})
export default class ChangeColorDirective {
  constructor(
    private element: ElementRef,
    private renderer: Renderer,
  ) {
    this.renderer.addEventListener(this.element.nativeElement, 'mouseover', this.changeColor);
    this.renderer.addEventListener(this.element.nativeElement, 'mouseout', this.removeColor);
  }

  public changeColor = () => {
    this.element.nativeElement.style = 'red';
  }

  public removeColor = () => {
    this.element.nativeElement.style.color = 'black';
  }
}
```

`@Directive` 接收两个参数，`selector: string;` `providers?: (Function | TUseClassProvider | TUseValueProvider | TUseFactoryProvider)[];`

* `selector: string;`  作为指令被渲染成 DOM 的属性，类似于 `<div change-color="{color}"></div>`
* `providers?: (Function | { provide: any; useClass: Function; } | { provide: any; useValue: any; } | { provide: any; useFactory: Function; deps?: any[]; })[];` 声明可以被指令注入的服务，这个我们放到服务再讲

> app.module.ts

```typescript
import { NvModule } from '@indiv/core';
import AppComponent from './app.component';
import ShowAgeComponent from './components/show-age/show-age.component';
import ChangeColorDirective from './directives/change-color.directive';

@NvModule({
  imports: [],
  declarations: [ AppComponent, ShowAgeComponent, ChangeColorDirective ],
  providers: [],
  bootstrap: AppComponent,
  exports: [],
})
export default class AppModule {}
```

现在我们将 `ChangeColorDirective` 在 `app.module.ts` 中声明一下并在`AppComponent`的模板中使用。

> app.component.ts

```typescript
import { Component, StateSetter, SetState, Watch } from '@indiv/core';

@Component({
    selector: 'app-component',
    template: (`
        <div class="app-component-container">
          <input nv-model="name"/>
          <p nv-on:click="addAge()" change-color>name: {{name}}</p>
          <show-age age="{age}" uupDateAge="{upDateAge}"></show-age>
        </div>
    `),
})
export default class AppComponent {
  public name: string = 'InDiv';
  @Watch() public age: number;

  @StateSetter() public setState: SetState;

  constructor() {}

  public addAge(): void {
    this.setState({ age: 24 });
  }

  public upDateAge(age: number) {
    this.age = age;
    // this.setState({ age: 24 });
  }
}
```


## 接收`inputs`

指令没有元数据`template` ，因此无法在指令实例内部主动更新指令。
但是如同组件一样，指令也可以接收实例上的 `inputs` 属性。`inputs` 属性来自于指令使用时在模板上所被渲染的字符串变量。
同理，当 `inputs` 被更新时，指令也会调用生命周期钩子 `nvReceiveInputs(nextInputs: any): void;`

> directives/change-color.directive.ts

```typescript
import { Directive, ElementRef, Renderer, ReceiveInputs, Input } from '@indiv/core';

@Directive({
    selector: 'change-color',
})
export default class ChangeColorDirective implements ReceiveInputs {
  @Input() public color: string;

  constructor(
    private element: ElementRef,
    private renderer: Renderer,
  ) {
    this.renderer.addEventListener(this.element.nativeElement, 'mouseover', this.changeColor);
    this.renderer.addEventListener(this.element.nativeElement, 'mouseout', this.removeColor);
  }

  public ReceiveInputs(nextInputs: string) {
    console.log('Directive ReceiveInputs', nextInputs);
  }

  public changeColor = () => {
    this.renderer.setStyle(this.element.nativeElement, 'color', this.color);
  }

  public removeColor = () => {
    this.renderer.removeStyle(this.element.nativeElement, 'color');
  }
}
```

现在我们更改下 `app.component.ts`，给指令一个`input`

> app.component.ts

```typescript
import { Component, SetState, Watch } from '@indiv/core';

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

  constructor() {}

  public addAge(): void {
    this.setState({ age: 24 });
  }

  public upDateAge(age: number) {
    this.age = age;
    // this.setState({ age: 24 });
  }
}
```


## 绑定事件和属性

**v3.0.0 新增，指令组件通用**

如果通过注入 `Renderer` 和 `ElementRef` 来为指令和组件的挂载元素添加响应事件或修改属性则过于繁琐，因此从 v3.0.0 开始新增两个装饰器:

1. `@HostListener(eventName: string, args?: string[])` 绑定事件
2. `@HostBinding(hostPropertyName: string)` 绑定属性

- HostListener

接受2个参数
1. `eventName: string` 绑定的事件名
2. `args?: string[]` 绑定方法的参数，**可使用的值与模板指令中的一致**

改造下 `ChangeColorDirective` ，移除掉通过 `ElementRef` 添加事件的代码。

> directives/change-color.directive.ts

```typescript
import { Directive, Renderer, ReceiveInputs, Input, HostListener } from '@indiv/core';

@Directive({
    selector: 'change-color',
})
export default class ChangeColorDirective implements ReceiveInputs {
  @Input() public color: string;

  constructor(
    private renderer: Renderer,
  ) {}

  public ReceiveInputs(nextInputs: string) {
    console.log('Directive ReceiveInputs', nextInputs);
  }

  @HostListener('mouseover', ['$element'])
  public changeColor = (element: Element) => {
    this.renderer.setStyle(element, 'color', this.color);
  }

  @HostListener('mouseout', ['$element'])
  public removeColor = (element: Element) => {
    this.renderer.removeStyle(element, 'color');
  }
}
```

- HostBinding

接受1个参数 `hostPropertyName: string` ，但该参数有格式要求：

1. 绑定原型上的属性或方法 : `@HostBinding('propertyName') value: any = 1;`
2. 绑定属性 attr.attributeName: `@HostBinding('attr.someAttributeName') value: string = 1;`
3. 添加某个样式 style.style-name: `@HostBinding('style.background-color') color: string = 'red';`
4. 判断某个 class 是否可以生效 class.className: `@HostBinding('class.someClass') classNameEnable: boolean = false;`

注意：**`@HostBinding` 组件中注解的属性会被加入监听队列，而指令中则会在 `@input` 更新时和 `@HostListener` 事件触发时渲染**

继续修改下上面的指令

> directives/change-color.directive.ts

```typescript
import { Directive, ReceiveInputs, Input, HostListener, HostBinding } from '@indiv/core';

@Directive({
    selector: 'change-color',
})
export default class ChangeColorDirective implements ReceiveInputs {
  @Input() public color: string;
  @HostBinding('style.color') public styleColor: string = null; 

  public ReceiveInputs(nextInputs: string) {
    console.log('Directive ReceiveInputs', nextInputs);
  }

  @HostListener('mouseover', ['$element'])
  public changeColor = (element: Element) => {
    this.styleColor = this.color;
  }

  @HostListener('mouseout', ['$element'])
  public removeColor = (element: Element) => {
    this.styleColor = null;
  }
}
```


## 属性查询

**v3.0.0 新增，指令组件通用**

在构造函数依赖注入的时候，不仅仅可以注入服务，在组件和指令中也可以通过**构造函数属性装饰器** `@Attribute(attributeName: string)` 注入挂载组件上的 `attribute`。

**该装饰器获取的属性仅可用于原生 attribute，nv Attribute则无法获取**

接受一个参数：属性名 `attributeName: string`

> directives/change-color.directive.ts

```typescript
import { Directive, ReceiveInputs, Input, HostListener, HostBinding, Attribute } from '@indiv/core';

@Directive({
    selector: 'change-color',
})
export default class ChangeColorDirective implements ReceiveInputs {
  @Input() public color: string;
  @HostBinding('style.color') public styleColor: string = null;
  
  constructor(
    @Attribute('some-attribute') someAttribute: string;
  ) {
     console.log(this.someAttribute);
  }

  public ReceiveInputs(nextInputs: string) {
    console.log('Directive ReceiveInputs', nextInputs);
  }

  @HostListener('mouseover', ['$element'])
  public changeColor = (element: Element) => {
    this.styleColor = this.color;
  }

  @HostListener('mouseout', ['$element'])
  public removeColor = (element: Element) => {
    this.styleColor = null;
  }
}
```


## 生命周期

每个指令都有一个被 InDiv 管理的生命周期。
大部分指令的生命周期跟组件相同，但有部分因为指令没有模板与被依赖的成员变量的概念所以缺失`nvDoCheck`。
生命周期钩子其实就是定义在实例中的一些方法，在 InDiv 中，通过不同的时刻调用不同的生命周期钩子，赋予你在它们发生时采取行动的能力。
在 TypeScript 中，引用 InDiv 提供的 interface，通过 implements 的方式让类去实现被预先定义好的生命周期，而在 JavaScript 中，你只能自己手动去定义应该实现的生命周期方法。

之前我们已经通过认识 <a href="#/components?id=组件通信-inputs" target="_blank">`inputs`</a> 认识了 `nvReceiveInputs` 的生命周期，而下面将**按照触发顺序**介绍其他生命周期钩子。

* `constructor` 在类被实例化的时候回触发，你可以在这里初始化
* `nvOnInit(): void;` constructor 之后，在这个生命周期中，可以获取 inputs，此生命周期会在开启监听前被触发，并且之后再也不会触发
* **v3.0.0新增** `nvBeforeMount(): void;` 在 nvOnInit 之后，指令挂载页面之前被触发，在指令第一次挂载页前会被触发
* `nvHasRender(): void;` 在 nvAfterMount 之后，渲染完成后被触发，每次触发渲染页面（render）都会被触发
* **v3.0.0新增** `nvAfterMount(): void;` 在 nvBeforeMount 之后和首次 nvHasRender 之后，指令挂载页面完毕之后被触发，只有指令第一次挂在页面后，挂载指令实例到DOM上后会被触发**推荐在此做异步拉取数据**
* `nvOnDestory(): void;` 仅仅在路由决定销毁此组件时,或是被`nv-if`销毁组件时被触发
* `nvReceiveInputs(nextInputs: any): void;` 监听 inputs 变化，当 inputs 即将被更改时（更改前）触发
* (原生)`getter`: 当监听 inputs 时，getter 会先于 nvReceiveInputs 被触发
* (原生)`setter`: 当监听 属性 时，setter 会晚于 nvDoCheck 被触发
