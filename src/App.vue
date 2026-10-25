<template>
  <div>
    <router-view />
    <LockScreen v-if="!isUnlocked" />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import LockScreen from "components/LockScreen.vue";

export default defineComponent({
  name: "App",
  components: { LockScreen },
  computed: {
    ...mapGetters("tindasense", ["isUnlocked"]),
  },
});
</script>
