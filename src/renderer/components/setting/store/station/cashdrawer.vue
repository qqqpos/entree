<template>
  <div>
    <header class="nav">
      <div class="back" @click="$router.push({ name: 'Setting.station' })">
        <i class="fa fa-chevron-left"></i>
      </div>
      <nav></nav>
    </header>
    <toggle title="text.cashDrawer" true-tooltip="tip.enableCashdrawer" false-tooltip="tip.disableCashdrawer" :conditionalTooltip="true" v-model="cashDrawer.enable">
      <transition name="dropdown">
        <div class="opt" v-if="cashDrawer.enable">
          <inputer title="text.alias" v-model="cashDrawer.name"></inputer>
        </div>
      </transition>
    </toggle>
    <text-list title="text.binding" v-model="cashDrawer.bind" :opts="printers"></text-list>
    <toggle title="setting.cashFlowRecord" v-model="cashDrawer.cashFlowCtrl">
      <transition name="dropdown">
        <div v-if="cashDrawer.cashFlowCtrl" class="opt">
          <inputer title="text.initialAmount" v-model.number="cashDrawer.initialAmount"></inputer>
        </div>
      </transition>
    </toggle>
  </div>
</template>

<script>
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import textList from "../../common/textList";

export default {
  components: { toggle, inputer, textList },
  data() {
    return {
      cashDrawer: Object.assign({}, this.$store.getters.station.cashDrawer),
      printers: Object.keys(this.$store.getters.config.printers).map(name => ({
        label: name,
        tooltip: "",
        plainText: true,
        value: name
      }))
    };
  },
  beforeDestroy() {
    let value = this.cashDrawer;
    if (value.enable) {
      value.name =
        value.name ||
        "cashDrawer_" +
          Math.random()
            .toString(36)
            .substring(4, 6);
    }

    this.$socket.emit("[STATION] UPDATE", {
      _id: this.$store.getters.station._id,
      key: "cashDrawer",
      value
    });
  }
};
</script>