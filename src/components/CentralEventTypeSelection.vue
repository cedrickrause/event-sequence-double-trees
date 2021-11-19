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
import { Actions } from '@/store/actions';
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

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
        this.updateCentralEventType(eventType);
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
    selectableEventTypes(): void {
      this.centralEventType = this.getEventData.data[0].eventType;
    },
  },

  methods: {
    ...mapActions({
      updateCentralEventType: Actions.UPDATE_CENTRAL_EVENT_TYPE,
    }),
  },
});
</script>
