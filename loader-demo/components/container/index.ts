import { InDiv, Component, OnInit, DoCheck, AfterMount, SetState, ElementRef, HasRender, ViewChild, ViewChildren, StateSetter, Watch, BeforeMount } from '@indiv/core';
import { RouteChange, NvLocation } from '@indiv/router';
import { HttpClient, HttpClientResponse } from '@indiv/common';
import { Observable } from 'rxjs';

import { SharedModule } from '../../modules/share.module';
import { HeroSearchService, HeroSearchService1, ValueType } from '../../services/service';
import { PrivateService } from '../../services/private.service';
import { TestComponent } from '../../components/test-component';
import { TestDirective } from '../../directives/test-directive';

@Component({
  selector: 'container-wrap',
  templateUrl: '/container/template.html',
  // templateUrl: './template.html',
})
export default class Container implements OnInit, AfterMount, DoCheck, HasRender, RouteChange, BeforeMount {
  @Watch() public aaaaa: number;
  public testNumber: number = 4;
  public ss: HeroSearchService;
  public ss2: HeroSearchService1;
  public state: any;
  public color: any = 'red';
  public test: any = {
    a: 3,
    b: 'adc',
  };
  public a: any = 1;
  public b: any = 3;
  public testArray: any = [
    {
      name: 'gerry',
      sex: '男',
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
    // setTimeout(() => {
    //   this.setState({
    //     test: {
    //       a: 5,
    //     },
    //   });
    // }, 1000);
  }

  public changeName(man: any) {
    man.name = '测试插槽';
  }

  public nvRouteChange(lastRoute?: string, newRoute?: string) {
    console.log('nvRouteChange Container', lastRoute, newRoute);
  }

  public nvOnInit() {
    this.testNumber = 1;
    this.testNumber = 2;
    console.log('nvOnInit Container', this.location.get());
  }

  public nvBeforeMount() {
    this.testNumber = 3;
    this.testNumber = 4;
    setTimeout(() => this.test.b = 'tank', 3000);
    console.log('nvBeforeMount Container');
  }

  public nvHasRender() {
    // this.testNumber = 5;
    // this.testNumber = 6;
    console.log('nvHasRender Container', 33333333, this, this.testComponent, this.testDirective, this.routerRenderElementRef, this.testDirectiveString);
  }

  public nvDoCheck() {
    console.log(999999, 'container do check!');
  }

  public nvAfterMount() {
    this.testNumber = 7;
    this.testNumber = 8;
    this.setState({testNumber: 100});
    console.log('nvAfterMount Container', 222222, this, this.testComponent, this.testDirective, this.routerRenderElementRef, this.testDirectiveString);
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

  public changeInput() {
    this.setState({
      color: "green",
      a: 5,
      testArray: [
        {
          name: 'gerry',
          sex: '女',
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
          name: 'nina',
          sex: '男',
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
  }

  private httpHandler = (value: any) => {
    this.a = 0;
    this.b = 44;
    console.log(33333, 'from container', value);
  }
}
