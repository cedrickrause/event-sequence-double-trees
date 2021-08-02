<template>
  <div>
    <svg :viewBox="`0 0 ${this.width} ${this.height}`">
      <g class="container"
        :transform="`translate(${this.margin.left},${this.margin.top})`"
        font-size="14"
        font-family="sans-serif"
        >
        <path
          :d="centralLine"
          stroke="black" />
        <g v-if="links">
          <tree-link v-for="(link, index) in links"
            :key="'link' + link.source.eventType + index"
            :link="link" />
        </g>
        <g v-if="nodes">
          <tree-node v-for="(node, index) in nodes"
            :key="'node' + node.eventType + index"
            :node="node" />
        </g>
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import treeBuildingMethod from '@/helpers/treeBuilding';
import Vue from 'vue';
import { EventTreeNode } from '@/models/EventTreeNode';
import { EventTreeLink } from '@/models/EventTreeLink';
import * as d3 from 'd3';
import TreeNode from './TreeNode.vue';
import TreeLink from './TreeLink.vue';

export default Vue.extend({
  components: { TreeNode, TreeLink },
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
      return treeBuildingMethod(
        this.eventSequenceData,
        this.centralEventType,
        this.width - this.margin.left - this.margin.right,
        this.height - this.margin.top - this.margin.bottom,
      );
    },

    nodes(): EventTreeNode[] | undefined {
      return this.doubletree?.allNodes();
    },

    links(): EventTreeLink[] | undefined {
      return this.doubletree?.links();
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

<style lang="scss" scoped>
@import '@/style/custom.scss';

circle.highlight {
  stroke: $highlight;
}

path.highlight {
  stroke: $highlight;
}

circle:hover {
  cursor: pointer;
}

text:hover {
  cursor: pointer;
}

text {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none;
}
</style>
