<template>
  <g :transform="`translate(${this.node.x},${this.node.y})`"
    >
    <circle
      :class="{ highlight: node.highlight }"
      @click="handleClick()"
    />
    <text dy="0.35em">
      {{ node.eventType.slice(0,1) }}
    </text>
    <path v-for="(keyValuePair, index) in comparisonValues" :key="keyValuePair.key"
      :d="arc(1, keyValuePair.value, comparisonValues.slice(0, index))"
      :fill="getColorScheme[keyValuePair.key]"
      />
  </g>
</template>

<script lang="ts">
import { EventTreeNode } from '@/models/EventTreeNode';
import { Variable } from '@/models/Variable';
import { Getters } from '@/store/getters';
import * as d3 from 'd3';
import _ from 'lodash';
import Vue from 'vue';
import { mapGetters } from 'vuex';

export default Vue.extend({
  props: {
    node: {
      type: Object as () => EventTreeNode,
    },
  },

  data() {
    return {
      value: this.node,
    };
  },

  computed: {
    ...mapGetters({
      getComparisonVariable: Getters.GET_COMPARISON_VARIABLE,
      getComparisonVariableValues: Getters.GET_COMPARISON_VARIABLE_VALUES,
      getColorScheme: Getters.GET_COLOR_SCHEME,
    }),

    comparisonValues(): {key: string, value: number}[] {
      const filteredVariables = this.node.variables.filter(
        (variable: Variable) => variable.name === this.getComparisonVariable?.name,
      );
      return Object.keys(_.countBy(filteredVariables, 'value')).map(
        (key) => ({ key, value: _.countBy(filteredVariables, 'value')[key] }),
      );
    },

    comparisonValueTotal(): number {
      return _.reduce(this.comparisonValues, (sum, n) => sum + n.value, 0);
    },
  },

  methods: {
    handleClick(): void {
      if (this.node.depth > 0) {
        this.handleClickRightTree();
      } else if (this.node.depth < 0) {
        this.handleClickLeftTree();
      } else {
        this.handleClickRoot();
      }
    },

    handleClickRightTree(): void {
      const isTurnOn = this.node.atLeastOneChildIsHighlighted() || !this.node.highlight;
      this.node.highlightDescendants(false);
      this.node.highlightAncestors(isTurnOn);
    },

    handleClickLeftTree(): void {
      const isTurnOn = this.node.atLeastOneParentIsHighlighted() || !this.node.highlight;
      this.node.highlightAncestors(false);
      this.node.highlightDescendants(isTurnOn);
    },

    handleClickRoot(): void {
      const isTurnOn = this.node.atLeastOneChildIsHighlighted()
        || this.node.atLeastOneParentIsHighlighted()
        || !this.node.highlight;

      this.node.allNodes().forEach((node) => {
        node.highlightNode(false);
      });
      this.node.highlightNode(isTurnOn);
    },

    arc(value: number, count: number, valuesBefore: {key: string, value: number}[]) {
      const arc = d3.arc();
      const total = this.comparisonValueTotal;
      const share = count / total;
      const sumBefore = valuesBefore.reduce((sum, n) => sum + n.value, 0);
      const start = sumBefore / total;
      return arc({
        innerRadius: 8,
        outerRadius: 8 + 4 * value,
        startAngle: start * 2 * Math.PI,
        endAngle: (start + share) * 2 * Math.PI,
      });
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
  r: 7.5;
}

text {
  text-anchor: middle;
}

circle.highlight {
  fill: $highlight;
  // stroke: $highlight;
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
