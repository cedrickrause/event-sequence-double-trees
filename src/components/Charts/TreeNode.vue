<template>
  <g :transform="`translate(${node.x},${node.y})
  scale(${isHoveredEventType ? 1.5 : 1})`"
      @click="handleClick()"
      @mouseover="setHoveredEventType(node.eventType)"
      @mouseleave="setHoveredEventType('')"
    >
    <defs>
           <pattern
                id="diagonalHatch"
                patternUnits="userSpaceOnUse"
                width="4"
                height="2"
                patternTransform="rotate(-45 2 2)"
            >
                <rect fill="white" width="10" height="10" />
                <path d="M -1,2 l 6,0" stroke="#888888" stroke-width=".5"/>
          </pattern>
    </defs>
    <circle
      :class="{ highlight: node.highlight }"
      :r="nodeSize"
      :fill="nodeColor"
    />
    <text dy="0.35em"
    :font-size="nodeSize"
    :opacity="node.highlight ? 1 : 0.5">
      {{ nodeIcon }}
    </text>
    <g v-if="comparisonValues.length > 0">
      <path v-for="(keyValuePair, index) in comparisonValues" :key="keyValuePair.key"
        :d="arc(node.count, keyValuePair.value, comparisonValues.slice(0, index))"
        :fill="getColorScheme[keyValuePair.key]"
        :opacity="node.highlight ? 1 : 0.5"
        :stroke="getHoveredAttribute === keyValuePair.key || isHoveredSequence ? 'black' : 'white'"
        @mouseover="setHoveredAttribute(keyValuePair.key)"
        @mouseleave="setHoveredAttribute('')"
        />
    </g>
    <g v-else>
      <path
        :d="fullArc(node.count)"
        fill="grey"
        :opacity="node.highlight ? 1 : 0.5"
        :stroke="isHoveredSequence ? 'black' : 'white'"
        />
    </g>
  </g>
</template>

<script lang="ts">
import { getDoubleTreeSelectionFromRoot } from '@/helpers/selection';
import { EventTreeNode } from '@/models/EventTreeNode';
import { NumericalVariable } from '@/models/NumericalVariable';
import { Variable } from '@/models/Variable';
import { Actions } from '@/store/actions';
import { Getters } from '@/store/getters';
import { Mutations } from '@/store/mutations';
import * as d3 from 'd3';
import _ from 'lodash';
import Vue from 'vue';
import { mapActions, mapGetters, mapMutations } from 'vuex';

export default Vue.extend({
  props: {
    node: {
      type: Object as () => EventTreeNode,
    },
    maxArcWidth: Number,
  },

  data() {
    return {
      value: this.node,
    };
  },

  computed: {
    ...mapGetters({
      getComparisonVariable: Getters.GET_COMPARISON_VARIABLE,
      getColorScheme: Getters.GET_COLOR_SCHEME,
      getNumericalComparisonVariableThreshold: Getters.GET_NUMERICAL_COMPARISON_VARIABLE_THRESHOLD,
      getNodeScale: Getters.GET_NODE_SCALE,
      getCentralEventType: Getters.GET_CENTRAL_EVENT_TYPE,
      getHoveredEventType: Getters.GET_HOVERED_EVENT_TYPE,
      getEventTypeToIconMapping: Getters.GET_EVENT_TYPE_ICON_MAPPING,
      getHoveredAttribute: Getters.GET_HOVERED_ATTRIBUTE,
      getHoveredSequence: Getters.GET_HOVERED_SEQUENCE,
    }),

    comparisonValues(): {key: string, value: number}[] {
      const filteredVariables = this.node.variables.filter(
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

    comparisonValueTotal(): number {
      return _.reduce(this.comparisonValues, (sum, n) => sum + n.value, 0);
    },

    nodeSize(): number {
      return this.getNodeScale(this.node.count);
    },

    nodeColor(): string {
      if (this.getCentralEventType === this.node.eventType) {
        return 'url(#diagonalHatch)';
      }
      return 'white';
    },

    nodeIcon(): string {
      return this.getEventTypeToIconMapping[this.node.eventType];
    },

    isHoveredEventType(): boolean {
      return this.getHoveredEventType === this.node.eventType;
    },

    isHoveredSequence(): boolean {
      return this.node.events.map((event) => event.sequence).includes(this.getHoveredSequence);
    },
  },

  methods: {
    ...mapActions({
      addSequenceToDoubleTreeSelection: Actions.ADD_SEQUENCE_TO_DOUBLE_TREE_SELECTION,
    }),

    ...mapMutations({
      setDoubleTreeSelection: Mutations.SET_DOUBLE_TREE_SELECTION,
      setHoveredEventType: Mutations.SET_HOVERED_EVENT_TYPE,
      setHoveredAttribute: Mutations.SET_HOVERED_ATTRIBUTE,
    }),

    handleClick(): void {
      if (this.node.depth > 0) {
        this.handleClickRightTree();
      } else if (this.node.depth < 0) {
        this.handleClickLeftTree();
      } else {
        this.handleClickRoot();
      }
      this.updateDoubleTreeSelection();
    },

    updateDoubleTreeSelection() {
      const selection = getDoubleTreeSelectionFromRoot(
        this.node.allNodes().filter((node) => node.depth === 0)[0],
      );
      this.setDoubleTreeSelection(selection);
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
      this.node.allNodes().forEach((node) => {
        node.highlightNode(false);
      });
      this.node.highlightNode(true);
    },

    arc(value: number, count: number, valuesBefore: {key: string, value: number}[]) {
      const arc = d3.arc();
      const total = this.comparisonValueTotal;
      const share = count / total;
      const sumBefore = valuesBefore.reduce((sum, n) => sum + n.value, 0);
      const start = sumBefore / total;

      return arc({
        innerRadius: this.nodeSize,
        outerRadius: this.nodeSize + 2
        + (value / this.getNodeScale.domain()[1]) * this.maxArcWidth,
        startAngle: start * 2 * Math.PI,
        endAngle: (start + share) * 2 * Math.PI,
      });
    },

    fullArc(value: number) {
      return d3.arc()({
        innerRadius: this.nodeSize,
        outerRadius: this.nodeSize + 2
        + (value / this.getNodeScale.domain()[1]) * this.maxArcWidth,
        startAngle: 0,
        endAngle: 2 * Math.PI,
      });
    },
  },
});
</script>

<style lang="scss" scoped>
@import '@/style/custom.scss';

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
