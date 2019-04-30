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
  public bootstrap(indivInstance: InDiv): void {
    const rootElement = _document.createElement('div');
    rootElement.id = 'root';
    _document.documentElement.appendChild(rootElement);
    indivInstance.setIndivEnv('server', true);
    indivInstance.setRootElement(_document.getElementById('root'));
    indivInstance.setRenderer(PlatfromServerRenderer);
    // 设置服务端模板编译检查，用于编译HTML
    indivInstance.setTemplateChecker(templateChecker);
  }
}
