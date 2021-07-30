<template>
  <path
    :class="{ highlight: isHighlight(link) }"
    fill="none"
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
      if (link.source.depth > 0) {
        return !!link.target.highlight;
      }
      if (link.source.depth < 0) {
        return !!link.source.highlight;
      }
      return false;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '@/style/custom.scss';

path {
  stroke: #aaa;
  stroke-width: 1.5px;
  stroke-opacity: 1;
}

path.highlight {
  stroke: $highlight;
}
</style>
