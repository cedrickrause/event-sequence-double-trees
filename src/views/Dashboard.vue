<template>
  <div class="dashboard">
    <b-container fluid>
      <b-row align-h="center" no-gutters>
        <b-col cols="3">
          <b-card
            class="h-50"
            title="Control Panel">
            <control-panel />
          </b-card>
          <b-card
            class="h-50"
            title="Sequence List">
            <sequence-list />
          </b-card>
        </b-col>
        <b-col cols="9">
          <b-card
            class="h-100"
            title="Event Sequence DoubleTree"
          >
            <double-tree
              :eventSequenceData="getEventSequenceData"
              :centralEventType="getCentralEventType"
            />
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import DoubleTree from '@/components/Charts/DoubleTree.vue';
import ControlPanel from '@/components/ControlPanel.vue';
import SequenceList from '@/components/SequenceList.vue';
import { Actions } from '@/store/actions';
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';

export default Vue.extend({
  name: 'Dashboard',
  components: { ControlPanel, SequenceList, DoubleTree },

  mounted() {
    this.loadData('./data/events.json');
  },

  computed: {
    ...mapGetters({
      getEventSequenceData: Getters.GET_EVENT_SEQUENCE_DATA,
      getCentralEventType: Getters.GET_CENTRAL_EVENT_TYPE,
    }),
  },

  methods: {
    ...mapActions({ loadData: Actions.LOAD_EVENT_DATA }),
  },
});
</script>

<style lang="scss" scoped>
.container-fluid {
  height: 100vh;
}

.row {
  height: 100%;
}

.col-3 {
  height: 100%;
}

.card-body {
  height: 100%;
}
</style>
