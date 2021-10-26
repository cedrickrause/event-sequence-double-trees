<template>
  <g>

  </g>
</template>
<script lang="ts">
import { EventTreeNode } from '@/models/EventTreeNode';
import * as d3 from 'd3';
import Vue from 'vue';

export default Vue.extend({
  props: {
    rootNode: {
      type: Object as () => EventTreeNode,
    },
    width: Number,
    height: Number,
  },

  computed: {
    xScale() {
      return d3.scaleSqrt()
        .domain([this.rootNode.leftMaximumWidth(), this.rootNode.leftMaximumWidth() / 4,
          this.rootNode.rightMaximumWidth() / 4, this.rootNode.rightMaximumWidth()])
        .range([0, this.width / 4, this.width * 0.75, this.width]);
    },
  },

});
</script>
