<template>
  <aside>
    <button class="btn" @click="editOrder">
      <i class="fas fa-edit"></i>
      <span class="text">{{$t('button.edit')}}</span>
    </button>
    <button class="btn" @click="reOpenOrder" v-if="this.order && this.order.status !== 1">
      <i class="fas fa-redo-alt"></i>
      <span class="text">{{$t('button.recover')}}</span>
    </button>
    <button class="btn" @click="voidOrder" v-else>
      <i class="fab fa-creative-commons-nc"></i>
      <span class="text">{{$t('button.void')}}</span>
    </button>
    <button class="btn" @click="receipt">
      <i class="fas fa-file-invoice"></i>
      <span class="text">{{$t('button.receipt')}}</span>
    </button>
    <button class="btn" @click="combine" :disabled="true">
      <i class="fa fa-link"></i>
      <span class="text">{{$t('button.combine')}}</span>
    </button>
    <button class="btn" @click="print">
      <i class="fa fa-print"></i>
      <span class="text">{{$t('button.print')}}</span>
    </button>
    <button class="btn" @click="calendar">
      <i class="fas fa-calendar-alt"></i>
      <span class="text">{{$t('button.calendar')}}</span>
    </button>
    <button class="btn" @click="terminal">
      <i class="fa fa-tablet-alt"></i>
      <span class="text">{{$t('button.terminal')}}</span>
    </button>
    <button class="btn" @click="report">
      <i class="fas fa-clipboard-check"></i>
      <span class="text">{{$t('button.report')}}</span>
    </button>
    <button class="btn" @click="getTransaction" :disabled="!reportable">
      <i class="fas fa-list-ol"></i>
      <span class="text">{{$t('button.stats')}}</span>
    </button>
    <button class="btn" @click="getLedger">
      <i class="fas fa-check-double"></i>
      <span class="text">{{$t('button.ledger')}}</span>
    </button>
    <div :is="component" :init="componentData"></div>
  </aside>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import calendarModule from "./component/calendar";
import dialogModule from "../common/dialog";
import unlockModule from "../common/unlock";
import reportModule from "../report/index";
import ledgerModule from "../ledger/index";
import terminalModule from "./terminal";
import transaction from "./transaction";
import Reason from "./component/reason";
import loger from "../payment/loger";

