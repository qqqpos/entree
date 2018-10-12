<template>
    <div>
        <div class="tab-content">
            <header class="nav">
                <h3 class="title">{{$t('setting.title.plugin')}}</h3>
            </header>            
            <toggle title="setting.inventoryControl" v-model="plugin.inventoryControl"></toggle>
        </div>
    </div>
</template>

<script>
import toggle from "../common/toggle";

export default {
  components: { toggle },
  data() {
    return {
      plugin: {
        inventoryControl: false
      }
    };
  },
  created() {
    Object.assign(this.plugin, this.$store.getters.config.plugin);
  },
  beforeDestroy() {
    this.$socket.emit("[CONFIG] UPDATE", {
      key: "plugin",
      value: this.plugin
    });
  }
};
</script>

