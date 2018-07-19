<template>
  <div class="popupMask dark" @click.self="init.resolve">
    <transition appear name="fadeDown">
      <ul class="panel">
        <div v-if="op.timecard || store.timecard.enable">
          <li v-if="op.clockIn" @click="askClockOut">
            <i class="fas fa-2x fa-user-clock"></i>
            <div>
              <h3>{{$t('dock.clockOut')}}</h3>
              <h5 class="clock">
                <span class="time">{{time | moment('HH:mm:ss')}}</span>
                <span class="pass">{{op.clockIn | fromNow(true)}}</span>
              </h5>
            </div>
            <div class="extra" @click.stop="startBreakTime" v-if="!op.break">
              <i class="fas fa-coffee"></i>
              <span>{{$t('button.break')}}</span>
            </div>
            <div class="extra" @click.stop="endBreakTime" v-else>
              <i class="fas fa-briefcase"></i>
              <span>{{$t('button.work')}}</span>
            </div>
          </li>
          <li v-else @click="askClockIn">
            <i class="fas fa-2x fa-user-clock"></i>
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
        <li @click="$open('giftcard')" v-show="giftcardEnable">
          <i class="fa fa-2x fa-gift"></i>
          <div>
            <h3>{{$t('dock.giftCard')}}</h3>
            <h5>{{$t('dock.giftCardTip')}}</h5>
          </div>
        </li>
        <li @click="openPayout" v-if="station.cashDrawer.enable">
          <i class="fas fa-2x fa-hand-holding-usd"></i>
          <div>
            <h3>{{$t('dock.payout')}}</h3>
            <h5>{{$t('dock.payoutTip')}}</h5>
          </div>
        </li>
        <template v-if="isShow.cashCtrl">
          <template v-if="isShow.staffBank">
            <li @click="askStaffCashIn" v-if="!isShow.deposit">
              <i class="fas fa-2x fa-donate"></i>
              <div>
                <h3>{{$t('dock.staffCashIn')}}</h3>
                <h5>{{$t('dock.staffCashInTip')}}</h5>
              </div>
          </li>
          <li @click="askStaffCashOut" v-else>
            <i class="fas fa-2x fa-donate"></i>
            <div>
              <h3>{{$t('dock.staffCashOut')}}</h3>
              <h5>{{$t('dock.staffCashOutTip')}}</h5>
            </div>
          </li>
          </template>
          <template v-else>
             <li @click="askCashDrawerCashIn" v-if="!isShow.deposit">
              <i class="fas fa-2x fa-donate"></i>
              <div>
                <h3>{{$t('dock.cashDrawerCashIn')}}</h3>
                <h5>{{$t('dock.cashInTip')}}</h5>
              </div>
              </li>
              <li @click="askCashDrawerCashOut" v-else>
                <i class="fas fa-2x fa-donate"></i>
                <div>
                  <h3>{{$t('dock.cashDrawerCashOut')}}</h3>
                  <h5>{{$t('dock.cashDrawerCashOutTip')}}</h5>
                </div>
              </li>
          </template>
        </template>
        <li @click="report" v-show="op.sessionReport">
          <i class="fa fa-2x fa-print"></i>
          <div>
            <h3>{{$t('dock.report')}}</h3>
            <h5>{{$t('dock.reportTip')}}</h5>
          </div>
        </li>
        <li @click="openSetting" v-show="authorized || op.role === 'Manager'">
          <i class="fas fa-2x fa-user-cog"></i>
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
          <i class="fas fa-2x fa-sign-out-alt"></i>
          <div>
            <h3>{{$t('dock.logout')}}</h3>
            <h5>{{$t('dock.logoutTip')}}</h5>
          </div>
        </li>
        <li @click="checkUpdate" v-show="op.role === 'Developer' && !updateStatus">
          <i class="fas fa-2x fa-sync-alt"></i>
          <div>
            <h3>{{$t('dock.update')}}</h3>
            <h5>{{$t('dock.updateApp')}}</h5>
          </div>
        </li>
        <li @click="downloadUpdate" v-if="updateStatus === 'available'">
          <i class="fas fa-2x fa-bell"></i>
          <div>
            <h3>{{$t('dock.downloadUpdate')}}</h3>
            <h5>{{$t('dock.downloadUpdateFile',updateMeta.version)}}</h5>
          </div>
        </li>        
        <li v-else-if="updateStatus === 'download'">
          <i class="fas fa-2x fa-download"></i>
          <div>
            <h3>{{$t('dock.downloading')}}</h3>
            <h5>{{$t('dock.downloadingFile')}}</h5>
          </div>
        </li>    
        <li @click="applyUpdate" v-else-if="updateStatus === 'ready'">
          <i class="fas fa-2x fa-window-restore"></i>
          <div>
            <h3>{{$t('dock.applyUpdate')}}</h3>
            <h5>{{$t('dock.updateVersion')}}</h5>
          </div>
        </li>           
      </ul>
    </transition>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import collector from "../../component/collector";
