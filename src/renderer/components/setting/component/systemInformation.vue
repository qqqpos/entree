<template>
    <div class="spec">
        <div class="item">
            <span class="name">{{$t('spec.version')}}:</span>
            <span class="value">{{app}} ({{stage}})</span>
        </div>
        <div class="item">
            <span class="name">{{$t('spec.core')}}:</span>
            <span class="value">{{node}}</span>
        </div>
        <div class="item">
            <span class="name">{{$t('spec.render')}}:</span>
            <span class="value">{{vue}}</span>
        </div>
        <div class="item">
            <span class="name">{{$t('spec.shell')}}:</span>
            <span class="value">{{electron}}</span>
        </div>
        <div class="item">
            <span class="name">{{$t('spec.engine')}}:</span>
            <span class="value">{{engine}}</span>
        </div>
        <div class="item">
            <span class="name">{{$t('spec.servo')}}:</span>
            <span class="value">{{about.host}}</span>
        </div>
    </div>
</template>

<script>
import config from "../../../../../package.json";

export default {
  data() {
    return {
      app: config.version,
      stage: config.stage,
      node: process.versions.node,
      platform: require("os").platform(),
      vue: require("vue/package.json").version,
      electron: process.versions.electron,
      engine: process.versions.v8,
      about: {}
    };
  },
  created() {
    this.$socket.emit("ABOUT", system => {
      this.about = system;
    });
  },
  methods: {}
};
</script>

<style scoped>
.spec {
  position: fixed;
  bottom: 0;
  left: 10px;
}

.item {
  display: flex;
  margin-bottom: 6px;
}

.item .name {
  color: #6a6a6a;
  margin-right: 6px;
}

.item .value {
  color: #35495e;
  font-weight: bold;
}
</style>