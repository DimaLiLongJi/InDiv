import { InDiv, Component, Utils, NvModule, OnInit, DoCheck, BeforeMount, AfterMount, ReceiveInputs, SetState, OnDestory, ElementRef, HasRender, Input, ViewChild, ViewChildren, StateSetter, Watch, ContentChildren, ContentChild, ChangeDetectionStrategy, MarkForCheck, TMarkForCheck } from '@indiv/core';
import { RouteChange, NvLocation, RouteModule, RouteCanActive } from '@indiv/router';
import { PlatformBrowser } from '@indiv/platform-browser';
import { HttpClient, HttpClientResponse } from '@indiv/common';
import { Observable } from 'rxjs';

import { SharedModule, TestDirective } from './share.module';
import { HeroSearchService, HeroSearchService1, HeroSearchService2 } from './service';
import { PrivateService } from './private.service';

class ValueType { }

@Component({
  selector: 'test-content-component',
  template: '<p nv-on:click="click()">这个是个测试组件content的东西 {{test}}</p>',
})
class TestContentComponent {
  public test: number = 2;

  public click() {
    console.log(999999, this.test);
    this.test = 1002;
  }
}

@Component({
  selector: 'pc-component',
  template: (`
    <div>
      <p nv-if="e" nv-class="a" nv-repeat="da in d"  nv-on:click="componentClick(d)">你好： {{da.z}}</p>
      state.d: <input nv-repeat="da in d" nv-model="da.z" />
      <p nv-on:click="sendProps(5)">props from component.state.a: {{ax}}</p>
      <test-component manName="{a}"></test-component>
    </div>
  `),
})
class PComponent implements DoCheck, BeforeMount, ReceiveInputs, OnDestory {
  @StateSetter() public setState: SetState;
  public a: any = 'a子组件';
  public b: number = 100;
  public c: string = '<p>1111</p>';
  public d: any = [
    {
      z: 111111111111111,
      b: 'a',
    },
    {
      z: 33333333333333,
      b: 'a',
    }];
  public e: boolean = true;
  @Input() public ax: any;
  @Input('b') public bx: (ax: any) => void;

  constructor(
    private element: ElementRef,
  ) {}

  public nvBeforeMount() {
    console.log('nvBeforeMount props11');
  }

  public componentClick(a: any) {
    console.log('aa', a);
  }
  public sendProps(ax: any) {
    this.bx(ax);
  }
  public getProps(a: any) {
    alert('子组件里 里面传出来了');
    // this.setState({ a: a });
    this.a = a;
    this.bx(a);
  }

  public nvDoCheck() {
  }
  public nvReceiveInputs(nextInputs: any) {
    console.log(1111111111111, nextInputs);
    // this.ax = nextInputs.ax;
  }
  public nvOnDestory() {
    console.log('PComponent is nvOnDestory');
  }
}

