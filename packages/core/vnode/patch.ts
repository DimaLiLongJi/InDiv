import { TAttributes, IPatchList, Vnode, TEventType } from './vnode';
import { Renderer } from './renderer';

/**
 * create nativeElment only without attributes
 *
 * @param {Vnode} createdVnode
 * @param {Renderer} renderer
 * @returns {*}
 */
export function createNativeElement(createdVnode: Vnode, renderer: Renderer): any {
  if (createdVnode.type === 'text') return renderer.creatTextElement(createdVnode.nodeValue);
  else if (createdVnode.type === 'comment') return renderer.creatCommentElement(createdVnode.nodeValue);
  else return renderer.creatElement(createdVnode.tagName);
}

/**
 * set attributes to nativeElment
 *
 * @param {Vnode} vnode
 * @param {TAttributes} attribute
 * @param {Renderer} renderer
 */
export function setAttributesToNativeElement(vnode: Vnode, attribute: TAttributes, renderer: Renderer): void {
  if (attribute.type === 'attribute') renderer.setAttribute(vnode.nativeElement, attribute.name, attribute.value);
  if (attribute.type === 'nv-attribute') renderer.setNvAttribute(vnode.nativeElement, attribute.name, attribute.nvValue);
}

/**
 * create a whol nativeElment and it's children
 *
 * @export
 * @param {Vnode} createdVnode
 * @param {Renderer} renderer
 * @param {number} [index]
 * @returns {*}
 */
export function createNativeElementAndChildrens(createdVnode: Vnode, renderer: Renderer, index?: number): any {
  const nativeElement = createNativeElement(createdVnode, renderer);
  createdVnode.nativeElement = nativeElement;
  if (createdVnode.attributes && createdVnode.attributes.length > 0) {
    createdVnode.attributes.forEach(attr => setAttributesToNativeElement(createdVnode, attr, renderer));
  }
  if (createdVnode.eventTypes && createdVnode.eventTypes.length > 0) {
    createdVnode.eventTypes.forEach(eventType => renderer.addEventListener(createdVnode.nativeElement, eventType.type, eventType.handler));
  }
  if (createdVnode.value) renderer.setValue(createdVnode.nativeElement, createdVnode.value);
  if (createdVnode.childNodes && createdVnode.childNodes.length > 0) {
    createdVnode.childNodes.forEach(childNode => createNativeElementAndChildrens(childNode, renderer));
  }

  if (!index && index !== 0) renderer.appendChild(createdVnode.parentVnode.nativeElement, createdVnode.nativeElement);
  else renderer.insertBefore(createdVnode.parentVnode.nativeElement, createdVnode.nativeElement, index);
}

/**
 * renderVnode 对比完render node
 * 
 * REMOVE_TAG: 0, 移除nativeElement
 * CREATE_TAG: 1, 创建nativeElement
 * MOVE_TAG: 2, 移动位置（插入或添加或删除）
 * REPLACE_ATTRIBUTES: 3, 移除属性
 * ADD_ATTRIBUTES: 4, 设置属性 
 * TEXT: 5, 更改文字
 * value: 6, 更改 input textarea select 等表单的 value 值
 * repeatData: 7, 更改 node 的 repeatData（nv-repeat的根数据）
 * REMOVE_EVENT: 8, 移除 node 事件
 * ADD_EVENT: 9, 添加 node 事件
 *
 * @export
 * @param {IPatchList[]} patchList
 * @param {Renderer} renderer
 */
