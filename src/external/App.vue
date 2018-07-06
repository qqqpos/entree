<template>
  <div id="app">
      <background :gallery="gallery" :duration="duration"></background>
      <router-view :order="order"></router-view>
  </div>
</template>

<script>
import background from "./helper/background";

export default {
  components: { background },
  data() {
    return {
      stage: "index",
      duration: 5000,
      gallery: [],
      order: {}
    };
  },
  created() {
    this.$electron.ipcRenderer.on(
      "External::config",
      (e, { gallery, duration }) => {
        this.gallery = gallery;
        this.duration = Math.trunc(duration * 1000);
      }
    );

    this.$electron.ipcRenderer.on("External::stage", (e, stage) => {
      this.stage = stage;

      if (stage !== "order") {
        this.order = {};
      }
    });

    this.$electron.ipcRenderer.on("External::update", (e, order) => {
      this.order = order;
    });
  },
  methods: {
    updateStage(name) {
      name === "order"
        ? this.$router.push({ name })
        : this.$router.push({ name: "index" });
    }
  },
  watch: {
    stage: "updateStage"
  }
};
</script>

<style>
@import url(./assets/css/style.css);
</style>