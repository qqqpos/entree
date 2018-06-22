<template>
  <div id="app">
    <transition>
      <router-view :config="currentPlayList" :order="order"></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      playlist: [],
      order: {},
      stage: "load"
    };
  },
  created() {
    this.$electron.ipcRenderer.on("External::playlist", (e, list) => {
      this.playlist = list;
    });

    this.$electron.ipcRenderer.on("External::stage", (e, stage) => {
      this.stage = stage;
    });

    this.$electron.ipcRenderer.on("External::update", (e, order) => {
      this.order = order;
    });
  },
  methods: {
    updateStage(name) {
      console.log("trigger stage", this.stage);
      this.$router.push({ name });
    }
  },
  watch: {
    stage: "updateStage"
  },
  computed: {
    currentPlayList() {
      return this.playlist.filter(config => config.stage === this.stage);
    }
  }
};
</script>

<style>
@import url(./assets/css/style.css);
</style>