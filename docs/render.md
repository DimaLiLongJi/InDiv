## 跨平台渲染

**门面模式是对象的结构模式，外部与一个子系统的通信必须通过一个统一的门面对象进行。门面模式提供一个高层次的接口，使得子系统更易于使用。**

InDiv 其中的一个设计目标是使平台与 DOM 独立。

DOM 是复杂的，因此使组件与它分离，会让我们的应用程序，更容易测试与重构。

另外的好处是，由于这种解耦，使得我们的应用能够运行在其它平台 (比如：Node.js、WebWorkers、NativeScript 等)。

为了能够支持跨平台，InDiv 通过抽象层封装了不同平台的差异。比如定义了抽象类 `Renderer`。此外还定义了以下引用类型：`ElementRef`。

因此抽象出了一个类似DOM api的类 `Renderer` 来执行特定平台的渲染代码。

> @indiv/core/vnode/renderer.ts

```typescript
export abstract class Renderer {
  public abstract nativeElementToVnode(nativeElement: any, parseVnodeOptions?: ParseOptions): Vnode[];
  public abstract getElementsByTagName(name: string): any;
  public abstract getElementByQuery(cssSelector: string, master?: any): any; // v2.0.8新增，支持css选择器查找
  public abstract getAllElementsByQuery(cssSelector: string, master?: any): any; // v2.0.8新增，支持css选择器查找
  public abstract hasChildNodes(nativeElement: any): boolean;
  public abstract getChildNodes(nativeElement: any): any[];
  public abstract removeChild(parent: any, child: any): void;
  public abstract appendChild(parent: any, child: any): void;
  public abstract insertBefore(parent: any, child: any, index: number): void;
  public abstract isContainted(parent: any, child: any): boolean;
  public abstract creatElement(tagName: string): any;
  public abstract creatTextElement(value: string): any;
  public abstract creatCommentElement(value: string): any; // v2.0.6新增，创建注释节点
  public abstract getAttribute(element: any, name: string): any;
  public abstract setAttribute(element: any, name: string, value: any): void;
  public abstract setNvAttribute(element: any, name: string, value: any): void;
  public abstract removeAttribute(element: any, name: string, value?: any): void;
  public abstract removeNvAttribute(element: any, name: string, value?: any): void;
  public abstract setNodeValue(element: any, nodeValue: any): void;
  public abstract setValue(element: any, value: any): void;
  public abstract removeEventListener(element: any, eventType: string, handler: any): void;
  public abstract addEventListener(element: any, eventType: string, handler: any): void;
  public abstract setStyle(element: any, name: string, value: any): void;
  public abstract removeStyle(element: any, name: string): void;
  public abstract getStyle(element: any, name: string): void;
}
```

通过制定不同平台的 `Renderer` ， InDiv 不关心渲染的方法，InDiv 核心仅仅作为一个api消费者调用封装好的方法进行渲染。

并且在组件内部如果想操控视图也仅仅通过依赖注入注入 `Render` 实例并操作 `ElementRef`实例的 `nativeElement`。
