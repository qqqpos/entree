<template>
  <div>
    <ul class="tabs">
      <router-link tag="li" class="tab" :to="{name:'Setting.inventory'}">{{$t('inventory.title.dashboard')}}</router-link>
      <router-link tag="li" class="tab" :to="{name:'Setting.inventory.product'}">{{$t('inventory.title.product')}}</router-link>
      <router-link tag="li" class="tab" :to="{name:'Setting.inventory.order'}">{{$t('inventory.title.order')}}</router-link>
    </ul>
    <router-view></router-view>
  </div>
</template>