import { parseTag } from './parse-tag';
import { Vnode } from './vnode';

export type ParseOptions = {
  components: string[];
  directives: string[];
};

/**
 * vnode main method, parse a template HTML string to Vnode[]
 *
 * html tag regex: (<(?!!--)(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>)
 * html comment tag regex: ((?:[^>]\s|^)<!--(?!<!)[^\[>][\s\S]*?-->)
 *
 * @export
 * @param {string} template
 * @param {ParseOptions} [options={ components: [], directives: [] }]
 * @returns {Vnode[]}
 */
export function parseTemplateToVnode(template: string, options: ParseOptions = { components: [], directives: [] }): Vnode[] {
  const tagRegex = /(<(?!!--)(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>)|((?:[^>]\s|^)<!--(?!<!)[^\[>][\s\S]*?-->)/g;
  const result: Vnode[] = [];
  let current: Vnode = null;
  let level = -1;
  const arr: Vnode[] = [];
  const byTag = {};
  let inComponent = false;

  template.replace(tagRegex, (tag: string, tagMatch: string, commentMatch: string, index: number): string => {
    if (inComponent && tag === `</${current.tagName}>`) inComponent = false;

    const isOpen = tag.charAt(1) !== '/';
    const start = index + tag.length;
    const nextChar = template.charAt(start);
    let parent = null;

    if (isOpen) {
      level++;

      // if tag is comment tag
      if (commentMatch) current = {
        type: 'comment',
        nodeValue: tag.replace(/^\s*<!--/, '').replace(/-->\s*$/, ''),
        parentVnode: current,
        template: tag,
        voidElement: true,
      };

      // if tag is other tag
      if (tagMatch && !commentMatch) current = parseTag(tag, options.directives);
      if (inComponent) current.inComponent = inComponent;

      // change tag into component
      if (current.type === 'tag' && options.components.indexOf(current.tagName) !== -1) {
        current.type = 'component';
        inComponent = true;
      }

      if (!current.voidElement && nextChar && nextChar !== '<' && !/^\s*$/.test(template.slice(start, template.indexOf('<', start)))) {
        current.childNodes.push({
          type: 'text',
          nodeValue: template.slice(start, template.indexOf('<', start)),
          parentVnode: current,
          template: template.slice(start, template.indexOf('<', start)),
          voidElement: true,
        });
      }

      (byTag as any)[(current as any).tagName] = current;

      // if we're at root, push new base node
      if (level === 0) result.push(current);

      parent = arr[level - 1];

      // protect route tag <router-rende> to be pure
      if (parent && parent.tagName !== 'router-render') {
        current.parentVnode = parent;
        parent.childNodes.push(current);
      }

      arr[level] = current;
    }

    if (!isOpen || current.voidElement) {
      level--;
      if (nextChar !== '<' && nextChar) {
        // trailing text node
        // if we're at the root, push a base text node. otherwise add as
        // a child to the current node.
        // parent = level === -1 ? result : arr[level].childNodes;
        parent = level === -1 ? null : arr[level];
        // calculate correct end of the content slice in case there's
        // no tag after the text node.
        const end = template.indexOf('<', start);
        const nodeValue = template.slice(start, end === -1 ? undefined : end);
        // if a node is nothing but whitespace, no need to add it.
        if (!/^\s*$/.test(nodeValue) && !parent) result.push({
          type: 'text',
          nodeValue: nodeValue,
          parentVnode: parent,
          template: nodeValue,
          voidElement: true,
        });
        if (!/^\s*$/.test(nodeValue) && parent && parent.tagName !== 'router-render') arr[level].childNodes.push({
          type: 'text',
          nodeValue: nodeValue,
          parentVnode: parent,
          template: nodeValue,
          voidElement: true,
        });
      }
    }
    return tag;
  });
  return result;
}
