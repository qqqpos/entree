<template>
  <div>
    <external title="setting.tax" tooltip="tip.tax" @open="editTax"></external>
    <external title="setting.delivery.config" tooltip="tip.delivery.setting" @open="editDelivery"></external>
    <text-list title="setting.rounding" tooltip="tip.rounding.tooltip" :opts="roundingOption" v-model="store.rounding" @update="updateRounding"></text-list>
    <text-list title="setting.defaultPaymentType" :opts="paymentTypes" v-model="store.defaultPaymentType" @update="updatePaymentType"></text-list>
    <toggle title="setting.tipSuggestion" tooltip="tip.tipSuggestion" v-model="store.tipSuggestion.enable" @update="updateTipSuggestion">
      <transition name="dropdown">
        <div v-if="store.tipSuggestion.enable" class="fees">
          <label>{{$t('text.tipPercentage')}}</label>
          <input type="text" v-model="store.tipSuggestion.percentages" v-mask="'##,##,##'" maxlength="10" placeholder="15,18,20" @blur="updateTipPercentages">
        </div>
      </transition>
    </toggle>
    <options title="setting.receiptDialog" tooltip="tip.receiptDefaultAction" v-model="store.receipt" :opts="receiptOption" @update="updateReceipt"></options>
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
    ...mapGetters(["config", "tax"])
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
      roundingOption: [{
        label: "text.noRounding",
        tooltip: "tip.rounding.disable",
        value: "disable"
      }, {
        label: 'text.autoSelect',
        tooltip: 'tip.rounding.auto',
        value: 'auto'
      }, {
        label: "text.roundToQuarter",
        tooltip: "tip.rounding.quarter",
        value: "quarter"
      }, {
        label: "text.alwaysRoundUp",
        tooltip: "tip.rounding.up",
        value: "roundUp"
      }, {
        label: "text.alwaysRoundDown",
        tooltip: "tip.rounding.down",
        value: "roundDown"
      }],
      paymentTypes: [{
        label: 'text.cash',
        tooltip: '',
        value: 'CASH'
      }, {
        label: 'text.creditCard',
        tooltip: '',
        value: 'CREDIT'
      }]
    };
  },
  created() {
    //patch
    this.store = Object.assign({}, this.config.store);
    !this.store.hasOwnProperty('tipSuggestion') && Object.assign(this.store, {
      tipSuggestion: {
        enable: false,
        percentages: "15,18,20"
      }
    })
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
      let value = this.store.tipPercentages || "15,18,20";
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
        key: 'store.rounding',
        value
      })
    },
    updatePaymentType(value) {
      this.update({
        key: 'store.defaultPaymentType',
        value
      })
    },
    editTax() {
      this.$router.push({ name: "Setting.store.tax" });
    },
    editDelivery() {
      this.$router.push({ name: 'Setting.store.delivery' });
    }
  }
};
</script>