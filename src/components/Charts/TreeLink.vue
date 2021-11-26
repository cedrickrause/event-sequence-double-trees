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

    referenceSiblings(): EventTreeNode[] {
      if (this.link.target.depth > 0) {
        return this.link.source.children.filter((sibling) => sibling.eventType !== 'End');
      }
      return this.link.target.parents.filter((sibling) => sibling.eventType !== 'Start');
    },

    otherNode(): EventTreeNode {
      if (this.link.target.depth > 0) {
        return this.link.source;
      }
      return this.link.target;
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
  },

  methods: {
    linkPath(comparisonVariableValue: {key: string, value: number},
      valuesBefore: {key: string, value: number}[]) {
      const nodeOffset = this.count / 2;
      const otherOffset = this.referenceSiblings
        .reduce((a, b) => a + b.count, 0) / 2;
      const width = comparisonVariableValue.value;
      const valuesBeforeOffset = valuesBefore.map(
        (variable) => variable.value,
      ).reduce((a, b) => a + b, 0);
      const childIndexInParent = this.referenceSiblings
        .findIndex((sibling) => sibling === this.referenceNode);
      const linksBefore = this.referenceSiblings.slice(0, childIndexInParent)
        .reduce((a, b) => a + b.count, 0);

      let points = [];
      if (this.referenceNode.depth > 0) {
        points = [
          [this.link.source.x, this.link.source.y - otherOffset + linksBefore + valuesBeforeOffset],
          [this.link.target.x, this.link.target.y - nodeOffset + valuesBeforeOffset],
          [this.link.target.x, this.link.target.y - nodeOffset + valuesBeforeOffset + width],
          [this.link.source.x, this.link.source.y - otherOffset + linksBefore
          + valuesBeforeOffset + width]] as
        [number, number][];
      } else {
        points = [
          [this.link.source.x, this.link.source.y - nodeOffset + valuesBeforeOffset],
          [this.link.target.x, this.link.target.y - otherOffset + linksBefore + valuesBeforeOffset],
          [this.link.target.x, this.link.target.y - otherOffset + linksBefore
          + valuesBeforeOffset + width],
          [this.link.source.x, this.link.source.y - nodeOffset + valuesBeforeOffset + width]] as
        [number, number][];
      }

      return d3.line()
        .curve(d3.curveBumpX)(points);
    },

    linkPathDefault() {
      const nodeOffset = this.count / 2;
      const otherOffset = this.referenceSiblings
        .reduce((a, b) => a + b.count, 0) / 2;
      const width = this.count;
      const childIndexInParent = this.referenceSiblings
        .findIndex((sibling) => sibling === this.referenceNode);
      const linksBefore = this.referenceSiblings.slice(0, childIndexInParent)
        .reduce((a, b) => a + b.count, 0);

      let points = [];
      if (this.referenceNode.depth > 0) {
        points = [
          [this.link.source.x, this.link.source.y - otherOffset + linksBefore],
          [this.link.target.x, this.link.target.y - nodeOffset],
          [this.link.target.x, this.link.target.y - nodeOffset + width],
          [this.link.source.x, this.link.source.y - otherOffset + linksBefore + width]] as
          [number, number][];
      } else {
        points = [
          [this.link.source.x, this.link.source.y - nodeOffset],
          [this.link.target.x, this.link.target.y - otherOffset + linksBefore],
          [this.link.target.x, this.link.target.y - otherOffset + linksBefore + width],
          [this.link.source.x, this.link.source.y - nodeOffset + width]] as
          [number, number][];
      }

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
  opacity: 0.25;
}

path.highlight {
  opacity: 1;
}
</style>
