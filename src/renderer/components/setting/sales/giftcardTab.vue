<template>
  <div>
    <ul class="tabs">
      <router-link tag="li" class="tab" :to="{name:'Setting.store.giftcard'}">{{$t('nav.overview')}}</router-link>
      <template v-if="card">
        <router-link tag="li" class="tab" :to="{name:'Setting.printer.config',params:{printer}}">{{$t('setting.basic')}}</router-link>
      </template>
    </ul>
    <transition name="slide" mode="out-in">
      <router-view class="tab-content" @click="getGiftCard"></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      card: null
    };
  },
  methods: {
    getGiftCard() {
        
    }
  }
};
</script>

<style scoped>

</style>