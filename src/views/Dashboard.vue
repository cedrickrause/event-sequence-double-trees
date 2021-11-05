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
            <double-tree-wrapper />
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import DoubleTreeWrapper from '@/components/Charts/DoubleTreeWrapper.vue';
import ControlPanel from '@/components/ControlPanel.vue';
import SequenceList from '@/components/SequenceList.vue';
import { Actions } from '@/store/actions';
import Vue from 'vue';
import { mapActions } from 'vuex';

export default Vue.extend({
  name: 'Dashboard',
  components: { ControlPanel, SequenceList, DoubleTreeWrapper },

  mounted() {
    this.loadData('./data/events.json');
  },

  methods: {
    ...mapActions({ loadData: Actions.LOAD_EVENT_DATA }),
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
