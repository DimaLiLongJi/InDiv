import { InDiv, INvModule } from '@indiv/core';
import { TRouter, NvLocation } from '@indiv/router';
import { _document } from '../renderer';
import { PlatformServer } from './platform-server';
import { buildPath, generalDistributeRoutes, RouteCongfig } from '../router';

/**
 * render a Indiv app to string
 * 
 * if has routeConfig, will await route render
 *
 * @export
 * @param {Function} rootModule
 * @param {RouteCongfig} [routeConfig]
 * @param {string} [templateRootPath]
 * @returns {Promise<string>}
 */
export async function renderToString(rootModule: Function, routeConfig?: RouteCongfig, templateRootPath?: string): Promise<string> {
  if (_document.getElementById('root')) _document.getElementById('root').innerHTML = '';
  const inDiv = new InDiv();
  inDiv.bootstrapModule(rootModule);
  inDiv.use(PlatformServer);
  // 设置 SSR 编译的模板根路径
  if (templateRootPath) inDiv.setTemplateRootPath(templateRootPath);
  await inDiv.init();
  if (routeConfig) {
    const nvLocatiton = new NvLocation(inDiv);
    nvLocatiton.set(routeConfig.path, routeConfig.query);
    const renderRouteList = buildPath(routeConfig.path);
    const routesList: TRouter[] = [];
    const loadModuleMap: Map<string, INvModule> = new Map();
    await generalDistributeRoutes(routeConfig, routesList, renderRouteList, inDiv, loadModuleMap);
  }
  const content = _document.getElementById('root').innerHTML;
  return content.replace(/^(\<div\>)/g, '').replace(/(\<\/div\>$)/g, '');
}
