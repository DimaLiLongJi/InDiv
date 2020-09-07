import { Component, NvModule, HasRender, OnInit, BeforeMount, AfterMount, ReceiveInputs, SetState, OnDestory, Directive, ElementRef, Input, Renderer, StateSetter, ContentChild, ContentChildren, HostListener, HostBinding, Attribute } from '@indiv/core';
import { RouteChange, RouteModule, TRouter } from '@indiv/router'; 
import { HeroSearchService, HeroSearchService2 } from './service';
import { Optional } from '@indiv/di';

@Component({
  selector: 'route-child',
  template: (`
    <div class="fuck">
      <p>子路由的子组件::{{b}}</p>
      <pp-childs ax="{b}"></pp-childs>
    </div>
  `),
})
class RouteChild implements OnInit, HasRender, ReceiveInputs, OnDestory {
  @StateSetter() public setState: SetState;
  public heroSearchService: HeroSearchService2;
  @Input() public a: string = 'a';
  public b: any;
  public d: any[] = [
    {
      z: 111111111111111,
      b: 'a',
    },
    {
      z: 33333333333333,
      b: 'a',
    },
  ];
  constructor(
    private heroSearchService2: HeroSearchService2,
    private element: ElementRef,
  ) {
    console.log('fuck this.heroSearchService2', this.heroSearchService2, this.element);
    this.heroSearchService2.test();
  }

  public nvOnInit() {
    this.b = this.a;
    console.log(555, 'PCChild nvOnInit props11', this.a);
    // this.props.b(3);
  }

  public nvHasRender() {
    console.log('RouteChild hasRender: this.props.a', this.a);
  }

  public nvReceiveInputs(nextInputs: any) {
    console.log(3333, nextInputs);
    this.b = nextInputs.a;
  }

  public nvOnDestory() {
    console.log('RouteChild nvOnDestory');
  }
}

@Component({
  selector: 'pp-childs',
  template: (`
    <div>
      子组件的子组件<br/>
      <p nv-on:click="sendProps(3)">PCChild props.ax:: {{b}}</p>
      <p nv-repeat="da in d">state.d {{da.z}}</p>
    </div>
  `),
})
class PCChild implements OnInit, BeforeMount, AfterMount, ReceiveInputs, OnDestory {
  // public props: any;
  public a: string = 'a';
  @Input('ax') public b: any;
  public d: any[] = [
        {
          z: 101111,
          b: 'a',
        },
        {
          z: 103333,
          b: 'a',
        },
      ];
  @StateSetter() public setState: SetState;
  constructor(
    private element: ElementRef,
  ) {}

  public nvHasRender() {
    console.log('PCChild hasRender : this.props', this.b, this.element);
  }

  public nvOnInit() {
    // this.b = this.props.ax;
    // this.setState({
    //   b: this.props.ax,
    // });
    console.log(555, 'PCChild nvOnInit props11', this.b);
    // this.props.b(3);
  }

  public sendProps(i: number) {
    // this.props.b(i);
    // this.props.ax = 100;
    console.log('this.props', this.b);
  }

  public nvBeforeMount() {
    console.log('PCChild nvBeforeMount props11', this.b);
  }

  public nvAfterMount() {
    console.log('PCChild nvAfterMount props11', this.b);
  }

  public nvOnDestory() {
    console.log('PCChild nvOnDestory');
  }

  public nvReceiveInputs(nextInputs: any) {
    // console.log(this.props.ax);
    console.log(4444, nextInputs);
    // this.b = nextInputs.ax;
    // this.setState({
    //   b: nextInputs.ax,
    // });
  }
}



const routes: TRouter[] = [
  {
    path: '/',
    // redirectTo: '/R1',
    children: [
      {
        path: '/R1',
        component: 'R1',
        routeCanActive: (lastRoute: string) => {
          // return false;
          return true;
        },
        children: [
          {
            path: '/C1',
            // component: 'R2',
            loadChild: () => import('./loadChild.module').then(mod => mod.LoadchildModule),
            // redirectTo: '/R1/C1/D1',
            children: [
              {
                path: '/D1',
                component: 'R2',
                // redirectTo: '/R2/2',
              },
            ],
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
        children: [
          {
            path: '/:id',
            component: 'R1',
            children: [
              {
                path: '/D1',
                redirectTo: '/R1/C1',
              },
            ],
          },
        ],
      },
    ],
  },
];

@Directive({
  selector: 'test-directive',
})
export class TestDirective implements OnInit, RouteChange, ReceiveInputs {
  @Input('test-directive') private testDirective: string;
  @HostBinding('style.color') private color: string = null;
  constructor(
    private hss: HeroSearchService,
    @Optional()
    @Attribute('fuck-y')
    private fuck: string,
  ) {
    console.log(1111111, 'fuck-y', this.fuck);
  }

  public nvOnInit() {
    // console.log(5555, 'init TestDirective', this.testDirective);
    // this.hss.test();
  }

  public nvRouteChange(lastRoute: string, newRoute: string) {
    // console.log(5555, 'nvRouteChange TestDirective', newRoute);
  }
  public nvReceiveInputs(nextInputs: any): void {
    // console.log(33333, 'nvReceiveInputs test-directive', nextInputs);
  }
  @HostListener('mouseover', ['$element'])
  public changeColor = (element: any) => {
    this.color = 'red';
  }
  @HostListener('mouseout', ['$element'])
  public removeColor = (element: any) => {
    this.color = null;
  }
}

@NvModule({
  imports : [
    RouteModule.forRoot({
      routes,
      rootPath: '/demo',
    }),
  ],
  declarations: [
    PCChild,
    RouteChild,
    TestDirective,
  ],
  exports: [
    PCChild,
    RouteChild,
    TestDirective,
    RouteModule,
  ],
})
export class SharedModule {}
