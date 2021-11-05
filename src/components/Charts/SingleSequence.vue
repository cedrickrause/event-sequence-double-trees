<template>
    <svg :viewBox="`0 0 ${this.width} ${this.height}`">
      <path
        :d="centralLine"
        stroke="lightgrey" />
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
import { mapGetters } from 'vuex';
import { Getters } from '@/store/getters';
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
      height: 16,
      width: 200,
      margin: {
        top: 10, right: 10, bottom: 10, left: 10,
      },
    };
  },

  computed: {
    ...mapGetters({
      getCentralEventType: Getters.GET_CENTRAL_EVENT_TYPE,
    }),

    xScale(): d3.ScaleLinear<number, number, never> {
      return d3.scaleLinear()
        .domain([this.layoutRootNode.leftMaximumWidth(), this.layoutRootNode.rightMaximumWidth()])
        .range([0 + this.margin.left, this.width - this.margin.right]);
    },

    sequenceWithoutStartAndEndEvents(): EventSequence {
      const sequenceWithoutEndEvent = {} as EventSequence;
      Object.assign(sequenceWithoutEndEvent, this.sequence);
      sequenceWithoutEndEvent.events = sequenceWithoutEndEvent.events
        .slice(1, sequenceWithoutEndEvent.events.length - 1);
      return sequenceWithoutEndEvent;
    },

    layoutRootNode(): EventTreeNode {
      return buildTreeModel(
        new EventSequenceDatasetImpl([this.sequenceWithoutStartAndEndEvents]),
        this.getCentralEventType,
      );
    },

    nodes(): EventTreeNode[] | undefined {
      return this.layoutRootNode?.allNodes().map((node) => {
        node.y = this.height / 2;
        node.x = this.xScale(node.depth);
        return node;
      });
    },

    links(): EventTreeLink[] | undefined {
      return this.layoutRootNode?.links();
    },

    centralLine() {
      const x = this.xScale(0);
      const points = [
        [x, 0],
        [x, this.height],
      ] as [number, number][];
      return d3.line()
        .curve(d3.curveBumpX)(points);
    },
  },

});
</script>
