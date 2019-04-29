import { Subscription } from 'rxjs';
import { Component, HasRender, DoCheck, OnInit, OnDestory,  } from '@indiv/core';
import { RouteChange } from '@indiv/router';
import { componentInfo } from '../../../constants/component';

import TestService from '../../../service/test.service';

interface Info {
    h1?: string;
    p?: string[];
    info?: {
      title?: string;
      p?: string[];
      pchild?: string[];
      code?: string;
      exampleTitle?: string;
      example?: {
        p?: string;
        code?: string;
      }[];
    }[];
}

@Component({
  selector: 'docs-component-container',
  // templateUrl: './template.html',
  templateUrl: './pages/docs/component/template.html',
  providers: [
    {
      provide: TestService,
      useClass: TestService,
    },
  ],
})
export default class DocsComponentContainer implements OnInit, HasRender, DoCheck, OnDestory, RouteChange {
  public content: Info[] = componentInfo();
  public subscribeToken: Subscription;

  constructor(
    private testS: TestService,
  ) {
    this.subscribeToken = this.testS.subscribe(this.subscribe);
  }

  public nvOnInit() {
    console.log('DocsComponentContainer has oninit');
  }
  
  public nvDoCheck() {
    console.log('oldState is changes');
  }

  public subscribe(value: any) {
    console.log('RXJS value from DocsComponentContainer', value);
  }

  public click(code: any, index: number) {
    code.title = '啊哈哈恭喜你发现，打开控制台吧（事件1）';
    code.title = '啊哈哈恭喜你发现，打开控制台吧（事件2）';
    this.testS.update(3);
    console.log('刚刚更新了service中的值，下面应该就有打印了');
  }
  
  public showText(text: any) {
    return text;
  }

  public nvHasRender() {
    console.log('nvHasRender');
  }

  public nvOnDestory() {
    console.log('DocsComponentContainer nvOnDestory');
    this.subscribeToken.unsubscribe();
  }

  public nvRouteChange(lastRoute?: string, newRoute?: string) {
    console.log('DocsComponentContainer nvRouteChange', lastRoute, newRoute);
  }
}
