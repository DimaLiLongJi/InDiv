import IndivPlatformServer = require('@indiv/platform-server');
import IndivRouter = require('@indiv/router');
import RootModule = require('./public/modules/index');
import path = require('path');

const routes: IndivRouter.TRouter[] = [
    {
        path: '/',
        redirectTo: '/introduction',
        component: 'root-component',
        children: [
            {
                path: '/introduction',
                loadChild: require('./public/modules/introduction.module').default,
            },
            {
                path: '/architecture',
                loadChild: require('./public/modules/architecture.module').default,
            },
            {
                path: '/docs',
                redirectTo: '/docs/component',
                loadChild: require('./public/modules/docs.module').default,
                children: [
                    {
                        path: '/component',
                        component: 'docs-component-container',
                        children: [
                            {
                                path: '/:id',
                                component: 'docs-template-container',
                                children: [
                                    {
                                        path: '/1docs',
                                        redirectTo: '/ssr',
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        path: '/template',
                        component: 'docs-template-container',
                        routeCanActive: () => {
                            // console.log(9999999, 'docs-template-container')
                            return true;
                        },
                    },
                    {
                        path: '/service',
                        component: 'docs-service-container',
                    },
                    {
                        path: '/module',
                        component: 'docs-module-container',
                    },
                    {
                        path: '/route',
                        component: 'docs-route-container',
                    },
                    {
                        path: '/indiv',
                        component: 'docs-indiv-container',
                    },
                    {
                        path: '/libs',
                        component: 'docs-libs-container',
                    },
                    {
                        path: '/http',
                        component: 'docs-http-container',
                    },
                ],
            },
            {
                path: '/ssr',
                loadChild: require('./public/modules/ssr.module').default,
            },
            {
                path: '/middleware',
                loadChild: require('./public/modules/middleware.module').default,
            },
        ],
    },
];

async function render(_path: string, query: any, rootPath: string): Promise<string> {
    const routeConfig = {
        _path,
        query,
        routes,
        rootPath,
    };
    const _string = await IndivPlatformServer.renderToString(RootModule.default, routeConfig, path.resolve(__dirname, './public'));
    return _string;
}

module.exports = {
    render,
};
