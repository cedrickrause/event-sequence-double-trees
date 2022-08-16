<template>
  <g v-if="comparisonValues.length > 0">
    <path v-for="(comparisonVariableValue, index) in comparisonValues"
    :key="comparisonVariableValue.key"
      :class="{ highlight: isHighlight() }"
      stroke="none"
      :fill="getColorScheme[comparisonVariableValue.key]"
      :stroke-width="linkWidth(comparisonVariableValue.key)"
      :d="linkPath(comparisonVariableValue, comparisonValues.slice(0, index))"
      />
  </g>
  <g v-else>
    <path
      :class="{ highlight: isHighlight() }"
      stroke="none"
      fill="#aaa"
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
    maxArcWidth: Number,
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
      getNodeScale: Getters.GET_NODE_SCALE,
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
      const filteredVariables = this.referenceNode.parentVariables.filter(
        (variable: Variable) => variable.name === this.getComparisonVariable?.name,
      ).map((variable) => {
        if (variable instanceof NumericalVariable) {
          return {
            name: variable.name,
            value: variable.value > this.getNumericalComparisonVariableThreshold
              ? 'Over' : 'Under or equal',
          };
        }
        return variable;
      });
      const colorScheme = this.getColorScheme;
      return Object.keys(_.countBy(filteredVariables, 'value')).map(
        (key) => ({ key, value: _.countBy(filteredVariables, 'value')[key] }),
      ).sort((a, b) => (
        (Object.keys(colorScheme).indexOf(a.key) > Object.keys(colorScheme).indexOf(b.key))
          ? 1 : -1));
    },

    newX(): number {
      const parent = this.link.source;
      return parent.x + this.maxArcWidth + (this.getNodeScale(this.count) / 2);
    },

    newY(): number {
      const parent = this.link.source;
      return parent.y + this.maxArcWidth + this.getNodeScale(parent.count) * 1.25;
    },
  },

  methods: {
    linkPath(comparisonVariableValue: {key: string, value: number},
      valuesBefore: {key: string, value: number}[]) {
      const offset = this.getNodeScale(this.count) / 2;
      const height = (comparisonVariableValue.value / this.count) * this.getNodeScale(this.count);
      const valuesBeforeOffset = valuesBefore.map(
        (variable) => (variable.value / this.count) * this.getNodeScale(this.count),
      ).reduce((a, b) => a + b, 0);

      const points = [
        [this.link.source.x, this.link.source.y - offset + valuesBeforeOffset],
        [this.newX - offset + valuesBeforeOffset + height, this.newY],
        [this.newX - offset + valuesBeforeOffset, this.newY],
        [this.link.source.x, this.link.source.y - offset + valuesBeforeOffset + height]] as
        [number, number][];
      return d3.line()
        .curve(d3.curveBumpY)(points);
    },

    linkPathDefault() {
      const offset = this.getNodeScale(this.count) / 2;
      const height = this.getNodeScale(this.count);

      const points = [
        [this.link.source.x, this.link.source.y - offset],
        [this.newX - offset + height, this.newY],
        [this.newX - offset, this.newY],
        [this.link.source.x, this.link.source.y - offset + height]] as [number, number][];
      return d3.line()
        .curve(d3.curveBumpY)(points);
    },

    isHighlight(): boolean {
      return this.link.source.highlight;
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
  opacity: 0.25;
}

path.highlight {
  opacity: 1;
}
</style>
