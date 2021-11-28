<template>
  <b-card
      class="h-50"
      :title="getDatasetName">
      <b-card-header header-tag="nav">
        <b-tabs content-class="h-100 mt-3">
          <b-tab title="Settings" active>
            <control-panel />
          </b-tab>
          <b-tab title="Filter">
            <query-builder />
          </b-tab>
        </b-tabs>
      </b-card-header>
    </b-card>
</template>

<script lang="ts">
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapGetters } from 'vuex';
import ControlPanel from './ControlPanel.vue';
import QueryBuilder from './QueryBuilder.vue';

export default Vue.extend({
  components: { ControlPanel, QueryBuilder },

  computed: {
    ...mapGetters({
      getDatasetName: Getters.GET_DATASET_NAME,
    }),
  },
});
</script>
<style lang="scss" scoped>
div, nav {
  height: 100%;
}

.card-header {
  background-color: white;
}

</style>
