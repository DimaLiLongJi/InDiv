import { NvModule } from '@indiv/core';
import { RouteModule, TRouter } from '@indiv/router'; 

import { RouteChild } from '../components/route-child';
import { PCChild } from '../components/pp-childs';
import { TestDirective } from '../directives/test-directive';


const routes: TRouter[] = [
  {
    path: '/',
    // redirectTo: '/R1',
    children: [
      {
        path: '/R1',
        component: 'R1',
        routeCanActive: (lastRoute: string) => {
          // return false;
          return true;
        },
        children: [
          {
            path: '/C1',
            // component: 'R2',
            loadChild: () => import('./loadChild.module').then(mod => mod.LoadchildModule),
            // redirectTo: '/R1/C1/D1',
            children: [
              {
                path: '/D1',
                component: 'R2',
                // redirectTo: '/R2/2',
              },
            ],
          },
          {
            path: '/C2',
            redirectTo: '/R2',
          },
        ],
      },
      {
        path: '/R2',
        component: 'R2',
        children: [
          {
            path: '/:id',
            component: 'R1',
            children: [
              {
                path: '/D1',
                redirectTo: '/R1/C1',
              },
            ],
          },
        ],
      },
    ],
  },
];

@NvModule({
  imports : [
    RouteModule.forRoot({
      routes,
      rootPath: '/demo',
    }),
  ],
  declarations: [
    PCChild,
    RouteChild,
    TestDirective,
  ],
  exports: [
    PCChild,
    RouteChild,
    TestDirective,
    RouteModule,
  ],
})
export class SharedModule {}
