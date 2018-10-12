<template>
  <div>
    <ul class="tabs">
      <router-link tag="li" class="tab" :to="{name:'Setting.inventory'}">{{$t('inventory.title.dashboard')}}</router-link>
      <router-link tag="li" class="tab" :to="{name:'Setting.inventory.product'}">{{$t('inventory.title.product')}}</router-link>
      <router-link tag="li" class="tab" :to="{name:'Setting.inventory.order'}">{{$t('inventory.title.order')}}</router-link>
    </ul>
    <transition name="slide" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {}
};
</script>