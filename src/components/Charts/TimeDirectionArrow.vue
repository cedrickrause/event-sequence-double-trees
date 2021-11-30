<template>
  <g :transform="`translate(${this.centerX}, ${-10})`">
    <text
    font-size="6px"
    fill="darkgrey"
    :x="-27">
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
    :x="13">
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

  computed: {
    arrowline() {
      const y = -2;
      const points = [
        [-7, y],
        [8, y],
      ] as [number, number][];
      return d3.line()(points);
    },

    arrowhead() {
      const points = [
        [8, -4],
        [11, -2],
        [8, 0],
      ] as [number, number][];
      return d3.line()(points);
    },
  },
});
</script>
