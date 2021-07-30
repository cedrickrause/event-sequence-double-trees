<template>
  <div>
    <svg :viewBox="`0 0 ${this.width} ${this.height}`">
      <g class="container"
        :transform="`translate(${this.margin.left},${this.margin.top})`"
        font-size="14"
        font-family="sans-serif"
        >
        <!-- <path v-for="(link, index) in links" :key="'link' + index"
          :class="{ highlight: link.target.data.highlight }"
          :stroke="lineColor"
          fill="none"
          :stroke-opacity="1"
          :stroke-width="lineWidth"
          :d="linkPath(link)"
          /> -->
        <g v-for="(node, index) in nodes"
          :key="'node' + index + render"
          :transform="`translate(${node.x},${node.y})`"
          >
          <circle
            :class="{ highlight: node.highlight }"
            :fill="nodeColor"
            :stroke="nodeStrokeColor"
            :r="nodeRadius"
            stroke-linejoin="round"
            @click="handleClick(node)"
          />
          <text
            text-anchor="middle"
            dy="0.35em"
            >
            <!-- {{ node.data.type.slice(0,1) }} -->
          </text>
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

export default Vue.extend({
  props: {
    eventSequenceData: {
      type: Object as () => EventSequenceDataset,
    },
  },

  data() {
    return {
      render: false,
      width: 800,
      height: 400,
      margin: {
        top: 40, right: 40, bottom: 40, left: 40,
      },
      nodeStrokeColor: '#555',
      nodeRadius: 7.5,
      nodeColor: 'white',
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

    // links(): EventTreeLayoutNode[] {
    //   return this.prefixtree.links();
    // },
  },

  methods: {
    handleClick(node: EventTreeNode) {
      let isTurnOn = false;
      if (node.depth >= 0) {
        isTurnOn = node.atLeastOneChildIsHighlighted() || !node.highlight;
        node.highlightDescendants(false);
        node.highlightAncestors(isTurnOn);
      } else {
        isTurnOn = node.atLeastOneParentIsHighlighted() || !node.highlight;
        node.highlightAncestors(false);
        node.highlightDescendants(isTurnOn);
      }
      this.render = !this.render;
    },
  },
});
</script>

<style lang="scss">
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
