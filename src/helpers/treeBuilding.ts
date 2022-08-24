/* eslint-disable no-param-reassign */
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { EventTreeNode, EventTreeNodeImpl } from '@/models/EventTreeNode';
import * as d3 from 'd3';

const createEmptyRoot = (centralEventType: string): EventTreeNode => new EventTreeNodeImpl(
  centralEventType, 0, 0, true, [], [], [], [], [], [],
);

export const buildTreeModel = (
  eventSequenceDataset: EventSequenceDataset,
  centralEventType: string,
): EventTreeNode => {
  const root = createEmptyRoot(centralEventType);

  eventSequenceDataset.data.forEach((sequence) => {
    const indexOfFirstOccurrence = sequence.events.findIndex(
      (event) => event.eventType === centralEventType,
    );
    if (indexOfFirstOccurrence >= 0) {
      root.count += 1;
      root.events.push(sequence.events[indexOfFirstOccurrence]);
      root.variables.push(...sequence.events[indexOfFirstOccurrence].variables);
      root.addEventSequenceToParents(sequence.events.slice(0, indexOfFirstOccurrence));
      root.addEventSequenceToChildren(sequence.events.slice(indexOfFirstOccurrence + 1));
    }
  });

  return root;
};

function calculateFinalYRight(node: EventTreeNode, modSum: number) {
  node.y += modSum;
  if (node.mod) {
    modSum += node.mod;
  }

  node.children.forEach((child) => {
    calculateFinalYRight(child, modSum);
  });
}

function calculateFinalYLeft(node: EventTreeNode, modSum: number) {
  node.y += modSum;
  if (node.mod) {
    modSum += node.mod;
  }

  node.parents.forEach((parent) => {
    calculateFinalYLeft(parent, modSum);
  });
}

function getChildrenLeftContour(node: EventTreeNode, modSum: number): number[] {
  let contour = [node.y + modSum];
  modSum += node.mod ?? 0;
  const nonEndChildren = node.children.filter((child) => child.eventType !== 'End');

  if (nonEndChildren.length > 0) {
    contour = [contour, getChildrenLeftContour(
      nonEndChildren[0], modSum,
    )].flat();
  }
  return contour;
}

function getChildrenRightContour(node: EventTreeNode, modSum: number): number[] {
  let contour = [node.y + modSum];
  modSum += node.mod ?? 0;
  const nonEndChildren = node.children.filter((child) => child.eventType !== 'End');

  if (nonEndChildren.length > 0) {
    contour = [contour, getChildrenRightContour(
      nonEndChildren[nonEndChildren.length - 1], modSum,
    )].flat();
  }
  return contour;
}

function getParentsLeftContour(node: EventTreeNode, modSum: number): number[] {
  let contour = [node.y + modSum];
  modSum += node.mod ?? 0;
  const nonStartParents = node.parents.filter((parent) => parent.eventType !== 'Start');

  if (nonStartParents.length > 0) {
    contour = [contour, getParentsLeftContour(
      nonStartParents[0], modSum,
    )].flat();
  }
  return contour;
}

function getParentsRightContour(node: EventTreeNode, modSum: number): number[] {
  let contour = [node.y + modSum];
  modSum += node.mod ?? 0;
  const nonStartParents = node.parents.filter((parent) => parent.eventType !== 'Start');

  if (nonStartParents.length > 0) {
    contour = [contour, getParentsRightContour(
      nonStartParents[nonStartParents.length - 1], modSum,
    )].flat();
  }
  return contour;
}

function maximumContourOverlap(rightContour: number[], leftContour: number[]): number {
  const overlap = -Math.min(...leftContour.slice(0, rightContour.length).map(
    (leftContourAtIndex, index) => {
      if (rightContour[index] !== undefined) {
        return leftContourAtIndex - rightContour[index];
      }
      return 0;
    },
  ));

  if (overlap >= 0) {
    return overlap + 1;
  }

  return 0;
}

function yExtentRight(rootNode: EventTreeNode): number[] {
  const leftMax = Math.min(...rootNode.descendants().map((node) => node.y));
  const rightMax = Math.max(...rootNode.descendants().map((node) => node.y));
  return [leftMax, rightMax];
}

function yExtentLeft(rootNode: EventTreeNode): number[] {
  const leftMax = Math.min(...rootNode.ancestors().map((node) => node.y));
  const rightMax = Math.max(...rootNode.ancestors().map((node) => node.y));
  return [leftMax, rightMax];
}

