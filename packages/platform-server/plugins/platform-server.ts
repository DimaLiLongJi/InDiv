import { InDiv, IPlugin } from '@indiv/core';
import { _document, PlatfromServerRenderer } from '../renderer';
import { templateChecker } from './template-checker';

/**
 * indiv plugin for platform server
 * 
 * includes setIndivEnv, setRootElement and setRenderer
 *
 * @export
 * @class PlatformServer
 * @implements {IPlugin}
 */
export class PlatformServer implements IPlugin {
  public bootstrap(application: InDiv): void {
    const rootElement = _document.createElement('div');
    rootElement.id = 'root';
    _document.documentElement.appendChild(rootElement);
    application.setIndivEnv('server', true);
    application.setRootElement(_document.getElementById('root'));
    application.setRenderer(PlatfromServerRenderer);
    // 设置服务端模板编译检查，用于编译HTML
    application.setTemplateChecker(templateChecker);
  }
}
