<template>
  <b-form-group
    id="input-group-2"
    label="Filter for sequences (incl. wildcards)"
    label-for="queryInput"
  >
    <b-form-select v-for="queryElement in queryBuilderLengthRange"
      :key="'query' + queryElement"
      :id="'queryInput' + queryElement"
      v-model="query[queryElement]"
      :options="selectableEventTypes">
    </b-form-select>
    <b-button variant="primary" v-on:click="handleQuery">
      Search
    </b-button>
    <b-button variant="outline-primary" v-on:click="handleRemove">
      Remove
    </b-button>
  </b-form-group>
</template>

<script lang="ts">
import { EventDatasetEntry } from '@/models/EventDataset';
import { Actions } from '@/store/actions';
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

export default Vue.extend({
  data() {
    return {
      query: [] as string[],
    };
  },

  computed: {
    ...mapGetters({
      getEventData: Getters.GET_EVENT_DATA,
      getEventSequenceData: Getters.GET_EVENT_SEQUENCE_DATA,
    }),

    queryBuilderLengthRange(): number[] {
      return Array.from(Array(this.query.length + 1).keys());
    },

    selectableEventTypes(): string[] {
      if (this.getEventData) {
        return [...new Set<string>(this.getEventData.data.map(
          (event: EventDatasetEntry) => event.eventType,
        ))];
      }
      return [];
    },
  },

  methods: {
    ...mapActions({
      filterEventSequencesWithQuery: Actions.FILTER_EVENT_SEQUENCE_WITH_QUERY,
      resetEventSequenceData: Actions.RESET_EVENT_SEQUENCE_DATA,
    }),

    handleQuery() {
      this.resetEventSequenceData();
      this.filterEventSequencesWithQuery(this.query);
    },

    handleRemove() {
      this.query = [];
      this.resetEventSequenceData();
    },
  },
});
</script>
