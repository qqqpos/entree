<template>
    <div>
        <header class="nav">
          <div class="back" @click="save">
              <i class="fa fa-chevron-left"></i>
          </div>
          <nav></nav>
        </header>
        <toggle title="setting.callerId" v-model="callid.enable"></toggle>
        <text-list title="text.port" v-model="callid.port" :opts="ports"></text-list>
        <text-list title="text.command" v-model="callid.command" :opts="commands"></text-list>
        <toggle title="setting.saveLog" tooltip="tip.saveCallLog" v-model="callid.save"></toggle>
      </div>
</template>

<script>
import toggle from "../../common/toggle";
import textList from "../../common/textList";

export default {
  components: { toggle, textList },
  data() {
    return {
      callid: Object.assign({}, this.$store.getters.station.callid),
      ports: Array(10)
        .fill("COM")
        .map((p, i) => p + (i + 1))
        .map(port => ({
          label: port,
          tooltip: "",
          plainText: true,
          value: port
        })),
      commands: ["AT#CID=1", "AT+VCID=1", "AT%CCID=1"].map(command => ({
        label: command,
        tooltip: "",
        plainText: true,
        value: command
      }))
    };
  },
  methods: {
    save() {
      this.$socket.emit("[STATION] UPDATE", {
        _id: this.$store.getters.station._id,
        key: "callid",
        value: this.callid
      });
      this.$router.push({ name: "Setting.station" });
    }
  }
};
</script>