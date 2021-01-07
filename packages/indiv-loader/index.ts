import { getOptions } from 'loader-utils';
import { loader } from 'webpack';
import recast from 'recast';
import { types } from 'recast';
import { classDecoratorCompiler, classPropertyCompiler } from './compiler';

/**
 * indiv loader for webpack
 *
 * @export
 * @param {string} source
 * @returns {string}
 */
export default function indivLoader(source: string): string {
  const that: loader.LoaderContext = this;

  let rootPath: string = that.context;
  const options: {
    useTypeScript?: boolean,
    templateRootPath?: string,
  } = getOptions(that);

  // use typeScript compiler
  let useTypeScript = false;
  if (/\.ts$/.test(that.resourcePath) || /\.tsx$/.test(that.resourcePath)) useTypeScript = true;
  if (/\.js$/.test(that.resourcePath) || /\.jsx$/.test(that.resourcePath)) useTypeScript = false;
  if (options && options.useTypeScript) useTypeScript = true;
  if (options && options.templateRootPath) rootPath = options.templateRootPath;

  const parseVnodeOptions: {
    components: string[],
    directives: string[],
  } = {
    components: [],
    directives: [],
  };
  const componentMap = new Map<string, { templateUrl: string; templateString: string; classBody: any }>();

  // build templateUrl from Decorator
  let ast;
  try {
    if (useTypeScript) ast = recast.parse(source, { parser: require('recast/parsers/typescript') });
    if (!useTypeScript) ast = recast.parse(source, { parser: require('recast/parsers/babel') });
    recast.visit(ast, {
      // collect classDecorator with @Component and @Directive
      visitClassDeclaration(this: any, path: any) {
        classDecoratorCompiler(rootPath, path.value, parseVnodeOptions, componentMap);
        this.traverse(path);
      },
    });
  } catch (e) {
    that.emitError(e);
  }
  // this.addDependency
  // build ast with templateUrl
  // add template into dependency
  componentMap.forEach((templateInfo) => {
    that.addDependency(templateInfo.templateUrl);
    classPropertyCompiler(templateInfo, useTypeScript);
  });

  return recast.print(ast).code;
}
