<template>
  <div>
    <fn icon="fa-edit" text="button.edit" @click="editOrder" :disabled="(!table || order.content.length === 0)"></fn>
    <fn icon="fa-ban" text="button.cancel" @click="$emit('update:transfer',false)" v-if="transfer"></fn>
    <fn icon="fa-exchange-alt" text="button.switchTable" :disabled="!table || order.type === 'HIBACHI'" v-else></fn>
    <fn icon="fa-list-ol" text="button.list" @click="$open('listModule')"></fn>
    <fn icon="fa-hand-holding-usd" text="button.payment" @click="invoke('settle')" :disabled="!table"></fn>
    <fn icon="fa-clone" text="button.split" @click="invoke('split')"></fn>
    <fn icon="fa-file-invoice-dollar" text="button.receipt" @click="invoke('prePayment')"></fn>
    <fn icon="fa-user-times" text="button.switch" @click="switchStaff"></fn>
    <fn icon="fa-times" text="button.exit" @click="exit"></fn>
    <fn icon="fa-recycle" text="button.clearTable" @click="clearTable"></fn>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import splitSelector from "./component/splitSelector";
import paymentModule from "../payment/main";
import unlockModule from "../common/unlock";
import dialogModule from "../common/dialog";
import listModule from "./component/list";
import splitModule from "../split/index";
import staff from "./component/staffs";
import fn from "../shared/fn";

