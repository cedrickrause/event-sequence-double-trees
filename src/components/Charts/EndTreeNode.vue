<template>
  <g :transform="`translate(${newX},${newY})`">
    <rect
      :x="-radius/2"
      :y="-1"
      :width="radius"
      :height="1"
      :opacity="node.parents[0].highlight ? 1 : 0.25"
      />
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
    maxArcWidth: Number,
  },

  data() {
    return {
      value: this.node,
    };
  },

  computed: {
    radius(): number {
      return this.node.count * 1.5;
    },

    newX(): number {
      const parent = this.node.parents[0];
      return parent.x + this.maxArcWidth + this.node.count;
    },

    newY(): number {
      const parent = this.node.parents[0];
      return parent.y - this.maxArcWidth - parent.count * 2;
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
}

text {
  text-anchor: middle;
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
