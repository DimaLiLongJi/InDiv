import { Component } from '@indiv/core';

import { middlewareInfo } from '../../constants/middleware';

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
    selector: 'middleware-container',
    // templateUrl: './template.html',
    templateUrl: 'pages/middleware/template.html',
    // template: (`
    //     <div class="page-container">
    //         <div class="info-content" nv-repeat="info in infos">
    //             <h1>{{info.h1}}</h1>
    //             <p nv-repeat="rp in info.p">{{rp}}</p>
    //             <div class="child-info" nv-repeat="code in info.info">
    //                 <h2>{{code.title}}</h2>
    //                 <p nv-repeat="pli in code.p">{{pli}}</p>
    //                 <div class="pchild" nv-if="code.pchild">
    //                 <p nv-repeat="child in code.pchild">{{child}}</p>
    //                 </div>
    //                 <code-shower nv-if="code.code" type="{codeType}" codes="{code.code}"></code-shower>
    //             </div>
    //         </div>
    //     </div>
    // `),
})
export default class MiddlewareContainer {
    public infos: Info[] = middlewareInfo();
    public codeType: string = 'javascript';
}
