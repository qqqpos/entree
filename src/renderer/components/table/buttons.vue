<template>
  <div>
    <button class="btn" @click="editOrder" :disabled="(!table || order.content.length === 0)">
      <i class="fa fa-edit"></i>
      <span class="text">{{$t('button.edit')}}</span>
    </button>
    <button class="btn" @click="$emit('update:transfer',false)" v-if="transfer">
      <i class="fas fa-ban"></i>
      <span class="text">{{$t("button.cancel")}}</span>
    </button>
    <button class="btn" @click="invoke('switchTableDialog')" v-else :disabled="!table || order.type === 'HIBACHI'">
      <i class="fas fa-exchange-alt"></i>
      <span class="text">{{$t('button.switchTable')}}</span>
    </button>
    <button class="btn" @click="$open('listModule')">
      <i class="fas fa-list-ol"></i>
      <span class="text">{{$t('button.list')}}</span>
    </button>
    <button class="btn" @click="invoke('settle')" :disabled="!table">
      <i class="fas fa-hand-holding-usd"></i>
      <span class="text">{{$t('button.payment')}}</span>
    </button>   
    <button class="btn" @click="invoke('split')">
      <i class="fa fa-clone"></i>
      <span class="text">{{$t('button.split')}}</span>
    </button> 
    <button class="btn" @click="invoke('prePayment')">
      <i class="fas fa-file-invoice-dollar"></i>
      <span class="text">{{$t('button.receipt')}}</span>
    </button>
    <button class="btn" @click="switchStaff">
      <i class="fa fa-user-times"></i>
      <span class="text">{{$t('button.switch')}}</span>
    </button>
    <button class="btn" @click="exit">
      <i class="fa fa-times"></i>
      <span class="text">{{$t('button.exit')}}</span>
    </button>
    <button class="btn" @click="clearTable">
      <i class="fa fa-recycle"></i>
      <span class="text">{{$t('button.clearTable')}}</span>
    </button>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import paymentModule from "../payment/main";
import unlockModule from "../common/unlock";
import dialogModule from "../common/dialog";
import listModule from "./component/list";
import splitModule from "../split/index";
import staff from "../component/staffs";

export default {
  components: {
    dialogModule,
    unlockModule,
    paymentModule,
    splitModule,
    listModule,
    staff
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
      this.setApp({ newTicket: false });
      this.setTicket({ type: "DINE_IN", number: this.order.number });
      this.$router.push({ path: "/main/menu" });
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
            true,
            "Receipt"
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

      Printer.setTarget("Receipt").print(
        Object.assign(order, { cashier: this.op.name, type: "PRE_PAYMENT" }),
        true
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
