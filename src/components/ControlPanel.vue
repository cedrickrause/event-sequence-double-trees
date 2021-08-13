<template>
    <div>
      <b-form-group
        id="input-group-1"
        label="Comparison Variable:"
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
    </div>
</template>

<script lang="ts">
import { Actions } from '@/store/actions';
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

export default Vue.extend({
  data() {
    return {
      comparisonVariable: null,
    };
  },

  watch: {
    comparisonVariable() {
      this.selectComparisonVariable(this.comparisonVariable);
    },
  },

  computed: {
    ...mapGetters({
      getEventSequenceData: Getters.GET_EVENT_SEQUENCE_DATA,
    }),

    selectableComparisonVariables(): string[] {
      if (this.getEventSequenceData) {
        return this.getEventSequenceData.data[0].events[0].variables.map(
          (variable: string | null) => variable.name,
        );
      }
      return [];
    },
  },

  methods: {
    ...mapActions({
      selectComparisonVariable: Actions.SELECT_COMPARISON_VARIABLE,
    }),
  },
});
</script>
