import fs from 'fs';
import path from 'path';
import { IComponent } from '@indiv/core';

/**
 * replace templateChecher for SSR
 *
 * @export
 * @param {IComponent} component
 */
export function templateChecker(component: IComponent) {
  if (component.$template) return;
  if (component.$templateUrl) {
    let templatePath = component.$templateUrl;
    const templateRootPath = component.$indivInstance.getTemplateRootPath;
    if (templateRootPath) {
      if (path.isAbsolute(component.$templateUrl)) templatePath = `${templateRootPath}${component.$templateUrl}`;
      else templatePath = path.resolve(templateRootPath, component.$templateUrl);
    }
    const templateString = fs.readFileSync(templatePath).toString();
    component.$template = templateString;
  }
}
