<template>
    <div id="control-panel">
      <central-event-type-selection />
      <absolute-time-switch />
      <comparison-variable-selection />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AbsoluteTimeSwitch from './AbsoluteTimeSwitch.vue';
import CentralEventTypeSelection from './CentralEventTypeSelection.vue';
import ComparisonVariableSelection from './ComparisonVariableSelection.vue';

export default Vue.extend({
  components: {
    ComparisonVariableSelection,
    CentralEventTypeSelection,
    AbsoluteTimeSwitch,
  },

});
</script>

<style lang="scss" scoped>
#control-panel {
  text-align: left;
  height: 100%;
}
</style>
