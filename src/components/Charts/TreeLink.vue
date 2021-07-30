<template>
  <path
    :class="{ highlight: isHighlight(link) }"
    fill="none"
    :stroke-width="linkWidth(link)"
    :d="linkPath(link)"
    />
</template>

<script lang="ts">
import * as d3 from 'd3';
import Vue from 'vue';
import { EventTreeLink } from '@/models/EventTreeLink';

export default Vue.extend({
  props: {
    link: {
      type: Object as () => EventTreeLink,
    },
  },

  data() {
    return {
      value: this.link,
    };
  },

  methods: {
    linkPath(link: EventTreeLink) {
      const points = [
        [link.source.x, link.source.y],
        [link.target.x, link.target.y]] as [number, number][];
      return d3.line()
        .curve(d3.curveBumpX)(points);
    },

    isHighlight(link: EventTreeLink): boolean {
      if (link.target.depth > 0) {
        return !!link.target.highlight;
      }
      if (link.source.depth < 0) {
        return !!link.source.highlight;
      }
      return false;
    },

    linkWidth(link: EventTreeLink): number {
      if (link.target.depth > 0) {
        return link.target.value;
      }
      if (link.source.depth < 0) {
        return link.source.value;
      }
      return 0;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '@/style/custom.scss';

path {
  stroke: #aaa;
  stroke-opacity: 0.5;
}

path.highlight {
  stroke: $highlight;
  stroke-opacity: 1;
}
</style>
