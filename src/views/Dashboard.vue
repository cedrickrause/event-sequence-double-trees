<template>
  <div class="dashboard">
    <b-container fluid>
      <b-row align-h="center" no-gutters>
        <b-col cols="3">
          <control-panel-card />
          <sequence-list />
        </b-col>
        <b-col cols="9">
          <b-card
            class="h-100"
            title="Event Sequence Double Tree"
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
import ControlPanelCard from '@/components/ControlPanelCard.vue';
import SequenceList from '@/components/SequenceList.vue';
import { Actions } from '@/store/actions';
import Vue from 'vue';
import { mapActions } from 'vuex';

export default Vue.extend({
  name: 'Dashboard',
  components: { ControlPanelCard, SequenceList, DoubleTreeWrapper },

  mounted() {
    this.loadDataset('nobel');
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
