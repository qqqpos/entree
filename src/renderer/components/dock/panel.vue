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
        <li @click="getTerminal" v-show="station.terminal.enable">
          <i class="fa fa-2x fa-credit-card"></i>
          <div>
            <h3>{{$t('dock.terminal')}}</h3>
            <h5>{{$t('dock.terminalTip')}}</h5>
          </div>
        </li>
        <li @click="giftCardPanel">
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
        <li @click="setting" v-show="authorized || op.role === 'Manager'">
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
        <li @click="logout">
          <i class="fa fa-2x fa-sign-out"></i>
          <div>
            <h3>{{$t('dock.logout')}}</h3>
            <h5>{{$t('dock.logoutTip')}}</h5>
          </div>
          <div class="extra" @click.stop="askCashOut" v-if="false">
            <i class="fa fa-usd"></i>
            <span>{{$t('button.cashOut')}}</span>
          </div>
        </li>
        <div :is="component" :init="componentData"></div>
      </ul>
    </transition>
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
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  computed: {
    ...mapGetters([
      "op",
      "app",
      "config",
      "time",
      "store",
      "station",
      "authorized"
    ])
  },
  methods: {
    askClockIn() {
      this.$dialog({
        type: "question",
        title: "dialog.clockInConfirm",
        msg: ["dialog.clockInTip", moment(this.time).format("hh:mm:ss a")]
      })
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
          this.store.tipReport ? this.reportTip() : this.clockOut();
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
    logout() {
      switch (this.op.cashCtrl) {
        case "enable":
          this.checkCashOut(this.station.cashDrawer.name, false);
          break;
        case "staffBank":
          this.checkCashOut(this.op.name, true);
          break;
        default:
          this.exit();
      }
    },
    checkCashOut(cashDrawer, staffBank) {
      this.$socket.emit(
        "[CASHFLOW] CHECK",
        { date: today(), cashDrawer, close: false },
        data => {
          let { name, initial } = data;
          initial
            ? this.exit()
            : staffBank ? this.staffCashOut(name) : this.regularCashOut(name);
        }
      );
    },
    staffCashOut(name) {
      const prompt = {
        type: "question",
        title: "dialog.staffCashOut",
        msg: "dialog.staffCashOutTip"
      };

      this.$dialog(prompt)
        .then(() => this.cashOut(name))
        .catch(() => this.exit());
    },
    regularCashOut(name) {
      const prompt = {
        type: "question",
        title: "dialog.cashOut",
        msg: ["dialog.cashOutTip", name]
      };

      this.$dialog(prompt)
        .then(() => this.cashOut(name))
        .catch(() => this.exit());
    },
    cashOut(cashDrawer) {
      this.$q();
      this.$socket.emit("[CASHFLOW] SETTLE", cashDrawer, cashFlow =>
        this.reconciliation(cashFlow)
      );
    },
    reconciliation(cashflow) {
      this.recordCashDrawerAction();
      const diff = (
        parseFloat(cashflow.end) - parseFloat(cashflow.begin)
      ).toFixed(2);

      cashflow.activity = cashflow.activity.filter(
        log =>
          log.type === "START" ||
          log.type === "CASHFLOW" ||
          log.type === "PAYOUT"
      );

      const prompt = {
        type: "question",
        title: ["dialog.cashOutSettle", cashflow.end],
        msg: ["dialog.cashOutSettleTip", cashflow.begin, diff, cashflow.end],
        buttons: [
          { text: "button.printDetail", fn: "reject" },
          { text: "button.print", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => {
          Printer.printCashOutReport(cashflow, false);
          this.exit();
        })
        .catch(() => {
          Printer.printCashOutReport(cashflow, true);
          this.exit();
        });
    },
    recordCashDrawerAction() {
      this.op.cashCtrl === "enable" && Printer.openCashDrawer();
      const cashDrawer =
        this.op.cashCtrl === "enable"
          ? this.station.cashDrawer.name
          : this.op.name;
      const activity = {
        type: "END",
        inflow: 0,
        outflow: 0,
        time: +new Date(),
        ticket: null,
        operator: this.op.name
      };

      this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });
    },
    getTerminal() {
      this.$open("terminal");
    },
    giftCardPanel() {
      this.$open("giftcard");
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
    openPayout() {
      this.$checkPermission("permission", "payout")
        .then(() => this.$p("payout"))
        .catch(() =>
          this.$log({
            eventID: 9100,
            type: "failure",
            source: "panel",
            note: `Access Denied when attempt access payout.`
          })
        );
    },
    askCashOut() {},
    changeLanguage() {
      const language = this.app.language === "usEN" ? "zhCN" : "usEN";
      this.$setLanguage(language);
      this.setApp({ language });
      moment.locale(language === "usEN" ? "en" : "zh-cn");
      this.$forceUpdate();
    },
    setting() {
      this.$checkPermission("access", "setting")
        .then(() => {
          this.init.resolve();
          this.$router.push({ path: "/main/setting" });
        })
        .catch(() =>
          this.$log({
            eventID: 9100,
            type: "failure",
            source: "panel",
            note: `Access Denied when attempt access back office setting.`
          })
        );
    },
    exit() {
      this.$router.push({ name: "Login" });
      this.$socket.emit("[SYS] RECORD", {
        type: "User",
        event: "logOut",
        status: 1
      });
    },
    ...mapActions(["setOp", "setApp"])
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