export function patchVnode(patchList: IPatchList[], renderer: Renderer): void {
  // 先排序，按照移除元素创建元素移动位置修改同一元素属性等，从0到9排序
  patchList.sort((a, b) => {
    if (a.type === b.type && a.newIndex && b.newIndex) return a.newIndex - b.newIndex;
    return a.type - b.type;
  });
  patchList.forEach(patch => {
    switch (patch.type) {
      case 0: {
        const removeNodeIndex = patch.parentVnode.childNodes.indexOf(patch.changedVnode);
        if (renderer.isContainted(patch.parentVnode.nativeElement, patch.changedVnode.nativeElement)) {
          renderer.removeChild(patch.parentVnode.nativeElement, patch.changedVnode.nativeElement);
        }
        patch.parentVnode.childNodes.splice(removeNodeIndex, 1);
        break;
      }
      case 1: {
        if (patch.parentVnode.childNodes[patch.newIndex]) {
          patch.changedVnode.parentVnode = patch.parentVnode;
          patch.parentVnode.childNodes.splice(patch.newIndex, 0, patch.changedVnode);
          createNativeElementAndChildrens(patch.changedVnode, renderer, patch.newIndex);
        } else {
          patch.changedVnode.parentVnode = patch.parentVnode;
          patch.parentVnode.childNodes.push(patch.changedVnode);
          createNativeElementAndChildrens(patch.changedVnode, renderer);
        }
        break;
      }
      case 2: {
        if (patch.parentVnode.childNodes.indexOf(patch.changedVnode) !== patch.newIndex) {
          if (renderer.isContainted(patch.parentVnode.nativeElement, patch.changedVnode.nativeElement)) {
            renderer.removeChild(patch.parentVnode.nativeElement, patch.changedVnode.nativeElement);
            patch.parentVnode.childNodes.splice(patch.oldIndex, 1);
          }
          if (patch.parentVnode.childNodes[patch.newIndex]) {
            renderer.insertBefore(patch.parentVnode.nativeElement, patch.changedVnode.nativeElement, patch.newIndex);
            patch.parentVnode.childNodes.splice(patch.newIndex, 0, patch.changedVnode);
          } else {
            renderer.appendChild(patch.parentVnode.nativeElement, patch.changedVnode.nativeElement);
            patch.parentVnode.childNodes.push(patch.changedVnode);
          }
        }
        break;
      }
      case 3: {
        const removeAttrIndex = patch.originVnode.attributes.indexOf((patch.changedValue as TAttributes));
        if ((patch.changedValue as TAttributes).name === 'nv-model') patch.originVnode.value = null;
        if ((patch.changedValue as TAttributes).name === 'nv-key') patch.originVnode.key = null;
        patch.originVnode.attributes.splice(removeAttrIndex, 1);

        // render nativeElement
        if (patch.attributeType === 'attribute') renderer.removeAttribute(patch.originVnode.nativeElement, (patch.changedValue as TAttributes).name, (patch.changedValue as TAttributes).value);
        if (patch.attributeType === 'nv-attribute') renderer.removeNvAttribute(patch.originVnode.nativeElement, (patch.changedValue as TAttributes).name, (patch.changedValue as TAttributes).nvValue);
        break;
      }
      case 4: {
        if (patch.originVnode.attributes) patch.originVnode.attributes.push({ ...(patch.changedValue as TAttributes) });
        if (!patch.originVnode.attributes) patch.originVnode.attributes = [{ ...(patch.changedValue as TAttributes) }];

        if ((patch.changedValue as TAttributes).name === 'nv-model') patch.originVnode.value = (patch.changedValue as TAttributes).nvValue;
        if ((patch.changedValue as TAttributes).name === 'nv-key') patch.originVnode.key = (patch.changedValue as TAttributes).nvValue;

        // render nativeElement
        if (patch.attributeType === 'attribute') renderer.setAttribute(patch.originVnode.nativeElement, (patch.changedValue as TAttributes).name, (patch.changedValue as TAttributes).value);
        if (patch.attributeType === 'nv-attribute') renderer.setNvAttribute(patch.originVnode.nativeElement, (patch.changedValue as TAttributes).name, (patch.changedValue as TAttributes).nvValue);
        break;
      }
      case 5: {
        patch.originVnode.nodeValue = (patch.changedValue as string);
        renderer.setNodeValue(patch.originVnode.nativeElement, patch.changedValue);
        break;
      }
      case 6: {
        patch.originVnode.value = (patch.changedValue as string | number);
        renderer.setValue(patch.originVnode.nativeElement, patch.changedValue);
        break;
      }
      case 7: {
        patch.originVnode.repeatData = patch.changedValue;
        break;
      }
      case 8: {
        const removeEventTypeIndex = patch.originVnode.eventTypes.indexOf((patch.changedValue as TEventType));
        patch.originVnode.eventTypes.splice(removeEventTypeIndex, 1);
        renderer.removeEventListener(patch.originVnode.nativeElement, (patch.changedValue as { type: string; handler: Function; }).type, (patch.changedValue as TEventType).handler);
        break;
      }
      case 9: {
        if (!patch.originVnode.eventTypes) patch.originVnode.eventTypes = [{ ...(patch.changedValue as TEventType) }];
        if (patch.originVnode.eventTypes) patch.originVnode.eventTypes.push({ ...(patch.changedValue as TEventType) });
        renderer.addEventListener(patch.originVnode.nativeElement, (patch.changedValue as { type: string; handler: Function; }).type, (patch.changedValue as TEventType).handler);
        break;
      }
    }
  });
}
