<template>
  <div>
    <svg :viewBox="`0 0 ${this.width} ${this.height}`">
      <g class="container"
        :transform="`translate(${this.margin.left},${this.margin.top})`"
        font-size="14"
        font-family="sans-serif"
        >
        <path v-for="(link, index) in links" :key="'link' + index"
          :class="{ highlight: isHighlight(link) }"
          :stroke="lineColor"
          fill="none"
          :stroke-opacity="1"
          :stroke-width="lineWidth"
          :d="linkPath(link)"
          />
        <tree-node v-for="(node, index) in nodes"
          :key="'node' + index"
          :node="node" />
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import treeBuildingMethod from '@/helpers/treeBuilding';
import * as d3 from 'd3';
import Vue from 'vue';
import { EventTreeNode } from '@/models/EventTreeNode';
import { EventTreeLink } from '@/models/EventTreeLink';
import TreeNode from './TreeNode.vue';

export default Vue.extend({
  components: { TreeNode },
  props: {
    eventSequenceData: {
      type: Object as () => EventSequenceDataset,
    },
  },

  data() {
    return {
      width: 800,
      height: 400,
      margin: {
        top: 40, right: 40, bottom: 40, left: 40,
      },
      lineWidth: 1.5,
      lineOpacity: 0.4,
      lineHighlightOpacity: 1,
      lineColor: '#aaa',
      nodeTooltipYOffset: 20,
      centerEventType: 'Dribble',
    };
  },

  computed: {
    prefixtree(): EventTreeNode[] {
      if (!this.eventSequenceData) {
        return [];
      }
      return treeBuildingMethod(
        this.eventSequenceData,
        this.centerEventType,
        this.width - this.margin.left - this.margin.right,
        this.height - this.margin.top - this.margin.bottom,
      );
    },

    nodes(): EventTreeNode[] {
      return this.prefixtree;
    },

    links(): EventTreeLink[] {
      return this.prefixtree[0]?.links();
    },
  },

  methods: {
    linkPath(link: EventTreeLink) {
      const points = [
        [link.source.x, link.source.y],
        [link.target.x, link.target.y]] as [number, number][];
      return d3.line()
        .curve(d3.curveBumpX)(points);
    },

    isHighlight(link: EventTreeLink): boolean {
      if (link.source.depth > 0) {
        return !!link.target.highlight;
      }
      if (link.source.depth < 0) {
        return !!link.source.highlight;
      }
      return false;
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
