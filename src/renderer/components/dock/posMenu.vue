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
        <template v-if="isShow.cashCtrl">
          <template v-if="isShow.staffBank">
            <li @click="askStaffCashIn" v-if="!isShow.deposit">
              <i class="fa fa-2x fa-money"></i>
              <div>
                <h3>{{$t('dock.staffCashIn')}}</h3>
                <h5>{{$t('dock.cashInTip')}}</h5>
              </div>
          </li>
          <li @click="askStaffCashOut" v-else>
            <i class="fa fa-2x fa-money"></i>
            <div>
              <h3>{{$t('dock.staffCashOut')}}</h3>
              <h5>{{$t('dock.cashOutTip')}}</h5>
            </div>
          </li>
          </template>
          <template v-else>
             <li @click="askCashDrawerCashIn" v-if="!isShow.deposit">
              <i class="fa fa-2x fa-money"></i>
              <div>
                <h3>{{$t('dock.cashDrawerCashIn')}}</h3>
                <h5>{{$t('dock.cashInTip')}}</h5>
              </div>
              </li>
              <li @click="askCashDrawerCashOut" v-else>
                <i class="fa fa-2x fa-money"></i>
                <div>
                  <h3>{{$t('dock.cashDrawerCashOut')}}</h3>
                  <h5>{{$t('dock.cashOutTip')}}</h5>
                </div>
              </li>
          </template>
        </template>
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
import collector from "../component/collector";
import inputer from "../component/inputer";
import terminal from "../history/terminal";
import dialoger from "../common/dialoger";
import giftcard from "../giftcard/index";
import unlock from "../common/unlock";
import payout from "./payout";

