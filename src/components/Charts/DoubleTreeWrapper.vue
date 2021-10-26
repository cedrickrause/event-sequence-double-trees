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
      <double-tree
      :eventSequenceData="getEventSequenceData"
      :centralEventType="centralEventType" />
    </div>
  </div>
</template>

<script lang="ts">
import { EventDatasetEntry } from '@/models/EventDataset';
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapGetters } from 'vuex';
import DoubleTree from './DoubleTree.vue';

export default Vue.extend({
  components: { DoubleTree },

  data() {
    return {
      centralEventType: 'Dribble',
    };
  },

  computed: {
    ...mapGetters({
      getEventData: Getters.GET_EVENT_DATA,
      getEventSequenceData: Getters.GET_EVENT_SEQUENCE_DATA,
    }),

    selectableEventTypes(): string[] {
      if (this.getEventData) {
        return [...new Set<string>(this.getEventData.data.map(
          (event: EventDatasetEntry) => event.eventType,
        ))];
      }
      return [];
    },
  },

});
</script>
