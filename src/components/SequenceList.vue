<template>
  <b-card
    class="h-50"
    :title="'Event Sequences (' + arrayOfSequences.length + ')'">
    <div id="sequence-list">
      <b-list-group>
        <b-list-group-item  v-for="value in arrayOfSequences" :key="value.id"
          @mouseover="setHoveredSequence(value.id)"
          @mouseleave="setHoveredSequence('')">
          <single-sequence
            :sequence="value"
            />
        </b-list-group-item>
      </b-list-group>
    </div>
  </b-card>
</template>

<script lang="ts">
import { matchesLeftSelection, matchesRightSelection } from '@/helpers/selection';
import { EventDatasetEntry } from '@/models/EventDataset';
import { EventSequence } from '@/models/EventSequenceDataset';
import { Getters } from '@/store/getters';
import { Mutations } from '@/store/mutations';
import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';
import SingleSequence from './Charts/SingleSequence.vue';

export default Vue.extend({
  components: { SingleSequence },

  computed: {
    ...mapGetters({
      getEventSequenceData: Getters.GET_EVENT_SEQUENCE_DATA,
      getDoubleTreeSelection: Getters.GET_DOUBLE_TREE_SELECTION,
      getCentralEventType: Getters.GET_CENTRAL_EVENT_TYPE,
    }),

    arrayOfSequences(): EventSequence[] {
      const sequences = this.getEventSequenceData?.data.slice();
      if (!sequences) {
        return [];
      }
      const c = sequences.sort((a: EventSequence, b: EventSequence) => {
        let aCount = 0;
        let bCount = 0;
        if (matchesLeftSelection(a.events.map((event: EventDatasetEntry) => event.eventType),
          this.getDoubleTreeSelection, this.getCentralEventType)) {
          aCount += 2;
        }
        if (matchesLeftSelection(b.events.map((event: EventDatasetEntry) => event.eventType),
          this.getDoubleTreeSelection, this.getCentralEventType)) {
          bCount += 2;
        }
        if (matchesRightSelection(a.events.map((event: EventDatasetEntry) => event.eventType),
          this.getDoubleTreeSelection, this.getCentralEventType)) {
          aCount += 1;
        }
        if (matchesRightSelection(b.events.map((event: EventDatasetEntry) => event.eventType),
          this.getDoubleTreeSelection, this.getCentralEventType)) {
          bCount += 1;
        }

        return bCount - aCount;
      });

      return c;
    },
  },

  methods: {
    ...mapMutations({
      setHoveredSequence: Mutations.SET_HOVERED_SEQUENCE,
    }),
  },

});
</script>

<style lang="scss" scoped>
@import '@/style/custom.scss';

.list-group{
    max-height: 95%;
    overflow-y: auto;
}

#sequence-list {
  text-align: left;
  height: 100%;
}

span {
  font-size: 12px;
  padding: 1px;
}

.card-text {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 0px;
}

.card-body {
  padding: 5px;
}

.card-title {
  margin-bottom: 0px;
  font-size: 15px;
  font-weight: bold;
}

.list-group-item {
  padding: 0px;
}

.list-group-item:hover {
  background-color: $hover-non-clickable;
}
</style>
