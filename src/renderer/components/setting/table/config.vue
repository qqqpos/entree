<template>
  <div>
    <div class="tab-content">
      <header class="nav">
        <h3 class="title">{{$t('setting.title.table')}}</h3>
      </header>
      <toggle title="setting.table" true-tooltip="tip.dinein.useTableLayout" false-tooltip="tip.dinein.noTableLayout" v-model="dineInOpt.useTable" :conditionalTooltip="true"></toggle>
      <toggle title="setting.passwordRequire" tooltip="tip.dinein.passwordRequire" v-model="dineInOpt.passwordRequire"></toggle>
      <toggle title="setting.guestCount" v-model="dineInOpt.guestCount"></toggle>
      <toggle title="setting.seatOrder" v-model="dineInOpt.seatOrder" :disabled="!dineInOpt.guestCount"></toggle>
      <toggle title="setting.printOnDone" true-tooltip="tip.dinein.printReceipt" false-tooltip="tip.dinein.noReceipt" v-model="dineInOpt.printOnDone" :conditionalTooltip="true"></toggle>
      <toggle title="setting.lockOnDone" tooltip="tip.dinein.lock" v-model="dineInOpt.lockOnDone"></toggle>
      <toggle title="setting.autoClear" true-tooltip="tip.dinein.autoClearTable" false-tooltip="tip.dinein.manuallyClearTable" v-model="dineInOpt.autoClear" :conditionalTooltip="true"></toggle>
      <external title="setting.surcharge" tooltip="tip.dinein.surcharge" @open="$router.push({name:'Setting.table.surcharge'})"></external>
    </div>
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
    this.dineInOpt = Object.assign({}, this.$store.getters.dineInOpt);
  },
  beforeDestroy() {
    this.$socket.emit("[CONFIG] UPDATE", {
      key: "dinein",
      value: this.dineInOpt
    });
  }
};
</script>