export default {
  components: {
    splitSelector,
    dialogModule,
    unlockModule,
    paymentModule,
    splitModule,
    listModule,
    staff,
    fn
  },
  props: ["transfer"],
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  methods: {
    editOrder() {
      this.checkStatus()
        .then(this.checkPermission)
        .then(this.edit)
        .catch(this.editFailed);
    },
    edit() {
      if (this.order.split) {
        const byNumber = (a, b) =>
          +a.number.replace(/\D/g, "") > +b.number.replace(/\D/g, "") ? 1 : -1;

        this.$socket.emit("[SPLIT] GET", this.order._id, splits => {
          this.$open("splitSelector", {
            parent: clone(this.order),
            splits: splits.sort(byNumber)
          });
        });
      } else {
        const { type, number } = this.order;
        
        this.setApp({ newTicket: false });
        this.setTicket({ type, number });
        this.$router.push({ path: "/main/menu" });
      }
    },
    checkStatus() {
      return new Promise((next, stop) => {
        if (this.order.settled) {
          const prompt = {
            type: "question",
            title: "dialog.ticketClosed",
            msg: "dialog.whatNext",
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.clearTable", fn: "clearTable" },
              { text: "button.additional", fn: "resolve" }
            ]
          };

          this.$dialog(prompt)
            .then(next)
            .catch(resetTable => {
              resetTable &&
                this.$socket.emit("[TABLE] RESET", { _id: this.table._id });
              this.exitComponent();
              stop();
            });
        } else {
          next();
        }
      });
    },
    checkPermission() {
      this.exitComponent();
      return new Promise((pass, denied) => {
        this.table.server !== this.op.name
          ? this.$checkPermission("modify", "order")
              .then(pass)
              .catch(denied)
          : pass();
      });
    },
    editFailed(reason) {
      console.log(reason);
    },
    settledOrder() {
      const prompt = {
        title: "dialog.ticketClosed",
        msg: "dialog.removePaymentRecordFirst",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };
      this.$dialog(prompt).then(this.exitComponent);
    },
    invoke(fn) {
      if (this.isEmptyTicket) return;
      if (this.order.settled) {
        this.settledOrder();
      } else {
        this[fn]();
      }
    },
    settle() {
      if (this.op.cashCtrl === "disable") {
        this.$accessDenied();
      } else {
        this.openPaymentModule();
      }
    },
    openPaymentModule(params) {
      new Promise((resolve, reject) => {
        this.componentData = Object.assign({}, { resolve, reject }, params);
        this.component = "paymentModule";
      })
        .then(this.exitComponent)
        .catch(exitParams => {
          this.exitComponent();

          if (exitParams && exitParams.reload === true) {
            this.$splitEvenly(exitParams.split).then(() =>
              this.openPaymentModule(Object.assign({}, params, exitParams))
            );
          }
        });
    },
    split() {
      this.$open("splitModule");
    },
    prePayment() {
      const remain = this.order.content.filter(item => !item.print).length;
      const prompt = this.order.print
        ? {
            type: "question",
            title: "dialog.printPrePayment",
            msg: ["dialog.printPrePaymentConfirm", this.order.table],
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.print", fn: "resolve" }
            ]
          }
        : {
            title: "dialog.unablePrintPrePayment",
            msg: ["dialog.itemRemainUnprint", remain],
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.printAnyway", fn: "resolve" }
            ]
          };

      this.$dialog(prompt)
        .then(() => {
          this.exitComponent();
          this.order.split ? this.splitReceiptDialog() : this.printReceipt();
        })
        .catch(this.exitComponent);
    },
    splitReceiptDialog() {
      const prompt = {
        type: "question",
        title: "dialog.printSplitTicket",
        msg: "dialog.printSplitTicketTip",
        buttons: [
          { text: "button.combinePrint", fn: "reject" },
          { text: "button.splitPrint", fn: "resolve" },
          { text: "button.cancel", fn: "cancel" }
        ]
      };

      this.$dialog(prompt)
        .then(this.printSplitReceipt)
        .catch(exit => {
          exit ? this.exitComponent() : this.printReceipt();
        });
    },
    printSplitReceipt() {
      this.exitComponent();

      this.$socket.emit("[SPLIT] GET", this.order._id, splits =>
        splits.forEach(ticket =>
          Printer.print(
            Object.assign(ticket, {
              type: this.order.togo ? ticket.type : "PRE_PAYMENT",
              cashier: this.op.name
            }),
            { target: "Receipt", receipt: true }
          )
        )
      );

      this.$socket.emit("[TABLE] STATUS", {
        session: this.order.session,
        status: 3
      });
    },
    printReceipt() {
      this.exitComponent();

      const order = clone(this.order);

      Printer.print(
        Object.assign(order, { cashier: this.op.name, type: "PRE_PAYMENT" }),
        { target: "Receipt", receipt: true }
      );

      this.$socket.emit("[TABLE] STATUS", {
        session: order.session,
        status: 3
      });
    },
    switchStaff() {
      if (this.isEmptyTicket) return;

      this.$checkPermission("modify", "server")
        .then(() =>
          this.$socket.emit("[OPERATOR] LIST", operators =>
            this.$open("staff", { operators })
          )
        )
        .catch(() => {});
    },
    switchTableDialog() {
      const prompt = {
        title: ["dialog.switchTable", this.table.name],
        msg: "dialog.selectAnEmptyTable"
      };

      this.$dialog(prompt)
        .then(() => this.switchTable(true))
        .catch(() => this.switchTable(false));
    },
    switchTable(boolean) {
      this.exitComponent();
      this.$emit("update:transfer", boolean);
    },
    clearTable() {
      if (!this.table) return;

      const { _id, name, status, invoice } = this.table;
      if (status === 4 || invoice.length === 0) {
        const prompt = {
          title: "dialog.tableReset",
          msg: ["dialog.tableStatusClearConfirm", name],
          buttons: [
            { text: "button.cancel", fn: "reject" },
            { text: "button.clear", fn: "resolve" }
          ]
        };

        this.$dialog(prompt)
          .then(() => {
            this.resetOrder();
            this.exitComponent();
            this.$socket.emit("[TABLE] RESET", { _id });
          })
          .catch(this.exitComponent);
      } else {
        const prompt = {
          type: "info",
          title: "dialog.tableResetFailed",
          msg: ["dialog.tableClearNotAllowed", name],
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        this.$dialog(prompt).then(this.exitComponent);
      }
    },
    exit() {
      this.resetAll();
      this.$router.push({ path: "/main" });
    },
    ...mapActions([
      "setApp",
      "resetAll",
      "setOrder",
      "setTicket",
      "resetOrder",
      "setOperator",
      "setTableInfo",
      "removePayment"
    ])
  },
  computed: {
    ...mapGetters([
      "op",
      "tax",
      "order",
      "table",
      "store",
      "station",
      "dineInOpt",
      "isEmptyTicket"
    ])
  }
};
</script>
