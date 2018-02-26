<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="editor">
        <header>
          <h5></h5>
          <h3>{{$t('title.timer')}}</h3>
        </header>
        <div class="banner"></div>
        <div class="wrap">
            <div class="timer">
                <div class="outer">
                    <i class="fa fa-angle-up" @click="addHour(10)"></i>
                    <span class="time">{{time[0]}}</span>
                    <i class="fa fa-angle-down" @click="subHour(10)"></i>
                </div>
                <div class="outer">
                    <i class="fa fa-angle-up" @click="addHour(1)"></i>
                    <span class="time">{{time[1]}}</span>
                    <i class="fa fa-angle-down" @click="subHour(1)"></i>
                </div>
                <div class="blink">:</div>
                <div class="outer">
                    <i class="fa fa-angle-up" @click="addMin(10)"></i>
                    <span class="time">{{time[2]}}</span>
                    <i class="fa fa-angle-down" @click="subMin(10)"></i>
                </div>
                <div class="outer">
                    <i class="fa fa-angle-up" @click="addMin(1)"></i>
                    <span class="time">{{time[3]}}</span>
                    <i class="fa fa-angle-down" @click="subMin(1)"></i>
                </div>
            </div>
            <div class="option">
              <ul>
                <li @click="setTimer(30)">{{$t('text.setTime',30)}}</li>
                <li @click="setTimer(45)">{{$t('text.setTime',45)}}</li>
                <li @click="setTimer(90)">{{$t('text.setTime',90)}}</li>
              </ul>
            </div>
        </div>
        <footer>
            <button class="btn" @click="verify">{{$t('button.confirm')}}</button>
        </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dialoger from "../../common/dialoger";

export default {
  props: ["init"],
  components: { dialoger },
  data() {
    return {
      componentData: null,
      component: null,
      timer: moment(),
      now: moment(),
      time: null
    };
  },
  created() {
    this.time = this.timer.format("HHmm").split("");
  },
  methods: {
    addHour(t) {
      this.timer.add(t, "hours");
      this.time = this.timer.format("HHmm").split("");
    },
    subHour(t) {
      this.timer.subtract(t, "hours");
      this.time = this.timer.format("HHmm").split("");
    },
    addMin(t) {
      this.timer.add(t, "minutes");
      this.time = this.timer.format("HHmm").split("");
    },
    subMin(t) {
      this.timer.subtract(t, "minutes");
      this.time = this.timer.format("HHmm").split("");
    },
    setTimer(t) {
      this.timer = moment();
      this.timer.add(t, "minutes");
      this.time = this.timer.format("HHmm").split("");
    },
    verify() {
      this.checkTime()
        .then(this.confirm)
        .catch(this.failed);
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
          this.timer.format("hh:mm a"),
          duration
        ]
      };

      this.$dialog(prompt)
        .then(this.submit)
        .catch(() => this.$q());
    },
    failed(prompt) {
      this.$dialog(prompt).then(() => this.$q());
    },
    submit() {
      this.$q();

      if (this.app.newTicket) {
        Object.assign(this.order, {
          customer: this.customer,
          number: this.ticket.number,
          modify: 0,
          time: +new Date(),
          schedule: +this.timer,
          status: 1,
          date: today(),
          timer: true,
          print: false,
          content: this.order.content.map(item => {
            item.pending = true;
            return item;
          })
        });

        this.$socket.emit("[SAVE] INVOICE", this.order, false, content => {
          this.delayPrint(content);
          this.resetAll();
          this.$router.push({ path: "/main" });
        });
      } else {
        Object.assign(this.order, {
          customer: this.customer,
          lastEdit: +new Date(),
          editor: this.op.name,
          schedule: +this.timer,
          modify: isNumber(this.order.modify) ? this.order.modify + 1 : 1
        });

        this.$socket.emit("[UPDATE] INVOICE", this.order);
        this.delayPrint(this.order);
        this.resetAll();
        this.$router.push({ path: "/main" });
      }
    },
    ...mapActions(["delayPrint", "resetAll"])
  },
  computed: {
    ...mapGetters(["op", "app", "order", "ticket", "customer"])
  }
};
</script>

<style scoped>
.wrap {
  width: 400px;
}

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
