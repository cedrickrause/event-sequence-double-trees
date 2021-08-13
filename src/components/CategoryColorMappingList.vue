<template>
  <div>
    <b-list-group>
      <b-list-group-item  v-for="(value, key) in getColorScheme" :key="'color' + key">
        {{ key }}
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
import { Getters } from '@/store/getters';
import Vue from 'vue';
import { mapGetters } from 'vuex';

export default Vue.extend({

  computed: {
    ...mapGetters({
      getColorScheme: Getters.GET_COLOR_SCHEME,
    }),
  },
});
</script>
