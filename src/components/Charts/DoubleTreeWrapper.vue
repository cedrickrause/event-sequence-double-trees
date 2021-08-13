<template>
  <div>
    <div>
      <b-form-select
        id="centralEventTypeInput"
        v-model="centralEventType"
        :options="selectableEventTypes">
      </b-form-select>
    </div>
    <div>
      <b-form-select
        id="comparisonVariableInput"
        v-model="comparisonVariable"
        :options="selectableComparisonVariables">
      </b-form-select>
    </div>
    <div>
      <double-tree
      :eventSequenceData="eventSequenceData"
      :centralEventType="centralEventType" />
    </div>
  </div>
</template>

<script lang="ts">
import { EventDatasetEntry } from '@/models/EventDataset';
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { Actions } from '@/store/actions';
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import DoubleTree from './DoubleTree.vue';

export default Vue.extend({
  components: { DoubleTree },
  props: {
    eventSequenceData: {
      type: Object as () => EventSequenceDataset,
    },
  },

  data() {
    return {
      centralEventType: 'Dribble',
      comparisonVariable: '',
    };
  },

  watch: {
    comparisonVariable() {
      this.selectComparisonVariable(this.comparisonVariable);
    },
  },

  computed: {
    ...mapGetters({ getEventData: Getters.GET_EVENT_DATA }),

    selectableEventTypes(): string[] {
      if (this.getEventData) {
        return [...new Set<string>(this.getEventData.data.map(
          (event: EventDatasetEntry) => event.eventType,
        ))];
      }
      return [];
    },

    selectableComparisonVariables(): string[] {
      if (this.getEventData) {
        return this.eventSequenceData.data[0].events[0].variables.map((variable) => variable.name);
      }
      return [];
    },
  },

  methods: {
    ...mapActions({
      selectComparisonVariable: Actions.SELECT_COMPARISON_VARIABLE,
    }),
  },

});
</script>
