<template>
    <div>
      <b-form-group
        id="input-group-1"
        label="Comparison Variable"
        label-for="comparisonVariableInput"
      >
        <b-form-select
          id="comparisonVariableInput"
          v-model="comparisonVariable"
          :options="selectableComparisonVariables">
          <template #first>
            <b-form-select-option :value="null">
              -- None --
            </b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>
      <b-form-group
        id="input-group-2"
        label="Query"
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
    </div>
</template>

<script lang="ts">
import { EventDatasetEntry } from '@/models/EventDataset';
import { Variable } from '@/models/Variable';
import { Actions } from '@/store/actions';
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

export default Vue.extend({
  data() {
    return {
      comparisonVariable: null,
      query: [] as string[],
    };
  },

  watch: {
    comparisonVariable(): void {
      this.selectComparisonVariable(this.comparisonVariable);
    },
  },

  computed: {
    ...mapGetters({
      getEventData: Getters.GET_EVENT_DATA,
      getEventSequenceData: Getters.GET_EVENT_SEQUENCE_DATA,
    }),

    queryBuilderLengthRange(): number[] {
      return Array.from(Array(this.query.length + 1).keys());
    },

    selectableComparisonVariables(): string[] {
      if (this.getEventSequenceData) {
        return this.getEventSequenceData.data[0].events[0].variables.map(
          (variable: Variable | null) => variable?.name,
        );
      }
      return [];
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
      selectComparisonVariable: Actions.SELECT_COMPARISON_VARIABLE,
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
