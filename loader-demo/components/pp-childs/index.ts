import { Component, OnInit, BeforeMount, AfterMount, ReceiveInputs, SetState, OnDestory, ElementRef, Input, StateSetter } from '@indiv/core';

@Component({
  selector: 'pp-childs',
  // templateUrl: './template.html',
  templateUrl: 'pp-childs/template.html',
})
export class PCChild implements OnInit, BeforeMount, AfterMount, ReceiveInputs, OnDestory {
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
