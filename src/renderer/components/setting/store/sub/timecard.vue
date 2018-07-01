<template>
    <div>
        <toggle title="text.enable" tooltip="tip.timecard.forAll" v-model="timecard.enable"></toggle>
        <toggle title="setting.timecard.tipReport" tooltip="tip.timecard.tipReport" v-model="timecard.tipReport"></toggle>
        <toggle title="setting.timecard.excludeBreak" v-model="timecard.excludeBreak"></toggle>
    </div>
</template>

<script>
import toggle from "../../common/toggle";

export default {
  components: { toggle },
  data() {
    return {
      timecard: {}
    };
  },
  created() {
    //patch timecard
    let { timecard } = this.$store.getters.store;

    if (isObject(timecard)) {
      this.timecard = timecard;
    } else {
      this.timecard = {
        enable: false,
        tipReport: false,
        excludeBreak: false
      };
    }
  },
  beforeDestroy() {
    this.$socket.emit("[CONFIG] UPDATE", {
      key: "store.timecard",
      value: this.timecard
    });
  }
};
</script>