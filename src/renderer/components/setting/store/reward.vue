<template>
    <div>
        <div class="tab-content">
            <header class="nav">
                <h3 class="title">{{$t('setting.rewardProgram')}}</h3>
            </header>
            <toggle title="text.enable" v-model="reward.enable"></toggle>
            <toggle title="reward.beforeTax" v-model="reward.beforeTax" ></toggle>
            <toggle title="reward.redeemable" v-model="reward.redeemable"></toggle>
            <text-list title="reward.unit" tooltip="tip.reward.unit" :opts="units" v-model="reward.unit"></text-list>
            <div class="ratio">
              <label>{{$t('reward.ratio')}}</label>
              <div class="wrap">
                <input type="text" placeholder="1000 Points" v-model="point">
                <i class="fas fa-exchange-alt light"></i>
                <input type="text" placeholder="$ 1.00" v-model="value">
              </div>
            </div>
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
          label: "reward.eachPenny",
          tooltip: "tip.reward.pennyEachPoint",
          value: "PENNY"
        },
        {
          label: "reward.eachDollar",
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
        unit: "PENNY",
        perPoint: 1000,
        asValue: 1
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
  computed: {
    point: {
      get() {
        return (parseInt(this.reward.perPoint) || 0) + " Pts";
      },
      set(value) {
        const p = parseInt(value) || 0;
        this.reward.perPoint = p;
      }
    },
    value: {
      get() {
        return this.reward.asValue
          ? "$ " + this.reward.asValue.toFixed(2)
          : "$ 0.00";
      },
      set(value) {
        const v = parseFloat(value.replace(/[^\d\.]/g, "")) || 0;
        this.reward.asValue = v;
      }
    }
  }
};
</script>

<style scoped>
.ratio {
  padding: 3px 0 3px 20px;
}

.ratio .wrap {
  text-align: center;
  margin: 7px 0 5px;
}

.ratio input {
  border: none;
  outline: none;
  text-align: center;
  padding: 5px 10px;
  background: #eeeeee;
  font-size: 18px;
  width: 150px;
  margin: 0 10px;
  border-radius: 6px;
}
</style>

