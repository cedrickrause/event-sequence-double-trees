<template>
  <g :transform="`translate(${centerX}, ${-10})`">
    <text
    font-size="6px"
    fill="darkgrey"
    text-anchor="end"
    :x="-(arrowLength / 2 + arrowTextPadding)">
      Before
    </text>
    <path
    :d="arrowline"
    stroke="lightgrey" />
    <path
    :d="arrowhead"
    fill="lightgrey" />
    <text
    font-size="6px"
    fill="darkgrey"
    text-anchor="start"
    :x="arrowLength / 2 + arrowTextPadding">
      After
    </text>
  </g>
</template>
<script lang="ts">
import Vue from 'vue';
import * as d3 from 'd3';

export default Vue.extend({
  props: [
    'centerX',
  ],

  data() {
    return {
      arrowLength: 18,
      arrowHeadWidth: 3,
      arrowHeadHeight: 2,
      arrowTextPadding: 6,
    };
  },

  computed: {
    arrowline() {
      const y = -this.arrowHeadHeight;
      const points = [
        [-this.arrowLength / 2, y],
        [this.arrowLength / 2 - this.arrowHeadWidth, y],
      ] as [number, number][];
      return d3.line()(points);
    },

    arrowhead() {
      const points = [
        [this.arrowLength / 2 - this.arrowHeadWidth, -2 * this.arrowHeadHeight],
        [this.arrowLength / 2, -this.arrowHeadHeight],
        [this.arrowLength / 2 - this.arrowHeadWidth, 0],
      ] as [number, number][];
      return d3.line()(points);
    },
  },
});
</script>
