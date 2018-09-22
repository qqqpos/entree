<template>
  <div>
    <div class="tab-content">
      <header class="nav">
      <div class="back" @click="$router.push({ name: 'Setting.payment' })">
        <i class="fa fa-chevron-left"></i>
      </div>
      <div class="title">{{$t('setting.default.setValue')}}</div>
    </header>
    <text-list title="setting.default.paymentType" :opts="paymentTypes" v-model="defaults.paymentType"></text-list>
    <toggle title="setting.default.discount" v-model="defaults.percentageDiscount" trueTooltip="tip.default.percentageDiscount" falseTooltip="tip.default.dollarDiscount" :conditionalTooltip="true"></toggle>
    <toggle title="setting.default.tip" v-model="defaults.percentageTip" trueTooltip="tip.default.percentageTip" falseTooltip="tip.default.dollarTip" :conditionalTooltip="true"></toggle>
    <toggle title="setting.default.instantPay" v-model="defaults.instantPay" trueTooltip="tip.default.instantProcess" falseTooltip="tip.default.defaultProcess" :conditionalTooltip="true"></toggle>
    <toggle title="setting.autoSaveCreditCard" v-model="defaults.autoSaveCard"></toggle>
    <toggle title="setting.default.printedWhenPaid" v-model="defaults.markPrintWhenSettled"></toggle>
    <toggle title="setting.default.allowNoPrint" v-model="defaults.allowNoPrint"></toggle>
    <toggle title="setting.default.findPaymentByCreateTime" v-model="defaults.findPaymentByCreate"></toggle>
    <text-list title="setting.default.button" :opts="buttonOpts" v-model="defaults.btn"></text-list>
    </div>
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
      ],
      buttonOpts: [
        {
          label: "text.discount",
          tooltip: "",
          value: "DISCOUNT"
        },
        {
          label: "text.gratuity",
          tooltip: "",
          value: "GRATUITY"
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
      matchItemQty: false,
      printedWhenPaid: false,
      allowNoPrint: false
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