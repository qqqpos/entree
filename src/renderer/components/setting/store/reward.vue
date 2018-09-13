<template>
    <div>
        <div class="tab-content">
            <header class="nav">
                <h3 class="title">{{$t('reward.setting.title')}}</h3>
            <nav>
              <span @click="reset" v-if="resettable" class="remove">{{$t('button.reset')}}</span>
            </nav>
            </header>
            <toggle title="reward.setting.enable" v-model="reward.enable"></toggle>
            <toggle title="reward.setting.beforeTax" v-model="reward.beforeTax" ></toggle>
            <toggle title="reward.setting.redeem" v-model="reward.redeemable"></toggle>
            <!-- <div class="setting">
              <label>{{$t('reward.expire')}}</label>
              <slider v-model="reward.expire"></slider>
            </div> -->
            <text-list title="reward.setting.unit" tooltip="tip.reward.unit" :opts="units" v-model="reward.unit"></text-list>
            <div class="setting" v-if="reward.unit === 'CUSTOM'">
              <label>{{$t('reward.custom')}}</label>
              <div class="wrap">
                <input type="text" placeholder="$ 1.00" v-model="custom">
                <i class="fas fa-long-arrow-alt-right light"></i>
                <input type="text" placeholder="10 Point" v-model="toPoint">
              </div>
            </div>
            <div class="setting" v-else-if="reward.unit === 'PERCENTAGE'">
              <label>{{$t('reward.percentage')}}</label>
              <div class="wrap">
                <input type="text" placeholder="10 %" v-model="percentage">
                <i class="fas fa-times light"></i>
                <input type="text" placeholder="10 Point" v-model="toPoint">
              </div>
            </div>
            <div class="setting">
              <label>{{$t('reward.setting.ratio')}}</label>
              <div class="wrap">
                <input type="text" placeholder="1000 Points" v-model="point">
                <i class="fas fa-exchange-alt light"></i>
                <input type="text" placeholder="$ 1.00" v-model="value">
              </div>
            </div>
            <div class="setting column">
              <label>{{$t('reward.setting.message')}}</label>
              <div class="rich-text">
                <div class="row">
                  <i class="fas fa-bold" title="Bold" @mousedown.prevent="input('<b>','</b>')"></i>
                  <i class="fas fa-italic" title="Italic" @mousedown.prevent="input('<i>','</i>')"></i>
                  <i class="fab fa-markdown" title="Mark" @mousedown.prevent="input('<mark>','</mark>')"></i>
                  <i class="fas fa-star" @mousedown.prevent="input('⋆')"></i>
                  <i class="fas fa-heart" @mousedown.prevent="input('♥')"></i>
                  <span :title="$t('reward.value')" @mousedown.prevent="input('{value}')">{value}</span>
                  <span :title="$t('reward.point')" @mousedown.prevent="input('{point}')">{point}</span>
                  <span :title="$t('reward.earn')" @mousedown.prevent="input('{earn}')">{earn}</span>
                </div>
                <textarea v-model="reward.message" ref="input"></textarea>
              </div>
            </div>
        </div>
    </div>
</template>

<script>
import editor from "./editor/reward";
import toggle from "../common/toggle";
import slider from "../common/slider";
import textList from "../common/textList";

export default {
  components: { editor, toggle, slider, textList },
  data() {
    return {
      resettable: false,
      reward: {},
      units: [
        {
          label: "reward.eachPenny",
          tooltip: "reward.tip.pennyEachPoint",
          value: "PENNY"
        },
        {
          label: "reward.eachDollar",
          tooltip: "reward.tip.dollarEachPoint",
          value: "DOLLAR"
        },
        {
          label: "reward.percentage",
          tooltip: "reward.tip.percentageEachPoint",
          value: "PERCENTAGE"
        },
        {
          label: "reward.custom",
          tooltip: "reward.tip.customEachPoint",
          value: "CUSTOM"
        }
      ],
      dates: [this.$t("date.lifetime")]
    };
  },
  created() {
    const {
      reward = {
        enable: false,
        beforeTax: false,
        unit: "PENNY",
        percentage: 10,
        custom: 0,
        toPoint: 1,
        perPoint: 1000,
        asValue: 1,
        message:
          "<i>Congratulations! You have earned {earn} Pts</i>\nYour Total Point <mark>{point}</mark>\nAny Questions About How to Redeem Reward Point\nPlease Ask Store Manager For Details"
      }
    } = this.$store.getters.config.store;

    this.reward = reward;
    this.resettable = this.$store.getters.authorized;
  },
  beforeDestroy() {
    this.$socket.emit("[CONFIG] UPDATE", {
      key: "store.reward",
      value: this.reward
    });
  },
  methods: {
    input(char1, char2 = "") {
      const selection = window.getSelection();
      if (selection.toString().length && char2) {
        // if has highlight
        const text = selection.toString();
        this.reward.message = this.reward.message.replace(
          text,
          char1 + text + char2
        );
      } else {
        let pt = this.$refs.input.selectionStart;

        const start = this.reward.message.substr(0, pt);
        const end = this.reward.message.substr(pt);

        this.reward.message = start + char1 + char2 + end;

        pt = pt + char1.length;

        this.$nextTick(() => this.$refs.input.setSelectionRange(pt, pt));
      }
    },
    reset() {
      this.reward = {
        enable: false,
        beforeTax: false,
        unit: "PENNY",
        percentage: 10,
        custom: 0,
        toPoint: 1,
        perPoint: 1000,
        asValue: 1,
        message:
          "<i>Congratulations! You have earned {earn} Pts</i>\nYour Total Point <mark>{point}</mark>\nAny Questions About How to Redeem Reward Point\nPlease Ask Store Manager For Details"
      };
    }
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
    },
    percentage: {
      get() {
        const value = Math.abs(parseInt(this.reward.percentage)) || 0;
        return value + " %";
      },
      set(value) {
        const pct = Math.abs(parseInt(value)) || 0;
        this.reward.percentage = pct;
      }
    },
    custom: {
      get() {
        const value = Math.abs(parseFloat(this.reward.custom)) || 0;
        return "$ " + value.toFixed(2);
      },
      set(value) {
        const v = parseFloat(value.replace(/[^\d\.]/g, "")) || 0;
        this.reward.custom = v;
      }
    },
    toPoint: {
      get() {
        const value = Math.abs(parseInt(this.reward.toPoint)) || 0;
        return value + " Pts";
      },
      set(value) {
        const v = parseFloat(value.replace(/[^\d\.]/g, "")) || 0;
        this.reward.toPoint = v;
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

.rich-text {
  margin: 5px 0;
}

.row {
  background: linear-gradient(to bottom, #fff 0%, #e5e5e5 100%);
  border: 1px solid #e0e0e0;
  border-radius: 3px 3px 0 0;
  align-items: center;
  padding: 0 5px;
}

.row i {
  padding: 5px;
  width: 25px;
  text-align: center;
}

.row span {
  margin: 0 5px;
  padding: 1px 5px;
  background: #333;
  color: #fff;
  border-radius: 5px;
}

textarea {
  border: 1px solid #eeeeee;
  border-top: none;
  font-family: "Yuanti-SC";
  text-align: center;
  background: #fafafa;
  resize: none;
  width: 394px;
  outline: none;
  border-radius: 0 0 3px 3px;
  padding: 5px 7px;
  font-size: 14px;
  height: 75px;
}
</style>

