import { Component } from '@indiv/core';

import { routeInfo } from '../../../constants/route';

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
  selector: 'docs-route-container',
  // templateUrl: './template.html',
  templateUrl: '/pages/docs/route/template.html',
  // template: (`
  //   <div class="child-page-wrapper">
  //     <div class="info-content" nv-repeat="info in infos">
  //       <h1>{{info.h1}}</h1>
  //       <p nv-repeat="rp in info.p">{{rp}}</p>
  //       <div class="child-info" nv-repeat="code in info.info">
  //         <h2>{{code.title}}</h2>
  //         <p nv-repeat="pli in code.p">{{pli}}</p>
  //         <div class="pchild" nv-if="code.pchild">
  //           <p nv-repeat="child in code.pchild">{{child}}</p>
  //         </div>
  //         <code-shower codes="{code.code}" nv-if="code.code"></code-shower>
  //       </div>
  //     </div>
  //   </div>
  // `),
})
export default class DocsRouteContainer {
  public infos: Info[] = routeInfo();
}
