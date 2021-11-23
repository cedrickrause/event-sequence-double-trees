<template>
  <div>
    <event-type-legend />
    <double-tree
      :eventSequenceData="getEventSequenceData"
      :centralEventType="getCentralEventType"
    />
  </div>
</template>

<script lang="ts">
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapGetters } from 'vuex';
import EventTypeLegend from '../EventTypeLegend.vue';
import DoubleTree from './DoubleTree.vue';

export default Vue.extend({
  components: { EventTypeLegend, DoubleTree },

  computed: {
    ...mapGetters({
      getEventSequenceData: Getters.GET_EVENT_SEQUENCE_DATA,
      getCentralEventType: Getters.GET_CENTRAL_EVENT_TYPE,
    }),
  },
});
</script>
