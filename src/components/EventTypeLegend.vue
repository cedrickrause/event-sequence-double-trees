<template>
  <div>
    <b-button-group>
      <b-button v-for="eventType in selectableEventTypes"
        :key="'legend' + eventType"
        :variant="eventType === getCentralEventType ? 'secondary' : 'outline-secondary'"
        @click="updateCentralEventType(eventType)">
        {{ eventType + ': ' + getEventTypeIconMapping[eventType] }}
      </b-button>
    </b-button-group>
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
      getCentralEventType: Getters.GET_CENTRAL_EVENT_TYPE,
      getEventTypeIconMapping: Getters.GET_EVENT_TYPE_ICON_MAPPING,
    }),

    selectableEventTypes(): string[] {
      if (this.getEventTypeIconMapping) {
        return Object.keys(this.getEventTypeIconMapping).sort(
          (a, b) => (+a.slice(a.indexOf(' ') + 1) > +b.slice(b.indexOf(' ') + 1) ? 1 : -1),
        );
      }
      return [];
    },
  },

  methods: {
    ...mapActions({
      updateCentralEventType: Actions.UPDATE_CENTRAL_EVENT_TYPE,
    }),
  },
});
</script>
