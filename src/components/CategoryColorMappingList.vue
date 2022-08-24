<template>
  <div id="category-color-mapping-list">
    <b-list-group>
      <b-list-group-item  v-for="(value, key) in getColorScheme" :key="'color' + key"
        @mouseover="setHoveredAttribute(key)"
        @mouseleave="setHoveredAttribute('')">
        <svg width="20" height="20">
          <circle
            cx="10"
            cy="10"
            r="7"
            fill="none"
            stroke-width="5"
            :stroke="value ? value : 'black'"
          />
        </svg>
        {{ key }}
        <span v-if="comparisonVariableIsNumerical">
          {{ getNumericalComparisonVariableThreshold }}
        </span>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script lang="ts">
import { NumericalVariable } from '@/models/NumericalVariable';
import { Getters } from '@/store/getters';
import { Mutations } from '@/store/mutations';
import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';

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

  methods: {
    ...mapMutations({
      setHoveredAttribute: Mutations.SET_HOVERED_ATTRIBUTE,
    }),
  },
});
</script>
<style lang="scss" scoped>
@import '@/style/custom.scss';

.list-group{
    max-height: 93%;
    overflow-y: auto;
}
.list-group-item {
  padding: 1px;
  font-size: 12px;
}

.list-group-item:hover {
  background-color: $hover-non-clickable;
}

#category-color-mapping-list {
  height: 100%;
}
</style>