function scalePositions(
  width: number, height: number, rootNode: EventTreeNode, direction: string,
): void {
  const xScale = d3.scalePow()
    .exponent(0.75)
    .domain([rootNode.leftMaximumWidth() + 1, rootNode.leftMaximumWidth() / 2,
      rootNode.rightMaximumWidth() / 2, rootNode.rightMaximumWidth() - 1])
    .range([0, width / 4, width * 0.75, width]);

  const yExtent = direction === 'right' ? yExtentRight(rootNode) : yExtentLeft(rootNode);
  const yScale = d3.scaleLinear()
    .domain(yExtent)
    .range([0, height]);

  if (direction === 'right') {
    rootNode.descendants().forEach((node) => {
      node.x = xScale(node.depth);
      node.y = yScale(node.y);
    });
  } else {
    rootNode.ancestors().forEach((node) => {
      node.x = xScale(node.depth);
      node.y = yScale(node.y);
    });
  }
}

function rightTreeLayout(width: number, height: number, rootNode: EventTreeNode) {
  rootNode.descendants().filter((node) => node.eventType !== 'End').forEach((node) => {
    const nodeIndexInParentChildren = node.parents[0]?.children.filter((child) => child.eventType !== 'End').findIndex(
      (checkNode) => checkNode === node,
    );

    const y = nodeIndexInParentChildren;
    node.y = y;

    const nonEndChildren = node.children.filter((child) => child.eventType !== 'End');

    if (nonEndChildren.length > 0) {
      let desiredY = nonEndChildren[0].y;
      if (nonEndChildren.length > 1) {
        desiredY += (nonEndChildren[nonEndChildren.length - 1].y - nonEndChildren[0].y) / 2;
      }

      if (node.parents[0]?.children[0] === node) {
        node.y = desiredY;
      } else {
        node.mod = node.y - desiredY;
      }
    }

    const nonEndSiblings = node.parents[0]?.children.filter((sibling) => sibling.eventType !== 'End');
    nonEndSiblings.slice(0, nodeIndexInParentChildren).forEach(
      (sibling) => {
        const overlap = maximumContourOverlap(
          getChildrenRightContour(sibling, 0), getChildrenLeftContour(node, 0),
        );

        node.y += overlap;
        if (node.mod) {
          node.mod += overlap;
        } else {
          node.mod = overlap;
        }
      },
    );
  });

  calculateFinalYRight(rootNode, 0);

  scalePositions(width, height, rootNode, 'right');
}

function leftTreeLayout(width: number, height: number, rootNode: EventTreeNode) {
  rootNode.ancestors().filter((node) => node.eventType !== 'Start').forEach((node) => {
    const nodeIndexInChildrenParents = node.children[0]?.parents.filter((parent) => parent.eventType !== 'Start').findIndex(
      (checkNode) => checkNode === node,
    );

    const y = nodeIndexInChildrenParents;
    node.y = y;

    const nonStartParents = node.parents.filter((parent) => parent.eventType !== 'Start');

    if (nonStartParents.length > 0) {
      let desiredY = nonStartParents[0].y;
      if (nonStartParents.length > 1) {
        desiredY += (nonStartParents[nonStartParents.length - 1].y - nonStartParents[0].y) / 2;
      }

      if (node.children[0]?.parents[0] === node) {
        node.y = desiredY;
      } else {
        node.mod = node.y - desiredY;
      }
    }

    const nonStartSiblings = node.children[0]?.parents.filter((sibling) => sibling.eventType !== 'Start');
    nonStartSiblings.slice(0, nodeIndexInChildrenParents).forEach(
      (sibling) => {
        const overlap = maximumContourOverlap(
          getParentsRightContour(sibling, 0), getParentsLeftContour(node, 0),
        );

        node.y += overlap;
        if (node.mod) {
          node.mod += overlap;
        } else {
          node.mod = overlap;
        }
      },
    );
  });

  calculateFinalYLeft(rootNode, 0);

  scalePositions(width, height, rootNode, 'left');
}

export const buildTreeLayout = (
  eventSequenceDataset: EventSequenceDataset,
  centralEventType: string,
  width: number,
  height: number,
): EventTreeNode => {
  const rootNode = buildTreeModel(eventSequenceDataset, centralEventType);

  leftTreeLayout(width, height, rootNode);
  rightTreeLayout(width, height, rootNode);

  return rootNode;
};
