import _ from 'lodash';
import { EventDatasetEntry } from './EventDataset';

export interface EventTreeNode {
  eventType: string,
  value: number,
  highlight?: boolean,
  depth: number,
  parents: EventTreeNode[],
  children: EventTreeNode[],

  descendants(): EventTreeNode[];
  ancestors(): EventTreeNode[];
  allNodes(): EventTreeNode[];

  leaves(): EventTreeNode[];
  founders(): EventTreeNode[];

  maximumWidth(): number;
  maximumHeight(): number;
  layerHeight(): number;

  addChildEvent(childEvent: EventDatasetEntry): EventTreeNode;
  addParentEvent(parentEvent: EventDatasetEntry): EventTreeNode;

  addEventSequenceToChildren(sequence: EventDatasetEntry[]): void;
  addEventSequenceToParents(sequence: EventDatasetEntry[]): void;
}

export class EventTreeNodeImpl implements EventTreeNode {
  eventType: string;

  value: number;

  highlight?: boolean | undefined;

  depth: number;

  parents: EventTreeNode[];

  children: EventTreeNode[];

  constructor(
    eventType: string,
    value: number,
    depth: number,
    parents: EventTreeNode[],
    children: EventTreeNode[],
  ) {
    this.eventType = eventType;
    this.value = value;
    this.depth = depth;
    this.parents = parents;
    this.children = children;
  }

  addChildEvent(childEvent: EventDatasetEntry): EventTreeNode {
    const child = this.children.find((node) => node.eventType === childEvent.eventType);
    if (child) {
      child.value += 1;
      return child;
    }
    const newChildNode = new EventTreeNodeImpl(
      childEvent.eventType,
      1,
      this.depth + 1,
      [this],
      [],
    );
    this.children.push(newChildNode);
    return newChildNode;
  }

  addParentEvent(parentEvent: EventDatasetEntry): EventTreeNode {
    const parent = this.parents.find((node) => node.eventType === parentEvent.eventType);
    if (parent) {
      parent.value += 1;
      return parent;
    }
    const newParentNode = new EventTreeNodeImpl(
      parentEvent.eventType,
      1,
      this.depth - 1,
      [],
      [this],
    );
    this.parents.push(newParentNode);
    return newParentNode;
  }

  addEventSequenceToParents(sequence: EventDatasetEntry[]): void {
    if (sequence.length < 1) {
      return;
    }
    const parent = this.addParentEvent(sequence[sequence.length - 1]);
    parent.addEventSequenceToParents(sequence.slice(0, sequence.length - 1));
  }

  addEventSequenceToChildren(sequence: EventDatasetEntry[]): void {
    if (sequence.length < 1) {
      return;
    }
    const child = this.addChildEvent(sequence[0]);
    child.addEventSequenceToChildren(sequence.slice(1));
  }

  descendants(): EventTreeNode[] {
    if (this.children.length < 1) {
      return [this];
    }
    return [this, ...this.children.map((node) => node.descendants())].flat();
  }

  leaves(): EventTreeNode[] {
    if (this.children.length < 1) {
      return [this];
    }
    return [...this.children.map((node) => node.leaves())].flat();
  }

  ancestors(): EventTreeNode[] {
    if (this.parents.length < 1) {
      return [this];
    }
    return [this, ...this.parents.map((node) => node.ancestors())].flat();
  }

  founders(): EventTreeNode[] {
    if (this.parents.length < 1) {
      return [this];
    }
    return [...this.parents.map((node) => node.founders())].flat();
  }

  allNodes(): EventTreeNode[] {
    // Filter descendants not to add 'this' a second time
    return this.ancestors().concat(this.descendants().filter((node) => node !== this));
  }

  maximumWidth(): number {
    let rightWidth = this.depth;
    let leftWidth = this.depth;

    this.leaves().forEach((leaf) => {
      if (leaf.depth > rightWidth) {
        rightWidth = leaf.depth;
      }
    });

    this.founders().forEach((founder) => {
      if (founder.depth < leftWidth) {
        leftWidth = founder.depth;
      }
    });

    return 1 - leftWidth + rightWidth;
  }

  maximumHeight(): number {
    const groupedNodesByDepth = _.groupBy(this.allNodes(), 'depth');
    const depths: number[] = [];
    _.forIn(groupedNodesByDepth, (value) => depths.push(value.length));
    return Math.max(...depths);
  }

  layerHeight(): number {
    return this.allNodes().filter((node) => node.depth === this.depth).length;
  }
}
