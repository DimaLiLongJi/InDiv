# router.js

a simple and naive front-end router and DOM render 一个图样、图乃义务的前端路由和DOM渲染

## demo
  - `npm run start`
  - open `http://localhost:1234`

## log

1. 2018-04-28 init program
  - add route and Life cycle

2. 2018-04-29 add watcher
  - add new life cycle: `$watchState` and `$beforeInit`
  - add new class: `Controller`
  - add watcher for state in `Controller` and `Component`

3. 2018-04-30 separate `Controller` and `Component`
  - add new class: `Component`
  - add new life cycle: `$replaceComponent` in class `Controller`

4. 2018-05-01 optimize `Controller` and `Component`
  - add new class `Lifecycle`
  - add new life cycle: `$routeChange` in class `Router`
  - optimize `Controller` and `Component`
  - fix lifecycle of class `Component`
5. 2018-05-02 optimize `Component` and `Controller`
  - add `props` in `Component` when new an instance in `Controller`
  - add two types for `props` for `Component` : value or action
  - optimize `Controller` and `Component`, update `props` in `Component`
  - update the declaration of `Component` in `Controller`
  - add new function `setProps` for update `props` in `Component`
  - add new lifecycle `$hasRender` for update `props` in `Component` and `Controller`
6. 2018-05-03/04 optimize
  - add new class `Utils`
  - add new class `Compile`
  - change renderComponent and use class `Compile`
  - add new **Template Syntax**



## Basic Usage

1. Create a root DOM for route which id is root:

  ```html
  <div id="root"></div>
  ```

2. Create a router:
  - routes must an `Array` includes `Object`
  - `router.init(routes);` can init routes
  - if u want to watch routes changes, plz use `router.$routeChange=(old.new) => {}`

  ``` javascript
  const router = new Router();
  const routes = [
    {
      path: 'R1',
      controller: R1,
    },
    {
      path: 'R2',
      controller: R2,
    },
  ];
  router.init(routes);
  router.$routeChange = function(old, next) {
    console.log('$routeChange', old, next);
  }
  ```

3. Create a Component:
  - must extends`class Component`
  - must `super(name, props);`
  - **plz setState or setProps after lifecycle `constructor()`**
  - u need to declare template in `constructor` and use `this.declareTemplate: String`
  - `name: String` is this component use in `class Controller`
  - `props: Object` is data which `class Controller` sends to `class Component`
  - **`props: Object` can only be changed or used after lifecycle `constructor()`**
  - `props: Object` can only be changed by action `this.setProps()` and `this.setProps()` is equal to `setState`

  ```javascript
  class pComponent extends Component {
    constructor(name, props) {
      super(name, props);
      this.declareTemplate = '<p rt-click="this.componentClick()">被替换的组件</p>';
      this.state = {b: 100};
    }
    $onInit() {
      console.log('props', this.props);
    }
    componentClick() {
      alert('点击了组件');
      this.declareTemplate = '<p>我改变了component</>';
      this.setState({b: 2});
      this.setProps({ax: 5});
      // this.props.b(3);
    }
    $watchState(oldData, newData) {
      console.log('oldData Component:', oldData);
      console.log('newData Component:', newData);
    }
  }
  ```

4. Create a controller for path:
  - must extends`class Controller`
  - must declare template in `this.declareTemplate : String`
  - must declare components in `this.declareComponents : Object`
  - if u want to rerender Component, plz use `this.$replaceComponent();`
  - declare Component, `class Component` needs two parmars: `declareTemplateName, props`
  - `declareTemplateName: String` must be as same as the `html tag` which is used in `this.declareTemplate`
  -  `props: Object`'s key is used in `class Component as props's key`
  -  `props: Object`'s value is the data which is send to `class Component` and must belongs to `this.state` in `class Controller`
  ``` javascript
  class R1 extends Controller {
    constructor() {
      super();
      this.state = {a: 1};
      this.declareTemplate = '<p rt-on:click="this.showAlert()">R1 点我然后打开控制台看看</p><pComponent1/><pComponent2/>';
      this.declareComponents = {
        pComponent1: new pComponent('pComponent1', {
          ax: 'a', // key in this.state
          b: this.getProps.bind(this), // action in this
        }),
        pComponent2: new pComponent('pComponent2', {
          ax: 'a',
          b: this.getProps.bind(this),
        }),
      };
    }
    $onInit() {
      console.log('is $onInit');
    }
    $beforeMount() {
      console.log('is $beforeMount');
    }
    $afterMount() {
      console.log('is $afterMount');
    }
    $onDestory() {
      console.log('is $onDestory');
    }
    $watchState(oldData, newData) {
      console.log('oldData Controller:', oldData);
      console.log('newData Controller:', newData);
    }
    showAlert() {
      alert('我错了 点下控制台看看吧');
      this.setState({a: 2});
      console.log('state', this.state);
    }
    getProps(a) {
      alert('里面传出来了');
      this.setState({a: a});
    }
  }
  ```

5. Template Syntax
  - 规定：指令以 rt-xxx 命名
  - rt-text rt-html rt-model rt-class rt-bind
  - 事件指令, 如 rt-on:click
  - Text1: `this.declareTemplate = '<p rt-text="this.state.b"></p>';`
  - Text2: `this.declareTemplate = '<p>{{this.state.b}}</p>';`
  - HTML: `this.declareTemplate = '<p rt-html="this.state.c"></p>';`
  - Model for input: `this.declareTemplate = '<p rt-model="this.state.c"></p>';`
  - Class: `this.declareTemplate = '<p  class="b" rt-class="this.state.a"></p>';`
  - Directives: ues `rt-on:event`
    - `this.declareTemplate = '<p rt-on:click="this.componentClick()"></p>';`

6. Data monitor: this.state && this.setState
  - use `this.state: Object` and `this.setState(parmars: Function || Object)`
  - if u have some variable, u can set `this.state` in `constructor(){}`
  - if u want to change State, plz use `this.setState`, parmars can be `Object` or `Function` which must return an `Object`
  - and u can recive this change in life cycle `$watchState(oldData, newData)`


7. Life cycle is:
  - Component
    ```javascript
      constructor()
      $onInit()
      $beforeMount()
      $afterMount()
      $hasRender()
      $onDestory()
      $watchState(oldData, newData)
    ```

  - Controller
    ```javascript
      constructor()
      $onInit()
      $beforeMount()
      $afterMount()
      $hasRender()
      $onDestory()
      $watchState(oldData, newData)
    ```

  - Router
    ```javascript
    $routeChange(oldPath, newPath)
    ```

## Architecture
route => controller => component

## To do
- [x] 公共类提取
- [x] 路由变化渲染dom
- [x] 数据监听
- [x] 双向绑定html模板
- [x] 组件传入传出props
- [x] 组件渲染
- [X] 组件化(3/3)
- [ ] 子路由
- [ ] 模块化
- [ ] 改用 history 模块的 pushState 方法去触发 url 更新
- [X] 双向绑定
- [X] 动态渲染DOM(1/2)
- [ ] ts实现 （强类型赛高）
