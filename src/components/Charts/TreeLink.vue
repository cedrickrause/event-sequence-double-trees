<template>
  <g v-if="getComparisonVariableValues.length > 0">
    <path v-for="comparisonVariableValue in getComparisonVariableValues"
    :key="comparisonVariableValue.name"
      :class="{ highlight: isHighlight() }"
      fill="none"
      :stroke="getColorScheme[comparisonVariableValue]"
      :stroke-width="linkWidth(comparisonVariableValue)"
      :d="linkPath()"
      />
  </g>
  <g v-else>
    <path
      :class="{ highlight: isHighlight() }"
      fill="none"
      stroke="#aaa"
      :stroke-width="count"
      :d="linkPath()"
      />
  </g>
</template>

<script lang="ts">
import * as d3 from 'd3';
import Vue from 'vue';
import { EventTreeLink } from '@/models/EventTreeLink';
import { mapGetters } from 'vuex';
import { Getters } from '@/store/getters';
import { Variable } from '@/models/Variable';
import { NumericalVariable } from '@/models/NumericalVariable';
import _ from 'lodash';
import { EventTreeNode } from '@/models/EventTreeNode';

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

  computed: {
    ...mapGetters({
      getComparisonVariable: Getters.GET_COMPARISON_VARIABLE,
      getComparisonVariableValues: Getters.GET_COMPARISON_VARIABLE_VALUES,
      getColorScheme: Getters.GET_COLOR_SCHEME,
      getNumericalComparisonVariableThreshold: Getters.GET_NUMERICAL_COMPARISON_VARIABLE_THRESHOLD,
    }),

    referenceNode(): EventTreeNode {
      if (this.link.target.depth > 0) {
        return this.link.target;
      }
      return this.link.source;
    },

    count(): number {
      return this.referenceNode.count;
    },

    comparisonValues(): {key: string, value: number}[] {
      const filteredVariables = this.referenceNode.variables.filter(
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
  },

  methods: {
    linkPath() {
      const points = [
        [this.link.source.x, this.link.source.y],
        [this.link.target.x, this.link.target.y]] as [number, number][];
      return d3.line()
        .curve(d3.curveBumpX)(points);
    },

    isHighlight(): boolean {
      return this.referenceNode.highlight;
    },

    linkWidth(comparisonVariableValue: string): number {
      const comparisonVariable = this.comparisonValues.find(
        (value) => value.key === comparisonVariableValue.toString(),
      );
      return comparisonVariable ? comparisonVariable.value : 0;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '@/style/custom.scss';

path {
  stroke-opacity: 0.25;
}

path.highlight {
  stroke-opacity: 1;
}
</style>
