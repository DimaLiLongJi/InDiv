import { IComponent } from '@indiv/core';

import { RenderTaskQueue } from './render-task-queue';

/**
 * render function for Component
 *
 * @template State
 * @template Props
 * @template Vm
 * @returns {Promise<IComponent<State, Props, Vm>>}
 */
export function render<State = any, Props = any, Vm = any>(): Promise<IComponent<State, Props, Vm>> {
  const dom = (this as IComponent<State, Props, Vm>).renderNode;

  if (!this.renderTaskQueue) this.renderTaskQueue = new RenderTaskQueue(this);
  return this.renderTaskQueue.push(dom);
}
