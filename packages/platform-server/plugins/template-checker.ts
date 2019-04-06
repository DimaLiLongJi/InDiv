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
    const templatePath = path.resolve((component.$indivInstance as InDiv).getTemplateRootPath, component.templateUrl);
    const templateString = fs.readFileSync(templatePath).toString();
    component.template = templateString;
  }
}
