import { Component } from '@indiv/core';
@Component({
  selector: 'test-content-component',
  // templateUrl: './template.html',
  templateUrl: 'test-content-component/template.html',
})
export class TestContentComponent {
  public test: number = 2;

  public click() {
    console.log(999999, this.test);
    this.test = 1002;
  }
}
