<template>
  <div>
    <ul class="tabs">
      <router-link tag="li" class="tab" :to="{name:'Setting.submenu'}">{{$t('nav.list')}}</router-link>
      <router-link tag="li" class="tab" :to="{name:'Setting.submenu.item'}" :class="{disable:!group}">{{$t('nav.item')}}</router-link>
    </ul>
    <transition name="slide" mode="out-in">
      <router-view class="tab-content" :group="group" @set="setSubmenu" @reset="resetSubmenu"></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      group: null
    };
  },
  methods: {
    setSubmenu(group) {
      this.group = group;
      this.$router.push({ name: "Setting.submenu.item" });
    },
    resetSubmenu() {
      this.group = null;
      this.$router.push({ name: "Setting.submenu" });
    }
  }
};
</script>