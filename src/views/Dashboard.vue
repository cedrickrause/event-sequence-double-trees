<template>
  <div class="dashboard">
    <b-container fluid>
      <b-row align-h="center" no-gutters>
        <b-col cols="3">
          <control-panel-card />
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
import ControlPanelCard from '@/components/ControlPanelCard.vue';
import SequenceList from '@/components/SequenceList.vue';
import { Actions } from '@/store/actions';
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';

export default Vue.extend({
  name: 'Dashboard',
  components: { SequenceList, DoubleTree, ControlPanelCard },

  mounted() {
    this.loadDataset('nobel');
  },

  computed: {
    ...mapGetters({
      getEventSequenceData: Getters.GET_EVENT_SEQUENCE_DATA,
      getCentralEventType: Getters.GET_CENTRAL_EVENT_TYPE,
    }),
  },

  methods: {
    ...mapActions({
      loadDataset: Actions.LOAD_DATASET,
    }),
  },
});
</script>

<style lang="scss" scoped>
.container-fluid {
  height: 100vh;
  overflow: hidden;
}

.row {
  height: 100%;
}

.col-3 {
  height: 100%;
}
</style>
