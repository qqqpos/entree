<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="editor">
          <header>
              <div>
                  <h3>{{$t('title.timer')}}</h3>
              </div>
            </header>
            <div class="banner"></div>
            <div class="wrap">
            <div class="time-picker">
                <div class="outer">
                    <i class="fas fa-plus" @click="addHour(10)"></i>
                    <span class="time">{{time[2]}}</span>
                    <i class="fa fa-minus" @click="subHour(10)"></i>
                </div>
                <div class="outer">
                    <i class="fas fa-plus" @click.stop="addHour(1)" @contextmenu.stop="addHour(1,true)"></i>
                    <span class="time">{{time[3]}}</span>
                    <i class="fa fa-minus" @click.stop="subHour(1)" @contextmenu.stop="subHour(1,true)"></i>
                </div>
                <div class="blink">:</div>
                <div class="outer">
                    <i class="fas fa-plus" @click="addMin(10)"></i>
                    <span class="time">{{time[4]}}</span>
                    <i class="fa fa-minus" @click="subMin(10)"></i>
                </div>
                <div class="outer">
                    <i class="fas fa-plus" @click="addMin(1)"></i>
                    <span class="time">{{time[5]}}</span>
                    <i class="fa fa-minus" @click="subMin(1)"></i>
                </div>
                <div class="outer" v-show="!militaryTime">
                    <i class="fas fa-angle-up" @click="setAM"></i>
                    <span class="time">{{time[6]}}</span>
                    <i class="fas fa-angle-down" @click="setPM"></i>
                </div>
            </div>
            <div class="popular-hour">
              <div class="bars">
                <div class="bar" v-for="(value,hour,index) in popular" :key="index" :style="{height:value+'px'}" :data-hour="hour" @click="setHour(hour)" :data-desc="getDetail(hour)"></div>
              </div>
              <div class="hours">
                <div class="hour" v-for="(value,hour,index) in popular" :key="'h'+index" :data-hour="hour" :class="{time:hour % 3=== 0}"></div>
              </div>
            </div>
            </div>
            <footer>
                <div class="opt">
                    <switches title="text.militaryTime" v-model="militaryTime" :reverse="true" @update="generate"></switches>
                </div>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
      </div>
    </div>
</template>

<script>
import switches from "../../setting/common/switches";

export default {
  props: ["init"],
  components: { switches },
  data() {
    return {
      popular: {
        9: 0,
        10: 0,
        11: 32,
        12: 43,
        13: 33,
        14: 50,
        15: 31,
        16: 70,
        17: 30,
        18: 56,
        19: 47,
        20: 70,
        21: 75,
        22: 38,
        23: 40,
        24: 0
      },
      militaryTime: true,
      timer: moment(),
      time: null
    };
  },
  created() {
    this.generate();
  },
  methods: {
    addHour(t, reset) {
      reset && this.resetHour();
      this.timer.add(t, "hours");
      this.generate();
    },
    subHour(t, reset) {
      reset && this.resetHour();
      this.timer.subtract(t, "hours");
      this.generate();
    },
    resetHour() {
      this.timer.set("minute", 0);
      this.generate();
    },
    addMin(t) {
      this.timer.add(t, "minutes");
      this.generate();
    },
    subMin(t) {
      this.timer.subtract(t, "minutes");
      this.generate();
    },
    setHour(h) {
      this.resetHour();
      this.timer.hour(h);
      this.generate();
    },
    generate() {
      let time = this.militaryTime
        ? this.timer.format("HHmm").split("")
        : this.timer.format("hhmm").split("");
      time.push(this.timer.locale("en").format("A"));
      time.unshift(this.timer.format("D"));
      time.unshift(this.timer.format("M"));
      this.time = time;
    },
    setAM() {
      ~~this.timer.format("H") > 12 && this.subHour(12);
    },
    setPM() {
      ~~this.timer.format("H") < 12 && this.addHour(12);
    },
    focus() {
      const hour = this.timer.format("HH");
      let dom = document.querySelector(".bar.active");
      dom && dom.classList.remove("active");

      dom = document.querySelector(`[data-hour='${hour}'].bar`);
      dom && dom.classList.add("active");
    },
    getDetail(hour) {
      const target = this.popular[hour];
      if (!target) return "No-data";

      const data = Object.values(this.popular).filter(v => v > 0);
      const average = data.reduce((a, c) => a + c, 0) / data.length;

      if (target > average * 1.7) {
        return this.$t("tip.peak.fullHouse");
      } else if (target > average * 1.3) {
        return this.$t("tip.peak.rush");
      } else if (target > average * 1) {
        return this.$t("tip.peak.busy");
      } else if (target > average * 0.7) {
        return this.$t("tip.peak.normal");
      } else {
        return this.$t("tip.peak.idle");
      }
    },
    confirm() {
      const time = this.timer.format("HH:mm");
      this.init.resolve(time);
    }
  },
  watch: {
    time: "focus"
  }
};
</script>

<style scoped>
.popular-hour {
  margin: 10px 0 35px;
}

.wrap {
  padding: 10px 15px;
  background: #fff;
}

.bars {
  height: 80px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  background-position: right;
  background-size: 100% 34%;
  background-repeat: repeat-y;
  border-top: 1px solid #f5f5f5;
  background-image: linear-gradient(#f5f5f5 1px, rgba(255, 255, 255, 0) 0);
}

.bar {
  flex: 1;
  margin-right: 1px;
  border-radius: 3px 3px 0 0;
  background: #7baaf7;
  position: relative;
  transition: background-color 0.3s ease-out;
}

.bar:hover {
  background-color: #5e97f6;
}

.bar.active {
  background: #4184ee;
}

.hours {
  height: 19px;
  display: flex;
  border-top: 1px solid #ccc;
}

.hour {
  flex: 1;
  margin-right: 1px;
  position: relative;
}

.hour:before {
  content: "";
  background: #bdbdbd;
  left: -1px;
  top: -1px;
  width: 1px;
  height: 3px;
  position: absolute;
}

.hour.time:after {
  content: attr(data-hour);
  color: #666;
  font-size: 12px;
  position: absolute;
  left: -10px;
  top: 5px;
  width: 20px;
}

.hour.time:before {
  height: 5px;
}

.hour:first-child:before,
.hour:first-child:after {
  content: unset;
}

.bar.active:before {
  content: attr(data-desc);
  position: absolute;
  bottom: -50px;
  padding: 4px 10px;
  white-space: nowrap;
  text-align: center;
  transform: translateX(-50%);
  background: #eceff1;
  color: #37474f;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>

