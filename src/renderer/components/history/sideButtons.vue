<template>
  <aside>
    <button class="btn" @click="editOrder">
      <i class="fa fa-pencil-square-o"></i>
      <span class="text">{{$t('button.edit')}}</span>
    </button>
    <button class="btn" @click="reOpenOrder" v-if="this.order && this.order.status !== 1">
      <i class="fa fa-ban"></i>
      <span class="text">{{$t('button.recover')}}</span>
    </button>
    <button class="btn" @click="voidOrder" v-else>
      <i class="fa fa-ban"></i>
      <span class="text">{{$t('button.void')}}</span>
    </button>
    <button class="btn" @click="isSettled" :disabled="order.settled">
      <i class="fa fa-money"></i>
      <span class="text">{{$t('button.payment')}}</span>
    </button>
    <button class="btn" @click="receipt">
      <i class="fa fa-print"></i>
      <span class="text">{{$t('button.receipt')}}</span>
    </button>
    <button class="btn" @click="print">
      <i class="fa fa-print"></i>
      <span class="text">{{$t('button.print')}}</span>
    </button>
    <button class="btn" @click="calendar">
      <i class="fa fa-calendar"></i>
      <span class="text">{{$t('button.calendar')}}</span>
    </button>
    <button class="btn" @click="terminal">
      <i class="fa fa-tablet"></i>
      <span class="text">{{$t('button.terminal')}}</span>
    </button>
    <button class="btn" @click="report">
      <i class="fa fa-file-text"></i>
      <span class="text">{{$t('button.report')}}</span>
    </button>
    <button class="btn" @click="getTransaction" :disabled="!reportable">
      <i class="fa fa-bar-chart"></i>
      <span class="text">{{$t('button.stats')}}</span>
    </button>
    <button class="btn" @click="getLedger">
      <i class="fa fa-check-square-o"></i>
      <span class="text">{{$t('button.ledger')}}</span>
    </button>
    <div :is="component" :init="componentData"></div>
  </aside>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import Calendar from "./component/calendar";
import paymentMark from "../payment/mark";
import Dialoger from "../common/dialoger";
import remover from "../payment/remover";
import transaction from "./transaction";
import Reason from "./component/reason";
import Payment from "../payment/index";
import reporter from "../report/index";
import unlock from "../common/unlock";
import ledger from "../ledger/index";
import Terminal from "./terminal";

export default {
  props: ["date"],
  components: {
    paymentMark,
    transaction,
    ledger,
    Calendar,
    Dialoger,
    Terminal,
    Payment,
    unlock,
    Reason,
    reporter,
    remover
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

        this.date === this.today ? next() : stop(prompt);
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
      return new Promise((resolve, reject) => {
        const ticketSettledError = {
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
        if (this.order.settled) throw ticketSettledError;

        this.$socket.emit("[PAYMENT] COUNT", this.order._id, count => {
          count > 0 ? reject(paymentFoundError) : resolve();
        });
      });
    },
    edit() {
      const { type, number } = this.order;

      this.setApp({ newTicket: false });
      this.setCustomer(this.order.customer);
      this.setTicket({ type, number });

      this.$router.push({ path: "/main/menu" });
    },
    editFailed(reason) {
      this.$dialog(reason)
        .then(this.removeRecordFromList)
        .catch(() => this.$q());
    },
    voidTicket() {
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
            .then(confirm => this.$p("Reason"))
            .catch(() => this.$q());
        })
        .catch(() => {});
    },
    voidFailed(reason) {
      this.$dialog(reason)
        .then(this.removeRecordFromList)
        .catch(() => this.$q());
    },
    removeRecordFromList() {
      new Promise((resolve, reject) => {
        this.$socket.emit("[PAYMENT] GET_LOG", this.order._id, logs => {
          const { number } = this.order;

          this.componentData = { resolve, reject, number, logs };
          this.component = "remover";
        });
      }).then(() => this.$q());
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
              this.$q();
            })
            .catch(() => this.$q());
        })
        .catch(() => {});
    },
    calendar() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "Calendar";
      })
        .then(date => {
          this.$emit("change", date);
          this.$q();
        })
        .catch(() => this.$q());
    },
    isSettled() {
      if (this.isEmptyTicket) return;
      if (this.order.status === 0) {
        this.$dialog({
          title: "dialog.orderVoided",
          msg: "dialog.settleVoidedOrder",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        }).then(() => this.$q());
        return;
      }
      this.order.settled
        ? this.handleSettledInvoice()
        : this.order.source === "POS"
          ? this.$p("Payment")
          : this.askSettleType();
    },
    handleSettledInvoice() {
      this.$dialog({
        title: "dialog.orderSettled",
        msg: "dialog.orderSettledTip",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      }).then(() => this.$q());
    },
    askSettleType() {
      this.$dialog({
        type: "question",
        title: "dialog.thirdPartyInvoice",
        msg: "dialog.thirdPartyInvoiceTip",
        buttons: [
          { text: "button.pay", fn: "reject" },
          { text: "button.markAsPaid", fn: "resolve" }
        ]
      })
        .then(() => this.$p("paymentMark"))
        .catch(() => this.$p("Payment", { regular: true }));
    },
    print() {
      if (this.isEmptyTicket) return;

      const order = JSON.parse(JSON.stringify(this.order));
      order.split ? this.askSplitPrint(order) : this.printTicket(order);
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
      this.$q();
      this.updateInvoice(order);
      order.content.forEach(item => (item.diffs = "unchanged"));
      receipt
        ? Printer.setTarget("Receipt").print(order, true)
        : Printer.setTarget("All").print(order);
    },
    splitPrint(order, receipt) {
      this.$q();
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
        .then(() => this.$open("Terminal"))
        .catch(() => this.accessFailedLog("terminal"));
    },
    report() {
      this.$checkPermission("access", "report")
        .then(() => this.$open("reporter"))
        .catch(() => this.accessFailedLog("report"));
    },
    getLedger() {
      this.$checkPermission("permission", "ledger")
        .then(() => this.$open("ledger"))
        .catch(() => this.accessFailedLog("ledger"));
    },
    accessFailedLog(component) {
      this.$log({
        eventID: 9101,
        note: `Permission Denied. Failed to access ${component}.`
      });
    },
    updateInvoice(ticket) {
      this.$socket.emit("[UPDATE] INVOICE", ticket, true);
    },
    getTransaction() {
      const date = document.querySelector("#calendar .text").innerText;

      this.$socket.emit("[PAYMENT] VIEW_TRANSACTIONS", date, transactions => {
        this.$open("transaction", {
          data: transactions.sort((a, b) =>
            String(b.ticket ? b.ticket.number : -1).localeCompare((a.ticket ? a.ticket.number : -1), undefined, {
              numeric: true,
              sensitivity: "base"
            })
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