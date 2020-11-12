import { InDiv, IPlugin, utils } from '@indiv/core';
import { ErrorHandler } from '@indiv/core/handler/error-handler';
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
      // 同步错误
      window.addEventListener('error', (ev) => {
        if (!errorHandler && application.getRootModule) {
          const injector = application.getRootModule.$privateInjector || rootInjector;
          // 在这里处理全局的handler
          if (!injector.getProvider(ErrorHandler)) return;
          errorHandler = getService(injector, ErrorHandler);
        }
        if (errorHandler) errorHandler.handleError(ev);
      }, true);
      // 异步错误
      window.addEventListener("unhandledrejection", (ev) => {
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
