/* eslint-disable no-param-reassign */
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { EventTreeNode, EventTreeNodeImpl } from '@/models/EventTreeNode';
import * as d3 from 'd3';

const createEmptyRoot = (centralEventType: string): EventTreeNode => new EventTreeNodeImpl(
  centralEventType, 0, 0, [], [],
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
      root.value += 1;
      root.addEventSequenceToParents(sequence.events.slice(0, indexOfFirstOccurrence));
      root.addEventSequenceToChildren(sequence.events.slice(indexOfFirstOccurrence + 1));
    }
  });

  return root;
};

export default (
  eventSequenceDataset: EventSequenceDataset,
  centralEventType: string,
  width: number,
  height: number,
): EventTreeNode[] => {
  const rootNode = buildTreeModel(eventSequenceDataset, centralEventType);

  const xScale = d3.scaleLinear()
    .domain([rootNode.leftMaximumWidth(), rootNode.rightMaximumWidth()])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, rootNode.maximumHeight()])
    .range([0, height]);

  const allLayoutNodes = rootNode.allNodes().map((node) => {
    const x = xScale(node.depth);
    const positionInLayer = rootNode.allNodesInLayer(node.depth)
      .findIndex((layerNode) => layerNode === node);
    const y = yScale(positionInLayer);

    node.x = x;
    node.y = y;
    return node;
  });

  return allLayoutNodes;
};
