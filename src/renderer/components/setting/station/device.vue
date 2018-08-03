<template>
    <div>
        <div class="tab-content">
            <header class="nav">
              <h3 class="title">{{$t('setting.device')}}</h3>
            </header>          
            <external title="setting.cashDrawer" @open="$router.push({ name: 'Setting.station.cashdrawer'})" :tooltip="station.cashDrawer.enable ? 'text.enable':'text.disable'"></external>
            <text-list title="setting.terminal" v-model="station.terminal" :opts="terminals" @update="updateTerminal"></text-list>
            <text-list title="setting.receiptPrinter" v-model="station.receipt" :opts="printers" @update="updateReceipt"></text-list>
            <external title="setting.printerGroup" @open="$router.push({name:'Setting.station.printers'})" :tooltip="$t('text.stationPrinters',station.printers.length)"></external>
            <external title="setting.callerId" @open="$router.push({name:'Setting.station.callid'})" :tooltip="station.callerID.enable ? 'text.enable':'text.disable'"></external>
            <external title="setting.customerDisplay" @open="$router.push({name:'Setting.station.customerDisplay'})"></external>
            <external title="setting.weightScale" @open="editScale"></external>
        </div>
    </div>
</template>

<script>
import external from "../common/external";
import textList from "../common/textList";

export default {
  components: { textList, external },
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
    this.printers = Object.keys(this.$store.getters.config.printers)
      .filter(p => /cashier/i.test(p))
      .map(name => ({
        label: name,
        tooltip: "",
        plainText: true,
        value: name
      }));

    if (!this.station.callerID) {
      this.station.callerID = {
        enable: false,
        autoForward: false,
        devices: []
      };
    }
  },
  methods: {
    update(data) {
      Object.assign(data, { _id: this.station._id });
      this.$socket.emit("[STATION] UPDATE", data);
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
    editScale() {}
  }
};
</script>


