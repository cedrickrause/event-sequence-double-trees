<template>
  <div>
    <b-form-group
    id="input-group-central-event-type"
    label="Central Event Type"
    label-for="centralEventTypeInput"
    >
      <b-form-select
        id="centralEventTypeInput"
        v-model="centralEventType"
        :options="selectableEventTypes">
      </b-form-select>
    </b-form-group>
  </div>
</template>

<script lang="ts">
import { EventDatasetEntry } from '@/models/EventDataset';
import { EventSequence } from '@/models/EventSequenceDataset';
import { Getters } from '@/store/getters';
import { Mutations } from '@/store/mutations';
import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';

export default Vue.extend({

  computed: {
    ...mapGetters({
      getEventData: Getters.GET_EVENT_DATA,
      getInitialEventSequenceData: Getters.GET_INITIAL_EVENT_SEQUENCE_DATA,
      getCentralEventType: Getters.GET_CENTRAL_EVENT_TYPE,
    }),

    centralEventType: {
      get(): string {
        return this.getCentralEventType;
      },
      set(eventType: string): void {
        this.setCentralEventType(eventType);
      },
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

  watch: {
    centralEventType(): void {
      const filteredSequence = this.getInitialEventSequenceData.data.filter(
        (sequence: EventSequence) => sequence.events.findIndex(
          (event) => event.eventType === this.centralEventType,
        ) > -1,
      );
      this.setEventSequenceData({
        data: filteredSequence,
      });
    },

    selectableEventTypes(): void {
      this.centralEventType = this.getEventData.data[0].eventType;
    },
  },

  methods: {
    ...mapMutations({
      setEventSequenceData: Mutations.SET_EVENT_SEQUENCE_DATA,
      setCentralEventType: Mutations.SET_CENTRAL_EVENT_TYPE,
    }),
  },
});
</script>
