<template>
  <div>
    <ul class="tabs">
      <router-link tag="li" class="tab" :to="{name:'Setting.printer'}">{{$t('text.printer')}}</router-link>
      <template v-if="printer">
        <router-link tag="li" class="tab" :to="{name:'Setting.printer.config',params:{printer}}">{{$t('setting.basic')}}</router-link>
        <router-link tag="li" class="tab" :to="{name:'Setting.printer.style',params:{printer}}">{{$t('setting.style')}}</router-link>
        <router-link tag="li" class="tab" :to="{name:'Setting.printer.preview',params:{printer}}">{{$t('setting.preview')}}</router-link>
      </template>
    </ul>
    <transition name="slide" mode="out-in">
      <router-view class="tab-content" @click="setPrinter"></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      printer: ""
    };
  },
  methods: {
    setPrinter(name) {
      this.printer = name;
      this.$router.push({
        name: "Setting.printer.config",
        params: { printer: name }
      });
    }
  }
};
</script>