export default {
  props: ["date"],
  components: {
    calendarModule,
    terminalModule,
    dialogModule,
    reportModule,
    unlockModule,
    ledgerModule,
    transaction,
    Reason,
    loger
  },
  data() {
    return {
      today: today(),
      reportable: false,
      component: null,
      componentData: null
    };
  },
  created() {
    this.reportable = this.approval(this.op.access, "report");
  },
  methods: {
    editOrder() {
      if (this.isEmptyTicket) return;

      this.$checkPermission("modify", "order")
        .then(() => {
          this.checkDate()
            .then(this.checkStatus)
            .then(this.checkSettlement)
            .then(this.edit)
            .catch(this.editFailed);
        })
        .catch(() => {});
    },
    voidOrder() {
      if (this.isEmptyTicket) return;

      this.$checkPermission("modify", "order")
        .then(() => {
          this.checkDate()
            .then(this.checkSettlement)
            .then(this.voidTicket)
            .catch(this.voidFailed);
        })
        .catch(() => {});
    },
    checkDate() {
      return new Promise((next, stop) => {
        const prompt = {
          title: "dialog.unableEdit",
          msg: "dialog.editPrevOrderTip",
          buttons: [{ text: "button.confirm", fn: "reject" }]
        };

        this.date === this.today
          ? next()
          : this.approval("permission", "anydate") ? next() : stop(prompt);
      });
    },
    checkStatus() {
      return new Promise((next, stop) => {
        this.order.status === 1
          ? next()
          : stop({
              title: "dialog.unableEdit",
              msg: ["dialog.editVoidOrderTip", this.order.void.by],
              buttons: [{ text: "button.confirm", fn: "reject" }]
            });
      });
    },
    checkSettlement() {
      return new Promise((next, stop) => {
        const ticketSettled = {
          type: "question",
          title: "dialog.ticketClosed",
          msg: "dialog.removePaymentRecordFirst",
          buttons: [
            { text: "button.removePayment", fn: "resolve" },
            { text: "button.cancel", fn: "reject" }
          ]
        };
        const paymentFoundError = {
          type: "question",
          title: "dialog.paymentFound",
          msg: "dialog.removePaymentRecordFirst",
          buttons: [
            { text: "button.removePayment", fn: "resolve" },
            { text: "button.cancel", fn: "reject" }
          ]
        };

        const splitTicketAction = {
          type: "question",
          title: "dialog.splitTicketPaymentFound",
          msg: "dialog.whatNext",
          buttons: [
            { text: "button.removePayment", fn: "resolve" },
            { text: "button.edit", fn: "reject" }
          ]
        };

        if (this.order.settled) throw ticketSettled;

        this.$socket.emit("[PAYMENT] COUNT", this.order._id, count => {
          count > 0
            ? this.order.split
              ? stop(splitTicketAction)
              : stop(paymentFoundError)
            : next();
        });
      });
    },
    edit(prompt) {
      if (isObject(prompt)) {
        this.$dialog(prompt)
          .then(this.removePaymentRecord)
          .catch(() => {
            this.exitComponent();
            this.edit();
          });
      } else {
        const { type, number, customer } = this.order;

        this.setApp({ newTicket: false });
        this.setCustomer(customer);
        this.setTicket({ type, number });

        this.$router.push({ path: "/main/menu" });
      }
    },
    editFailed(reason) {
      reason.hasOwnProperty("title")
        ? this.$dialog(reason)
            .then(this.removePaymentRecord)
            .catch(this.exitComponent)
        : this.edit();
    },
    voidTicket(p) {
      const prompt = {
        type: "warning",
        title: [
          "dialog.voidOrderConfirm",
          this.order.number,
          this.$t("type." + this.order.type)
        ],
        msg: "dialog.voidOrderConfirmTip",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.void", fn: "resolve" }
        ]
      };

      this.$checkPermission("modify", "void")
        .then(() => {
          this.$dialog(prompt)
            .then(confirm => this.$open("Reason"))
            .catch(this.exitComponent);
        })
        .catch(() => {});
    },
    voidFailed(reason) {
      this.$dialog(reason)
        .then(this.removePaymentRecord)
        .catch(this.exitComponent);
    },
    removePaymentRecord() {
      new Promise((resolve, reject) => {
        const { _id, number } = this.order;
        this.$socket.emit("[PAYMENT] GET_LOG", _id, logs => {
          this.componentData = { resolve, reject, number, logs };
          this.component = "loger";
        });
      }).then(() => {
        this.exitComponent();
        this.$socket.emit("[INVOICE] UPDATE", this.order);
      });
    },
    reOpenOrder() {
      if (this.isEmptyTicket) return;

      const prompt = {
        type: "question",
        title: ["dialog.recoverOrderConfirm", this.order.number],
        msg: [
          "dialog.recoverOrderConfirmTip",
          this.order.void.by,
          this.$t("reason." + this.order.void.note)
        ]
      };

      this.$checkPermission("modify", "void")
        .then(() => {
          this.$dialog(prompt)
            .then(() => {
              let order = JSON.parse(JSON.stringify(this.order));
              order.status = 1;
              delete order.void;
              this.updateInvoice(order);
              this.exitComponent();
            })
            .catch(this.exitComponent);
        })
        .catch(() => {});
    },
    calendar() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "calendarModule";
      })
        .then(date => {
          this.$emit("change", date);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    combine() {},
    print() {
      if (this.isEmptyTicket) return;

      if (this.order.print) {
        this.$checkPermission("permission", "reprint")
          .then(this.rePrint)
          .catch(() => {});
      } else {
        const order = JSON.parse(JSON.stringify(this.order));
        order.split ? this.askSplitPrint(order) : this.printTicket(order);
      }
    },
    rePrint() {
      const order = JSON.parse(JSON.stringify(this.order));

      Object.assign(order, {
        content: order.content.map(item => {
          item.print = false;
          item.pending = false;
          return item;
        }),
        print: false
      });

      const prompt = {
        type: "warning",
        title: "dialog.reprintConfirm",
        msg: "dialog.reprintTicketAgain"
      };

      this.$dialog(prompt)
        .then(
          () =>
            order.split ? this.askSplitPrint(order) : this.printTicket(order)
        )
        .catch(this.exitComponent);
    },
    receipt() {
      if (this.isEmptyTicket) return;

      const order = JSON.parse(JSON.stringify(this.order));
      order.split
        ? this.askSplitPrintReceipt(order)
        : this.printTicket(order, true);
    },
    askSplitPrint(order) {
      const prompt = {
        type: "question",
        title: "dialog.printSplitTicket",
        msg: "dialog.printSplitTicketTip",
        buttons: [
          { text: "button.combinePrint", fn: "reject" },
          { text: "button.splitPrint", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => this.splitPrint(order))
        .catch(() => this.printTicket(order));
    },
    askSplitPrintReceipt(order) {
      const prompt = {
        type: "question",
        title: "dialog.printSplitTicket",
        msg: "dialog.printSplitTicketTip",
        buttons: [
          { text: "button.combinePrint", fn: "reject" },
          { text: "button.splitPrint", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => this.splitPrint(order, true))
        .catch(() => this.printTicket(order, true));
    },
    printTicket(order, receipt) {
      order.printCount++;

      this.exitComponent();
      this.updateInvoice(order);

      order.content.forEach(item => (item.diffs = "UNCHANGED"));
      receipt
        ? Printer.setTarget("Receipt").print(order, true)
        : Printer.setTarget("All").print(order);
    },
    splitPrint(order, receipt) {
      order.printCount++;

      this.exitComponent();
      this.updateInvoice(order);

      this.$socket.emit("[SPLIT] GET", order.children, splits => {
        splits.forEach(ticket => {
          receipt
            ? Printer.setTarget("Receipt").print(ticket, true)
            : Printer.setTarget("All").print(ticket);
        });
      });
    },
    terminal() {
      this.$checkPermission("access", "terminal")
        .then(() =>
          this.$socket.emit("[TERMINAL] TODAY", transactions =>
            this.$open("terminalModule", { transactions })
          )
        )
        .catch(() => this.accessFailedLog("terminal"));
    },
    report() {
      this.$checkPermission("access", "report")
        .then(() => this.$open("reportModule"))
        .catch(() => this.accessFailedLog("report"));
    },
    getLedger() {
      this.$checkPermission("permission", "ledger")
        .then(() => this.$open("ledgerModule"))
        .catch(() => this.accessFailedLog("ledger"));
    },
    accessFailedLog(component) {
      this.$log({
        eventID: 5000,
        note: `Permission Denied. Failed to access ${component}.`
      });
    },
    updateInvoice(ticket) {
      this.$socket.emit("[INVOICE] UPDATE", ticket, true);
    },
    getTransaction() {
      const date = document.querySelector("#calendar .text").innerText;

      this.$socket.emit("[PAYMENT] VIEW_TRANSACTIONS", date, transactions => {
        this.$open("transaction", {
          data: transactions.sort((a, b) =>
            String(b.ticket ? b.ticket.number : -1).localeCompare(
              a.ticket ? a.ticket.number : -1,
              undefined,
              {
                numeric: true,
                sensitivity: "base"
              }
            )
          )
        });
      });
    },
    ...mapActions([
      "setApp",
      "setOrder",
      "setTicket",
      "resetMenu",
      "setCustomer",
      "removePayment"
    ])
  },
  computed: {
    ...mapGetters(["op", "order", "station", "isEmptyTicket"])
  }
};
</script>

<style scoped>
aside {
  display: flex;
  flex-direction: column;
  padding: 4px;
}
</style>