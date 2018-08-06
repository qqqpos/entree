<template>
    <div>
        <div class="tab-content">
        <header class="nav">
            <div class="title">
                <h3>{{$t('setting.title.indexing')}}</h3>
            </div>
        </header>  
            <toggle title="text.enable" v-model="enable" @input="index" :disabled="true"></toggle>
        </div>
    </div>
</template>

<script>
import toggle from "../common/toggle";

export default {
  components: { toggle },
  data() {
    return {
      enable: false
    };
  },
  methods: {
    index() {
      console.log("toggle");
      this.$socket.emit("[INDEX] START");
    }
  }
};
</script>

<style scoped>
</style>


