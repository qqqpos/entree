<template>
  <div class="popupMask dark" @click.self="init.resolve">
    <transition appear name="fadeDown">
      <ul class="panel">
        <div v-if="op.timecard">
          <li v-if="op.clockIn" @click="askClockOut">
            <i class="fa fa-2x fa-clock-o"></i>
            <div>
              <h3>{{$t('dock.clockOut')}}</h3>
              <h5 class="clock">
                <span class="time">{{time | moment('HH:mm:ss')}}</span>
                <span class="pass">{{op.clockIn | fromNow(true)}}</span>
              </h5>
            </div>
            <div class="extra" @click.stop="startBreakTime" v-if="!op.break">
              <i class="fa fa-coffee"></i>
              <span>{{$t('button.break')}}</span>
            </div>
            <div class="extra" @click.stop="endBreakTime" v-else>
              <i class="fa fa-briefcase"></i>
              <span>{{$t('button.work')}}</span>
            </div>
          </li>
          <li v-else @click="askClockIn">
            <i class="fa fa-2x fa-clock-o"></i>
            <div>
              <h3>{{$t('dock.clockIn')}}</h3>
              <h5 class="clock">
                <span class="time">{{time | moment('HH:mm:ss')}}</span>
              </h5>
            </div>
          </li>
        </div>
        <li @click="$open('terminal')" v-show="station.terminal.enable">
          <i class="fa fa-2x fa-credit-card"></i>
          <div>
            <h3>{{$t('dock.terminal')}}</h3>
            <h5>{{$t('dock.terminalTip')}}</h5>
          </div>
        </li>
        <li @click="$open('giftcard')">
          <i class="fa fa-2x fa-gift"></i>
          <div>
            <h3>{{$t('dock.giftCard')}}</h3>
            <h5>{{$t('dock.giftCardTip')}}</h5>
          </div>
        </li>
        <li @click="openPayout" v-if="station.cashDrawer.enable">
          <i class="fa fa-2x fa-money"></i>
          <div>
            <h3>{{$t('dock.payout')}}</h3>
            <h5>{{$t('dock.payoutTip')}}</h5>
          </div>
        </li>
        <li @click="openSetting" v-show="authorized || op.role === 'Manager'">
          <i class="fa fa-2x fa-cog"></i>
          <div>
            <h3>{{$t('dock.setting')}}</h3>
            <h5>{{$t('dock.settingTip')}}</h5>
          </div>
        </li>
        <li @click="changeLanguage">
          <i class="fa fa-2x fa-language"></i>
          <div>
            <h3>{{$t('dock.language')}}</h3>
            <h5>{{$t('dock.languageTip')}}</h5>
          </div>
        </li>
        <li @click="askCashIn">
          <i class="fa fa-2x fa-money"></i>
          <div>
            <h3>{{$t('dock.cashIn')}}</h3>
            <h5>{{$t('dock.cashInTip')}}</h5>
          </div>
        </li>
        <li @click="askCashOut">
          <i class="fa fa-2x fa-money"></i>
          <div>
            <h3>{{$t('dock.cashOut')}}</h3>
            <h5>{{$t('dock.cashOutTip')}}</h5>
          </div>
        </li>
        <li @click="logout">
          <i class="fa fa-2x fa-sign-out"></i>
          <div>
            <h3>{{$t('dock.logout')}}</h3>
            <h5>{{$t('dock.logoutTip')}}</h5>
          </div>
        </li>
      </ul>
    </transition>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import inputer from "../component/inputer";
import terminal from "../history/terminal";
import dialoger from "../common/dialoger";
import giftcard from "../giftcard/index";
import unlock from "../common/unlock";
import payout from "./payout";

