<template>
  <div>
    <ul class="tabs">
      <router-link tag="li" class="tab" :to="{name:'Setting.operator'}">{{$t('title.operators')}}</router-link>
      <template v-if="operator">
        <router-link tag="li" class="tab" :to="{name:'Setting.operator.config',params:{operator}}">{{$t('setting.basic')}}</router-link>
        <router-link tag="li" class="tab" :to="{name:'Setting.operator.timecard',params:{operator}}">{{$t('setting.timecard')}}</router-link>
        <router-link tag="li" class="tab" :to="{name:'Setting.operator.schedule',params:{operator}}">{{$t('nav.schedule')}}</router-link>
      </template>
    </ul>
    <transition name="slide" mode="out-in">
      <router-view class="tab-content" @set="setOperator"></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      operator: null
    };
  },
  methods: {
    setOperator(operator) {
      this.operator = operator;
      this.$router.push({
        name: "Setting.operator.config",
        params: { operator }
      });
    }
  }
};
</script>