<a name="4.1.1"></a>
# [4.1.1](https://github.com/DimaLiLongJi/InDiv/releases/tag/4.1.1) (2020-06-08)


### Features

* **package:@indiv/indiv-loader** use `recast.visit` to rebuild `Declaration` of `Class`
* **package:@indiv/core** fix `@Injectable({providedIn: 'root'})` can't be injected into injector



<a name="4.1.0"></a>
# [4.1.0](https://github.com/DimaLiLongJi/InDiv/releases/tag/4.1.0) (2019-12-14)


### Features

* **package:@indiv/core** now `@Inject()` `@SkipSelf()` `@Self()` `@Host()` `@Optional()` can be used in `Property Injection`



<a name="4.0.0"></a>
# [4.0.0](https://github.com/DimaLiLongJi/InDiv/releases/tag/4.0.0) (2019-10-28)


### Features

* **package:@indiv/router** add new method for `loadChild`
* **package:@indiv/core** add new static method `bootstrapFactory` for bootstraping Indiv application and creating Indiv instance
* **package:@indiv/core** format and rename Factory method



<a name="3.1.3"></a>
# [3.1.3](https://github.com/DimaLiLongJi/InDiv/releases/tag/3.1.3) (2019-09-29)


### Fix

* **package:@indiv/core** fix `cacheDirectiveList` in `directive-compiler`



<a name="3.1.2"></a>
# [3.1.2](https://github.com/DimaLiLongJi/InDiv/releases/tag/3.1.2) (2019-09-19)


### Fix

* **package:@indiv/core** fix `$declarationMap` is `undefined` in `@NvModule`



<a name="3.1.1"></a>
# [3.1.1](https://github.com/DimaLiLongJi/InDiv/releases/tag/3.1.1) (2019-06-19)


### Features

* **package:@indiv/core** let all `provider` of `@Directive`, `@Component` and `@NvModule` can use `deps`


### Fix

* **package:@indiv/core** fix `provider` of `@Directive` and `@Component`



<a name="3.1.0"></a>
# [3.1.0](https://github.com/DimaLiLongJi/InDiv/releases/tag/3.1.0) (2019-06-12)


### Features

* **all packages** all private properties start with `$`
* **package:@indiv/core** add `useFactory` in DI



<a name="3.0.0"></a>
# [3.0.0](https://github.com/DimaLiLongJi/InDiv/releases/tag/3.0.0) (2019-05-12)


### Features

* **package:@indiv/core** use `injector.fork()` to build `Injector`
* **package:@indiv/platform-server** update `factoryModule`
* **package:@indiv/router** update `factoryModule`
* **package:@indiv/core** add `@HostListener` and `@HostBinding`
* **package:@indiv/core** add `@Inject`, `@Host`, `@SkipSelf`, `@Self` and `@Optional` in DI
* **package:@indiv/core** add `@Attribute` in component and directive



<a name="2.1.0"></a>
# [2.1.0](https://github.com/DimaLiLongJi/InDiv/releases/tag/2.1.0) (2019-04-30)


### Features

* **package:@indiv/core** support absolute path of `templateUrl` with @indiv/indiv-loader
* **package:@indiv/core** add method `querySelectorAll` and method `querySelector` in `Renderer`
* **package:@indiv/platform-server** support absolute path of `templateUrl` with method `renderToString` by `templateRootPath`
* **package:@indiv/platform-server** add method `querySelectorAll` and method `querySelector` in `Renderer`
* **package:@indiv/platform-browser** add method `querySelectorAll` and method `querySelector` in `Renderer`



<a name="2.0.7"></a>
# [2.0.7](https://github.com/DimaLiLongJi/InDiv/releases/tag/2.0.7) (2019-03-21)


### Features

* **package:@indiv/indiv-loader** add HTML into dependences of Webpack for watching changes



<a name="2.0.6"></a>
# [2.0.6](https://github.com/DimaLiLongJi/InDiv/releases/tag/2.0.6) (2019-03-17)


### Features

* **package:@indiv/core** add `lifecycleCaller`
* **package:@indiv/core** add comment node renderer
* **package:@indiv/core** add `@ContentChild` `@ContentChildren` `<nv-content>`
* **package:@indiv/core** add ChangeDetectionStrategy
* **package:@indiv/core** add `@MarkForCheck` for marking to check and render
* **package:@indiv/platform-browser** add comment node renderer
* **package:@indiv/platform-server** add comment node renderer



