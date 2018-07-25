<template>
  <div>
    <ul class="tabs">
      <router-link tag="li" class="tab" :to="{name:'Setting.sales.giftcard'}">{{$t('nav.overview')}}</router-link>
      <router-link tag="li" class="tab" :to="{name:'Setting.sales.giftcard.list'}">{{$t('nav.list')}}</router-link>
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