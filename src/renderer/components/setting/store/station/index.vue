<template>
  <div>
    <text-input title="text.alias" v-model="station.alias" @update="updateAlias"></text-input>
    <text-input title="text.mac" v-model="station.mac" :disabled="true"></text-input>
    <text-input title="text.username" v-model="station.username" :disabled="true"></text-input>
    <toggle title="text.autoAwake" v-model="station.wol" @update="updateAwake"></toggle>
    <external title="setting.cashDrawer" @open="$router.push({ name: 'Setting.station.cashdrawer'})"></external>
    <text-list title="setting.receiptPrinter" v-model="station.receipt" :opts="printers" @update="updateReceipt"></text-list>
    <external title="setting.printerGroup" @open="$router.push({name:'Setting.station.printers'})" :tooltip="$t('text.stationPrinters',station.printers.length)"></external>
    <text-list title="setting.terminal" v-model="station.terminal" :opts="terminals" @update="updateTerminal"></text-list>
    <external title="setting.callerId" @open="$router.push({name:'Setting.station.callid'})"></external>
    <external title="setting.poleDisplay" tooltip="tip.poleDisplay" @open="$router.push({name:'Setting.station.poleDisplay'})"></external>
    <external title="setting.weightScale" @open="editScale"></external>
    <toggle title="setting.autoLock" tooltip="tip.autoLock" v-model="station.autoLock.enable" @update="updateAutoLock">
      <transition name="dropdown">
        <div v-if="station.autoLock.enable" class="opt">
          <range title="setting.timeout" :min="0" :max="600" :step="30" v-model.number="station.autoLock.timeout" @update="updateTimeout"></range>
          <switches title="text.doneLock" v-model="station.autoLock.done" @update="updateDoneLock"></switches>
        </div>
      </transition>
    </toggle>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import range from "../../common/range";
import toggle from "../../common/toggle";
import external from "../../common/external";
import switches from "../../common/switches";
import textList from "../../common/textList";
import textInput from "../../common/textInput";

export default {
  components: { range, toggle, textInput, textList, external, switches },
  data() {
    return {
      station: null,
      terminals: [],
      printers: []
    };
  },
  created() {
    this.station = Object.assign({}, this.$store.getters.station);
    this.$socket.emit("[TERMINAL] DEVICE", data => {
      this.terminals = data.map(terminal => ({
        label: `${terminal.alias} (${terminal.model})`,
        tooltip: `${terminal.ip} - ${terminal.location}`,
        plainText: true,
        value: terminal.alias
      }));
      this.terminals.unshift({
        label: this.$t("text.disable"),
        tooltip: "",
        plainText: true,
        value: ""
      });
    });
    this.printers = Object.keys(this.$store.getters.config.printers).map(
      name => ({
        label: name,
        tooltip: "",
        plainText: true,
        value: name
      })
    );
  },
  methods: {
    update(data) {
      Object.assign(data, { _id: this.station._id });
      this.$socket.emit("[STATION] UPDATE", data);
    },
    updateAlias(value) {
      this.update({
        key: "alias",
        value
      });
    },
    updateAwake(value) {
      this.update({
        key: "wol",
        value
      });
    },
    updateReceipt(value) {
      this.update({
        key: "receipt",
        value
      });
    },
    updateTerminal(value) {
      this.update({
        key: "terminal",
        value
      });
    },
    editScale() { },
    updateAutoLock(value) {
      if (!value) {
        this.station.autoLock.timeout = 0;
        this.station.autoLock.done = false;
        this.setApp({ autoLock: false });
        this.update({
          key: "autoLock",
          value: this.station.autoLock
        })
      } else {
        this.update({
          key: "autoLock.enable",
          value
        });
      }

    },
    updateTimeout(value) {
      value = parseInt(value);
      value === 0
        ? this.setApp({ autoLock: false })
        : this.setApp({ autoLock: true, lastActivity: +new Date() });

      this.update({
        key: "autoLock.timeout",
        value
      });
    },
    updateDoneLock(value) {
      this.update({
        key: "autoLock.done",
        value
      });
    },
    ...mapActions(["setApp"])
  }
};
</script>