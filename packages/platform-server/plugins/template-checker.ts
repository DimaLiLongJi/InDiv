import fs from 'fs';
import path from 'path';
import { IComponent, InDiv } from '@indiv/core';

/**
 * replace templateChecher for SSR
 *
 * @export
 * @param {IComponent} component
 */
export function templateChecker(component: IComponent) {
  if (component.template) return;
  if (component.templateUrl) {
    let templatePath = component.templateUrl;
    const templateRootPath = (component.$indivInstance as InDiv).getTemplateRootPath;
    if (templateRootPath) {
      if (path.isAbsolute(component.templateUrl)) {
        templatePath = `${templateRootPath}${component.templateUrl}`;
        console.log(8888888, templateRootPath, component.templateUrl, templatePath);
      } else {
        templatePath = path.resolve(templateRootPath, component.templateUrl);
        console.log(9999999, templateRootPath, component.templateUrl, templatePath);
      }
    }
    const templateString = fs.readFileSync(templatePath).toString();
    component.template = templateString;
  }
}
