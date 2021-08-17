<template>
    <div id="control-panel">
      <b-form-group
        id="input-group-1"
        label="Comparison Variable"
        label-for="comparisonVariableInput"
      >
        <b-form-select
          id="comparisonVariableInput"
          v-model="comparisonVariable"
          :options="selectableComparisonVariables">
          <template #first>
            <b-form-select-option :value="null">
              -- None --
            </b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>
      <b-form-input type="range" v-if="comparisonVariableIsNumerical">
      </b-form-input>
      <category-color-mapping-list />
      <query-builder />
    </div>
</template>

<script lang="ts">
import { NumericalVariable } from '@/models/NumericalVariable';
import { Variable } from '@/models/Variable';
import { Actions } from '@/store/actions';
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import CategoryColorMappingList from './CategoryColorMappingList.vue';
import QueryBuilder from './QueryBuilder.vue';

export default Vue.extend({
  components: { QueryBuilder, CategoryColorMappingList },
  data() {
    return {
      comparisonVariable: null,
    };
  },

  watch: {
    comparisonVariable(): void {
      this.selectComparisonVariable(this.comparisonVariable);
    },
  },

  computed: {
    ...mapGetters({
      getEventData: Getters.GET_EVENT_DATA,
      getEventSequenceData: Getters.GET_EVENT_SEQUENCE_DATA,
      getComparisonVariable: Getters.GET_COMPARISON_VARIABLE,
    }),

    selectableComparisonVariables(): string[] {
      if (this.getEventSequenceData) {
        return this.getEventSequenceData.data[0].events[0].variables.map(
          (variable: Variable | null) => ({
            value: variable,
            text: variable?.name,
          }),
        );
      }
      return [];
    },

    comparisonVariableIsNumerical(): boolean {
      return this.getComparisonVariable instanceof NumericalVariable;
    },
  },

  methods: {
    ...mapActions({
      selectComparisonVariable: Actions.SELECT_COMPARISON_VARIABLE,
    }),
  },
});
</script>

<style lang="scss" scoped>
#control-panel {
  text-align: left;
}
</style>
