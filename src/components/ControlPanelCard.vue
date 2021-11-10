<template>
  <b-card
      class="h-50"
      title="Control Panel">
      <control-panel />
    </b-card>
</template>

<script lang="ts">
import Vue from 'vue';
import ControlPanel from './ControlPanel.vue';

export default Vue.extend({
  components: { ControlPanel },

});
</script>
