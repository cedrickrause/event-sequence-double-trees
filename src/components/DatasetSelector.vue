<template>
  <b-form inline>
    <label class="mr-sm-2" for="datasetInput">Dataset</label>
    <b-form-select
      id="datasetInput"
      v-model="selectedDataset"
      :options="datasetDescriptions">
      <template #first>
      </template>
    </b-form-select>
  </b-form>
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
        { value: 'flatlands', text: 'Flatlands Sample Data' },
        { value: 'example', text: 'Example Data For Screenshots' },
      ],
      selectedDataset: 'example',
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
