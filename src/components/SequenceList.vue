<template>
  <div id="sequence-list">
    <b-list-group>
      <b-list-group-item  v-for="value in arrayOfSequences" :key="'sequence' + value.id">
        <span>
          Sequence #{{value.id}}
        </span>
        <single-sequence
          :sequence="value"
          />
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script lang="ts">
import { EventSequence } from '@/models/EventSequenceDataset';
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapGetters } from 'vuex';
import SingleSequence from './Charts/SingleSequence.vue';

export default Vue.extend({
  components: { SingleSequence },

  computed: {
    ...mapGetters({
      getEventSequenceData: Getters.GET_EVENT_SEQUENCE_DATA,
    }),

    arrayOfSequences(): EventSequence[] {
      return this.getEventSequenceData?.data;
    },
  },

});
</script>

<style lang="scss" scoped>
.list-group{
    max-height: 95%;
    overflow-y:scroll;
    -webkit-overflow-scrolling: touch;
}

#sequence-list {
  text-align: left;
  height: 100%;
}

span {
  font-size: 12px
}
</style>
