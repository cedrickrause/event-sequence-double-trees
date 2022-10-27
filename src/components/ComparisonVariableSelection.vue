<template>
  <div id="comparison-variable-selection">
    <b-form inline>
      <label class="mr-sm-2" for="centralEventTypeInput">Define categories by</label>
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
      <b-form-input type="range" v-if="comparisonVariableIsNumerical"
        v-model="numericalComparisonVariableThreshold"
        min="0"
        :max="getNumericalComparisonVariableMaximum">
      </b-form-input>
    </b-form>
    <category-color-mapping-list />
  </div>
</template>

<script lang="ts">
import { NumericalVariable } from '@/models/NumericalVariable';
import { Variable } from '@/models/Variable';
import { Actions } from '@/store/actions';
import { Getters } from '@/store/getters';
import { Mutations } from '@/store/mutations';
import Vue from 'vue';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import CategoryColorMappingList from './CategoryColorMappingList.vue';

export default Vue.extend({
  components: { CategoryColorMappingList },
  data() {
    return {
      numericalComparisonVariableThreshold: 0,
    };
  },

  watch: {
    numericalComparisonVariableThreshold(): void {
      this.setNumericalComparisonVariableThreshold(this.numericalComparisonVariableThreshold);
    },
  },

  computed: {
    ...mapGetters({
      getEventData: Getters.GET_EVENT_DATA,
      getEventSequenceData: Getters.GET_EVENT_SEQUENCE_DATA,
      getComparisonVariable: Getters.GET_COMPARISON_VARIABLE,
      getNumericalComparisonVariableMaximum: Getters.GET_NUMERICAL_COMPARISON_VARIABLE_MAXIMUM,
    }),

    comparisonVariable: {
      get(): string {
        return this.getComparisonVariable;
      },
      set(value: string): void {
        this.selectComparisonVariable(value);
        this.numericalComparisonVariableThreshold = 0;
        this.setNumericalComparisonVariableThreshold(this.numericalComparisonVariableThreshold);
      },
    },

    selectableComparisonVariables(): string[] {
      if (this.getEventSequenceData) {
        return this.getEventSequenceData.data[0].events[1].variables.map(
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

    ...mapMutations({
      setNumericalComparisonVariableThreshold:
      Mutations.SET_NUMERICAL_COMPARISON_VARIABLE_THRESHOLD,
    }),
  },
});
</script>

<style lang="scss" scoped>
#comparison-variable-selection {
  height: 60%;
}
</style>