<a name="2.0.5"></a>
# [2.0.5](https://github.com/DimaLiLongJi/InDiv/releases/tag/2.0.5) (2019-02-21)


### Fix

* **package:@indiv/core** fix npm
* **package:@indiv/common** fix npm
* **package:@indiv/platform-browser** fix npm
* **package:@indiv/platform-server** fix npm
* **package:@indiv/router** fix npm
* **package:@indiv/indiv-loader** fix npm



**These versions have been deprecated.**

<a name="2.0.4"></a>
# [2.0.4](https://github.com/DimaLiLongJi/InDiv/releases/tag/2.0.4) (2019-02-21)


### Features

* **package:@indiv/core** add `templateUrl` in `@Component`
* **package:@indiv/indiv-loader** add webpack loader for AOT

### Fix

* **package:@indiv/common** fix npm peerDependencies version
* **package:@indiv/platform-browser** fix npm peerDependencies version
* **package:@indiv/platform-server** fix npm peerDependencies version
* **package:@indiv/router** fix npm peerDependencies version



<a name="2.0.3"></a>
# [2.0.3](https://github.com/DimaLiLongJi/InDiv/releases/tag/2.0.3) (2019-02-15)


### Performance Improvements

* **package:@indiv/core** save `parseVnodeOptions` and `templateVnode` in Component instance，now will compile template to vnode once
* **package:@indiv/core** now `@Component` and `@Directive` can be found in `provide` of `rootInjector` as unsingleton instance

### Fix

* **package:@indiv/route** fix `RouteCanActive` with `redirectTo`



<a name="2.0.2"></a>
# [2.0.2](https://github.com/DimaLiLongJi/InDiv/releases/tag/2.0.2) (2019-02-05)


### Features

* **package:@indiv/core** now `NvModule` can be injected as singleton dependency in DI
* **package:@indiv/core** optimize DI in `Indiv` and `Renderer`



<a name="2.0.1"></a>
# [2.0.1](https://github.com/DimaLiLongJi/InDiv/releases/tag/2.0.1) (2019-02-04)


### Features

新年前最后一版！新年快乐！

* **package:@indiv/core** now `NvModule` will be push into `rootInjector` and it will be a singleton instance
* **package:@indiv/core** add methods: `getModuleFromRootInjector` for finding `NvModule` in `rootInjector`. If `NvModule` isn't in `rootInjector`, `rootInjector` will save instance of `NvModule` automatically
* **package:@indiv/core** add new property Decorator `StateSetter` for mapping function `setState`

### Fix

* **package:@indiv/core** fix `@Watch` can't watch property which is unassigned
* **package:@indiv/core** fix `@Input` can't set property which is unassigned



<a name="2.0.0"></a>
# [2.0.0](https://github.com/DimaLiLongJi/InDiv/releases/tag/2.0.0) (2019-01-31)


### Features

* **package:@indiv/router** add navigation guards `RouteChange` `RouteCanActive`
* **package:@indiv/router** add new interface `IComponentWithRoute` `IDirectiveWithRoute`
* **package:@indiv/core** add methods: `initComponent` `runComponentRenderer`
* **package:@indiv/platform-server** synchronize navigation guards with @indiv/router



<a name="0.0.3-alpha.0"></a>
# [0.0.3-alpha.0](https://github.com/DimaLiLongJi/InDiv/releases/tag/v0.0.3-alpha.0) (2019-01-18)


### Features

* **package:@indiv/core** add @ViewChild and @ViewChildren
* **package:@indiv/core** optimize @Input

### Fix

* **package:@indiv/core** fix compile `nv-repeat`
* **package:@indiv/platform-server** fix nvLocation parmas



<a name="0.0.2-alpha.0"></a>
# [0.0.2-alpha.0](https://github.com/DimaLiLongJi/InDiv/releases/tag/v0.0.2-alpha.0) (2019-01-11)


### Features

* **package:@indiv/core** optimize render
* **package:@indiv/platform-server** add package of server side render



<a name="0.0.1-alpha.0"></a>
# [0.0.1-alpha.0](https://github.com/DimaLiLongJi/InDiv/releases/tag/v0.0.1-alpha.0) (2019-01-04)


### Features

* **package** now @indiv/core @indiv/common @indiv/platform-browser @indiv/router
* **Virtual DOM:** rewrite virtual DOM and renderer

