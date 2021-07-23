<template>
  <div>
    <svg :viewBox="`0 0 ${this.width} ${this.height}`">
      <g class="container"
        :transform="`translate(${this.margin.left},${this.margin.top})`"
        font-size="14"
        font-family="sans-serif"
        >
        <path v-for="(link, index) in createTreeFromTrieData.links()" :key="'link' + index"
          :stroke="lineColor"
          fill="none"
          :stroke-opacity="1"
          :stroke-width="lineWidth"
          :d="linkPath(link)"
          />
        <g v-for="(node, index) in createTreeFromTrieData.descendants()" :key="'node' + index"
        :transform="`translate(${node.y},${node.x})`"
        >
          <circle
            :fill="nodeColor"
            :stroke="nodeStrokeColor"
            :r="nodeRadius"
            stroke-linejoin="round"
          />
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
      width: 800,
      height: 600,
      margin: {
        top: 40, right: 40, bottom: 40, left: 40,
      },
      strokeWidth: 3,
      nodeStrokeColor: '#555',
      nodeRadius: 5.5,
      nodeColor: 'white',
      nodeHighlightColor: '#FEEC8F',
      lineWidth: 1.5,
      lineOpacity: 0.4,
      lineHighlightOpacity: 1,
      lineColor: '#aaa',
      lineHighlightColor: '#FEEC8F',
      nodeTooltipYOffset: 20,
      centerEventType: 'Pass',
    };
  },

  computed: {
    createTreeFromTrieData(): d3.HierarchyPointNode<HierarchyDatum> {
      let trieData = {} as HierarchyDatum;
      if (this.eventSequenceData) {
        trieData = this.buildTrie({ data: this.eventSequenceData.data.slice(0, 10) }, 'root');
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
  },

  methods: {
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
  },
});
</script>

<style lang="scss">
circle:hover {
  cursor: pointer;
}

text:hover {
  cursor: pointer;
}
</style>
