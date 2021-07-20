<template>
  <div>
    <svg :viewBox="`0 0 ${this.width} ${this.height}`">
      <g class="container"
        :transform="`translate(${this.margin.left},${this.margin.top})`"
        font-size="14"
        font-family="sans-serif"
        >
      </g>
    </svg>
    <div>
      {{ eventSequenceData.data.slice(0, 3) }}
    </div>
  </div>
</template>

<script lang="ts">
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import Vue from 'vue';

export default Vue.extend({
  props: {
    eventSequenceData: {
      type: Object as () => EventSequenceDataset,
    },
  },

  data() {
    return {
      width: 800,
      height: 600,
      margin: {
        top: 40, right: 40, bottom: 40, left: 40,
      },
      strokeWidth: 3,
      nodeStrokeColor: '#555',
      nodeRadius: 10.5,
      nodeColor: 'white',
      nodeHighlightColor: '#FEEC8F',
      lineWidth: 3.5,
      lineOpacity: 0.4,
      lineHighlightOpacity: 1,
      lineColor: '#aaa',
      lineHighlightColor: '#FEEC8F',
      nodeTooltipYOffset: 20,
      centerEventType: 'Pass',
    };
  },
});
</script>

<style lang="scss">
circle:hover {
  cursor: pointer;
}

text:hover {
  cursor: pointer;
}
</style>
