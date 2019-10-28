import {
  InDiv,
  Component,
  Utils,
  NvModule,
  Injectable,
  StateSetter,
  Input,
  Watch,
} from '../packages/core/build';
import {
  NvLocation,
  RouteModule,
} from '../packages/router/build';
import {
  HttpClient,
} from '../packages/common/build';
import {
  PlatformBrowser,
} from '../packages/platform-browser/build';


  @Injectable({
    isSingletonMode: true,
  })
class HeroSearchService1 {
    constructor() {
      console.log('js HeroSearchService1 is comming');
    }

    test() {
      console.log('HeroSearchService !!!1111');
    }
  }

  @Injectable({
    isSingletonMode: false,
  })
class HeroSearchService2 {
    test() {
      console.log('HeroSearchService !!!2222');
    }
  }

  @Injectable({
    isSingletonMode: false,
  })
class HeroSearchService {
    static injectTokens = [
      HeroSearchService1,
    ];

    constructor(
      heroSearchService1,
    ) {
      console.log('测试 js 依赖注入', heroSearchService1);
      this.hsr = heroSearchService1;
      this.hsr.test();
    }

    test() {
      console.log('HeroSearchService !!!000000000');
    }
  }

  @Component({
    selector: 'route-child',
    template: (`
      <div>
        <p>子路由的子组件::{{b}}</p>
        <pp-childs ax="{b}"></pp-childs>
      </div>`),
  })
class RouteChild {
    static injectTokens = [
      HeroSearchService2,
    ];
    @StateSetter() setState;
    @Input('aa') b;
    constructor(heroSearchService2) {
      this.heroSearchService = heroSearchService2;
      this.heroSearchService.test();
      this.a = 'a';
      this.d = [{
        z: 111111111111111,
        b: 'a',
      },
      {
        z: 33333333333333,
        b: 'a',
      },
      ];
    }
    nvReceiveInputs(nextInputs) {
      this.b = nextInputs.a;
    }
  }

  @Component({
    selector: 'pp-childs',
    template: (`
      <div>
        子组件的子组件<br/>
        <p nv-on:click="sendProps(100)">PCChild ax:: {{ax}}</p>
        <p nv-repeat="_a in d">1232{{_a.z}}</p>
      </div>
    `),
  })
class PCChild {
    @Input() ax;
    @StateSetter() setState;
    constructor() {
      this.a = 'a';
      this.d = [{
        z: 111111111111111,
        b: 'a',
      },
      {
        z: 33333333333333,
        b: 'a',
      },
      ];
    }
    nvHasRender() {
      console.log('PCChild: this.ax', this.ax);
    }
    sendProps(i) {
      this.ax = i;
    }

    nvReceiveInputs(nextInputs) {
      console.log(4444, nextInputs);
    }
  }
  @Component({
    selector: 'pc-component',
    template: (`
      <div>
        <p nv-if="e" nv-class="da.d" nv-repeat="da in d"  nv-on:click="componentClick(da)">你好： {{da.z}}</p>
        state.d: <input nv-repeat="da in d" nv-model="da.z" />
        <p nv-on:click="sendProps(5)">props from component.state.a: {{ax}}</p>
      </div>`),
  })
class PComponent {
    @Input('ax') ax;
    @Input('getProps') getProps;
    @StateSetter() setState;
    nvOnInit() {
      this.a = 'a子组件';
      this.c = '<p>1111</p>';
      this.d = [{
        z: 111111111111111,
        b: 'a',
      },
      {
        z: 33333333333333,
        b: 'a',
      },
      ];
      this.e = true;
    }
    nvBeforeMount() {
      console.log('nvBeforeMount props11', this.props);
    }

    nvAfterMount() {
      console.log('nvAfterMount props11', this.props);
    }
    nvReceiveInputs(nextInputs) {
      console.log(1111111111111, nextInputs);
      this.ax = nextInputs.ax;
    }
    componentClick(a) {
      console.log('aa', a);
    }
    sendProps(ax) {
      this.getProps(ax);
      console.log('this', this);
    }
    getProps(a) {
      alert('子组件里 里面传出来了');
      this.setState({
        a: a,
      });
      this.getProps(a);
    }
  }

  @Component({
    selector: 'R1',
    template: (`
    <div>
      <pc-component ax="{a}" getProps="{getProps}"></pc-component>
      下面跟组件没关系<br/>
      <div nv-if="f">
        ef
        <input nv-repeat="ea in e" nv-model="ea.z" />
        <p nv-class="c" nv-if="ea.show" nv-repeat="ea in e" nv-text="ea.z" nv-on:click="showAlert(ea.z)"></p>
        <p>111this.a：{{a}}</p>
        <input nv-model="a" />
      </div>
      下面是子路由<br/>
      <router-render></router-render>
    </div>
    `),
  })
