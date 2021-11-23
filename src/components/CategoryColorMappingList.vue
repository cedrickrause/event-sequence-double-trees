<template>
  <div id="category-color-mapping-list">
    <b-list-group>
      <b-list-group-item  v-for="(value, key) in getColorScheme" :key="'color' + key">
        <span v-if="comparisonVariableIsNumerical">
          {{ getNumericalComparisonVariableThreshold }}
        </span>
        <svg width="30" height="30">
          <circle
            cx="15"
            cy="15"
            r="10"
            fill="none"
            stroke-width="5"
            :stroke="value ? value : 'black'"
          />
        </svg>
        {{ key }}
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
    max-height: 70%;
    overflow-y: auto;
}

.list-group-item {
  padding: 5px;
}

#category-color-mapping-list {
  height: 100%;
}
</style>
