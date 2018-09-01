<template>
  <div>
      <div class="tab-content">
          <header class="nav">
            <div class="back" @click="$router.push({ name: 'Setting.station.device' })">
                <i class="fa fa-chevron-left"></i>
            </div>
            <h3 class="title">
              {{$t('setting.title.customerDisplay')}}
            </h3>
          </header>
          <toggle title="setting.poleDisplay" v-model="customerDisplay.poleDisplay.enable">
            <transition name="dropdown">
              <div class="opt" v-if="customerDisplay.poleDisplay.enable">
                <inputer title="text.firstLine" v-model="customerDisplay.poleDisplay.top"></inputer>
                <inputer title="text.secondLine" v-model="customerDisplay.poleDisplay.bot"></inputer>
                <text-list title="text.port" v-model="customerDisplay.poleDisplay.port" :opts="ports"></text-list>
                <toggle title="setting.animation" tooltip="tip.poleDisplayAnimation" v-model="customerDisplay.poleDisplay.animation" :disabled="true"></toggle>
              </div>
            </transition>
          </toggle>
          <toggle title="setting.ledDisplay" v-model="customerDisplay.ledDisplay.enable">
            <transition name="dropdown">
              <div class="opt" v-if="customerDisplay.ledDisplay.enable">
                <range title="setting.playDuration" :min="5" :max="30" :step="1" v-model.number="customerDisplay.ledDisplay.duration"></range>
                <external title="text.gallery" @open="showDialog" :tooltip="customerDisplay.ledDisplay.gallery"></external>
              </div>
            </transition>
          </toggle>
        </div>
  </div>
</template>

<script>
import range from "../../common/range";
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import external from "../../common/external";
import textList from "../../common/textList";
import textInput from "../../common/textInput";

export default {
  components: { range, toggle, inputer, external, textList, textInput },
  data() {
    return {
      customerDisplay: {},
      ports: Array(10)
        .fill("COM")
        .map((p, i) => p + (i + 1))
        .map(port => ({
          label: port,
          tooltip: "",
          plainText: true,
          value: port
        }))
    };
  },
  created() {
    //path config
    if (!this.$store.getters.station.hasOwnProperty("customerDisplay")) {
      this.customerDisplay = {
        poleDisplay: {
          enable: false,
          top: "",
          bot: "",
          port: "",
          animation: false
        },
        ledDisplay: {
          enable: false,
          gallery: "",
          duration: 5
        }
      };
    } else {
      this.customerDisplay = Object.assign(
        {},
        this.$store.getters.station.customerDisplay
      );
    }
  },
  beforeDestroy() {
    const { gallery, duration } = this.customerDisplay.ledDisplay;
    this.$electron.ipcRenderer.send("External::config", { gallery, duration });

    this.$socket.emit("[STATION] UPDATE", {
      _id: this.$store.getters.station._id,
      key: "customerDisplay",
      value: this.customerDisplay
    });
  },
  methods: {
    showDialog() {
      const { dialog } = this.$electron.remote;

      const directory = dialog.showOpenDialog({
        properties: ["openFile", "openDirectory"]
      });

      Object.assign(this.customerDisplay.ledDisplay, { gallery: directory[0] });
    }
  }
};
</script>