@Component({
  selector: 'R1',
  template: (`
    <div>
      <pc-component ax="{a}" b="{getProps}"></pc-component>
      下面跟组件没关系<br/>
      <div nv-if="f">
        ef
        <input nv-repeat="ea in e" nv-model="ea.z" />
        <p nv-class="c" nv-if="ea.z" nv-repeat="ea in e" nv-text="ea.z" nv-on:click="showAlert(ea)"></p>
        <p>111this.a：{{a}}</p>
        <input nv-model="a" />
      </div>
      下面是子路由<br/>
      <router-render></router-render>
    </div>
    `),
})
class R1 implements OnInit, BeforeMount, DoCheck, RouteChange, OnDestory, RouteCanActive {
  @StateSetter() public setState: SetState;
  public a: string = 'a11';
  public b: number = 2;
  public d: any[] = [
    {
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
  public c: string = 'c';
  public e: any = [
    {
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
  public f: boolean = true;

  constructor(
    private heroSearchService: HeroSearchService,
    private location: NvLocation,
    private element: ElementRef,
    private indiv: InDiv,
  ) {
    console.log(9999888777, 'from R1', this.element, this.indiv);
    this.heroSearchService.test();
  }

  public nvRouteCanActive(lastRoute: string): boolean {
    console.log('R1 is nvRouteCanActive', 444444, lastRoute);
    // this.location.set('/');
    return true;
  }

  public nvOnInit() {
    console.log('R1 nvOnInit', this.location.get());
  }
  public nvBeforeMount() {
    console.log('is nvBeforeMount');
  }

  public nvRouteChange(lastRoute: string, newRoute: string) {
    console.log('R1 is nvRouteChange', lastRoute, newRoute);
  }

  public nvDoCheck() {
  }
  public showAlert(a: any) {
    this.location.set('/R1/C1', { a: '1' });
    console.log('this.$location', this.location.get());
  }
  public getProps(a: any) {
    console.log('被触发了！', a);
    this.a = a;
    // this.setState({ a: a });
  }

  public nvOnDestory() {
    console.log(this.location.get(), 'R1 is nvOnDestory');
  }
}

// @Injected
@Component({
  selector: 'R2',
  template: (`
    <div>
      <p nv-on:click="showLocation()">点击显示子路由跳转</p>
      <input nv-model="a"/>
      <br/>
      <p nv-on:click="showAlert()">点击显示this.a:{{a}}</p>
      子组件:<br/>
      <route-child a="{a}"></route-child>
      <router-render></router-render>
    </div>
  `),
})
class R2 implements OnInit, BeforeMount, AfterMount, DoCheck, RouteChange, OnDestory {
  public state: any;
  public a: any = 1;
  constructor(
    private heroSearchService1: HeroSearchService1,
    private location: NvLocation,
    private sss: HeroSearchService,
    private element: ElementRef,
  ) {
    this.heroSearchService1.test();
    console.log('this.heroSearchService1', this.heroSearchService1, this.element);
    this.sss.test();
  }
  public nvOnInit() {
    console.log('this.getLocation', this.location.get());
  }
  public nvBeforeMount() {
    // console.log('is nvBeforeMount');
  }
  public nvAfterMount() {
    // console.log('is nvAfterMount');
  }
  public nvHasRender() {
    console.log('！！father: this.a', this.a);
  }
  public nvRouteChange(lastRoute: string, newRoute: string) {
    console.log('R2 is nvRouteChange', lastRoute, newRoute);
  }

  public nvDoCheck() {
  }

  public nvOnDestory() {
    console.log(this.location.get(), 'R2 is nvOnDestory');
  }

  public showAlert() {
    console.log('this.a', this.a);
    // alert('我错了 点下控制台看看吧');
    // this.setState(() => ({ a: 2 }));
  }
  public bindChange(a: any) {
    console.log('aaa', a);
  }
  public showLocation() {
    this.location.set('/R1/C1/D1', { b: '1' });
  }
}

@Component({
  selector: 'test-component',
  template: (`
    <div>
      <p nv-on:click="click()">测试repeat组件: {{manName}}</p>
    </div>
    <div nv-repeat='num in repeatData'>
      <nv-content></nv-content>
    </div>
    <nv-content></nv-content>
`),
  providers: [
    HeroSearchService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent implements OnDestory, ReceiveInputs, AfterMount, HasRender {
  public state: any;
  @Input() public manName: any;
  @MarkForCheck() public markForCheck: TMarkForCheck;
  public repeatData: number[] = [1];
  public man: {name: string} = {
    name: 'fucker',
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
    private heroSearchService: HeroSearchService,
  ) {
    console.log(55544333, 'init TestComponent', this.indiv, this.element);
    this.heroSearchService.test(988);
    this.httpClient.get('/success').subscribe({
      next: (value: any) => { console.log(4444, value); },
    });
  }

  public click() {
    console.log('this.manName', this.manName);
    this.manName = 'fuck!';
    this.markForCheck().then(() => {
      console.log('渲染完成');
    });
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

@Component({
  selector: 'container-wrap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: (`
  <!-- container: {{countState(color)}} -->
  <div class="fucck" nv-class="test.a" nv-id="'cc'">
  <p>{{testNumber}}</p>
  <input nv-model="test.a" nv-on:click="show(test)" />
  <p test-directive="{test.a}" nv-id="232" nv-if="countState(a)" nv-on:click="changeInput()">{{a}}</p>
  <test-component nv-repeat="man in testArray" nv-key="man.id" manName="{countState(man.name)}" nv-if="a">
    <a>this is {{man.name}}</a>
    <test-content-component test-directive="{test.a}"></test-content-component>
  </test-component>
  <p nv-on:click="go()">
    <!-- container: {{countState(color)}} -->
    container: {{countState(color)}}
    <!-- <a nv-href="countState(man.sex, $index)">a {{man.sex}}</a> -->
  </p>
  <!-- <a nv-href="countState(man.sex, $index)">a {{man.sex}}</a> -->
  <input type="number" nv-model="a" />
  <!-- <a nv-href="countState(man.sex, $index)">a {{man.sex}}</a> -->
  <div nv-repeat="man in testArray" nv-key="man.name">
    <!-- <a nv-href="countState(man.sex, $index)">a {{man.sex}}</a> -->
    <div nv-on:click="show(testArray2, '你111')" nv-text="man.name"></div>
    <div>
      <p>性别：{{countState(man.sex, $index)}}</p>
    </div>
    <!-- <a nv-href="countState(man.sex, $index)">a {{man.sex}}</a>
      <img nv-src="man.sex" nv-alt="man.sex" />
      <test-component nv-key="man.name" manName="{countState2(man.name, bd)}"  nv-repeat="bd in testArray2"></test-component>
      <p nv-key="man.name" nv-class="man.name" nv-id="bd" nv-repeat="bd in testArray2">{{bd}}</p>
      <input nv-on:click="show(_b, $index)" nv-repeat="_b in testArray2" nv-model="_b"  nv-class="_b" />
      <input nv-model="test.a"/>
      <div class="fuck" nv-class="man.name" nv-repeat="c in man.job" nv-key="c.id">
         <input nv-on:click="show(c, $index)" nv-model="c.name" nv-class="c.id" />
         <p test-directive="{'123'}" nv-key="man.name" nv-class="man.name" nv-id="c.name">{{man.name}}</p>
         <div nv-repeat="_bb in man.job">
          <p nv-class="man.name" nv-repeat="_test in testArray2">
            {{_test}}: {{man.name}} is {{_bb.name}}
            <a nv-class="_bbc" nv-repeat="_bbc in testArray2">{{man.name}} {{_bb.name}}</a>
          </p>
         </div>
      </div> -->
  </div>
  <router-render></router-render>
</div>
<p>1111</p>
  <!-- <b nv-href="countState(man.sex, $index)"></b> -->
`),
})
class Container implements OnInit, AfterMount, DoCheck, HasRender, RouteChange {
  @Watch() public aaaaa: number;
  public ss: HeroSearchService;
  public ss2: HeroSearchService1;
  public state: any;
  public testNumber: number = 4;
  public color: any = 'red';
  public test: any = {
    a: 3,
  };
  public a: any = 1;
  public b: any = 3;
  public testArray: any = [
    {
      name: 'gerry',
      sex: '男',
      id: 1,
      job: [
        {
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
      id: 2,
      // job: ['老师', '英语老师', '美1'],
      job: [
        {
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
  public testArray2: any = ['程序员2', '码农2', '架构师2'];
  // public testArray2: any = ['程序员2'];
  public props: any;
  @StateSetter() public setState: SetState;
  @MarkForCheck() public markForCheck: TMarkForCheck;
  public http$: Observable<HttpClientResponse>;

  @ViewChild('test-component') private testComponent: TestComponent;
  @ViewChild('router-render') private routerRenderElementRef: ElementRef;
  @ViewChildren('test-directive') private testDirectiveString: TestDirective[];
  @ViewChildren(TestDirective) private testDirective: TestDirective[];

  constructor(
    private hss: HeroSearchService,
    private value: ValueType,
    private location: NvLocation,
    private httpClient: HttpClient,
    private element: ElementRef,
    private indiv: InDiv,
    private privateService: PrivateService,
    private sharedModule: SharedModule,
  ) {
    this.privateService.change();
    console.log(99988, 'from Container', this.sharedModule, this.element, this.indiv, this.privateService.isPrivate);
    this.httpClient.createResponseInterceptor((value: HttpClientResponse) => {
      return {
        data: value.data,
      };
    });
    this.http$ = this.httpClient.get('/success');
    // this.http$.subscribe({
    //   next: this.httpHandler,
    // });
    this.hss.test();
    console.log('value', this.value);
    setTimeout(() => {
      this.setState({
        test: {
          a: 5,
        },
      });
    }, 1000);
  }

  public nvRouteChange(lastRoute?: string, newRoute?: string) {
    console.log('nvRouteChange Container', lastRoute, newRoute);
  }

  public nvOnInit() {
    console.log('nvOnInit Container', this.location.get());
  }

  public nvBeforeMount() {
    // this.testNumber = 11;
    // this.testNumber = 12;
    console.log('nvBeforeMount Container');
  }

  public nvHasRender() {
    this.testNumber = 6;
    this.testNumber = 7;
    console.log('nvHasRender Container', 33333333, this.testComponent, this.testDirective, this.routerRenderElementRef, this.testDirectiveString);
  }

  public nvAfterMount() {
    // this.testNumber = 8;
    // this.testNumber = 9;
    console.log('nvAfterMount Container', 222222, this.testComponent, this.testDirective, this.routerRenderElementRef, this.testDirectiveString);
  }

  public go() {
    this.location.redirectTo('/R1', { b: '1' });
  }
  public countState(a: any, index: number): any {
    return a;
  }

  public countState2(a: any, index: number): any {
    return index;
  }
  public show(a: any, index?: string) {
    console.log('aaaa', a);
    console.log('$index', index);
    console.log('testArray2', this.testArray2);
    setTimeout(() => {
      this.setState({
        test: {
          a: 5,
        },
      });
    }, 2000);
    this.test.a = 222;
  }

  public showInput(event: any, index: number) {
    this.testArray2[index] = event.target.value;
  }

  public nvDoCheck() {
    console.log(999999, 'container do check!');
  }

  public changeInput() {
    this.setState({
      color: "green",
      a: 5,
      testArray: [
        {
          name: 'gerry1',
          sex: '女',
          id: 1,
          job: [
            {
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
          id: 3,
          job: [
            {
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
          name: 'nina3',
          sex: '男',
          id: 2,
          job: [
            {
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
        }],
    });
    this.a = 100;
    this.markForCheck();
  }

  private httpHandler = (value: any) => {
    this.a = 0;
    this.b = 44;
    console.log(33333, 'from container', value);
  }
}

@NvModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    R2,
  ],
  providers: [
    Utils,
    HttpClient,
    HeroSearchService,
    {
      provide: HeroSearchService1,
      useClass: HeroSearchService1,
    },
    HeroSearchService2,
    {
      provide: ValueType,
      useValue: 1123,
    },
    NvLocation,
  ],
  exports: [
    R2,
    SharedModule,
  ],
})
class M2 {
  constructor(
    private indiv: InDiv,
  ) {
    console.log(99999988866666, '来自注入的模块 M2', this.indiv);
  }
}


@NvModule({
  imports: [
    M2,
  ],
  declarations: [
    TestContentComponent,
    Container,
    PComponent,
    TestComponent,
    R1,
  ],
  exports: [
    RouteModule,
  ],
  bootstrap: Container,
})
class M1 {
  constructor(
    private hsr: HeroSearchService,
    private indiv: InDiv,
    private m2: M2,
  ) {
    console.log(999999888777, '来自注入的模块 M1', this.hsr, this.indiv, this.m2);
  }
}

const inDiv = new InDiv();
inDiv.bootstrapModule(M1);
inDiv.use(PlatformBrowser);
inDiv.init();
