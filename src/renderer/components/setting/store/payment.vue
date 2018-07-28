<template>
  <div>
    <div class="tab-content">
    <header class="nav">
      <h3 class="title">{{$t('setting.payment')}}</h3>
    </header>
    <external title="setting.tax" tooltip="tip.tax" @open="$router.push({ name: 'Setting.store.tax' })"></external>
    <external title="setting.delivery.config" tooltip="tip.delivery.setting" @open="$router.push({ name: 'Setting.store.delivery' })"></external>
    <external title="setting.default.setValue" @open="$router.push({ name: 'Setting.store.defaults' })"></external>
    <toggle title="setting.autoSaveCreditCard" v-model="store.autoSaveCard" v-show="authorized" @update="updateAutoSave"></toggle>
    <text-list title="setting.rounding" tooltip="tip.rounding.tooltip" :opts="roundingOption" v-model="store.rounding" @update="updateRounding"></text-list>
    <toggle title="setting.tipSuggestion" tooltip="tip.tipSuggestion" v-model="store.tipSuggestion.enable" @update="updateTipSuggestion">
      <transition name="dropdown">
        <div v-if="store.tipSuggestion.enable" class="fees">
          <label>{{$t('text.tipPercentage')}}</label>
          <input type="text" v-model="store.tipSuggestion.percentages" maxlength="10" placeholder="15,18,20" @blur="updateTipPercentages">
        </div>
      </transition>
    </toggle>
    <options title="setting.receiptDialog" tooltip="tip.receiptDefaultAction" v-model="store.receipt" :opts="receiptOption" @update="updateReceipt"></options>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import toggle from "../common/toggle";
import inputer from "../common/inputer";
import options from "../common/options";
import external from "../common/external";
import textList from "../common/textList";
import textInput from "../common/textInput";

export default {
  components: { options, toggle, inputer, textInput, textList, external },
  computed: {
    ...mapGetters(["tax", "config", "authorized"])
  },
  data() {
    return {
      store: null,
      receiptOption: [
        {
          label: "text.prompt",
          tooltip: "tip.alwaysAskReceipt",
          value: "prompt"
        },
        {
          label: "text.never",
          tooltip: "tip.doNotPrintReceipt",
          value: "never"
        },
        {
          label: "text.always",
          tooltip: "tip.alwaysPrintReceipt",
          value: "always"
        }
      ],
      roundingOption: [
        {
          label: "text.noRounding",
          tooltip: "tip.rounding.disable",
          value: "disable"
        },
        {
          label: "text.autoSelect",
          tooltip: "tip.rounding.auto",
          value: "auto"
        },
        {
          label: "text.roundToQuarter",
          tooltip: "tip.rounding.quarter",
          value: "quarter"
        },
        {
          label: "text.alwaysRoundUp",
          tooltip: "tip.rounding.up",
          value: "roundUp"
        },
        {
          label: "text.alwaysRoundDown",
          tooltip: "tip.rounding.down",
          value: "roundDown"
        }
      ]
    };
  },
  created() {
    //patch
    this.store = Object.assign({}, this.config.store);
    // !this.store.hasOwnProperty("tipSuggestion") &&
    //   Object.assign(this.store, {
    //     tipSuggestion: {
    //       enable: false,
    //       percentages: "15,18,20"
    //     }
    //   });
  },
  methods: {
    update(data) {
      this.$socket.emit("[CONFIG] UPDATE", data);
    },
    updateTipSuggestion(value) {
      this.update({
        key: "store.tipSuggestion.enable",
        value
      });
    },
    updateTipPercentages() {
      const value = this.store.tipSuggestion.percentages || "15,18,20";
      if (value.split(",").length === 3) {
        this.update({
          key: "store.tipSuggestion.percentages",
          value
        });
      }
    },
    updateReceipt(value) {
      this.update({
        key: "store.receipt",
        value
      });
    },
    updateRounding(value) {
      this.update({
        key: "store.rounding",
        value
      });
    },
    updatePaymentType(value) {
      this.update({
        key: "store.defaultPaymentType",
        value
      });
    },
    updateDiscountType(value) {
      this.update({
        key: "store.defaultDiscountUnit",
        value
      });
    },
    updateAutoSave(value) {
      this.update({
        key: "store.autoSaveCard",
        value
      });
    }
  }
};
</script>