export default {
  props: ["init"],
  components: { dialoger, terminal, giftcard, payout, unlock, inputer },
  computed: {
    ...mapGetters([
      "op",
      "app",
      "time",
      "store",
      "station",
      "history",
      "authorized"
    ])
  },
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  created() {
    this.initialCashManagement();
  },
  methods: {
    initialCashManagement() {},
    changeLanguage() {
      const language = this.app.language === "usEN" ? "zhCN" : "usEN";
      this.$setLanguage(language);
      this.setApp({ language });
      moment.locale(language === "usEN" ? "en" : "zh-cn");
      this.$forceUpdate();
    },
    openPayout() {
      this.$checkPermission("permission", "payout")
        .then(() => this.$open("payout"))
        .catch(() =>
          this.$log({
            eventID: 9100,
            note: `${this.op.name} was attempt to access payout.`
          })
        );
    },
    openSetting() {
      this.$checkPermission("permission", "payout")
        .then(() => this.$open("payout"))
        .catch(() =>
          this.$log({
            eventID: 9100,
            note: `${this.op.name} was attempt to access back office setting.`
          })
        );
    },
    logout() {},
    exit() {},
    askClockIn() {
      const prompt = {
        type: "question",
        title: "dialog.clockInConfirm",
        msg: ["dialog.clockInTip", moment(this.time).format("hh:mm:ss a")]
      };

      this.$dialog(prompt)
        .then(() => {
          this.setOp({ clockIn: this.time, session: ObjectId() });
          this.$socket.emit("[TIMECARD] CLOCK_IN", this.op);
          this.$q();
        })
        .catch(() => this.$q());
    },
    askClockOut() {
      const diff = moment().diff(moment(this.op.clockIn));
      const h =
        ("0" + Math.floor(diff / 36e5)).slice(-2) + " " + this.$t("text.hour");
      const m =
        ("0" + Math.floor(diff / 6e4)).slice(-2) + " " + this.$t("text.minute");
      const prompt = {
        type: "question",
        title: "dialog.clockOutConfirm",
        msg: [
          "dialog.clockOutTip",
          moment(this.op.clockIn).format("hh:mm:ss a"),
          h + " " + m
        ]
      };

      this.$dialog(prompt)
        .then(() => {
          this.store.timecard.tipReport ? this.reportTip() : this.clockOut();
        })
        .catch(() => this.$q());
    },
    reportTip() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, title: "title.reportTip" };
        this.component = "inputer";
      })
        .then(tip => {
          const prompt = {
            type: "question",
            title: "dialog.tipReport",
            msg: ["dialog.tipReportConfirm", tip.toFixed(2)]
          };

          this.$dialog(prompt)
            .then(() => this.clockOut(tip))
            .catch(this.reportTip);
        })
        .catch(() => this.$q());
    },
    clockOut(tip = 0) {
      this.$q();
      this.$socket.emit("[TIMECARD] CLOCK_OUT", { op: this.op, tip });
      this.setOp({ clockIn: null, session: null });
      this.$router.push({ path: "/main/lock" });
      this.init.resolve();
    },
    checkOpenTicket() {
      return new Promise((next, stop) => {
        const server = this.op.name;
        const doneJob = this.history
          .filter(invoice => invoice.server === server)
          .every(ticket => ticket.settled);

        const prompt = {
          title: "dialog.cantExecute",
          msg: "dialog.ticketUnsettleAlert",
          buttons: [
            { text: "button.confirm", fn: "reject" },
            { text: "button.processAnyway", fn: "resolve" }
          ]
        };

        doneJob
          ? next()
          : this.$dialog(prompt)
              .then(() => next())
              .catch(() => stop());
      });
    },
    startBreakTime() {
      const prompt = {
        type: "question",
        title: "dialog.startBreakTime",
        msg: "dialog.startBreakTimeTip"
      };

      this.$dialog(prompt)
        .then(() => {
          this.$socket.emit("[TIMECARD] BREAK_START", this.op);
          this.setOp({ clockIn: null, session: null });
          this.$router.push({ path: "/main/lock" });
          this.init.resolve();
        })
        .catch(() => this.$q());
    },
    endBreakTime() {
      const duration = moment
        .duration(+new Date() - this.op.break, "milliseconds")
        .humanize();

      const prompt = {
        type: "question",
        title: "dialog.endBreakTime",
        msg: ["dialog.endBreakTimeTip", duration]
      };

      this.$dialog(prompt)
        .then(() => {
          this.$socket.emit("[TIMECARD] BREAK_END", this.op);
          this.setOp({ break: null });
          this.$q();
        })
        .catch(() => this.$q());
    },
    askCashIn() {},
    askCashOut() {},
    logout() {},
    exit() {
      this.$router.push({ name: "Login" });
    },
    ...mapActions(["setApp", "setOp"])
  }
};
</script>

<style scoped>
.popupMask {
  margin-top: 30px;
}

ul.panel {
  font-size: initial;
  width: 260px;
  position: absolute;
  top: 10px;
  right: 90px;
  padding: 4px 4px 0;
  border-radius: 4px;
  background: linear-gradient(
    rgba(255, 255, 255, 0.45),
    rgba(255, 255, 255, 0.85)
  );
  color: #263238;
  box-shadow: 0px 4px 8px -1px rgba(0, 0, 0, 0.6);
}

li {
  background: linear-gradient(to bottom, #fff 0%, #e5e5e5 100%);
  margin-bottom: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  padding: 10px;
  border-radius: 4px;
  align-items: center;
  position: relative;
}

li:active {
  background: #eee;
}

li > i {
  width: 50px;
  margin: 0 10px 0 0;
  color: #363636;
  text-align: center;
}

h3 {
  font-weight: normal;
}

h5 {
  font-weight: normal;
  color: #757575;
  font-size: 14px;
  line-height: 12px;
  display: flex;
  align-items: center;
  height: 14px;
}

.clock {
  color: #009688;
  display: flex;
  padding: 0;
  width: 128px;
  justify-content: flex-start;
}

.pass {
  flex: 1;
  text-align: right;
}

.extra {
  position: absolute;
  right: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 10px;
  border-width: 0 0 0 1px;
  border-style: solid;
  border-image: linear-gradient(
      to bottom,
      rgba(224, 224, 224, 0),
      #9e9e9e,
      rgba(224, 224, 224, 0)
    )
    1 100%;
}
</style>