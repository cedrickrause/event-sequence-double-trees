<template>
  <div class="dashboard">
    <b-container fluid>
      <b-row align-h="center">
        <b-col cols="6">
          <b-card
            title="Event Sequence PrefixSuffixTree">
            <prefix-suffix-tree :eventSequenceData="getEventSequenceData" />
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import PrefixSuffixTree from '@/components/Charts/PrefixSuffixTree.vue';
import { Actions } from '@/store/actions';
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';

export default Vue.extend({
  name: 'Dashboard',
  components: { PrefixSuffixTree },

  mounted() {
    this.loadData('./data/events.json');
  },

  computed: {
    ...mapGetters({ getEventSequenceData: Getters.GET_EVENT_SEQUENCE_DATA }),
  },

  methods: {
    ...mapActions({ loadData: Actions.LOAD_EVENT_DATA }),
  },
});
</script>
