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
      :eventSequenceData="eventSequenceData"
      :centralEventType="centralEventType" />
    </div>
  </div>
</template>

<script lang="ts">
import { EventDatasetEntry } from '@/models/EventDataset';
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapGetters } from 'vuex';
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
    };
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
  },

});
</script>
