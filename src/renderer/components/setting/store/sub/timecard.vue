<template>
    <div>
        <toggle title="text.enable" tooltip="tip.timecard.forAll" v-model="store.timecard.enable" @update="updateTimecard"></toggle>
        <toggle title="setting.timecard.tipReport" tooltip="tip.timecard.tipReport" v-model="store.timecard.tipReport" @update="updateTipReport" :disabled="!store.timecard"></toggle>
        <toggle title="setting.timecard.excludeBreak" v-model="store.timecard.excludeBreak" @update="updateBreak"></toggle>
    </div>
</template>

<script>
import toggle from "../../common/toggle";

export default {
  components: { toggle },
  data() {
    return {
      store: JSON.parse(JSON.stringify(this.$store.getters.store))
    };
  },
  methods: {
    update(data) {
      this.$socket.emit("[CONFIG] UPDATE", data);
    },
    updateTimecard(value) {
      this.update({
        key: "store.timecard.enable",
        value
      });
    },
    updateTipReport(value) {
      this.update({
        key: "store.timecard.tipReport",
        value
      });
    },
    updateBreak(value) {
      this.update({
        key: "store.timecard.excludeBreak",
        value
      });
    }
  }
};
</script>