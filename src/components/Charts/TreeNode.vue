<template>
  <g :transform="`translate(${this.node.x},${this.node.y})`"
      @click="handleClick()"
    >
    <circle
      :class="{ highlight: node.highlight }"
      :r="radius"
      :stroke-opacity="node.highlight ? 1 : 0.25"
    />
    <text dy="0.35em"
    :font-size="1.5 * this.node.count"
    :opacity="node.highlight ? 1 : 0.25">
      {{ node.eventType.slice(0,1) }}
    </text>
    <path v-for="(keyValuePair, index) in comparisonValues" :key="keyValuePair.key"
      :d="arc(1, keyValuePair.value, comparisonValues.slice(0, index))"
      :fill="getColorScheme[keyValuePair.key]"
      :opacity="node.highlight ? 1 : 0.25"
      />
  </g>
</template>

<script lang="ts">
import { EventTreeNode } from '@/models/EventTreeNode';
import { NumericalVariable } from '@/models/NumericalVariable';
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
      maxArcWidth: 4,
    };
  },

  computed: {
    ...mapGetters({
      getComparisonVariable: Getters.GET_COMPARISON_VARIABLE,
      getComparisonVariableValues: Getters.GET_COMPARISON_VARIABLE_VALUES,
      getColorScheme: Getters.GET_COLOR_SCHEME,
      getNumericalComparisonVariableThreshold: Getters.GET_NUMERICAL_COMPARISON_VARIABLE_THRESHOLD,
    }),

    comparisonValues(): {key: string, value: number}[] {
      const filteredVariables = this.node.variables.filter(
        (variable: Variable) => variable.name === this.getComparisonVariable?.name,
      ).map((variable) => {
        if (variable instanceof NumericalVariable) {
          return {
            name: variable.name,
            value: variable.value > this.getNumericalComparisonVariableThreshold
              ? 'Over' : 'Under',
          };
        }
        return variable;
      });
      return Object.keys(_.countBy(filteredVariables, 'value')).map(
        (key) => ({ key, value: _.countBy(filteredVariables, 'value')[key] }),
      );
    },

    comparisonValueTotal(): number {
      return _.reduce(this.comparisonValues, (sum, n) => sum + n.value, 0);
    },

    radius(): number {
      return this.node.count > 1 ? 1.5 * this.node.count : 0;
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
        innerRadius: this.radius,
        outerRadius: this.radius + 4 * value,
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
}

text {
  text-anchor: middle;
}

circle:hover {
  cursor: pointer;
}

text:hover {
  cursor: pointer;
}

path:hover {
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
