<template>
    <div id="control-panel">
      <central-event-type-selection />
      <comparison-variable-selection />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CentralEventTypeSelection from './CentralEventTypeSelection.vue';
import ComparisonVariableSelection from './ComparisonVariableSelection.vue';

export default Vue.extend({
  components: {
    ComparisonVariableSelection,
    CentralEventTypeSelection,
  },
});
</script>

<style lang="scss" scoped>
#control-panel {
  text-align: left;
  height: 100%;
}
</style>
