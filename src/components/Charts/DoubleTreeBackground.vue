<template>
  <g v-if="rootNode">
    <rect v-for="(depth) in range"
      :key="'backgroundrect' + depth"
      :x="xScale(depth < 0 ? depth : depth - 1)"
      :y="-40"
      :width="rectWidth(depth < 0 ? depth : depth - 1)"
      :height="height + 80"
      :fill="color(depth)"
    />

  </g>
</template>
<script lang="ts">
import { EventTreeNode } from '@/models/EventTreeNode';
import * as d3 from 'd3';
import Vue from 'vue';
import _ from 'lodash';

export default Vue.extend({
  props: {
    rootNode: {
      type: Object as () => EventTreeNode,
    },
    width: Number,
    height: Number,
  },

  computed: {
    xScale(): d3.ScalePower<number, number, never> {
      return d3.scalePow()
        .exponent(0.75)
        .domain([this.rootNode.leftMaximumWidth(), this.rootNode.rightMaximumWidth()])
        .range([0, this.width]);
    },

    colorScale(): d3.ScaleSequential<string, never> {
      return d3.scaleSequential(d3.interpolateGreys);
    },

    range(): number[] {
      return _.range(this.rootNode.leftMaximumWidth() - 1, this.rootNode.rightMaximumWidth() + 2)
        .filter((value) => value !== 0);
    },
  },

  methods: {
    rectWidth(depth: number): number {
      return this.xScale(depth + 1) - this.xScale(depth);
    },

    color(depth: number) {
      return this.colorScale((Math.abs(depth) - 1)
      / (4 * Math.max(-this.rootNode.leftMaximumWidth(), this.rootNode.rightMaximumWidth())));
    },
  },

});
</script>
