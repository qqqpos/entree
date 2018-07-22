<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import store from "./vuex/store";

export default {
  store,
  computed: {
    ...mapGetters(["op"])
  },
  mounted() {
    window.addEventListener("click", this.record, false);
    window.addEventListener("online", this.online, false);
    window.addEventListener("offline", this.offline, false);
  },
  methods: {
    record() {
      this.setApp({ lastActivity: new Date().getTime() });
    },
    online() {
      this.setDevice({ online: true });
    },
    offline() {
      this.setDevice({ online: true });
    },
    ...mapActions(["setApp", "setDevice"])
  }
};
</script>

<style>
@import url(./assets/css/icon.css);
@import url(./assets/css/style.css);
@import url(./assets/css/setting.css);
@import url(./assets/css/animation.css);
@import url(./assets/fontAwesome/css/all.css);
@import url(./assets/css/wide.css);
</style>
