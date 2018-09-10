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
            <div class="setting">
              <label>{{$t('reward.ratio')}}</label>
              <div class="wrap">
                <input type="text" placeholder="1000 Points" v-model="point">
                <i class="fas fa-exchange-alt light"></i>
                <input type="text" placeholder="$ 1.00" v-model="value">
              </div>
            </div>
            <div class="setting column">
              <label>{{$t('reward.message')}}</label>
              <textarea v-model="reward.message" cols="65" wrap="hard" placeholder="Use {value} to display reward value
Use {point} to display reward point
<i> to display italy style
<b> to display bold style"></textarea>
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
        asValue: 1,
        message: "Total Point <b>{point}</b>"
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
        const value = Math.abs(parseInt(this.reward.perPoint)) || 0;
        return value + " Pts";
      },
      set(value) {
        const pts = Math.abs(parseInt(value)) || 0;
        this.reward.perPoint = pts;
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
.setting {
  padding: 3px 20px;
  border-bottom: 1px solid #eee;
}

.wrap {
  text-align: center;
  margin: 7px 0 5px;
}

input {
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

textarea {
  border: 2px solid #e0e0e0;
  font-family: "Yuanti-SC";
  text-align: center;
  border-radius: 6px;
  resize: none;
  width: 370px;
  outline: none;
  margin: 7px 10px 8px;
  padding: 5px 7px;
  font-size: 16px;
  height: 75px;
}
</style>

