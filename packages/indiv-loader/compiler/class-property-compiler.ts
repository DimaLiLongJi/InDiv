import { types } from 'recast';

/**
 * add template in class
 *
 * @export
 * @param {{ templateString: string; classBody: any }} templateInfo
 * @param {boolean} useTypeScript
 */
export function classPropertyCompiler(templateInfo: { templateString: string; classBody: any }, useTypeScript: boolean): void {
  const typeAnnotation = useTypeScript ? types.builders.typeAnnotation(
    types.builders.genericTypeAnnotation(types.builders.identifier('string'), null),
  ) : null;
  templateInfo.classBody.body.body.push(types.builders.classProperty(
    types.builders.identifier('$template'),
    types.builders.identifier(`\`${templateInfo.templateString}\``),
    typeAnnotation,
  ));
}
