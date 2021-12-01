<template>
  <div>
    <b-form inline >
      <label class="mr-sm-2" for="centralEventTypeInput">Central Event Type</label>
        <b-form-select
          id="centralEventTypeInput"
          v-model="centralEventType"
          >
          <b-form-select-option v-for="eventType in selectableEventTypes"
          :key="eventType + 'dropdownItem'"
          :value="eventType">
            {{ eventType + ': ' + getEventTypeIconMapping[eventType] }}
          </b-form-select-option>
        </b-form-select>
    </b-form>
  </div>
</template>

<script lang="ts">
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
      getEventTypeIconMapping: Getters.GET_EVENT_TYPE_ICON_MAPPING,
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
      if (this.getEventTypeIconMapping) {
        return Object.keys(this.getEventTypeIconMapping).sort(
          (a, b) => (+a.slice(a.indexOf(' ') + 1) > +b.slice(b.indexOf(' ') + 1) ? 1 : -1),
        );
      }
      return [];
    },
  },

  watch: {
    getEventTypeIconMapping(): void {
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
