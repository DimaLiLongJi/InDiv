## 模板语法

在这一组文章中, 将详细讲解下InDiv的模板语法（或称作内部指令）。


## 分类

除了自定义的指令，InDiv 中的内置指令主要分为三种

1. 属性指令
2. 结构指令
3. 事件指令
4. 组件inputs

指令可以绑定下面几种值

1. 来自实例上被收集的依赖的值：例如 接受 `this.value`，则可以直接写成 `nv-id="value"`，省略 this。
2. 通过结构指令 `nv-repeat` 出的被循环的数组中的每一项：例如 `nv-repeat="item in valueList"`，在该指令所属的元素及其子元素都可以直接使用 `item`，如`nv-class="item.className"`
3. 来自实例上的方法，如果用在事件指令中则结尾要加 `()` 表示执行。该类型常用与 `input的action` 及事件指令的绑定：`nv-on:click="handleClick()"` `handler-method="{handleClick}"` 
4. `inputs` 的 `props` 与 `actions`，使用前三种语法外额外要用 `{}` 包裹：`handler-method="{handleClick}"` `color="{color}"`
5. pipe类型：接收一个来自实例上带有返回值的方法，参数可以是 **来自组件实例上的值** 或 **通过结构指令 `nv-repeat` 出的被循环的数组中的每一项**，指令被渲染的值为该方法的**返回值**。例如：`<p nv-text="returnValue(b,abc)"></p>`


## 属性指令

属性指令主要指模板中类似 `nv-src` `nv-id` 等指令

* text 指令：`<p nv-text="returnValue(b)"></p>` `<p>{{returnValue(b)}}</p>`。该指令可直接渲染为标签内的文字。
* html 指令：`<p nv-html="b"></p>` `<p nv-html="returnValue(b)"></p>`。该指令可直接渲染为标签内的 HTML，内部实现相当于 innerHTML。
* model 指令：`<input nv-model="c"/>`。此指令等同于 nv-value 和 nv-on:input 同时使用，仅仅可以对 `<input>` 或 `<textarea>` 使用 nv-model, model会主动更新被绑定的值并更新视图。
* class 指令：`<input nv-class="d"/>` `<input nv-class="returnValue(d)"/>`。`nv-class`需要返回一个数组或一个字符串，该指令会主动把被绑定的数组的每一项或是值作为 className 增加到元素的class中。
* 其他属性指令：`<img nv-src="src" nv-alt="alt"/>` `<img nv-src="return(src)" nv-alt="return(alt)"/>`。如果属性可以通过 `Element.attribute = value`来设置的话，也可以使用 `nv-属性名` 来使用。


## 结构指令

结构指令主要用于改变 DOM 的结构

* if 指令：`<input nv-if="e"/>` `<input nv-if="returnValue(e)"/>`。如果被绑定的值被 `Boolean()` 判定为 `true/false`，将分别在DOM树中显示或移除。
* **v5.0.0新增** if-not 指令：`<input nv-if-not="e"/>` `<input nv-if-not="returnValue(e)"/>`。与`nv-if`指令正相反，如果被绑定的值被 `Boolean()` 判定为 f`alse/false`，将分别在DOM树中显示或移除。
* repeat 指令：

  1. repeat 是一个重复器指令 —— 自定义数据显示的一种方式。你的目标是展示一个由多个条目组成的列表。
  2. 首先定义了一个 HTML 块，它规定了单个条目应该如何显示。再告诉 InDiv 把这个块当做模板，渲染列表中的每个条目。该指令可以搭配 nv-key 指令使用提高渲染性能。
  3. 使用 nv-repeat="item in Array"语法, Array只能为 **其他被repeat值** 或 **组件实例上** 的数组。
  4. 可以通过 `item in Array` 的语法定义 nv-repeat 指令，在元素本身或子元素可以直接使用 item 作为值。
  5. 此指令十分耗费性能，不建议多用，并且建议搭配 nv-key 使用。

  ```html
  <div nv-class="array.class" nv-repeat="array in arrayList" nv-key="array.id">
    <input nv-model="l.value" nv-repeat="l in array" nv-key="l.id"/>
    <demo-component value="{l}" nv-key="array.id"></demo-component>
  </div>
  ```

* key 指令：`<demo-component value="{l}" nv-key="li.id"></demo-component>`。nv-key 的值必须在 同级且同标签名的元素 中为唯一值，建议如果对 自定义组件的父元素 或 自定义组件本身 使用 nv-repeat，尽量加上 nv-key 指令来避免重复创建组件实例，并保存组件内部状态。


## 事件指令

事件指令主要用于为元素绑定事件并触发回调等交互。

以 nv-on:event 开头, event 为未加on的事件名， 指令值为 @开头 加 组件实例上的方法
例如：nv-on:click="@goTo()"

方法可使用参数：

  1. `$element` 事件绑定的元素实例
  2. `$event` 事件的 `event`
  3. `'1','2','3'` 单引号`''` 或 双引号`""` 包裹的字符串类型
  4. `1,2,3` 数字类型
  5. `$index` 如果该元素被 repeat指令包裹 或是 repeat指令的元素本身，可以使用该参数
  6. 来自实例上的值
  7. repeat value，传递`nv-repeat='item in array'`的item值，如： `nv-on:click="show(nav)" nv-repeat="nav in navList" nv-key="nav.id"`,


## 组件`inputs`

具体详情见 <a href="#/components?id=组件通信-inputs" target="_blank">组件</a>

## 注释（v2.0.6）

使用 `HTML` 标准注释

```html
<p>
  <!-- 这是一个注释 -->
</p>
```
