<template>
    <div id="control-panel">
      <comparison-variable-selection />
      <query-builder />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import ComparisonVariableSelection from './ComparisonVariableSelection.vue';
import QueryBuilder from './QueryBuilder.vue';

export default Vue.extend({
  components: { QueryBuilder, ComparisonVariableSelection },
});
</script>

<style lang="scss" scoped>
#control-panel {
  text-align: left;
}
</style>
