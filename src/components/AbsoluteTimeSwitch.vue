<template>
  <div class="d-flex">
  <label for="absolute-time-switch">Relative Time</label>
    <b-form-checkbox class="ml-2 mr-2"
      size="sm" v-model="absoluteTimeUsed" name="absolute-time-switch" switch>
      Absolute Time
    </b-form-checkbox>
    <span v-b-popover.hover="'Absolute time calculates the length of the temporal links relative '
     + 'to the longest sequence (comparing absolute time values), '
     + 'while relative time calculates it to the duration of the sequence the event occurs in '
     + '(comparing relative time values).'">
      🛈
    </span>
  </div>
</template>
<script lang="ts">
import { Getters } from '@/store/getters';
import { Mutations } from '@/store/mutations';
import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';

export default Vue.extend({

  computed: {
    ...mapGetters({
      getAbsoluteTimeUsed: Getters.GET_ABSOLUTE_TIME_USED,
    }),

    absoluteTimeUsed: {
      get(): string {
        return this.getAbsoluteTimeUsed;
      },
      set(absoluteTimeSwitch: boolean): void {
        this.setAbsoluteTimeUsed(absoluteTimeSwitch);
      },
    },
  },

  methods: {
    ...mapMutations({
      setAbsoluteTimeUsed: Mutations.SET_ABSOLUTE_TIME_USED,
    }),
  },
});
</script>
