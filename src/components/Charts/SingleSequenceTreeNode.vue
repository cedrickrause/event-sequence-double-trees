<template>
  <g :transform="`translate(${this.node.x},${this.node.y})`"
      @click="handleClick()"
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
      :stroke-opacity="node.highlight ? 1 : 0.5"
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
        />
    </g>
    <g v-else>
      <path
        :d="fullArc(node.count)"
        fill="grey"
        :opacity="node.highlight ? 1 : 0.5"
        />
    </g>
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
      getEventTypeToIconMapping: Getters.GET_EVENT_TYPE_ICON_MAPPING,
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

    isHighlight(): boolean {
      return true;
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
        outerRadius: this.nodeSize + 1 + Math.sqrt(value),
        startAngle: start * 2 * Math.PI,
        endAngle: (start + share) * 2 * Math.PI,
      });
    },

    fullArc(value: number) {
      return d3.arc()({
        innerRadius: this.nodeSize,
        outerRadius: this.nodeSize + 1 + Math.sqrt(value),
        startAngle: 0,
        endAngle: 2 * Math.PI,
      });
    },
  },
});
</script>

<style lang="scss" scoped>
@import '@/style/custom.scss';

circle {
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
