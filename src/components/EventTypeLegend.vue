<template>
  <div>
    <b-button-group>
      <b-button v-for="(eventTypeIcon, eventType) in getEventTypeIconMapping"
        :key="'legend' + eventType"
        variant="outline-primary">
        {{ eventType + ': ' + eventTypeIcon }}
      </b-button>
    </b-button-group>
  </div>
</template>

<script lang="ts">
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapGetters } from 'vuex';

export default Vue.extend({

  computed: {
    ...mapGetters({
      getEventTypeIconMapping: Getters.GET_EVENT_TYPE_ICON_MAPPING,
    }),
  },

});
</script>
