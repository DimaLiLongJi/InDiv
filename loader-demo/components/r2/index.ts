import { Component, OnInit, DoCheck, BeforeMount, AfterMount, OnDestory, ElementRef } from '@indiv/core';
import { RouteChange, NvLocation } from '@indiv/router';
import { HeroSearchService, HeroSearchService1 } from '../../services/service';

@Component({
  selector: 'R2',
  // templateUrl: './template.html',
  templateUrl: 'r2/template.html',
})
export class R2 implements OnInit, BeforeMount, AfterMount, DoCheck, RouteChange, OnDestory {
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
