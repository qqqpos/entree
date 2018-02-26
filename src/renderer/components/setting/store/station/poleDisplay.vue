<template>
    <div>
        <header class="nav">
          <div class="back" @click="save">
              <i class="fa fa-chevron-left"></i>
          </div>
          <nav></nav>
        </header>
        <toggle title="setting.poleDisplay" v-model="poleDisplay.enable">
          <transition name="dropdown">
            <div class="opt" v-if="poleDisplay.enable">
              <inputer title="text.firstLine" v-model="poleDisplay.top"></inputer>
              <inputer title="text.secondLine" v-model="poleDisplay.bot"></inputer>
            </div>
          </transition>
        </toggle>
        <text-list title="text.port" v-model="poleDisplay.port" :opts="ports"></text-list>
        <toggle title="setting.animation" tooltip="tip.poleDisplayAnimation" v-model="poleDisplay.animation" :disabled="true"></toggle>
      </div>
</template>

<script>
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import textList from "../../common/textList";
import textInput from "../../common/textInput";

export default {
  components: { toggle, inputer, textList, textInput },
  data() {
    return {
      poleDisplay: Object.assign({}, this.$store.getters.station.pole),
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
  methods: {
    save() {
      this.$socket.emit("[STATION] UPDATE", {
        _id: this.$store.getters.station._id,
        key: "pole",
        value: this.poleDisplay
      });
      this.$router.push({ name: "Setting.station" });
    }
  }
};
</script>