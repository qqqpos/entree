<template>
  <div class="popupMask dark center setting" @click.self="init.reject">
      <div class="editor">
          <header>
              <h3>{{$t('title.timer')}}</h3>
            </header>
            <div class="banner"></div>
            <div class="timer">
              <div class="outer">
                    <i class="fa fa-angle-up" @click="addMonth"></i>
                    <span class="time extend">{{time[0]}}<span class="annot">{{timer | moment('MMMM')}}</span></span>
                    <i class="fa fa-angle-down" @click="subMonth"></i>
                </div>
                <div class="outer">
                    <i class="fa fa-angle-up" @click="addDay"></i>
                    <span class="time extend">{{time[1]}}<span class="annot">{{timer | moment('ddd')}}</span></span>
                    <i class="fa fa-angle-down" @click="subDay"></i>
                </div>
                <div class="blink">&nbsp;</div>
                <div class="outer">
                    <i class="fa fa-angle-up" @click="addHour(10)"></i>
                    <span class="time">{{time[2]}}</span>
                    <i class="fa fa-angle-down" @click="subHour(10)"></i>
                </div>
                <div class="outer">
                    <i class="fa fa-angle-up" @click="addHour(1)"></i>
                    <span class="time">{{time[3]}}</span>
                    <i class="fa fa-angle-down" @click="subHour(1)"></i>
                </div>
                <div class="blink">:</div>
                <div class="outer">
                    <i class="fa fa-angle-up" @click="addMin(10)"></i>
                    <span class="time">{{time[4]}}</span>
                    <i class="fa fa-angle-down" @click="subMin(10)"></i>
                </div>
                <div class="outer">
                    <i class="fa fa-angle-up" @click="addMin(1)"></i>
                    <span class="time">{{time[3]}}</span>
                    <i class="fa fa-angle-down" @click="subMin(1)"></i>
                </div>
            </div>
            <footer>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
      </div>
  </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      timer: moment(this.init.time, "YYYY-MM-DD HH:mm:ss", true).isValid()
        ? moment(this.init.time, "YYYY-MM-DD HH:mm:ss", true)
        : moment(),
      time: null
    };
  },
  created() {
    this.generate();
  },
  methods: {
    addMonth() {
      this.timer.add(1, "M");
      this.generate();
    },
    subMonth() {
      this.timer.subtract(1, "M");
      this.generate();
    },
    addDay() {
      this.timer.add(1, "days");
      this.generate();
    },
    subDay() {
      this.timer.subtract(1, "days");
      this.generate();
    },
    addHour(t) {
      this.timer.add(t, "hours");
      this.generate();
    },
    subHour(t) {
      this.timer.subtract(t, "hours");
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
    generate() {
      let time = this.timer.format("HHmm").split("");
      time.unshift(this.timer.format("D"));
      time.unshift(this.timer.format("M"));
      this.time = time;
    },
    confirm() {
      this.init.resolve(this.timer);
    }
  }
};
</script>

<style scoped>
.timer {
  display: flex;
  justify-content: center;
}

.blink {
  line-height: 185px;
  font-size: 5em;
  color: #616161;
}

.timer .outer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: 5px 10px;
}

.time {
  padding: 10px;
  font-family: "Agency FB";
  font-weight: bold;
  color: #fff;
  background: #424242;
  font-size: 3em;
  width: 50px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 58px;
}

.time.extend {
  width: 65px;
}

.annot {
  font-size: 14px;
  font-weight: normal;
  font-family: "Yuanti-SC";
  color: #bdbdbd;
}

.outer i {
  padding: 10px 29px;
  background: linear-gradient(#fefefe, #cfd0d3);
  margin: 8px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.outer i:active {
  background: linear-gradient(#e2e3e4, #aaadb4);
}
</style>