class R1 {
    @StateSetter() setState;
    @Watch() aaaa;
    static injectTokens = [
      HeroSearchService,
      Utils,
      NvLocation,
    ];
    constructor(
      heroSearchService,
      utils,
      location
    ) {
      this.location = location;
      this.heroSearchService = heroSearchService;
      this.heroSearchService.test();
      this.utils = utils;
      this.a = 'a11';
      this.b = 2;
      this.d = [{
        z: 111111111111111,
        b: 'a',
        show: true,
      },
      {
        z: 33333333333333,
        b: 'a',
        show: true,
      },
      ];
      this.c = 'c';
      this.e = [{
        z: 232323,
        b: 'a',
        show: true,
      },
      {
        z: 1111,
        b: 'a',
        show: false,
      },
      ];
      this.f = true;
    }
    nvBeforeMount() {
      console.log('is nvBeforeMount');
    }
    nvRouteChange(lastRoute, newRoute) {
      console.log('R1 is nvRouteChange', lastRoute, newRoute);
    }
    showAlert(a) {
      this.location.set('/R1/C1', {
        a: '1',
      });
      console.log('this.$location', this.location.get());
    }
    getProps(a) {
      // alert('里面传出来了');
      console.log('被触发了！', a, this);
      this.setState({
        a: a,
      });
    }
  }

  @Component({
    selector: 'R2',
    template: (`
    <div>
      <p nv-on:click="showLocation()">点击显示子路由跳转</p>
      <input nv-model="a"/>
      <br/>
      <p nv-on:click="showAlert()">点击显示this.a:{{a}}</p>
      子组件:<br/>
      <route-child aa="{a}"></route-child>
      <router-render></router-render>
    </div>
    `),
  })
class R2 {
    static injectTokens = [
      HeroSearchService1,
      NvLocation,
    ];
    @StateSetter() setState;
    constructor(
      heroSearchService1,
      location,
    ) {
      this.heroSearchService1 = heroSearchService1;
      this.a = 1;
      this.location = location;
    }
    nvOnInit() {
      console.log('this.$location222', this.location.get());
    }
    nvHasRender() {
      console.log('！！father: this.a', this.a);
    }
    nvRouteChange(lastRoute, newRoute) {
      console.log('R2 is nvRouteChange', lastRoute, newRoute);
    }

    nvDoCheck() {}
    showAlert() {
      console.log('this.a', this.a);
      // alert('我错了 点下控制台看看吧');
      // this.setState(() => ({ a: 2 }));
    }
    bindChange(a) {
      console.log('aaa', a);
    }
    showLocation() {
      this.location.set('/R1/C1/D1', {
        b: '1',
      });
    }
  }

  @Component({
    selector: 'test-component',
    template: (`
      <div>
        <p nv-on:click="click()">测试repeat组件: {{man}}</p>
      </div>`),
  })
class TestComponent {
    @Input('man') man = '';
    click() {
      console.log('this.man', this.man);
      this.man = 'fuck!';
    }
  }

  @Component({
    selector: 'container-wrap',
    template: (`
      <div>
        <p id="aa" nv-if="a" nv-on:click="changeInput()">{{a}}</p>
        <test-component nv-repeat="man in testArray" man="{man.name}" nv-key="man.name" nv-if="a"></test-component>
        <p nv-on:click="go()">container: {{a}}</p>
        <input nv-model="a" />
        <div nv-repeat="man in testArray" nv-key="man.name">
            <test-component man="{man.name}"></test-component>
            <div nv-on:click="show(testArray2)">姓名：{{man.name}}</div>
            <div>性别：{{man.sex}}</div>
            <a nv-href="man.name">a {{man.sex}}</a>
            <img nv-src="man.name" ng-alt="man.name" />
            <input nv-on:click="show(_b, $index)" nv-repeat="_b in testArray2" nv-key="$index" nv-model="_b" nv-class="_b" />
            <div class="fuck" nv-repeat="c in man.job" nv-key="c.id">
              <input nv-on:click=show(c, $index)" nv-model="c.name" nv-class="c.id" />
            </div>
        </div>
        <router-render></router-render>
      </div>
    `),
    providers: [{
      provide: HeroSearchService2,
      useClass: HeroSearchService2,
    }],
  })
