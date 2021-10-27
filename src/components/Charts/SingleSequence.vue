<template>
    <svg :viewBox="`0 0 ${this.width} ${this.height}`">
      <g v-if="links">
          <tree-link v-for="(link, index) in links"
            :key="'link' + link.source.eventType + index"
            :link="link" />
        </g>
        <g v-if="nodes">
          <tree-node v-for="(node, index) in nodes"
            :key="'node' + node.eventType + index"
            :node="node"
            :maxArcWidth="4" />
        </g>
    </svg>
</template>

<script lang="ts">
/* eslint-disable no-param-reassign */
import { buildTreeModel } from '@/helpers/treeBuilding';
import { EventSequence, EventSequenceDatasetImpl } from '@/models/EventSequenceDataset';
import Vue from 'vue';
import * as d3 from 'd3';
import { EventTreeNode } from '@/models/EventTreeNode';
import { EventTreeLink } from '@/models/EventTreeLink';
import TreeLink from './TreeLink.vue';
import TreeNode from './TreeNode.vue';

export default Vue.extend({
  components: { TreeLink, TreeNode },
  props: {
    sequence: {
      type: Object as () => EventSequence,
    },
  },

  data() {
    return {
      height: 40,
      width: 200,
      margin: {
        top: 10, right: 10, bottom: 10, left: 10,
      },
      radius: 5,
    };
  },

  computed: {
    xScale(): d3.ScaleLinear<number, number, never> {
      return d3.scaleLinear()
        .domain([0, this.sequenceWithoutEndEvent.events.length - 1])
        .range([0 + this.margin.left, this.width - this.margin.right]);
    },

    sequenceWithoutEndEvent(): EventSequence {
      const sequenceWithoutEndEvent = {} as EventSequence;
      Object.assign(sequenceWithoutEndEvent, this.sequence);
      sequenceWithoutEndEvent.events = sequenceWithoutEndEvent.events
        .slice(0, sequenceWithoutEndEvent.events.length - 1);
      return sequenceWithoutEndEvent;
    },

    layoutRootNode(): EventTreeNode {
      return buildTreeModel(
        new EventSequenceDatasetImpl([this.sequenceWithoutEndEvent]),
        this.sequence.events[0].eventType,
      );
    },

    nodes(): EventTreeNode[] | undefined {
      return this.layoutRootNode?.allNodes().map((node) => {
        node.y = 20;
        node.x = this.xScale(node.depth);
        return node;
      });
    },

    links(): EventTreeLink[] | undefined {
      return this.layoutRootNode?.links();
    },
  },

});
</script>
