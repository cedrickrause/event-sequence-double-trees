import { EventDatasetEntry } from './EventDataset';

export interface EventTreeNode {
  eventType: string,
  value: number,
  highlight?: boolean,
  parents: EventTreeNode[],
  children: EventTreeNode[],

  descendants(): EventTreeNode[];
  ancestors(): EventTreeNode[];

  addChildEvent(childEvent: EventDatasetEntry): EventTreeNode;
  addParentEvent(parentEvent: EventDatasetEntry): EventTreeNode;

  addEventSequenceToChildren(sequence: EventDatasetEntry[]): void;
  addEventSequenceToParents(sequence: EventDatasetEntry[]): void;
}

export class EventTreeNodeImpl implements EventTreeNode {
  eventType: string;

  value: number;

  highlight?: boolean | undefined;

  parents: EventTreeNode[];

  children: EventTreeNode[];

  constructor(
    eventType: string,
    value: number,
    parents: EventTreeNode[],
    children: EventTreeNode[],
  ) {
    this.eventType = eventType;
    this.value = value;
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

  ancestors(): EventTreeNode[] {
    if (this.parents.length < 1) {
      return [this];
    }
    return [this, ...this.parents.map((node) => node.ancestors())].flat();
  }
}
