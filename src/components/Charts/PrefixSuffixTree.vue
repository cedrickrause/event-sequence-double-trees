<template>
  <div>
    <svg :viewBox="`0 0 ${this.width} ${this.height}`">
      <g class="container"
        :transform="`translate(${this.margin.left},${this.margin.top})`"
        font-size="14"
        font-family="sans-serif"
        >
        <path v-for="(link, index) in links" :key="'link' + index"
          :class="{ highlight: link.target.data.highlight }"
          :stroke="lineColor"
          fill="none"
          :stroke-opacity="1"
          :stroke-width="lineWidth"
          :d="linkPath(link)"
          />
        <g v-for="(node, index) in nodes"
          :key="'node' + index + render"
          :transform="`translate(${node.y},${node.x})`"
          v-on:click="handleClick(node)"
          >
          <circle
            :class="{ highlight: node.data.highlight }"
            :fill="nodeColor"
            :stroke="nodeStrokeColor"
            :r="nodeRadius"
            stroke-linejoin="round"
          />
          <text
            text-anchor="middle"
            dy="0.35em"
            >
            {{ node.data.type.slice(0,1) }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { EventSequenceDataset, EventSequence } from '@/models/EventSequenceDataset';
import { HierarchyDatum } from '@/helpers/d3helpers';
import * as d3 from 'd3';
import Vue from 'vue';

export default Vue.extend({
  props: {
    eventSequenceData: {
      type: Object as () => EventSequenceDataset,
    },
  },

  data() {
    return {
      render: false,
      width: 800,
      height: 400,
      margin: {
        top: 40, right: 40, bottom: 40, left: 40,
      },
      nodeStrokeColor: '#555',
      nodeRadius: 7.5,
      nodeColor: 'white',
      lineWidth: 1.5,
      lineOpacity: 0.4,
      lineHighlightOpacity: 1,
      lineColor: '#aaa',
      nodeTooltipYOffset: 20,
      centerEventType: 'Pass',
    };
  },

  computed: {
    prefixtree(): d3.HierarchyPointNode<HierarchyDatum> {
      return this.createTreeFromTrieData();
    },

    nodes(): d3.HierarchyPointNode<HierarchyDatum>[] {
      return this.prefixtree.descendants();
    },

    links(): d3.HierarchyPointLink<HierarchyDatum>[] {
      return this.prefixtree.links();
    },
  },

  methods: {
    createTreeFromTrieData() {
      let trieData = {} as HierarchyDatum;
      if (this.eventSequenceData) {
        trieData = this.buildTrie({ data: this.eventSequenceData.data.slice(0, 15) }, 'root');
      }
      const root = d3.hierarchy<HierarchyDatum>(trieData);

      return d3.tree<HierarchyDatum>()
        .size([
          // Layout is top-bottom, so we need to swap X and Y here because we plot left-right
          this.height - this.margin.top - this.margin.bottom,
          (this.width - this.margin.left - this.margin.right) / 2,
        ])
        .separation(() => 2)(root);
    },

    buildTrie(sequences: EventSequenceDataset, root: string): HierarchyDatum {
      let trie: HierarchyDatum = { type: root, value: 0, children: [] };
      sequences.data.forEach((sequence) => {
        trie = this.addSeriesToTrie(sequence, trie);
      });
      return trie;
    },

    addSeriesToTrie(sequence: EventSequence, subtrie: HierarchyDatum) {
      const tempTrie = subtrie;
      const typeToAdd = sequence.events[0].eventType;
      let childWithTypeToAdd = tempTrie.children.find(
        (child: HierarchyDatum) => child.type === typeToAdd,
      );
      if (!childWithTypeToAdd) {
        childWithTypeToAdd = { type: typeToAdd, children: [], value: 1 };
        tempTrie.children.push(childWithTypeToAdd);
      } else {
        childWithTypeToAdd.value += 1;
      }
      if (sequence.events.length > 1) {
        this.addSeriesToTrie(
          { events: sequence.events.slice(1) },
          childWithTypeToAdd,
        );
      }
      return tempTrie;
    },

    linkPath(link: d3.HierarchyPointLink<HierarchyDatum>) {
      const path = d3.linkHorizontal
      <d3.HierarchyPointLink<HierarchyDatum>, d3.HierarchyPointNode<HierarchyDatum>>()
        // Layout is top-bottom, so we need to swap X and Y here because we plot left-right
        .x((d) => d.y)
        .y((d) => d.x)(link);
      return path;
    },

    handleClick(node: d3.HierarchyPointNode<HierarchyDatum>) {
      console.log(node.data.type);
      const isTurnOn = this.atLeastOneChildIsHighlighted(node) || !node.data.highlight;
      this.highlightDownToLeaves(node, false);
      this.highlightUpToRoot(node, isTurnOn);
      this.render = !this.render;
    },

    highlightUpToRoot(node: d3.HierarchyPointNode<HierarchyDatum>, isTurnOn: boolean) {
      // eslint-disable-next-line no-param-reassign
      node.data.highlight = isTurnOn;
      this.$set(node.data, 'highlight', isTurnOn);
      if (node.parent && (isTurnOn || !this.atLeastOneChildIsHighlighted(node.parent))) {
        this.highlightUpToRoot(node.parent, isTurnOn);
      }
    },

    highlightDownToLeaves(node: d3.HierarchyPointNode<HierarchyDatum>, isTurnOn: boolean) {
      // eslint-disable-next-line no-param-reassign
      node.data.highlight = isTurnOn;
      node.children?.forEach((child) => this.highlightDownToLeaves(child, isTurnOn));
    },

    atLeastOneChildIsHighlighted(node: d3.HierarchyPointNode<HierarchyDatum>) {
      let atLeastOneChildIsHighlighted = false;
      node.children?.forEach((child) => {
        if (child.data.highlight === true) {
          atLeastOneChildIsHighlighted = true;
        }
      });
      return atLeastOneChildIsHighlighted;
    },
  },
});
</script>

<style lang="scss">
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