import inputModule from "../../component/inputer";
import dialogModule from "../../common/dialog";
import unlockModule from "../../common/unlock";
import terminal from "../../history/terminal";
import giftcard from "../../giftcard/index";
import payout from "../payout";

export default {
  props: ["init"],
  components: {
    unlockModule,
    dialogModule,
    inputModule,
    collector,
    terminal,
    giftcard,
    payout
  },
  computed: {
    ...mapGetters([
      "op",
      "app",
      "tax",
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
      isShow: this.init.args,
      giftcardEnable: false,
      componentData: null,
      component: null,
      updateStatus: null,
      updater: null,
      updateMeta: {}
    };
  },
  created() {
    const { giftcard = {} } = this.$store.getters.store;
    this.giftcardEnable = giftcard.enable;
    this.updater = this.$electron.remote.require("electron-simple-updater");

    this.updater.on("update-available", meta => {
      this.updateMeta = meta;
      this.updateStatus = "available";
    });

    this.updater.on("update-not-available", () => {
      const prompt = {
        title: "dialog.alreadyUpToDate",
        msg: "dialog.latestVersion",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.$dialog(prompt).then(this.exitComponent);
    });

    this.updater.on("update-downloading", () => {
      this.updateStatus = "download";
    });

    this.updater.on("update-downloaded", () => {
      this.updateStatus = "ready";
    });

    this.updater.on("error", log => {
      const prompt = {
        type: "error",
        title: "dialog.updateFail",
        msg: ["dialog.message", log],
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };
      this.updateStatus = null;
      this.$dialog(prompt).then(this.exitComponent);
    });
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
      this.$checkPermission("access", "setting")
        .then(() => {
          this.init.resolve();
          this.$router.push({ path: "/main/setting" });
        })
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
        msg: ["dialog.clockInTime", moment(this.time).format("hh:mm:ss a")]
      };
      
      this.$dialog(prompt)
        .then(() => {
          this.setOperator({ clockIn: this.time, session: ObjectId().toString() });
          this.$socket.emit("[TIMECARD] CLOCK_IN", this.op);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    askClockOut() {
      const diff = moment().diff(moment(this.op.clockIn));

      const h =
        ("0" + Math.floor(diff / 36e5)).slice(-2) + " " + this.$t("text.hour");
      const m =
        ("0" + Math.floor(diff / 6e4)).slice(-2) + " " + this.$t("text.minute");

      let d = Math.round(diff / 864e5);
      let msg = [];

      if (d > 1) {
        d += " " + this.$t("text.day");
        msg = [
          "dialog.clockOutTip",
          moment(this.op.clockIn).format("MM-DD hh:mm a"),
          d + "" + h + " " + m
        ];
      } else {
        msg = [
          "dialog.clockOutTip",
          moment(this.op.clockIn).format("hh:mm:ss a"),
          h + " " + m
        ];
      }

      const prompt = { type: "question", title: "dialog.clockOutConfirm", msg };

      this.checkOpenTicket()
        .then(() => {
          this.$dialog(prompt)
            .then(() => {
              console.log(this.store.timecard);
              this.store.timecard.tipReport
                ? this.reportTip()
                : this.clockOut();
            })
            .catch(this.exitComponent);
        })
        .catch(this.exitComponent);
    },
    reportTip() {
      new Promise((resolve, reject) => {
        const config = {
          title: "title.reportTip",
          type: "decimal",
          percentage: false,
          allowPercentage: false,
          amount: "0.00"
        };
        this.componentData = Object.assign({ resolve, reject }, config);
        this.component = "inputModule";
      })
        .then(({ amount }) => {
          const prompt = {
            type: "question",
            title: "dialog.tipConfirm",
            msg: ["dialog.tipReportConfirm", amount.toFixed(2)],
            buttons: [
              { text: "button.reenter", fn: "reject" },
              { text: "button.confirm", fn: "resolve" }
            ]
          };

          this.$dialog(prompt)
            .then(this.clockOut.bind(null, amount))
            .catch(this.reportTip);
        })
        .catch(this.exitComponent);
    },
    clockOut(tip = 0) {
      this.exitComponent();
      this.$socket.emit("[TIMECARD] CLOCK_OUT", { op: this.op, tip });
      this.setOperator({ clockIn: null, session: null });
      this.$router.push({ path: "/main/lock" });
      this.init.resolve();
    },
    checkOpenTicket() {
      return new Promise((next, stop) => {
        const server = this.op.name;
        const doneJob = this.history
          .filter(invoice => invoice.server === server && invoice.status === 1)
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
        msg: "dialog.startBreakTimeConfirm"
      };

      this.$dialog(prompt)
        .then(() => {
          this.$socket.emit("[TIMECARD] BREAK_START", this.op);
          this.setOperator({ clockIn: null, session: null });
          this.$router.push({ path: "/main/lock" });
          this.init.resolve();
        })
        .catch(this.exitComponent);
    },
    endBreakTime() {
      const duration = moment
        .duration(+new Date() - this.op.break, "milliseconds")
        .humanize();

      const prompt = {
        type: "question",
        title: "dialog.endBreakTime",
        msg: ["dialog.endBreakTimeConfirm", duration]
      };

      this.$dialog(prompt)
        .then(() => {
          this.$socket.emit("[TIMECARD] BREAK_END", this.op);
          this.setOperator({ break: null });
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    askCashDrawerCashIn() {
      const amount = this.station.cashDrawer.initialAmount;
      const prompt = { title: "dialog.cashIn", msg: "dialog.cashInTip" };

      this.$dialog(prompt)
        .then(this.countInitialCash)
        .catch(this.exitComponent);
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
        .catch(this.exitComponent);
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
          .catch(this.exitComponent);
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
          .catch(this.exitComponent);
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
        beginTime: Date.now(),
        end: null,
        endTime: null,
        close: false,
        activity: [
          {
            type: "START",
            inflow: parseFloat(amount),
            outflow: 0,
            time: Date.now(),
            ticket: null,
            operator: this.op.name
          }
        ]
      };

      this.$socket.emit("[CASHFLOW] DEPOSIT", record);
      Printer.printCashInReport(record);
      this.isShow.deposit = true;
      this.exitComponent();
    },
    cashOut(cashDrawer) {
      this.exitComponent();
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
        time: Date.now(),
        ticket: null,
        operator: this.op.name
      };

      this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });
    },
    logout() {
      this.$checkPermission("access", "exit")
        .then(() => {
          this.checkOpenTicket()
            .then(this.exit)
            .catch(this.exitComponent);
        })
        .catch(() => {});
    },
    exit() {
      this.exitComponent();
      this.$router.push({ name: "Login" });
    },
    report() {
      this.checkOpenTicket()
        .then(this.askReport)
        .then(this.exitComponent)
        .catch(this.exitComponent);
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
    checkUpdate() {
      this.updater.checkForUpdates();
    },
    downloadUpdate() {
      this.updater.downloadUpdate();
    },
    applyUpdate() {
      this.updater.quitAndInstall();
    },
    printReport(transactions) {
      const { role, name } = this.op;
      let invoices = [];
      let tickets = [];
      let title = role + " Report";
      let subtitle = "Payments";

      switch (role) {
        case "Manager":
          subtitle = "All Tickets";
          invoices = transactions.slice();
          tickets = this.history.filter(t => t.status === 1);
          break;
        case "Cashier":
        case "Bartender":
          subtitle = "Payment Handled By " + name;
          invoices = transactions.filter(p => p.cashier === name);
          tickets = this.history.filter(
            t => t.cashier === name && t.status === 1
          );
          break;
        case "Waitstaff":
          subtitle = "Order Taken By " + name;
          invoices = transactions.filter(p => p.server === name);
          tickets = this.history.filter(
            t => t.server === name && t.status === 1
          );
      }

      const payments = invoices.map(i => ({
        create: i.create || i.time,
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
      const gratuity = tickets.reduce((a, c) => a + c.payment.gratuity, 0);
      const grandTotal = toFixed(total + tip + gratuity, 2);
      const settled = invoices.reduce((a, c) => a + c.actual, 0);
      const cash = invoices
        .filter(t => t.type === "CASH" || t.subType === "CASH")
        .reduce((a, c) => a + c.actual, 0);
      const settledCount = invoices.length;
      const unsettled = tickets
        .filter(t => !t.settled)
        .reduce((a, c) => a + c.payment.balance, 0);
      const unsettledCount = tickets.filter(t => !t.settled).length;

      //session report
      const weekDay = moment().format("d");
      const { hours } = this.store.openingHours.rules[weekDay];
      const sessions = hours
        .map(({ from, to, alias }) => ({
          from: +new Date(today() + " " + from),
          to: +new Date(today() + " " + to),
          alias
        }))
        .map(hour => {
          const orders = payments.filter(
            ({ create }) => create >= hour.from && create <= hour.to
          );

          const group = {};

          orders.forEach(({ ticket, tip, amount }) => {
            if (group.hasOwnProperty(ticket)) {
              group[ticket].count++;
              group[ticket].tip += tip;
              group[ticket].amount += amount;
            } else {
              group[ticket] = {
                type: ticket,
                count: 1,
                tip,
                amount
              };
            }
          });

          const count = orders.length;
          const amount = orders.reduce((a, c) => a + c.amount, 0);
          const tip = orders.reduce((a, c) => a + c.tip, 0);

          return Object.assign(hour, {
            count,
            amount,
            tip,
            type: Object.values(group).sort((a, b) => a.amount < b.amount)
          });
        });
      //end of session report

      //department report
      let departments = this.departments.map(dep =>
        Object.assign({}, dep, { count: 0, subtotal: 0, tax: 0, total: 0 })
      );

      if (departments.length > 0) {
        departments.push({
          usEN: "Others",
          zhCN: "Others",
          contain: [],
          count: 0,
          subtotal: 0,
          tax: 0,
          total: 0
        });

        const depLength = departments.length - 1;

        tickets.forEach(({ type, content, taxFree = false }) => {
          content.forEach(({ category, qty, single, taxClass, choiceSet }) => {
            const index = departments.findIndex(dep =>
              dep.contain.includes(category)
            );

            const Tax = this.tax.class[taxClass];

            let tax = 0;
            let amount = toFixed(qty * single, 2);

            choiceSet.forEach(set => {
              const p = parseFloat(set.single);
              const s = set.qty || 1;
              const t = toFixed(p * s, 2);
              amount = toFixed(amount + t, 2);
            });

            if (!taxFree && Tax.apply[type]) tax += Tax.rate / 100 * amount;

            if (index === -1) {
              departments[depLength].count += qty;
              departments[depLength].subtotal += amount;
              departments[depLength].tax += tax;
              departments[depLength].total += amount + tax;
            } else {
              departments[index].count += qty;
              departments[index].subtotal += amount;
              departments[index].tax += tax;
              departments[index].total += amount + tax;
            }
          });
        });

        departments.last().count === 0 && departments.pop();
      }

      const report = {
        title,
        subtitle,
        for: name,
        date: today(),
        payments,
        guest,
        subtotal,
        tax,
        total,
        tip,
        gratuity,
        discount,
        rounding,
        grandTotal,
        settled,
        unsettled,
        settledCount,
        cash,
        unsettledCount,
        sessions,
        departments
      };
      Printer.printSessionReport(report);
    },
    ...mapActions(["setApp", "setOperator"])
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
  right: 70px;
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