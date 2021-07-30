<template>
  <div>
    <svg :viewBox="`0 0 ${this.width} ${this.height}`">
      <g class="container"
        :transform="`translate(${this.margin.left},${this.margin.top})`"
        font-size="14"
        font-family="sans-serif"
        >
        <tree-link v-for="(link, index) in links"
          :key="'link' + index"
          :link="link" />
        <tree-node v-for="(node, index) in nodes"
          :key="'node' + index"
          :node="node" />
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import treeBuildingMethod from '@/helpers/treeBuilding';
import Vue from 'vue';
import { EventTreeNode } from '@/models/EventTreeNode';
import { EventTreeLink } from '@/models/EventTreeLink';
import TreeNode from './TreeNode.vue';
import TreeLink from './TreeLink.vue';

export default Vue.extend({
  components: { TreeNode, TreeLink },
  props: {
    eventSequenceData: {
      type: Object as () => EventSequenceDataset,
    },
  },

  data() {
    return {
      width: 800,
      height: 400,
      margin: {
        top: 40, right: 40, bottom: 40, left: 40,
      },
      centerEventType: 'Dribble',
    };
  },

  computed: {
    prefixtree(): EventTreeNode[] {
      if (!this.eventSequenceData) {
        return [];
      }
      return treeBuildingMethod(
        this.eventSequenceData,
        this.centerEventType,
        this.width - this.margin.left - this.margin.right,
        this.height - this.margin.top - this.margin.bottom,
      );
    },

    nodes(): EventTreeNode[] {
      return this.prefixtree;
    },

    links(): EventTreeLink[] {
      return this.prefixtree[0]?.links();
    },
  },
});
</script>

<style lang="scss" scoped>
@import '@/style/custom.scss';

circle.highlight {
  stroke: $highlight;
}

path.highlight {
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
