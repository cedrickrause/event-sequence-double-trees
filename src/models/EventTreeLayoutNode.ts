import { EventTreeNode, EventTreeNodeImpl } from './EventTreeNode';

export interface EventTreeLayoutNode extends EventTreeNode {
  x: number,
  y: number,
}

export class EventTreeLayoutNodeImpl extends EventTreeNodeImpl implements EventTreeLayoutNode {
  x: number;

  y: number;

  constructor(
    node: EventTreeNode,
    x: number,
    y: number,
  ) {
    super(node.eventType, node.value, node.depth, node.parents, node.children);
    this.x = x;
    this.y = y;
  }
}
