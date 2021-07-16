import { InDiv, IPlugin, utils, ErrorHandler } from '@indiv/core';
import { getService, rootInjector } from '@indiv/di';
import { PlatfromBrowserRenderer } from '../renderer';

/**
 * indiv plugin for platform browser
 * 
 * includes setIndivEnv, setRootElement and setRenderer
 *
 * @export
 * @class PlatformBrowser
 * @implements {IPlugin}
 */
export class PlatformBrowser implements IPlugin {
  public bootstrap(application: InDiv): void {
    application.setIndivEnv('browser', false);
    application.setRootElement(document.getElementById('root'));
    application.setRenderer(PlatfromBrowserRenderer);

    // 浏览器端增加下错误处理
    if (utils.hasWindowAndDocument()) {
      let errorHandler: ErrorHandler = null;
      const rootElement: Element = application.getRootElement;
      if (!rootElement) return;
      // 同步错误
      rootElement.addEventListener('error', (ev) => {
        if (!errorHandler && application.getRootModule) {
          const injector = application.getRootModule.$privateInjector || rootInjector;
          // 在这里处理全局的handler
          if (!injector.getProvider(ErrorHandler)) return;
          errorHandler = getService(injector, ErrorHandler);
        }
        if (errorHandler) errorHandler.handleError(ev);
      }, true);
      // 异步错误
      rootElement.addEventListener("unhandledrejection", (ev) => {
        if (!errorHandler && application.getRootModule) {
          const injector = application.getRootModule.$privateInjector || rootInjector;
          // 在这里处理全局的handler
          if (!injector.getProvider(ErrorHandler)) return;
          errorHandler = getService(injector, ErrorHandler);
        }
        if (errorHandler) errorHandler.handleError(ev);
      }, true);
    }
  }
}
