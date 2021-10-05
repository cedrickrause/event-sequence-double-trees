<template>
  <g v-if="comparisonValues.length > 0">
    <path v-for="(comparisonVariableValue, index) in comparisonValues"
    :key="comparisonVariableValue.key"
      :class="{ highlight: isHighlight() }"
      fill="none"
      :stroke="getColorScheme[comparisonVariableValue.key]"
      :stroke-width="linkWidth(comparisonVariableValue.key)"
      :d="linkPath(comparisonVariableValue, comparisonValues.slice(0, index))"
      />
  </g>
  <g v-else>
    <path
      :class="{ highlight: isHighlight() }"
      fill="none"
      stroke="#aaa"
      :stroke-width="count"
      :d="linkPathDefault()"
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
    linkPath(comparisonVariableValue: {key: string, value: number},
      valuesBefore: {key: string, value: number}[]) {
      let yOffset = valuesBefore.map((variable) => variable.value).reduce((a, b) => a + b, 0);
      yOffset += comparisonVariableValue.value / 2;
      yOffset -= this.count / 2;
      console.log(yOffset);
      console.log(valuesBefore);

      // Stimmt für geraden, für Schräge Linien aber nicht!

      const points = [
        [this.link.source.x, this.link.source.y! + yOffset],
        [this.link.target.x, this.link.target.y! + yOffset]] as [number, number][];
      return d3.line()(points);
    },

    linkPathDefault() {
      const points = [
        [this.link.source.x, this.link.source.y],
        [this.link.target.x, this.link.target.y]] as [number, number][];
      return d3.line()(points);
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
