<template>
  <div>
    <header class="nav">
      <div class="back" @click="$router.push({ name: 'Setting.store.payment' })">
        <i class="fa fa-chevron-left"></i>
      </div>
      <div class="title">{{$t('setting.default.setValue')}}</div>
    </header>
    <text-list title="setting.default.paymentType" :opts="paymentTypes" v-model="defaults.paymentType"></text-list>
    <toggle title="setting.default.discount" v-model="defaults.percentageDiscount" trueTooltip="tip.default.percentageDiscount" falseTooltip="tip.default.dollarDiscount" :conditionalTooltip="true"></toggle>
    <toggle title="setting.default.tip" v-model="defaults.percentageTip" trueTooltip="tip.default.percentageTip" falseTooltip="tip.default.dollarTip" :conditionalTooltip="true"></toggle>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import toggle from "../../common/toggle";
import textList from "../../common/textList";

export default {
  components: { toggle, textList },
  data() {
    return {
      component: null,
      componentData: null,
      defaults: {},
      paymentTypes: [
        {
          label: "text.cash",
          tooltip: "",
          value: "CASH"
        },
        {
          label: "text.creditCard",
          tooltip: "",
          value: "CREDIT"
        },
        {
          label: "text.thirdParty",
          tooltip: "",
          value: "THIRD"
        }
      ]
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