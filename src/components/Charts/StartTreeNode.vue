<template>
  <g :transform="`translate(${newX},${newY})`">
    <rect
      :x="-radius/2"
      :y="-1"
      :width="radius"
      :height="1"
      :opacity="node.children[0].highlight ? 1 : 0.25"
      />
  </g>
</template>

<script lang="ts">
import { EventTreeNode } from '@/models/EventTreeNode';
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapGetters } from 'vuex';

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
    ...mapGetters({
      getNodeScale: Getters.GET_NODE_SCALE,
    }),

    radius(): number {
      return this.node.count * 1.5;
    },

    newX(): number {
      const child = this.node.children[0];
      return child.x - this.maxArcWidth - this.getNodeScale(this.node.count) * 1.5;
    },

    newY(): number {
      const child = this.node.children[0];
      return child.y - this.maxArcWidth - this.getNodeScale(child.count) * 1.5;
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
