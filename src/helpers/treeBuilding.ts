/* eslint-disable no-param-reassign */
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { EventTreeNode, EventTreeNodeImpl } from '@/models/EventTreeNode';
import * as d3 from 'd3';

const createEmptyRoot = (centralEventType: string): EventTreeNode => new EventTreeNodeImpl(
  centralEventType, 0, 0, false, [], [], [], [], [],
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

  if (node.children.length > 0) {
    contour = [contour, getChildrenLeftContour(
      node.children[0], modSum,
    )].flat();
  }
  return contour;
}

function getChildrenRightContour(node: EventTreeNode, modSum: number): number[] {
  let contour = [node.y + modSum];
  modSum += node.mod ?? 0;

  if (node.children.length > 0) {
    contour = [contour, getChildrenRightContour(
      node.children[node.children.length - 1], modSum,
    )].flat();
  }
  return contour;
}

function getParentsLeftContour(node: EventTreeNode, modSum: number): number[] {
  let contour = [node.y + modSum];
  modSum += node.mod ?? 0;

  if (node.parents.length > 0) {
    contour = [contour, getParentsLeftContour(
      node.parents[0], modSum,
    )].flat();
  }
  return contour;
}

function getParentsRightContour(node: EventTreeNode, modSum: number): number[] {
  let contour = [node.y + modSum];
  modSum += node.mod ?? 0;

  if (node.parents.length > 0) {
    contour = [contour, getParentsRightContour(
      node.parents[node.parents.length - 1], modSum,
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
  const xScale = d3.scaleSqrt()
    .domain([rootNode.leftMaximumWidth(), rootNode.leftMaximumWidth() / 4,
      rootNode.rightMaximumWidth() / 4, rootNode.rightMaximumWidth()])
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
  rootNode.descendants().forEach((node) => {
    const nodeIndexInParentChildren = node.parents[0]?.children.findIndex(
      (checkNode) => checkNode === node,
    );

    const y = nodeIndexInParentChildren;
    node.y = y;

    if (node.children.length > 0) {
      let desiredY = node.children[0].y;
      if (node.children.length > 1) {
        desiredY += (node.children[node.children.length - 1].y - node.children[0].y) / 2;
      }

      if (node.parents[0]?.children[0] === node) {
        node.y = desiredY;
      } else {
        node.mod = node.y - desiredY;
      }
    }

    node.parents[0]?.children.slice(0, nodeIndexInParentChildren).forEach(
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
  rootNode.ancestors().forEach((node) => {
    const nodeIndexInChildrenParents = node.children[0]?.parents.findIndex(
      (checkNode) => checkNode === node,
    );

    const y = nodeIndexInChildrenParents;
    node.y = y;

    if (node.parents.length > 0) {
      let desiredY = node.parents[0].y;
      if (node.parents.length > 1) {
        desiredY += (node.parents[node.parents.length - 1].y - node.parents[0].y) / 2;
      }

      if (node.children[0]?.parents[0] === node) {
        node.y = desiredY;
      } else {
        node.mod = node.y - desiredY;
      }
    }

    node.children[0]?.parents.slice(0, nodeIndexInChildrenParents).forEach(
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
