<template>
  <b-form-select
    id="comparisonVariableInput"
    v-model="selectedDataset"
    :options="datasetDescriptions">
    <template #first>
    </template>
  </b-form-select>
</template>

<script lang="ts">
import { Actions } from '@/store/actions';
import Vue from 'vue';
import { mapActions } from 'vuex';

export default Vue.extend({

  data() {
    return {
      datasetDescriptions: [
        { value: 'soccer', text: 'Soccer World Cup 2018 Final' },
        { value: 'nobel', text: 'Physics Nobel Prize Laureats until 1921' },
      ],
      selectedDataset: 'nobel',
    };
  },

  watch: {
    selectedDataset() {
      this.loadDataset(this.selectedDataset);
    },
  },

  methods: {
    ...mapActions({
      loadDataset: Actions.LOAD_DATASET,
    }),
  },

});
</script>
