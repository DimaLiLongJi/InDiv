import fs from 'fs';
import path from 'path';

/**
 * compile class decorator and find Component and Directive
 *
 * @export
 * @param {string} rootPath
 * @param {*} body
 * @param {{ components: string[], directives: string[] }} parseVnodeOptions
 * @param {Map<string, { templateUrl: string; templateString: string; classBody: any; }>} componentMap
 */
export function classDecoratorCompiler(rootPath: string, body: any, parseVnodeOptions: { components: string[], directives: string[] }, componentMap: Map<string, { templateUrl: string , templateString: string; classBody: any; }>): void {
  if (body.decorators) {
    body.decorators.forEach((decorator: any) => {
      if (decorator.expression && decorator.expression.callee && decorator.expression.callee.name === 'Component') {
        if (decorator.expression.arguments) {
          decorator.expression.arguments.forEach((argument: any) => {
            const selectorProperty: any = argument.properties.find((property: any) => property.key.name === 'selector');
            const templateProperty: any = argument.properties.find((property: any) => property.key.name === 'templateUrl');
            let selector: string;
            // build selector
            if (selectorProperty && selectorProperty.value && selectorProperty.value.value) {
              selector = selectorProperty.value.value;
              parseVnodeOptions.components.push(selector);
            }
            // build template
            if (templateProperty && templateProperty.value && templateProperty.value.value) {
              let templatePath = templateProperty.value.value;
              if (rootPath) {
                if (path.isAbsolute(templateProperty.value.value)) templatePath = `${rootPath}${templateProperty.value.value}`;
                else templatePath = path.resolve(rootPath, templateProperty.value.value);
              }
              const templateString = fs.readFileSync(templatePath).toString();
              componentMap.set(selector, {
                templateUrl: templatePath,
                templateString,
                classBody: body,
              });
            }
          });
        }
      }
      if (decorator.expression && decorator.expression.callee && decorator.expression.callee.name === 'Directive') {
        if (decorator.expression.arguments) {
          decorator.expression.arguments.forEach((argument: any) => {
            argument.properties.forEach((property: any) => {
              if (property.key.name === 'selector') parseVnodeOptions.directives.push(property.value.value);
            });
          });
        }
      }
    });
  }
}
