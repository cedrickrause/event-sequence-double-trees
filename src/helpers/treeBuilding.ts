/* eslint-disable no-param-reassign */
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { EventTreeNode, EventTreeNodeImpl } from '@/models/EventTreeNode';
import * as d3 from 'd3';

const createEmptyRoot = (centralEventType: string): EventTreeNode => new EventTreeNodeImpl(
  centralEventType, 0, 0, false, [], [], [],
);

const buildTreeModel = (
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

function calculateFinalY(node: EventTreeNode, modSum: number) {
  node.y += modSum;
  if (node.mod) {
    modSum += node.mod;
  }

  node.children.forEach((child) => {
    calculateFinalY(child, modSum);
  });
}

function getLeftContour(node: EventTreeNode): number[] {
  let contour = [node.y];
  if (node.children.length > 0) {
    contour = [node.y, getLeftContour(node.children[0])].flat();
  }
  return contour;
}

function getRightContour(node: EventTreeNode): number[] {
  let contour = [node.y];
  if (node.children.length > 0) {
    contour = [node.y, getRightContour(node.children[node.children.length - 1])].flat();
  }
  return contour;
}

function maximumContourOverlap(rightContour: number[], leftContour: number[]): number {
  const overlap = -Math.min(...leftContour.map((layerLeftMin, index) => {
    if (rightContour[index] !== undefined) {
      return layerLeftMin - rightContour[index];
    }
    return 0;
  }));

  if (overlap > 0) {
    return overlap + 1;
  }

  return 0;
}

export default (
  eventSequenceDataset: EventSequenceDataset,
  centralEventType: string,
  width: number,
  height: number,
): EventTreeNode => {
  const rootNode = buildTreeModel(eventSequenceDataset, centralEventType);

  const xScale = d3.scaleSqrt()
    .domain([rootNode.leftMaximumWidth(), rootNode.leftMaximumWidth() / 4,
      rootNode.rightMaximumWidth() / 4, rootNode.rightMaximumWidth()])
    .range([0, width / 4, width * 0.75, width]);

  const maxHeight = rootNode.maximumHeight();
  const yScale = d3.scaleLinear()
    .domain([0, maxHeight])
    .range([0, height]);

  rootNode.descendants().reverse().forEach((node) => {
    const nodeIndexInParentChildren = node.parents[0].children.findIndex(
      (checkNode) => checkNode === node,
    );

    const y = nodeIndexInParentChildren;

    node.y = y;

    if (node.children.length > 0) {
      let desiredY = node.children[0].y;
      if (node.children.length > 1) {
        desiredY += (node.children[node.children.length - 1].y - node.children[0].y) / 2;
      }

      if (node.parents[0].children[0] === node) {
        node.y = desiredY;
      } else {
        node.mod = node.y - desiredY;
      }
    }

    node.parents[0].children.slice(nodeIndexInParentChildren).forEach(
      (sibling) => {
        const overlap = maximumContourOverlap(getRightContour(sibling), getLeftContour(node));
        console.log(overlap);
        node.y += overlap;
        if (node.mod) {
          node.mod += overlap;
        } else {
          node.mod = overlap;
        }
      },
    );
  });

  calculateFinalY(rootNode, 0);

  rootNode.descendants().forEach((node) => {
    node.x = xScale(node.depth);
    node.y = yScale(node.y);
  });
  return rootNode;
};