class Container {
    static injectTokens = [
      HeroSearchService,
      HeroSearchService1,
      HeroSearchService2,
      NvLocation,
    ];
    constructor(
      heroSearchService,
      heroSearchService1,
      heroSearchService2,
      location,
    ) {
      this.location = location;
      this.ss = heroSearchService;
      this.ss.test();
      console.log('heroSearchService2', heroSearchService2);
      this.a = 1;
      this.b = 3;
      this.testArray = [{
        name: 'gerry',
        sex: '男',
        job: [{
          id: 1,
          name: '程序员',
        },
        {
          id: 2,
          name: '码农',
        },
        {
          id: 3,
          name: '帅',
        },
        ],
      },
      {
        name: 'nina',
        sex: '女',
        // job: ['老师', '英语老师', '美1'],
        job: [{
          id: 1,
          name: '老师',
        },
        {
          id: 2,
          name: '英语老师',
        },
        {
          id: 3,
          name: '美',
        },
        ],
      },
      ];
      this.testArray2 = ['程序员3', '码农3', '帅3'];
    }
    nvOnInit() {
      console.log('nvOnInit Container');
    }
    nvOnDestory() {
      console.log('TestComponent OnDestory');
    }

    go() {
      this.location.set('/R1', {
        b: '1',
      });
      console.log('R1 nvOnInit', this.location.get());
    }

    show(a, index) {
      console.log('aaaa', a);
      console.log('index', index);
    }

    showInput(event, index) {
      console.log('aaaa', event.target.value);
      const testArray2 = this.testArray2;
      testArray2[index] = event.target.value;
      console.log('this.state.testArray2', this.testArray2);
    }

    changeInput() {
      this.a = 4;
      this.testArray = [{
        name: 'gerry',
        sex: '男',
        job: [{
          id: 1,
          name: '程序员',
        },
        {
          id: 2,
          name: '码农',
        },
        {
          id: 3,
          name: '帅',
        },
        ],
      },
      {
        name: 'gerry2',
        sex: '男2',
        job: [{
          id: 1,
          name: '程序员2',
        },
        {
          id: 2,
          name: '码农2',
        },
        {
          id: 3,
          name: '帅2',
        },
        ],
      },
      {
        name: 'nina',
        sex: '女',
        job: [{
          id: 1,
          name: '老师',
        },
        {
          id: 2,
          name: '英语老师',
        },
        {
          id: 3,
          name: '美',
        },
        ],
      },
      ];
    }
  }

  @NvModule({
    declarations: [
      R2,
      RouteChild,
      PCChild,
    ],
    providers: [{
      provide: HeroSearchService2,
      useClass: HeroSearchService2,
    }],
    exports: [
      R2,
      RouteChild,
    ],
  })
class M2 {}

const routes = [{
  path: '/',
  // redirectTo: '/R1',
  children: [{
    path: '/R1',
    component: 'R1',
    // redirectTo: '/R2',
    children: [{
      path: '/C1',
      component: 'R2',
      children: [{
        path: '/D1',
        redirectTo: '/R2',
      }],
    },
    {
      path: '/C2',
      redirectTo: '/R2',
    },
    ],
  },
  {
    path: '/R2',
    component: 'R2',
    children: [{
      path: '/:id',
      component: 'R1',
      children: [{
        path: '/D1',
        redirectTo: '/R1/C1',
      }],
    }],
  },
  ],
}];

  @NvModule({
    imports: [
      M2,
      RouteModule.forRoot({
        routes: routes,
        rootPath: '/demo',
      }),
    ],
    declarations: [
      Container,
      PComponent,
      TestComponent,
      R1,
    ],
    providers: [
      Utils,
      HeroSearchService,
      {
        provide: HeroSearchService1,
        useClass: HeroSearchService1,
      },
      NvLocation,
      HttpClient,
    ],
    bootstrap: Container,
  })
class M1 {}


InDiv.bootstrapFactory(M1, {
  plugins: [
    PlatformBrowser,
  ],
});
