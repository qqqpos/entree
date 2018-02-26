<template>
  <div class="dashboard">
    <div class="cardWrap" v-if="station" :class="{enlarge:station.enlargeTitle}">
      <div class="card" v-for="(grid,index) in station.interface" @click="access(grid)" :class="{disable:!grid.enable}" :key="index">
        <i class="fa" :class="[grid.icon]"></i>
        <h1>{{grid.head}}</h1>
        <h4>{{grid.subhead}}</h4>
      </div>
    </div>
    <div class="clock">
      <div class="time">{{time | moment('hh:mm')}}</div>
      <div class="date">{{time | moment('dddd MMM D')}}</div>
    </div>
    <toast></toast>
    <transition name="payment">
      <div class="popupMask center dark" v-if="component">
        <div :is="component" :init="componentData"></div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.cardWrap {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 50px;
  width: 704px;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2);
}

.card {
  width: 135px;
  height: 115px;
  padding: 20px;
  margin: 0px;
  cursor: pointer;
  background: #fff;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  transition: background, box-shadow 0.22s ease;
  position: relative;
}

.card.disable {
  pointer-events: none;
}

.card.disable::after {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1;
  content: " ";
}

.card:active {
  background: #f6f6f6;
  color: #666;
  box-shadow: inset 0 1px 6px rgba(0, 0, 0, 0.55);
}

.card:nth-child(n + 5) {
  border-bottom: none;
}

.card:nth-child(4),
.card:nth-child(8) {
  border-right: none;
}

.card i {
  position: absolute;
  right: 20px;
  font-size: 2em;
  color: #039be5;
  text-shadow: 0 -1px 0px rgba(0, 0, 0, 0.5);
}

h4 {
  font-weight: normal;
  color: #757575;
}

h1 {
  font-weight: normal;
  margin-top: 50px;
}

.enlarge h1 {
  font-size: 46px;
}

.dashboard .clock {
  position: absolute;
  bottom: 50px;
  left: 50px;
  color: #f1f1f1;
  text-shadow: 0 3px 5px rgba(0, 0, 0, 0.5);
}

.dashboard .time {
  font-size: 6em;
}

.dashboard .date {
  font-size: 2em;
  margin-top: -10px;
}
</style>

<script>
import { mapActions, mapGetters } from "vuex";
import collector from "./component/collector";
import dialoger from "./common/dialoger";
import toast from "./component/toast";
import unlock from "./common/unlock";

