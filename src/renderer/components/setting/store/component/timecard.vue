<template>
    <div>
      <div class="tab-content">
        <header class="nav">
          <div class="back" @click="$router.push({ name: 'Setting.store.others'})">
            <i class="fa fa-chevron-left"></i>
          </div>
          <h3 class="title">{{$t('setting.title.timecard')}}</h3>
        </header>
        <toggle title="text.enable" tooltip="tip.timecard.forAll" v-model="timecard.enable"></toggle>
        <toggle title="setting.timecard.tipReport" tooltip="tip.timecard.tipReport" v-model="timecard.tipReport"></toggle>
        <toggle title="setting.timecard.excludeBreak" v-model="timecard.excludeBreak"></toggle>
      </div>
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