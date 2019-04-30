import { Component, HasRender, OnInit, ReceiveInputs, SetState, OnDestory, ElementRef, Input, StateSetter } from '@indiv/core';
import { HeroSearchService2 } from '../../services/service';

@Component({
  selector: 'route-child',
  // templateUrl: './template.html',
  templateUrl: 'route-child/template.html',
})
export class RouteChild implements OnInit, HasRender, ReceiveInputs, OnDestory {
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
