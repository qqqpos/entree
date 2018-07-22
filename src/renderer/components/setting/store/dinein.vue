<template>
  <div>
    <toggle title="setting.table" true-tooltip="tip.dinein.useTableLayout" false-tooltip="tip.dinein.noTableLayout" v-model="dineInOpt.useTable" :conditionalTooltip="true" @update="updateTable"></toggle>
    <toggle title="setting.passwordRequire" tooltip="tip.dinein.passwordRequire" v-model="dineInOpt.passwordRequire" @update="updatePasswordRequire"></toggle>
    <toggle title="setting.guestCount" v-model="dineInOpt.guestCount" @update="updateGuestCount"></toggle>
    <toggle title="setting.seatOrder" v-model="dineInOpt.seatOrder" @update="updateSeatOrder" :disabled="!dineInOpt.guestCount"></toggle>
    <toggle title="setting.printOnDone" true-tooltip="tip.dinein.printReceipt" false-tooltip="tip.dinein.noReceipt" v-model="dineInOpt.printOnDone" :conditionalTooltip="true" @update="updatePrint"></toggle>
    <toggle title="setting.lockOnDone" tooltip="tip.dinein.lock" v-model="dineInOpt.lockOnDone" @update="updateDone"></toggle>
    <toggle title="setting.autoClear" true-tooltip="tip.dinein.autoClearTable" false-tooltip="tip.dinein.manuallyClearTable" v-model="dineInOpt.autoClear" :conditionalTooltip="true" @update="updateAutoClear"></toggle>
    <external title="setting.surcharge" tooltip="tip.dinein.surcharge" @open="$router.push({name:'Setting.store.surcharge'})"></external>
  </div>
</template>

<script>
import toggle from "../common/toggle";
import external from "../common/external";

export default { 
  components: { toggle, external },
  data() {
    return {
      dineInOpt: null
    };
  },
  created() {
    this.dineInOpt = Object.assign({}, this.$store.getters.dinein);
  },
  methods: {
    update(data) {
      this.$socket.emit("[CONFIG] UPDATE", data);
    },
    updateTable(value) {
      this.update({
        key: "dinein.useTable",
        value
      });
    },
    updateGuestCount(value) {
      this.update({
        key: "dinein.guestCount",
        value
      });
    },
    updateSeatOrder(value) {
      this.update({
        key: "dinein.seatOrder",
        value
      });
    },
    updateAutoClear(value) {
      this.update({
        key: "dinein.autoClear",
        value
      });
    },
    updatePrint(value) {
      this.update({
        key: "dinein.printOnDone",
        value
      });
    },
    updateDone(value) {
      this.update({
        key: "dinein.lockOnDone",
        value
      });
    },
    updatePasswordRequire(value) {
      this.update({
        key: "dinein.passwordRequire",
        value
      });
    }
  }
};
</script>