<template>
    <div>
        <div class="tab-content">
          <header class="nav">
            <div class="back" @click="save">
                <i class="fa fa-chevron-left"></i>
            </div>
            <nav>
              <span class="mini-btn" @click="addDevice" v-show="callerID.devices.length < 3">{{$t('button.new')}}</span>
            </nav>
          </header>
          <toggle title="setting.callerId" v-model="callerID.enable"></toggle>
          <toggle title="setting.autoForward" v-model="callerID.autoForward"></toggle>
          <div class="device-list">
            <div v-for="(device,index) in callerID.devices" :key="index" class="device relative">
                <i class="fa fa-times" @click="remove(index)"></i>
                <inputer title="text.alias" v-model="device.line"></inputer>
                <selector title="text.port" v-model="device.port" :opts="ports"></selector>
                <selector title="text.command" v-model="device.command" :opts="commands"></selector>
                <selector title="text.forward" v-model="device.forward" :opts="targets" v-show="callerID.autoForward"></selector>
            </div>
          </div>
        </div>
    </div>
</template>

<script>
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import selector from "../../common/selector";

export default {
  components: { toggle, inputer, selector },
  data() {
    return {
      callerID: {},
      ports: Array(15)
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
      })),
      targets: [
        {
          label: this.$t("tip.noForward"),
          tooltip: "",
          value: ""
        }
      ]
    };
  },
  created() {
    const {
      callerID = {
        enable: false,
        devices: []
      }
    } = this.$store.getters.station;

    this.callerID = callerID;

    this.$socket.emit("[STATIONS] NAME", list => {
      list.map(station =>
        this.targets.push({
          label: this.$t("tip.forwardToStation", station.alias),
          tooltip: "",
          value: station.alias
        })
      );
    });
  },
  methods: {
    addDevice() {
      this.callerID.devices.push({
        line: `Line ${this.callerID.devices.length + 1}`,
        port: "",
        command: "",
        forward: ""
      });
    },
    remove(index) {
      this.callerID.devices.splice(index, 1);
    },
    save() {
      this.$socket.emit("[STATION] UPDATE", {
        _id: this.$store.getters.station._id,
        key: "callerID",
        value: this.callerID
      });
      this.$router.push({ name: "Setting.station.device" });
    }
  }
};
</script>

<style scoped>
.new {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4px;
  border: 1px solid #eee;
  margin: 4px;
}

.device {
  padding: 25px 45px 5px;
  margin-bottom: 4px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.device-list {
  margin: 5px;
  padding-bottom: 1px;
}

.fa-times {
  position: absolute;
  right: 0px;
  top: 0;
  padding: 10px 15px;
  cursor: pointer;
}
</style>