<template>
  <div>
    <svg :viewBox="`0 0 ${this.width} ${this.height}`">
      <g class="container"
        :transform="`translate(${this.margin.left},${this.margin.top})`"
        font-size="14"
        font-family="sans-serif"
        >
        <doube-tree-background
          :rootNode="doubletree"
          :width="width - margin.left - margin.right"
          :height="height - margin.top - margin.bottom"
          />
        <path
          :d="centralLine"
          stroke="lightgrey" />
        <g v-if="nonEndLinks && endLinks">
          <tree-link v-for="(link, index) in nonEndLinks"
            :key="'link' + link.source.eventType + index"
            :link="link" />
          <end-tree-link v-for="(link, index) in endLinks"
            :key="'endLink' + link.source.eventType + index"
            :link="link"
            :maxArcWidth="4" />
        </g>
        <g v-if="nonEndNodes && endNodes">
          <tree-node v-for="(node, index) in nonEndNodes"
            :key="'node' + node.eventType + index"
            :node="node"
            :maxArcWidth="4" />
          <end-tree-node v-for="(node, index) in endNodes"
            :key="'endNode' + node.eventType + index"
            :node="node"
            :maxArcWidth="4" />
        </g>
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { buildTreeLayout } from '@/helpers/treeBuilding';
import Vue from 'vue';
import { EventTreeNode } from '@/models/EventTreeNode';
import { EventTreeLink } from '@/models/EventTreeLink';
import * as d3 from 'd3';
import TreeNode from './TreeNode.vue';
import TreeLink from './TreeLink.vue';
import EndTreeNode from './EndTreeNode.vue';
import EndTreeLink from './EndTreeLink.vue';
import DoubeTreeBackground from './DoubeTreeBackground.vue';

export default Vue.extend({
  components: {
    TreeNode, TreeLink, EndTreeNode, EndTreeLink, DoubeTreeBackground,
  },
  props: {
    eventSequenceData: {
      type: Object as () => EventSequenceDataset,
    },
    centralEventType: {
      type: String,
    },
  },

  data() {
    return {
      width: 800,
      height: 400,
      margin: {
        top: 40, right: 40, bottom: 40, left: 40,
      },
    };
  },

  computed: {
    doubletree(): EventTreeNode | undefined {
      if (!this.eventSequenceData) {
        return undefined;
      }
      return buildTreeLayout(
        this.eventSequenceData,
        this.centralEventType,
        this.width - this.margin.left - this.margin.right,
        this.height - this.margin.top - this.margin.bottom,
      );
    },

    nodes(): EventTreeNode[] | undefined {
      return this.doubletree?.allNodes();
    },

    endNodes(): EventTreeNode[] | undefined {
      return this.nodes?.filter((node) => node.eventType === 'End');
    },

    nonEndNodes(): EventTreeNode[] | undefined {
      return this.nodes?.filter((node) => node.eventType !== 'End');
    },

    links(): EventTreeLink[] | undefined {
      return this.doubletree?.links();
    },

    endLinks(): EventTreeLink[] | undefined {
      return this.links?.filter((link) => link.target.eventType === 'End');
    },

    nonEndLinks(): EventTreeLink[] | undefined {
      return this.links?.filter((link) => link.target.eventType !== 'End');
    },

    centralLine() {
      const x = this.doubletree?.x ? this.doubletree.x : 0;
      const points = [
        [x, 0],
        [x, this.height - this.margin.top - this.margin.bottom],
      ] as [number, number][];
      return d3.line()
        .curve(d3.curveBumpX)(points);
    },
  },
});
</script>
