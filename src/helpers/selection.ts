/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line import/no-cycle
import { EventTreeNode } from '@/models/EventTreeNode';
import { EventSequence } from '@/models/EventSequenceDataset';
import _ from 'lodash';

export type DoubleTreeSelection = {
  left: string[][],
  right: string[][],
}

const addHighlightedChildren = (node: EventTreeNode, right: string[][]): void => {
  const highlightedChildren = node.children.filter((child) => child.highlight);
  highlightedChildren.forEach((child) => {
    addHighlightedChildren(child, right);
  });
  const sequence = [node.eventType];
  let current = node;
  while (current.depth >= 1) {
    // eslint-disable-next-line prefer-destructuring
    current = current.parents[0];
    sequence.push(current.eventType);
  }
  if (!(highlightedChildren.length > 0)) {
    right.push(sequence.reverse());
  }
};

const addHighlightedParents = (node: EventTreeNode, left: string[][]): void => {
  const highlightedParents = node.parents.filter((parent) => parent.highlight);
  highlightedParents.forEach((parent) => {
    addHighlightedParents(parent, left);
  });
  const sequence = [node.eventType];
  let current = node;
  while (current.depth <= -1) {
    // eslint-disable-next-line prefer-destructuring
    current = current.children[0];
    sequence.push(current.eventType);
  }
  if (!(highlightedParents.length > 0)) {
    left.push(sequence.reverse());
  }
};

export const getDoubleTreeSelectionFromRoot = (rootNode: EventTreeNode): DoubleTreeSelection => {
  const right = [] as string[][];
  const left = [] as string[][];
  addHighlightedChildren(rootNode, right);
  addHighlightedParents(rootNode, left);
  return {
    left,
    right,
  };
};

export const applySelectionToSequence = (selection: DoubleTreeSelection, root: EventTreeNode)
: void => {
  selection.right.forEach((sequence) => {
    let current = root;
    let matches = true;
    let counter = 0;
    sequence.forEach((eventType) => {
      if (!(current.eventType === eventType)) {
        matches = false;
      }
      counter += 1;
      if (current.children[0] && counter < sequence.length) {
        [current] = current.children;
      }
    });
    if (matches) {
      current.highlightAncestors(true);
    }
  });

  selection.left.forEach((sequence) => {
    let current = root;
    let matches = true;
    let counter = 0;
    sequence.forEach((eventType) => {
      if (!(current.eventType === eventType)) {
        matches = false;
      }
      counter += 1;
      if (current.parents[0] && counter < sequence.length) {
        [current] = current.parents;
      }
    });
    if (matches) {
      current.highlightDescendants(true);
    }
  });
};

export const matchesLeftSelection = (
  sequence: string[],
  selection: DoubleTreeSelection,
  centralEventType: string,
): boolean => {
  const leftSequence = sequence.slice(0, sequence.indexOf(centralEventType) + 1).reverse();
  let matches = false;

  selection.left.forEach((subsequence) => {
    if (subsequence.filter((eventType, index) => eventType === leftSequence[index])
      .length === subsequence.length) {
      matches = true;
    }
  });
  return matches;
};

export const matchesRightSelection = (
  sequence: string[],
  selection: DoubleTreeSelection,
  centralEventType: string,
): boolean => {
  const rightSequence = sequence.slice(sequence.indexOf(centralEventType));
  let matches = false;

  selection.right.forEach((subsequence) => {
    if (subsequence.filter((eventType, index) => eventType === rightSequence[index])
      .length === subsequence.length) {
      matches = true;
    }
  });
  return matches;
};
