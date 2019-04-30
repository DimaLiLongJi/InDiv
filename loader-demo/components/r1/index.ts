import { InDiv, Component, OnInit, DoCheck, BeforeMount, SetState, OnDestory, ElementRef, StateSetter } from '@indiv/core';
import { RouteChange, NvLocation, RouteCanActive } from '@indiv/router';
import { HeroSearchService } from '../../services/service';

@Component({
  selector: 'R1',
  // templateUrl: './template.html',
  templateUrl: './r1/template.html',
})
export class R1 implements OnInit, BeforeMount, DoCheck, RouteChange, OnDestory, RouteCanActive {
  public hSr: HeroSearchService;
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
