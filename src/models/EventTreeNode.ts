/* eslint-disable import/no-cycle */
import _ from 'lodash';
import { EventDatasetEntry } from './EventDataset';
import { EventTreeLink } from './EventTreeLink';
import { Variable } from './Variable';

export interface EventTreeNode {
  eventType: string,
  count: number,
  highlight: boolean,
  depth: number,
  parents: EventTreeNode[],
  children: EventTreeNode[],
  variables: Variable[],
  x: number,
  y: number,
  mod?: number,

  descendants(): EventTreeNode[];
  ancestors(): EventTreeNode[];
  allNodes(): EventTreeNode[];
  links(): EventTreeLink[];

  postorder(): EventTreeNode[];

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

  count: number;

  highlight: boolean;

  depth: number;

  parents: EventTreeNode[];

  children: EventTreeNode[];

  variables: Variable[];

  x: number;

  y: number;

  mod?: number;

  constructor(
    eventType: string,
    count: number,
    depth: number,
    highlight: boolean,
    parents: EventTreeNode[],
    children: EventTreeNode[],
    variables: Variable[],
  ) {
    this.eventType = eventType;
    this.count = count;
    this.depth = depth;
    this.highlight = highlight;
    this.parents = parents;
    this.children = children;
    this.variables = variables;
    this.x = 0;
    this.y = 0;
  }

  addChildEvent(childEvent: EventDatasetEntry): EventTreeNode {
    const child = this.children.find((node) => node.eventType === childEvent.eventType);
    if (child) {
      child.count += 1;
      child.variables.push(...childEvent.variables);
      return child;
    }
    const newChildNode = new EventTreeNodeImpl(
      childEvent.eventType,
      1,
      this.depth + 1,
      false,
      [this],
      [],
      [...childEvent.variables],
    );
    this.children.push(newChildNode);
    return newChildNode;
  }

  addParentEvent(parentEvent: EventDatasetEntry): EventTreeNode {
    const parent = this.parents.find((node) => node.eventType === parentEvent.eventType);
    if (parent) {
      parent.count += 1;
      parent.variables.push(...parentEvent.variables);
      return parent;
    }
    const newParentNode = new EventTreeNodeImpl(
      parentEvent.eventType,
      1,
      this.depth - 1,
      false,
      [],
      [this],
      [...parentEvent.variables],
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
    if (this.depth === 0) {
      if (this.atLeastOneParentIsHighlighted()) {
        return;
      }
      this.highlight = isTurnOn;
      return;
    }
    this.highlight = isTurnOn;
    this.parents.forEach((parent) => {
      if (isTurnOn || !parent.atLeastOneChildIsHighlighted()) {
        parent.highlightAncestors(isTurnOn);
      }
    });
  }

  highlightDescendants(isTurnOn: boolean): void {
    if (this.depth === 0) {
      if (this.atLeastOneChildIsHighlighted()) {
        return;
      }
      this.highlight = isTurnOn;
      return;
    }
    this.highlight = isTurnOn;
    this.children.forEach((child) => {
      if (isTurnOn || !child.atLeastOneParentIsHighlighted()) {
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

  postorder(): EventTreeNode[] {
    if (this.children.length > 0) {
      return [...this.children.map((node) => node.postorder()), this].flat();
    }
    return [this];
  }
}
