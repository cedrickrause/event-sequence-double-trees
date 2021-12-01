<template>
  <b-form-group
    id="input-group-2"
    label="Filter for sequences (incl. wildcards)"
    label-for="queryInput"
  >
    <b-form-select v-for="queryElement in queryBuilderLengthRange"
      :key="'query' + queryElement"
      :id="'queryInput' + queryElement"
      v-model="query[queryElement]">
      <b-form-select-option v-for="(icon, eventType) in getEventTypeIconMapping"
      :key="eventType + 'dropdownItem'"
      :value="eventType">
        {{ eventType + ': ' + icon }}
      </b-form-select-option>
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
      getEventTypeIconMapping: Getters.GET_EVENT_TYPE_ICON_MAPPING,
    }),

    queryBuilderLengthRange(): number[] {
      return Array.from(Array(this.query.length + 1).keys());
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
