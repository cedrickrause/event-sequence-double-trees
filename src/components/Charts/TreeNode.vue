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
  </g>
</template>

<script lang="ts">
import { EventTreeNode } from '@/models/EventTreeNode';
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
