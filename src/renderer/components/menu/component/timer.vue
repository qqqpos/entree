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
                    <span class="time">{{time[5]}}</span>
                    <i class="fa fa-angle-down" @click="subMin(1)"></i>
                </div>
                <div class="outer">
                    <i class="fa fa-angle-up" @click="setAM"></i>
                    <span class="time">{{time[6]}}</span>
                    <i class="fa fa-angle-down" @click="setPM"></i>
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
      componentData: null,
      component: null,
      date: moment().format("YYYY-MM-DD"),
      timer: moment(),
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
        this.timer.isAfter(this.now)
          ? next()
          : stop({
              title: "dialog.scheduleError",
              msg: "dialog.scheduleErrorTip",
              buttons: [{ text: "button.confirm", fn: "resolve" }]
            });
      });
    },
    confirm() {
      const duration = moment.duration(this.timer.diff(this.now)).humanize();
      const prompt = {
        title: "dialog.scheduleTimer",
        msg: [
          "dialog.scheduleTimerConfirm",
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
          "dialog.scheduleTimerConfirm",
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
      Printer.setTarget("All").print(
        Object.assign(order, { delay: +this.timer })
      );
      this.resetAll();
      this.$router.push({ path: "/main" });
    },
    failed(prompt) {
      this.$dialog(prompt).then(this.exitComponent);
    },
    save(print) {
      this.exitComponent();

      return new Promise(next => {
        if (this.app.newTicket) {
          Object.assign(this.order, {
            customer: this.$minifyCustomer(this.customer),
            number: this.ticket.number,
            modify: 0,
            time: Date.now(),
            schedule: +this.timer,
            status: 1,
            date: today(),
            timer: true,
            print,
            content: this.order.content.map(item => {
              if (!print) {
                item.pending = true;
              } else {
                item.print = true;
              }

              return item;
            })
          });

          this.$socket.emit("[INVOICE] SAVE", this.order, false, order =>
            next(order)
          );
        } else {
          try {
            Object.assign(this.order, {
              customer: this.$minifyCustomer(this.customer),
              lastEdit: Date.now(),
              editor: this.op.name,
              schedule: +this.timer
            });

            if (this.order.type === "TO_GO") {
              const order = JSON.parse(JSON.stringify(this.order));

              let { type, content } = this.archivedOrder;
              content.push(
                ...this.order.content.map(item => {
                  print ? (item.print = true) : (item.pending = true);
                  return item;
                })
              );

              this.order.type = type;
              this.order.content = content;

              this.$calculatePayment(this.order, { selfAssign: true });

              this.$socket.emit("[INVOICE] UPDATE", this.order);
              next(order);
            } else {
              this.$socket.emit("[INVOICE] UPDATE", this.order);
              next(this.order);
            }
          } catch (e) {
            console.log(e);
          }
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
      "dinein",
      "station",
      "customer",
      "archivedOrder"
    ])
  }
};
</script>

<style scoped>
.timer {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #eee;
}

.blink {
  line-height: 185px;
  font-size: 5em;
  animation: blinker 1s infinite;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
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
