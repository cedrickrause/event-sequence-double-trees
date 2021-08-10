<template>
  <g :transform="`translate(${this.node.x},${this.node.y})`"
    >
    <circle
      :class="{ highlight: node.highlight }"
      @click="handleClick()"
    />
    <text dy="0.35em">
      {{ node.eventType.slice(0,1) }}
    </text>
    <path
      :d="arc(0.8 , 0, firstHalfTime)" />
    <path
      class="blue"
      :d="arc(0.4, firstHalfTime, firstHalfTime + secondHalfTime)" />
  </g>
</template>

<script lang="ts">
import { EventTreeNode } from '@/models/EventTreeNode';
import { StatsbombVariableNames } from '@/transformer/StatsbombEventTransformer';
import * as d3 from 'd3';
import Vue from 'vue';

export default Vue.extend({
  props: {
    node: {
      type: Object as () => EventTreeNode,
    },
  },

  data() {
    return {
      value: this.node,
    };
  },

  computed: {
    firstHalfTime(): number {
      return this.node.variables.filter(
        (variable) => variable.name === StatsbombVariableNames.HALF_TIME
          && variable.value === 1,
      ).length;
    },
    secondHalfTime(): number {
      return this.node.variables.filter(
        (variable) => variable.name === StatsbombVariableNames.HALF_TIME
          && variable.value === 2,
      ).length;
    },
  },

  methods: {
    handleClick(): void {
      if (this.node.depth > 0) {
        this.handleClickRightTree();
      } else if (this.node.depth < 0) {
        this.handleClickLeftTree();
      } else {
        this.handleClickRoot();
      }
    },

    handleClickRightTree(): void {
      const isTurnOn = this.node.atLeastOneChildIsHighlighted() || !this.node.highlight;
      this.node.highlightDescendants(false);
      this.node.highlightAncestors(isTurnOn);
    },

    handleClickLeftTree(): void {
      const isTurnOn = this.node.atLeastOneParentIsHighlighted() || !this.node.highlight;
      this.node.highlightAncestors(false);
      this.node.highlightDescendants(isTurnOn);
    },

    handleClickRoot(): void {
      const isTurnOn = this.node.atLeastOneChildIsHighlighted()
        || this.node.atLeastOneParentIsHighlighted()
        || !this.node.highlight;

      this.node.allNodes().forEach((node) => {
        node.highlightNode(false);
      });
      this.node.highlightNode(isTurnOn);
    },

    arc(value: number, startAngle: number, endAngle: number) {
      const arc = d3.arc();
      const total = this.firstHalfTime + this.secondHalfTime;
      const amount = endAngle - startAngle;
      const share = amount / total;
      const start = startAngle / total;
      return arc({
        innerRadius: 8,
        outerRadius: 8 + 4 * value,
        startAngle: start * 2 * Math.PI,
        endAngle: (start + share) * 2 * Math.PI,
      });
    },
  },
});
</script>

<style lang="scss" scoped>
@import '@/style/custom.scss';

circle {
  fill: white;
  stroke: #555;
  stroke-linejoin: round;
  r: 7.5;
}

text {
  text-anchor: middle;
}

circle.highlight {
  fill: $highlight;
  // stroke: $highlight;
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

path {
  fill: red;
}

path.blue {
  fill: blue;
}
</style>
