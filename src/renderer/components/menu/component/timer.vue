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
                    <i class="fas fa-plus" @click="addMonth"></i>
                    <span class="time extend" >{{time[0]}}<span class="annot">{{timer | moment('MMMM')}}</span></span>
                    <i class="fas fa-minus" @click="subMonth"></i>
                </div>
                <div class="outer">
                    <i class="fas fa-plus" @click="addDay"></i>
                    <span class="time extend">{{time[1]}}<span class="annot">{{timer | moment('ddd')}}</span></span>
                    <i class="fas fa-minus" @click="subDay"></i>
                </div>
                <div class="outer">
                    <i class="fas fa-plus" @click="addHour(10)"></i>
                    <span class="time">{{time[2]}}</span>
                    <i class="fas fa-minus" @click="subHour(10)"></i>
                </div>
                <div class="outer">
                    <i class="fas fa-plus" @click.stop="addHour(1)" @contextmenu.stop="addHour(1,true)"></i>
                    <span class="time" @dblclick="resetHour">{{time[3]}}</span>
                    <i class="fas fa-minus" @click.stop="subHour(1)" @contextmenu.stop="subHour(1,true)"></i>
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
                <div class="outer">
                    <i class="fas fa-angle-up" @click="setAM"></i>
                    <span class="time">{{time[6]}}</span>
                    <i class="fas fa-angle-down" @click="setPM"></i>
                </div>
            </div>
            <div class="option relative">
              <ul>
                <li @click="setTimer(30)">{{$t('text.setTime',30)}}</li>
                <li @click="setTimer(45)">{{$t('text.setTime',45)}}</li>
                <li @click="setTimer(90)">{{$t('text.setTime',90)}}</li>
                <li @click="setTimer(120)">{{$t('text.setTime',120)}}</li>
                <li @click="setTimer(150)">{{$t('text.setTime',150)}}</li>
              </ul>
              <h5>{{$t('text.printAhead',ahead)}}</h5>
            </div>
              <slider v-model="ahead" :piecewise="true" :data="gaps" tooltip="hover" :dot-size="20"></slider>
        </div>
        <footer>
            <div class="f1">
              <button class="btn" @click="setDate">{{$t('button.calendar')}}</button>
              <button class="btn" :disabled="true">{{$t('button.deposit')}}</button>
            </div>
            <button class="btn" @click="promptPrint">{{$t('button.print')}}</button>
            <button class="btn" @click="verify">{{$t('type.delay')}}</button>
        </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import calendar from "../../history/component/calendar";
import dialogModule from "../../common/dialog";
import slider from "../../setting/common/slider";

export default {
  props: ["init"],
  components: { dialogModule, calendar, slider },
  data() {
    return {
      date: moment().format("YYYY-MM-DD"),
      timer: moment(),
      componentData: null,
      component: null,
      now: moment(),
      time: null,
      ahead: 10,
      gaps: [0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]
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
    setAM() {
      ~~this.timer.format("H") > 12 && this.subHour(12);
    },
    setPM() {
      ~~this.timer.format("H") < 12 && this.addHour(12);
    },
    generate() {
      let time = this.timer.format("hhmm").split("");
      time.push(this.timer.locale("en").format("A"));
      time.unshift(this.timer.format("D"));
      time.unshift(this.timer.format("M"));
      this.time = time;
    },
    setTimer(t) {
      this.timer = moment();
      this.timer.add(t, "minutes");
      this.generate();
    },
    verify() {
      this.combineTime()
        .then(this.checkTime)
        .then(this.confirm)
        .catch(this.failed);
    },
    setDate() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "calendar";
      })
        .then(date => {
          date = date.split("-");
          this.timer.year(~~date[0]);
          this.timer.month(date[1] - 1);
          this.timer.date(~~date[2]);
          this.generate();
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    combineTime() {
      return new Promise(next => {
        const date = this.date + " " + this.timer.format("HH:mm:ss");
        this.timer = moment(date, "YYYY-MM-DD HH:mm:ss");
        next();
      });
    },
    checkTime() {
      return new Promise((next, stop) => {
        const dialog = {
          title: "dialog.dateTimeIncorrect",
          msg: "dialog.inputTimeMustAfterCurrent",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        this.timer.isAfter(this.now) ? next() : stop(dialog);
      });
    },
    confirm() {
      const duration = moment.duration(this.timer.diff(this.now)).humanize();
      const prompt = {
        title: "dialog.scheduleConfirm",
        msg: [
          "dialog.scheduleTimerDetail",
          this.timer.format("MMM DD hh:mm a"),
          duration
        ]
      };

      this.$dialog(prompt)
        .then(this.save.bind(null, false))
        .then(this.delay)
        .catch(this.exitComponent);
    },
    promptPrint() {
      const duration = moment.duration(this.timer.diff(this.now)).humanize();
      const prompt = {
        title: "dialog.printConfirm",
        msg: [
          "dialog.scheduleTimerDetail",
          this.timer.format("MMM DD hh:mm a"),
          duration
        ]
      };

      this.$dialog(prompt)
        .then(this.save.bind(null, true))
        .then(this.print)
        .catch(this.exitComponent);
    },
    print(order) {
      Printer.print(Object.assign(order, { delay: +this.timer }), {
        target: "All",
        receipt: true
      });
      this.resetAll();
      this.$router.push({ path: "/main" });
    },
    failed(prompt) {
      this.$dialog(prompt).then(this.exitComponent);
    },
    save(print) {
      this.exitComponent();

      return new Promise(next => {
        Object.assign(this.order, {
          customer: this.$minifyCustomer(this.customer),
          schedule: +this.timer,
          timer: true
        });

        if (this.app.newTicket) {
          const items = JSON.parse(JSON.stringify(this.order.content));

          this.order.content.forEach(item => {
            print
              ? Object.assign(item, { print })
              : Object.assign(item, { pending: true });
          });

          this.$socket.emit("[ORDER] SAVE", this.order, false, order =>
            next(Object.assign(order, { content: items }))
          );
        } else {
          Object.assign(this.order, {
            customer: this.$minifyCustomer(this.customer),
            lastEdit: Date.now(),
            editor: this.op.name,
            schedule: +this.timer
          });
          this.$socket.emit("[ORDER] UPDATE", this.order);
          next(this.order);
        }
      });
    },
    delay(order) {
      const job = {
        type: "delay",
        target: "All",
        schedule: +this.timer.subtract(this.ahead, "m"),
        creator: this.op.name,
        station: this.station.alias,
        order
      };

      this.delayPrint(job);
      this.resetAll();
      this.$router.push({ path: "/main" });
    },
    ...mapActions(["delayPrint", "resetAll"])
  },
  computed: {
    ...mapGetters([
      "op",
      "app",
      "tax",
      "store",
      "order",
      "ticket",
      "station",
      "customer",
      "dineInOpt",
      "archivedOrder"
    ])
  }
};
</script>

<style scoped>
.time-picker {
  border-bottom: 1px solid #eee;
}

.option {
  border-top: 1px solid #fff;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.option h5 {
  position: absolute;
  background: #fafafa;
  left: calc(50% - 80px);
  text-align: center;
  width: 160px;
  bottom: -8px;
}

ul {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

li {
  border: 2px solid #eee;
  border-radius: 4px;
  background: #fff;
  padding: 13px 0;
  margin: 4px;
  cursor: pointer;
  flex: 1;
  text-align: center;
}
</style>
