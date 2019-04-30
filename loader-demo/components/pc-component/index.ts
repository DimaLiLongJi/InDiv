import { Component, DoCheck, BeforeMount, ReceiveInputs, SetState, OnDestory, ElementRef, Input, StateSetter } from '@indiv/core';

@Component({
  selector: 'pc-component',
  // templateUrl: './template.html',
  templateUrl: './pc-component/template.html',
})
export class PComponent implements DoCheck, BeforeMount, ReceiveInputs, OnDestory {
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
