<template>
  <div class="tab-content">
    <header class="nav">
      <div class="title">{{$t('setting.default.orderLogic')}}</div>
    </header>
    <toggle title="setting.default.autoStack" tooltip="tip.default.autoStackItemQty" v-model="defaults.autoStackItem"></toggle>
    <toggle title="setting.default.matchQty" tooltip="tip.default.matchItemQty" v-model="defaults.matchItemQty"></toggle>
  </div>
</template>

<script>
import toggle from "../common/toggle";
import textList from "../common/textList";

export default {
  components: { toggle, textList },
  data() {
    return {
      defaults: {}
    };
  },
  created() {
    //hot patch
    const defaults = {
      paymentType: "CASH",
      percentageDiscount: true,
      percentageTip: true,
      autoStackItem: false,
      matchItemQty: false
    };

    this.defaults = this.$store.getters.config.defaults || defaults;
  },
  beforeRouteLeave(to, from, next) {
    this.$socket.emit("[CONFIG] UPDATE", {
      key: "defaults",
      value: this.defaults
    });

    next();
  }
};
</script>