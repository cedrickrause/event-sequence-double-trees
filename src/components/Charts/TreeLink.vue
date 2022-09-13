<template>
  <g v-if="comparisonValues.length === 0"
    :transform="`translate(${link.source.x}, ${link.source.y})
    rotate(${angle})`">
    <rect
      :x="length"
      :width="distance - length"
      height="1"
      y="-0.5"
      :class="{ highlight: isHighlight }"
      :fill="isHoveredSequence ? 'black' : '#aaa'"
      :opacity="isHighlight ? 1 : 0.25"
    />
    <rect
      :class="{ highlight: isHighlight }"
      :y="-width/2"
      :width="length"
      :height="width"
      :stroke="isHoveredSequence ? 'black' : 'none'"
      fill="#aaa"
      :opacity="isHighlight ? 1 : 0.25"
    />
  </g>
  <g v-else
    :transform="`translate(${link.source.x}, ${link.source.y})
    rotate(${angle})`">
    <rect v-for="(comparisonValue, index) in comparisonValues"
      :key="comparisonValue.key + 'connector'"
      :x="lengthForComparisonValue(comparisonValue.key)"
      :width="distance - lengthForComparisonValue(comparisonValue.key)"
      height="1"
      :y="- 0.5 -width/2
        + (width / count * comparisonValue.value) /2
        + width / count
        * comparisonValues.slice(0, index).map((val) => val.value).reduce((a,b) => a+b, 0)"
      :class="{ highlight: isHighlight }"
      :fill="isHoveredSequenceOrHoveredCategoryForComparisonValue(comparisonValue.key)
        ? 'black'
        : getColorScheme[comparisonValue.key]"
      :opacity="isHighlight ? 1 : 0.25"
    />
    <rect v-for="(comparisonValue, index) in comparisonValues"
      :key="comparisonValue.key"
      :class="{ highlight: isHighlight }"
      :y="-width/2 + width / count
        * comparisonValues.slice(0, index).map((val) => val.value).reduce((a,b) => a+b, 0)"
      :width="lengthForComparisonValue(comparisonValue.key)"
      :height="width / count * comparisonValue.value"
      :stroke="isHoveredSequenceOrHoveredCategoryForComparisonValue(comparisonValue.key)
        ? 'black'
        : 'none'"
      :fill="getColorScheme[comparisonValue.key]"
      :opacity="isHighlight ? 1 : 0.25"
    />
  </g>
</template>

<script lang="ts">
import Vue from 'vue';
import { EventTreeLink } from '@/models/EventTreeLink';
import { mapGetters } from 'vuex';
import { Getters } from '@/store/getters';
import { Variable } from '@/models/Variable';
import { NumericalVariable } from '@/models/NumericalVariable';
import _ from 'lodash';
import { EventTreeNode } from '@/models/EventTreeNode';
import { EventSequence } from '@/models/EventSequenceDataset';
import { EventDatasetEntry } from '@/models/EventDataset';

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
      getNodeScale: Getters.GET_NODE_SCALE,
      getNumericalComparisonVariableThreshold: Getters.GET_NUMERICAL_COMPARISON_VARIABLE_THRESHOLD,
      getHoveredSequence: Getters.GET_HOVERED_SEQUENCE,
      getHoveredAttribute: Getters.GET_HOVERED_ATTRIBUTE,
      getEventSequenceData: Getters.GET_EVENT_SEQUENCE_DATA,
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

    referenceSiblingsCount(): number {
      return this.referenceSiblings.reduce((a, b) => a + b.count, 0);
    },

    otherNode(): EventTreeNode {
      if (this.link.target.depth > 0) {
        return this.link.source;
      }
      return this.link.target;
    },

    sequences(): EventSequence[] {
      const sequenceData = this.getEventSequenceData.data;
      return sequenceData
        .filter((sequence: EventSequence) => this.link.source.events.map((event) => event.sequence)
          .includes(sequence.id)
        && this.link.target.events.map((event) => event.sequence)
          .includes(sequence.id));
    },

    sourceEvents(): EventDatasetEntry[] {
      return this.link.source.events
        .filter((event) => this.sequences.map((sequence) => sequence.id).includes(event.sequence));
    },

    targetEvents(): EventDatasetEntry[] {
      return this.link.target.events
        .filter((event) => this.sequences.map((sequence) => sequence.id).includes(event.sequence));
    },

    count(): number {
      return this.referenceNode.count;
    },

    width(): number {
      return this.getNodeScale(this.count);
    },

    length(): number {
      const left = this.sourceEvents
        .map((event) => event.time).reduce((a, b) => a + b, 0) / this.sourceEvents.length;

      const right = this.targetEvents
        .map((event) => event.time).reduce((a, b) => a + b, 0) / this.targetEvents.length;

      let total = this.sequences
        .map((sequence) => sequence.duration)
        .reduce((a, b) => a + b, 0) / this.sequences.length;

      // Catch sequence with total duration of 0
      if (total === 0) {
        total = 1;
      }

      const sourceRadius = this.getNodeScale(this.link.source.count) * (4 / 3);
      const targetRadius = this.getNodeScale(this.link.target.count) * (4 / 3);

      return ((right - left) / total)
      * (this.distance - sourceRadius - targetRadius)
      + sourceRadius * (4 / 3);
    },

    distance(): number {
      const left = this.link.source;
      const right = this.link.target;

      return Math.sqrt((right.y - left.y) ** 2 + (right.x - left.x) ** 2);
    },

    angle(): number {
      const left = this.link.source;
      const right = this.link.target;

      const yDiff = right.y - left.y;
      const hypotenuse = this.distance;

      return (Math.asin(yDiff / hypotenuse) * 180) / Math.PI;
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

    isHoveredSequence(): boolean {
      return this.referenceNode.events.map(
        (event) => event.sequence,
      ).includes(this.getHoveredSequence);
    },

    isHighlight(): boolean {
      return this.referenceNode.highlight;
    },
  },

  methods: {
    lengthForComparisonValue(comparisonValue: string): number {
      const sourceEventsForComparisonValue = this.sourceEvents
        .filter((event) => event.variables
          .find((variable) => variable.name === this.getComparisonVariable.name)
          ?.value === comparisonValue);

      const sequencesForComparisonValue = this.sequences
        .filter((sequence: EventSequence) => sourceEventsForComparisonValue
          .map((event) => event.sequence)
          .includes(sequence.id));

      const targetEventsForComparisonValue = this.targetEvents
        .filter((event) => sequencesForComparisonValue.map((sequence) => sequence.id)
          .includes(event.sequence));

      const left = sourceEventsForComparisonValue
        .map((event) => event.time).reduce((a, b) => a + b, 0)
        / sourceEventsForComparisonValue.length;
      const right = targetEventsForComparisonValue
        .map((event) => event.time).reduce((a, b) => a + b, 0)
        / targetEventsForComparisonValue.length;

      let total = sequencesForComparisonValue
        .map((sequence) => sequence.duration)
        .reduce((a, b) => a + b, 0) / sequencesForComparisonValue.length;

      // Catch sequence with total duration of 0
      if (total === 0 || !(typeof total === 'number')) {
        total = 1;
      }

      const sourceRadius = this.getNodeScale(this.link.source.count) * (4 / 3);
      const targetRadius = this.getNodeScale(this.link.target.count) * (4 / 3);

      return ((right - left) / total)
      * (this.distance - sourceRadius - targetRadius)
      + sourceRadius * (4 / 3);
    },

    isHoveredSequenceForComparisonValue(comparisonValue: string): boolean {
      const sourceEventsForComparisonValue = this.sourceEvents
        .filter((event) => event.variables
          .find((variable) => variable.name === this.getComparisonVariable.name)
          ?.value === comparisonValue);

      return sourceEventsForComparisonValue.findIndex(
        (event) => event.sequence === this.getHoveredSequence,
      ) !== -1;
    },

    isHoveredSequenceOrHoveredCategoryForComparisonValue(comparisonValue: string): boolean {
      return this.isHoveredSequenceForComparisonValue(comparisonValue)
        || comparisonValue === this.getHoveredAttribute;
    },
  },
});
</script>
