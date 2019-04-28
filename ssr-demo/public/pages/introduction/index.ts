import { Component } from '@indiv/core';

import { content } from '../../constants/introduction';

type Info = {
    [x: string]: any;
    h1: string;
    p: string[];
    info?: string[];
}

@Component({
    selector: 'introduction-container',
    // templateUrl: './template.html',
    templateUrl: 'pages/introduction/template.html',
    // template: (`
    //     <div class="page-container">
    //         <div class="info-content" nv-repeat="info in infos">
    //             <h1>{{info.h1}}</h1>
    //             <p nv-repeat="pp in info.p">{{pp}}</p>
    //             <div class="child-info" nv-if="info.info">
    //                 <div class="pchild">
    //                     <p nv-repeat="child in info.info">{{child}}</p>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // `),
})
export default class IntroductionContainer {
    public infos: Info[] = content();
}
