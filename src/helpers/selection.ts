import { EventTreeNode } from '@/models/EventTreeNode';
import { DoubleTreeSelection } from '../models/DoubleTreeSelection';

const getHighlightedChildren = (node: EventTreeNode): string[][] => {
  const highlightedChildren = node.children.filter((child) => child.highlight);
  if (highlightedChildren.length === 0) {
    const sequence = [node.eventType];
    let current = node;
    while (current.depth >= 1) {
      [current] = current.parents;
      sequence.push(current.eventType);
    }
    return [sequence.reverse()];
  }

  return highlightedChildren.map((child) => getHighlightedChildren(child)).flat();
};

const getHighlightedParents = (node: EventTreeNode): string[][] => {
  const highlightedParents = node.parents.filter((parent) => parent.highlight);
  if (highlightedParents.length === 0) {
    const sequence = [node.eventType];
    let current = node;
    while (current.depth <= -1) {
      [current] = current.children;
      sequence.push(current.eventType);
    }
    return [sequence.reverse()];
  }

  return highlightedParents.map((parent) => getHighlightedParents(parent)).flat();
};

export const getDoubleTreeSelectionFromRoot = (rootNode: EventTreeNode): DoubleTreeSelection => ({
  left: getHighlightedParents(rootNode),
  right: getHighlightedChildren(rootNode),
});

export const applySelectionToSequence = (selection: DoubleTreeSelection, root: EventTreeNode)
: void => {
  selection.right.forEach((rightSelection) => {
    let current = root;
    let matches = true;
    let counter = 0;
    rightSelection.forEach((eventType) => {
      if (!(current.eventType === eventType)) {
        matches = false;
      }
      counter += 1;
      if (current.children[0] && counter < rightSelection.length) {
        [current] = current.children;
      }
    });
    if (matches) {
      current.highlightAncestors(true);
    }
  });

  selection.left.forEach((leftSelection) => {
    let current = root;
    let matches = true;
    let counter = 0;
    leftSelection.forEach((eventType) => {
      if (!(current.eventType === eventType)) {
        matches = false;
      }
      counter += 1;
      if (current.parents[0] && counter < leftSelection.length) {
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
