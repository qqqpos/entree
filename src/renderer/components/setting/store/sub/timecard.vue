<template>
    <div>
        <toggle title="text.enable" tooltip="tip.timecard.forAll" v-model="timecard.enable"></toggle>
        <toggle title="setting.timecard.tipReport" tooltip="tip.timecard.tipReport" v-model="timecard.tipReport" :disabled="!timecard.enable"></toggle>
        <toggle title="setting.timecard.excludeBreak" v-model="timecard.excludeBreak"></toggle>
        <toggle title="setting.timecard.valid" v-model="timecard.valid"></toggle>
        <toggle title="setting.timecard.isoWeek" v-model="timecard.isoWeek" :tooltip="$t('tip.timecard.isoWeek')"></toggle>
    </div>
</template>

<script>
import toggle from "../../common/toggle";

export default {
  components: { toggle },
  data() {
    return {
      timecard: JSON.parse(JSON.stringify(this.$store.getters.store.timecard))
    };
  },
  beforeDestroy() {
    this.$socket.emit("[CONFIG] UPDATE", {
      key: "store.timecard",
      value: this.timecard
    });
  }
};
</script>