<template>
    <div>
        <div class="tab-content">
            <header class="nav">
                <h3 class="title">{{$t('setting.rewardProgram')}}</h3>
            </header>
            <toggle title="text.enable" v-model="reward.enable"></toggle>
            <toggle title="setting.reward.beforeTax" v-model="reward.beforeTax"></toggle>
            <text-list title="setting.reward.unit" tooltip="tip.reward.unit" :opts="units" v-model="reward.unit"></text-list>
        </div>
    </div>
</template>

<script>
import editor from "./editor/reward";
import toggle from "../common/toggle";
import textList from "../common/textList";

export default {
  components: { editor, toggle, textList },
  data() {
    return {
      reward: {},
      units: [
        {
          label: "setting.reward.eachPenny",
          tooltip: "tip.reward.pennyEachPoint",
          value: "PENNY"
        },
        {
          label: "setting.reward.eachDollar",
          tooltip: "tip.reward.dollarEachPoint",
          value: "DOLLAR"
        }
      ]
    };
  },
  created() {
    const {
      reward = {
        enable: false,
        beforeTax: false,
        unit: "PENNY"
      }
    } = this.$store.getters.config.store;

    this.reward = reward;
  },
  beforeDestroy() {
    this.$socket.emit("[CONFIG] UPDATE", {
      key: "store.reward",
      value: this.reward
    });
  },
  methods: {}
};
</script>

