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
  events: EventDatasetEntry[],
  variables: Variable[],
  parentVariables: Variable[],
  childVariables: Variable[],
  x: number,
  y: number,
  mod?: number,

  descendants(): EventTreeNode[];
  ancestors(): EventTreeNode[];
  allNodes(): EventTreeNode[];
  links(): EventTreeLink[];

  leaves(): EventTreeNode[];
  founders(): EventTreeNode[];

  maximumWidth(): number;
  rightMaximumWidth(): number;
  leftMaximumWidth(): number;
  leftMaximumHeight(): number;
  rightMaximumHeight(): number;
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

  events: EventDatasetEntry[];

  variables: Variable[];

  parentVariables: Variable[];

  childVariables: Variable[];

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
    events: EventDatasetEntry[],
    variables: Variable[],
    parentVariables: Variable[],
    childVariables: Variable[],
  ) {
    this.eventType = eventType;
    this.count = count;
    this.depth = depth;
    this.highlight = highlight;
    this.parents = parents;
    this.children = children;
    this.events = events;
    this.variables = variables;
    this.parentVariables = parentVariables;
    this.childVariables = childVariables;
    this.x = 0;
    this.y = 0;
  }

  addChildEvent(childEvent: EventDatasetEntry): EventTreeNode {
    const childNode = this.children.find((node) => node.eventType === childEvent.eventType);
    if (childNode) {
      childNode.count += 1;
      childNode.events.push(childEvent);
      childNode.variables.push(...childEvent.variables);
      childNode.parentVariables.push(
        ...this.variables.slice(this.variables.length - childEvent.variables.length,
          this.variables.length),
      );
      childNode.childVariables.push(...childEvent.variables);
      return childNode;
    }
    const newChildNode = new EventTreeNodeImpl(
      childEvent.eventType,
      1,
      this.depth + 1,
      false,
      [this],
      [],
      [childEvent],
      [...childEvent.variables],
      [...this.variables.slice(this.variables.length - childEvent.variables.length,
        this.variables.length)],
      [...childEvent.variables],
    );
    this.children.push(newChildNode);
    return newChildNode;
  }

  addParentEvent(parentEvent: EventDatasetEntry): EventTreeNode {
    const parentNode = this.parents.find((node) => node.eventType === parentEvent.eventType);
    if (parentNode) {
      parentNode.count += 1;
      parentNode.events.push(parentEvent);
      parentNode.variables.push(...parentEvent.variables);
      parentNode.parentVariables.push(...parentEvent.variables);
      parentNode.childVariables.push(
        ...this.variables.slice(this.variables.length - parentEvent.variables.length,
          this.variables.length),
      );
      return parentNode;
    }
    const newParentNode = new EventTreeNodeImpl(
      parentEvent.eventType,
      1,
      this.depth - 1,
      false,
      [],
      [this],
      [parentEvent],
      [...parentEvent.variables],
      [...parentEvent.variables],
      [...this.variables.slice(this.variables.length - parentEvent.variables.length,
        this.variables.length)],
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
    // Postorder
    if (this.children.length > 0) {
      return [...this.children.map((node) => node.descendants()), this].flat();
    }
    return [this];
  }

  leaves(): EventTreeNode[] {
    if (this.children.length < 1) {
      return [this];
    }
    return [...this.children.map((node) => node.leaves())].flat();
  }

  ancestors(): EventTreeNode[] {
    // Postorder
    if (this.parents.length > 0) {
      return [...this.parents.map((node) => node.ancestors()), this].flat();
    }
    return [this];
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

  leftMaximumHeight(): number {
    const groupedNodesByDepth = _.groupBy(this.ancestors(), 'depth');
    const depths: number[] = [];
    _.forIn(groupedNodesByDepth, (value) => depths.push(value.length));
    return Math.max(...depths);
  }

  rightMaximumHeight(): number {
    const groupedNodesByDepth = _.groupBy(this.descendants(), 'depth');
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
}
