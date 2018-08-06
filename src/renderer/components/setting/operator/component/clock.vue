<template>
  <div class="popupMask dark center setting" @click.self="init.reject">
      <div class="editor">
          <header>
              <div>
                  <h3>{{$t('title.timer')}}</h3>
              </div>
            </header>
            <div class="banner"></div>
            <div class="time-picker">
              <div class="outer">
                    <i class="fas fa-plus" @click="addMonth"></i>
                    <span class="time extend">{{time[0]}}<span class="annot">{{timer | moment('MMMM')}}</span></span>
                    <i class="fas fa-minus" @click="subMonth"></i>
                </div>
                <div class="outer">
                    <i class="fas fa-plus" @click="addDay"></i>
                    <span class="time extend">{{time[1]}}<span class="annot">{{timer | moment('ddd')}}</span></span>
                    <i class="fas fa-minus" @click="subDay"></i>
                </div>
                <div class="blink">&nbsp;</div>
                <div class="outer">
                    <i class="fas fa-plus" @click.stop="addHour(10)" @contextmenu.stop="addHour(10,true)"></i>
                    <span class="time">{{time[2]}}</span>
                    <i class="fas fa-minus" @click.stop="subHour(10)" @contextmenu.stop="subHour(10,true)"></i>
                </div>
                <div class="outer">
                    <i class="fas fa-plus" @click="addHour(1)" @contextmenu.stop="addHour(1,true)"></i>
                    <span class="time">{{time[3]}}</span>
                    <i class="fas fa-minus" @click="subHour(1)" @contextmenu.stop="subHour(1,true)"></i>
                </div>
                <div class="blink">:</div>
                <div class="outer">
                    <i class="fas fa-plus" @click="addMin(10)"></i>
                    <span class="time">{{time[4]}}</span>
                    <i class="fas fa-minus" @click="subMin(10)"></i>
                </div>
                <div class="outer">
                    <i class="fas fa-plus" @click="addMin(1)"></i>
                    <span class="time">{{time[5]}}</span>
                    <i class="fas fa-minus" @click="subMin(1)"></i>
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
    addHour(t,reset) {
      reset && this.resetHour();
      this.timer.add(t, "hours");
      this.generate();
    },
    subHour(t,reset) {
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