export default {
  components: { dialoger, collector, toast, unlock },
  computed: {
    ...mapGetters([
      "op",
      "time",
      "ring",
      "callLog",
      "device",
      "config",
      "store",
      "dinein",
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
    this.getTicketNumber()
      .then(this.checkTimecard)
      .then(this.checkCashCtrl)
      .then(this.initialized)
      .catch(this.initialFailed);
  },
  methods: {
    getTicketNumber() {
      return new Promise(next => {
        this.$socket.emit("[INQUIRY] TICKET_NUMBER", number => {
          this.setTicket({ number });
          next();
        });
      });
    },
    checkTimecard() {
      return new Promise(next => {
        if (this.authorized) {
          next();
        } else if (
          (this.store.timecard || this.op.timecard) &&
          !this.op.clockIn
        ) {
          const prompt = {
            title: "dialog.clockInRequire",
            msg: "dialog.clockInRequireTip",
            buttons: [
              { text: "button.later", fn: "reject" },
              { text: "button.clockIn", fn: "resolve" }
            ]
          };

          this.$dialog(prompt)
            .then(() => {
              const confirm = {
                type: "question",
                title: "dialog.clockInConfirm",
                msg: [
                  "dialog.clockInTip",
                  moment(this.time).format("hh:mm:ss a")
                ],
                buttons: [{ text: "button.confirm", fn: "resolve" }]
              };

              this.setOp({ clockIn: this.time, session: ObjectId() });
              this.$socket.emit("[TIMECARD] CLOCK_IN", this.op);
              this.$dialog(confirm).then(() => next());
            })
            .catch(() => next());
        } else if (this.op.break) {
          const duration = moment
            .duration(+new Date() - this.op.break, "milliseconds")
            .humanize();

          this.$dialog({
            type: "question",
            title: "dialog.endBreakTime",
            msg: ["dialog.endBreakTimeTip", duration]
          })
            .then(() => {
              this.$socket.emit("[TIMECARD] BREAK_END", this.op);
              this.setOp({ break: null });
              next();
            })
            .catch(() => next());
        } else {
          next();
        }
      });
    },
    checkCashCtrl() {
      return new Promise(next => {
        const { enable, name, cashFlowCtrl } = this.station.cashDrawer;

        this.$socket.emit(
          "[CASHFLOW] CHECK",
          {
            date: today(),
            cashDrawer: name,
            close: false
          },
          ({ name, initial }) => {
            if (this.authorized) {
              next();
            } else if (initial && enable && cashFlowCtrl) {
              this.askCashIn();
              next();
            } else {
              next();
              this.$q();
            }
          }
        );
      });
    },
    askCashIn() {
      const amount = this.station.cashDrawer.initialAmount;
      const prompt = { title: "dialog.cashIn", msg: "dialog.cashInTip" };

      this.$dialog(prompt)
        .then(() => this.countInitialCash(amount))
        .catch(() => this.$q());
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
          .catch(() => this.countInitialCash());
      } else {
        new Promise((resolve, reject) => {
          this.componentData = { resolve, reject };
          this.component = "collector";
        })
          .then(this.countInitialCash)
          .catch(() => this.$q());
      }
    },
    initialized() {
      this.device.poleDisplay && this.welcomeScreen();
      const { enable, timeout } = this.station.autoLock;

      enable && timeout > 0
        ? this.setApp({ autoLock: true, lastActivity: +new Date() })
        : this.setApp({ autoLock: false });
    },
    initialFailed(error) {
      this.$log({
        eventID: 9101,
        type: "failure",
        note: `Dashboard initial has failed.\n\nError Message:\n${JSON.stringify(
          error
        )}`
      });
    },
    welcomeScreen() {
      const { top, bot } = this.station.pole;
      poleDisplay.write("\f");
      poleDisplay.write(line(top, bot));
    },
    access(grid) {
      const { route, password } = grid;

      new Promise((next, stop) => {
        if (password) {
          new Promise((resolve, reject) => {
            this.componentData = { resolve, reject };
            this.component = "unlock";
          })
            .then(_op => {
              _op._id === this.op._id ? next() : stop();
            })
            .catch(() => stop());
        } else {
          next();
        }
      })
        .then(() => {
          this.$q();
          this.go(route);
        })
        .catch(() => {
          const prompt = {
            type: "warning",
            title: "dialog.accessDenied",
            msg: "dialog.accessPinNotMatch",
            buttons: [{ text: "button.confirm", fn: "reject" }]
          };
          this.$accessDenied(prompt);
          this.$log({
            eventID: 9100,
            type: "failure",
            note: `Attempt access ${route} failed.`
          });
        });
    },
    go(route) {
      switch (route) {
        case "buffet":
          this.emptyCustomerInfo();
          this.setTicket({ type: "BUFFET" });
          this.$router.push({ path: "/main/menu" });
          break;
        case "sale":
          this.emptyCustomerInfo();
          this.setTicket({ type: "SALES" });
          this.$router.push({ path: "/main/menu" });
          break;
        case "order":
          this.emptyCustomerInfo();
          this.setTicket({ type: "WALK_IN" });
          this.$router.push({ path: "/main/menu" });
          break;
        case "pickup":
          this.setTicket({ type: "PICK_UP" });
          this.ring && this.setCustomer(this.callLog[0]);
          this.$router.push({ path: "/main/customer" });
          break;
        case "delivery":
          this.setTicket({ type: "DELIVERY" });
          this.ring && this.setCustomer(this.callLog[0]);
          this.$router.push({ path: "/main/customer" });
          break;
        case "table":
          if (this.dinein.table) {
            this.$router.push({ path: "/main/table" });
          } else {
            this.setTicket({ type: "DINE_IN" });
            this.$router.push({ path: "/main/menu" });
          }
          break;
        case "pickupList":
          this.$router.push({ path: "/main/list" });
          break;
        case "history":
          this.$checkPermission("access", route)
            .then(() => this.$router.push({ path: "/main/history" }))
            .catch(() =>
              this.$log({
                eventID: 9100,
                type: "failure",
                source: "dashboard",
                note: "Access Denied when attempt access history."
              })
            );
          break;
        case "setting":
          this.$checkPermission("access", route)
            .then(() => this.$router.push({ path: "/main/setting" }))
            .catch(() =>
              this.$log({
                eventID: 9100,
                type: "failure",
                source: "dashboard",
                note: "Access Denied when attempt access back office setting."
              })
            );
          break;
        case "cashDrawer":
          this.station.cashDrawer.enable
            ? this.cashDrawerAvailable()
            : this.cashDrawerUnavailable();
          break;
        case "lock":
          this.resetAll();
          this.setOp(null);
          this.$router.push({ path: "/main/lock" });
          break;
        default:
      }
    },
    cashDrawerAvailable() {
      switch (this.op.cashCtrl) {
        case "enable":
          this.station.cashDrawer.cashFlowCtrl
            ? this.$socket.emit(
                "[CASHFLOW] CHECK",
                {
                  date: today(),
                  cashDrawer: this.station.cashDrawer.name,
                  close: false
                },
                data => {
                  let { name, initial } = data;
                  initial
                    ? this.initialCashFlow(name)
                    : this.recordCashFlow(name);
                }
              )
            : Printer.openCashDrawer();
          break;
        case "staffBank":
          this.$socket.emit(
            "[CASHFLOW] CHECK",
            { date: today(), cashDrawer: this.op.name, close: false },
            data => {
              let { name, initial } = data;
              initial ? this.initialCashFlow(name) : this.recordCashFlow(name);
            }
          );
          break;
        case "disable":
          this.$denyAccess();
          break;
        default:
          this.$denyAccess();
      }
    },
    cashDrawerUnavailable() {
      const prompt = {
        title: "dialog.cashDrawerUnavailable",
        msg: "dialog.cashDrawerUnavailableTip",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.$dialog(prompt).then(() => this.$q());
    },
    askSelfCashIn() {
      this.$dialog({ title: "dialog.selfCashIn", msg: "dialog.selfCashInTip" })
        .then(() => this.countSelfCash())
        .catch(() => this.$q());
    },
    countSelfCash(amount) {
      if (isNumber(amount)) {
        this.$dialog({
          title: "dialog.selfCashInConfirm",
          msg: ["dialog.selfCashInConfirmTip", amount.toFixed(2)]
        })
          .then(() => this.acceptCashIn(amount))
          .catch(() => this.countSelfCash());
      } else {
        new Promise((resolve, reject) => {
          this.componentData = { resolve, reject };
          this.component = "collector";
        })
          .then(this.countSelfCash)
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

      this.$socket.emit("[CASHFLOW] INITIAL", record);
      Printer.printCashInReport(record);
      this.$q();
    },
    recordCashFlow(cashDrawer) {
      if (this.op.cashCtrl === "enable") {
        Printer.openCashDrawer();

        const activity = {
          type: "OPEN",
          inflow: 0,
          outflow: 0,
          time: +new Date(),
          ticket: null,
          operator: this.op.name
        };
        this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });
      } else {
        const prompt = {
          title: "dialog.staffBankMode",
          msg: "dialog.staffBankModeTip",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        this.$dialog(prompt).then(() => this.$q());
      }
    },
    initialCashFlow(name) {
      this.op.cashCtrl === "enable" ? this.askCashIn() : this.askSelfCashIn();
    },
    ...mapActions([
      "setOp",
      "setApp",
      "setTicket",
      "setOrder",
      "resetAll",
      "setCustomer",
      "setStation",
      "setStations",
      "emptyCustomerInfo"
    ])
  }
};
</script>