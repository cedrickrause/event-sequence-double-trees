<template>
  <div>
    <b-button-group>
      <b-button v-for="(eventTypeIcon, eventType) in getEventTypeIconMapping"
        :key="'legend' + eventType"
        :variant="eventType === getCentralEventType ? 'primary' : 'outline-primary'"
        @click="updateCentralEventType(eventType)">
        {{ eventType + ': ' + eventTypeIcon }}
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
  },

  methods: {
    ...mapActions({
      updateCentralEventType: Actions.UPDATE_CENTRAL_EVENT_TYPE,
    }),
  },
});
</script>
