/* eslint-disable import/no-cycle */
import _ from 'lodash';
import { EventDatasetEntry } from './EventDataset';
import { EventTreeLink } from './EventTreeLink';

export interface EventTreeNode {
  eventType: string,
  value: number,
  highlight: boolean,
  depth: number,
  parents: EventTreeNode[],
  children: EventTreeNode[],
  x?: number,
  y?: number,

  descendants(): EventTreeNode[];
  ancestors(): EventTreeNode[];
  allNodes(): EventTreeNode[];
  links(): EventTreeLink[];

  leaves(): EventTreeNode[];
  founders(): EventTreeNode[];

  maximumWidth(): number;
  rightMaximumWidth(): number;
  leftMaximumWidth(): number;
  maximumHeight(): number;
  layerHeight(): number;
  allNodesInLayer(depth: number): EventTreeNode[];

  addChildEvent(childEvent: EventDatasetEntry): EventTreeNode;
  addParentEvent(parentEvent: EventDatasetEntry): EventTreeNode;

  addEventSequenceToChildren(sequence: EventDatasetEntry[]): void;
  addEventSequenceToParents(sequence: EventDatasetEntry[]): void;

  atLeastOneChildIsHighlighted(): boolean;
  atLeastOneParentIsHighlighted(): boolean;

  highlightAncestors(isTurnOn: boolean): void;
  highlightDescendants(isTurnOn: boolean): void;
  highlightNode(isTurnOn: boolean): void;

}

export class EventTreeNodeImpl implements EventTreeNode {
  eventType: string;

  value: number;

  highlight: boolean;

  depth: number;

  parents: EventTreeNode[];

  children: EventTreeNode[];

  x?: number;

  y?: number;

  constructor(
    eventType: string,
    value: number,
    depth: number,
    highlight: boolean,
    parents: EventTreeNode[],
    children: EventTreeNode[],
  ) {
    this.eventType = eventType;
    this.value = value;
    this.depth = depth;
    this.highlight = highlight;
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
      false,
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
      false,
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
    const rightWidth = this.rightMaximumWidth();
    const leftWidth = this.leftMaximumWidth();

    return 1 - leftWidth + rightWidth;
  }

  rightMaximumWidth(): number {
    return Math.max(...this.leaves().map((leaf) => leaf.depth));
  }

  leftMaximumWidth(): number {
    return Math.min(...this.founders().map((founder) => founder.depth));
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

  allNodesInLayer(depth: number): EventTreeNode[] {
    const groupedNodesByDepth = _.groupBy(this.allNodes(), 'depth');
    return groupedNodesByDepth[depth];
  }

  atLeastOneChildIsHighlighted(): boolean {
    return this.children.findIndex((child) => child.highlight) >= 0;
  }

  atLeastOneParentIsHighlighted(): boolean {
    return this.parents.findIndex((parent) => parent.highlight) >= 0;
  }

  highlightAncestors(isTurnOn: boolean): void {
    this.highlight = isTurnOn;
    if (this.depth === 0) {
      return;
    }
    this.parents.forEach((parent) => {
      if (isTurnOn || !parent.atLeastOneChildIsHighlighted()) {
        if (parent.depth < 1 && parent.atLeastOneParentIsHighlighted()) {
          return;
        }
        parent.highlightAncestors(isTurnOn);
      }
    });
  }

  highlightDescendants(isTurnOn: boolean): void {
    this.highlight = isTurnOn;
    if (this.depth === 0) {
      return;
    }
    this.children.forEach((child) => {
      if (isTurnOn || !child.atLeastOneParentIsHighlighted()) {
        if (child.depth > -1 && child.atLeastOneChildIsHighlighted()) {
          return;
        }
        child.highlightDescendants(isTurnOn);
      }
    });
  }

  highlightNode(isTurnOn: boolean): void {
    this.highlight = isTurnOn;
  }

  links(): EventTreeLink[] {
    return this.allNodes().map(
      (node) => node.children.map(
        (child) => ({ source: node, target: child }),
      ),
    ).flat();
  }
}
