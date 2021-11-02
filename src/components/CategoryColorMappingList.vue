<template>
  <div>
    <b-list-group>
      <b-list-group-item  v-for="(value, key) in getColorScheme" :key="'color' + key">
        {{ key }}
        <span v-if="comparisonVariableIsNumerical">
          {{ getNumericalComparisonVariableThreshold }}
        </span>
        <b-badge pill
          :style="'background-color: ' + value"
        >
          {{ value }}
        </b-badge>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script lang="ts">
import { NumericalVariable } from '@/models/NumericalVariable';
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapGetters } from 'vuex';

export default Vue.extend({

  computed: {
    ...mapGetters({
      getColorScheme: Getters.GET_COLOR_SCHEME,
      getNumericalComparisonVariableThreshold: Getters.GET_NUMERICAL_COMPARISON_VARIABLE_THRESHOLD,
      getComparisonVariable: Getters.GET_COMPARISON_VARIABLE,
    }),

    comparisonVariableIsNumerical() {
      return this.getComparisonVariable instanceof NumericalVariable;
    },
  },
});
</script>
<style lang="scss" scoped>
.list-group{
    max-height: 250px;
    overflow-y:scroll;
}
</style>