export default {
  props: ["init"],
  components: {
    dialoger,
    terminal,
    giftcard,
    payout,
    unlock,
    inputer,
    collector
  },
  computed: {
    ...mapGetters([
      "op",
      "app",
      "time",
      "store",
      "station",
      "history",
      "language",
      "authorized",
      "departments"
    ])
  },
  data() {
    return {
      componentData: null,
      component: null,
      isShow: this.init.args
    };
  },
  methods: {
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
            { text: "button.cancel", fn: "reject" },
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
    askCashDrawerCashIn() {
      const amount = this.station.cashDrawer.initialAmount;
      const prompt = { title: "dialog.cashIn", msg: "dialog.cashInTip" };

      this.$dialog(prompt)
        .then(this.countInitialCash)
        .catch(() => this.$q());
    },
    askCashDrawerCashOut() {
      const { name } = this.station.cashDrawer;
      const prompt = {
        type: "question",
        title: "dialog.cashOut",
        msg: ["dialog.cashOutTip", name]
      };

      this.$dialog(prompt)
        .then(() => this.cashOut(name))
        .catch(this.exit);
    },
    askStaffCashIn() {
      this.$dialog({ title: "dialog.selfCashIn", msg: "dialog.selfCashInTip" })
        .then(this.countSelfCash)
        .catch(() => this.$q());
    },
    askStaffCashOut() {
      const { name } = this.op;
      const prompt = {
        type: "question",
        title: "dialog.staffCashOut",
        msg: "dialog.staffCashOutTip"
      };

      this.$dialog(prompt)
        .then(() => this.cashOut(name))
        .catch(this.exit);
    },
    countSelfCash(amount) {
      if (isNumber(amount)) {
        this.$dialog({
          title: "dialog.selfCashInConfirm",
          msg: ["dialog.selfCashInConfirmTip", amount.toFixed(2)]
        })
          .then(() => this.acceptCashIn(amount))
          .catch(this.countSelfCash);
      } else {
        new Promise((resolve, reject) => {
          const cashDrawer = this.op.name;
          this.componentData = { resolve, reject, cashDrawer };
          this.component = "collector";
        })
          .then(this.countSelfCash)
          .catch(() => this.$q());
      }
    },
    countInitialCash(amount) {
      if (isNumber(amount)) {
        const prompt = {
          title: "dialog.cashInConfirm",
          msg: ["dialog.cashInConfirmTip", amount.toFixed(2)],
          buttons: [
            { text: "button.modify", fn: "reject" },
            { text: "button.confirm", fn: "resolve" }
          ]
        };
        Printer.openCashDrawer();
        this.$dialog(prompt)
          .then(() => this.acceptCashIn(amount))
          .catch(this.countInitialCash);
      } else {
        new Promise((resolve, reject) => {
          const cashDrawer = this.station.cashDrawer.name;
          this.componentData = { resolve, reject, cashDrawer };
          this.component = "collector";
        })
          .then(this.countInitialCash)
          .catch(() => this.$q());
      }
    },
    acceptCashIn(amount) {
      const cashDrawer =
        this.op.cashCtrl === "enable"
          ? this.station.cashDrawer.name
          : this.op.name;
      const record = {
        date: today(),
        cashDrawer,
        operator: this.op.name,
        begin: amount.toFixed(2),
        beginTime: +new Date(),
        end: null,
        endTime: null,
        close: false,
        activity: [
          {
            type: "START",
            inflow: parseFloat(amount),
            outflow: 0,
            time: +new Date(),
            ticket: null,
            operator: this.op.name
          }
        ]
      };

      this.$socket.emit("[CASHFLOW] DEPOSIT", record);
      Printer.printCashInReport(record);
      this.isShow.deposit = true;
      this.$q();
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
    logout() {
      this.checkOpenTicket()
        .then(this.askReport)
        .then(this.exit)
        .catch(() => this.$q());
    },
    exit() {
      this.$q();
      this.$router.push({ name: "Login" });
    },
    askReport() {
      return new Promise(next => {
        const prompt = {
          type: "question",
          title: "dialog.printReport",
          msg: ["dialog.printSessionReport", this.$t("type." + this.op.role)],
          buttons: [
            { text: "button.exit", fn: "reject" },
            { text: "button.print", fn: "resolve" }
          ]
        };
        this.op.sessionReport
          ? this.$dialog(prompt)
              .then(() => {
                const date = today();

                this.$socket.emit(
                  "[PAYMENT] VIEW_TRANSACTIONS",
                  date,
                  transactions => {
                    this.printReport(
                      transactions.sort((a, b) =>
                        String(b.ticket ? b.ticket.number : -1).localeCompare(
                          a.ticket ? a.ticket.number : -1,
                          undefined,
                          {
                            numeric: true,
                            sensitivity: "base"
                          }
                        )
                      )
                    );
                    next();
                  }
                );
              })
              .catch(() => next())
          : next();
      });
    },
    printReport(transactions) {
      const { role, name } = this.op;
      let invoices = [];
      let tickets = [];

      switch (role) {
        case "Manager":
          invoices = transactions.slice();
          tickets = this.history.filter(ticket => ticket.status === 1);
          break;
        case "Cashier":
          invoices = transactions.filter(payment => payment.cashier === name);
          tickets = this.history.filter(
            ticket => ticket.cashier === name && ticket.status === 1
          );

          break;
        case "Waitstaff":
          invoices = transactions.filter(payment => payment.server === name);
          tickets = this.history.filter(
            ticket => ticket.server === name && ticket.status === 1
          );
      }

      const payments = invoices.map(i => ({
        number: isObject(i.ticket) ? i.ticket.number : "",
        ticket: isObject(i.ticket) ? this.$t("type." + i.ticket.type) : "",
        tip: i.tip,
        amount: i.actual,
        payment:
          i.type === "THIRD" || i.type === "CREDIT"
            ? i.subType
            : this.$t("type." + i.type)
      }));

      const guest = tickets.reduce((a, c) => a + (c.guest || 0), 0);
      const subtotal = tickets.reduce((a, c) => a + c.payment.subtotal, 0);
      const tax = tickets.reduce((a, c) => a + c.payment.tax, 0);
      const discount = tickets.reduce((a, c) => a + c.payment.discount, 0);
      const rounding = tickets.reduce((a, c) => a + c.payment.rounding, 0);
      const total = toFixed(subtotal + tax - discount + rounding, 2);
      const tip = invoices.reduce((a, c) => a + c.tip, 0);
      const grandTotal = toFixed(total + tip, 2);
      const settled = invoices.reduce((a, c) => a + c.actual, 0);
      const cash = invoices
        .filter(t => t.type === "CASH" || t.subType === "CASH")
        .reduce((a, c) => a + c.actual, 0);
      const settledCount = invoices.length;
      const unsettled = tickets
        .filter(t => !t.settled)
        .reduce((a, c) => a + c.payment.balance, 0);
      const unsettledCount = tickets.filter(t => !t.settled).length;

      const report = {
        title: role + " Report",
        for: name,
        date: moment().format("YYYY-MM-DD HH:mm:ss"),
        payments,
        guest,
        subtotal,
        tax,
        total,
        tip,
        discount,
        rounding,
        grandTotal,
        settled,
        unsettled,
        settledCount,
        cash,
        unsettledCount
      };

      Printer.printSessionReport(report);
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