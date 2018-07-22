<template>
  <div>
    <button class="btn" @click="editOrder" :disabled="(!currentTable || order.content.length === 0)">
      <i class="fa fa-edit"></i>
      <span class="text">{{$t('button.edit')}}</span>
    </button>
    <button class="btn" @click="$emit('switch',false)" v-if="transfer">
      <i class="fas fa-ban"></i>
      <span class="text">{{$t("button.cancel")}}</span>
    </button>
    <button class="btn" @click="switchTable" v-else :disabled="!currentTable">
      <i class="fas fa-exchange-alt"></i>
      <span class="text">{{$t('button.switchTable')}}</span>
    </button>
    <button class="btn" @click="combineTicket">
      <i class="fa fa-link"></i>
      <span class="text">{{$t('button.combineTicket')}}</span>
    </button>
    <button class="btn" @click="settle" :disabled="!currentTable">
      <i class="fas fa-hand-holding-usd"></i>
      <span class="text">{{$t('button.payment')}}</span>
    </button>   
    <button class="btn" @click="split">
      <i class="fa fa-clone"></i>
      <span class="text">{{$t('button.split')}}</span>
    </button> 
    <button class="btn" @click="prePayment">
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
import staff from "../component/staffs";
import split from "../split/index";
import list from "./list";

export default {
  props: ["transfer"],
  components: { dialogModule, unlockModule, paymentModule, split, list, staff },
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  methods: {
    editOrder() {
      if (this.order.settled) {
        this.handleSettledOrder();
        return;
      }
      this.currentTable.server !== this.op.name
        ? this.$checkPermission("modify", "order")
            .then(this.edit)
            .catch(() => {})
        : this.edit();
    },
    edit() {
      this.setApp({ newTicket: false });
      this.setTicket({ type: "DINE_IN", number: this.order.number });
      this.$router.push({ path: "/main/menu" });
    },
    editDenied() {
      const prompt = {
        title: "dialog.cannotModify",
        msg: ["dialog.noRightToModify", this.order.server],
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.$dialog(prompt).then(this.exitComponent);
    },
    handleSettledOrder() {
      const prompt = {
        title: ["dialog.settledOrderReopen", this.order.number],
        msg: [
          "dialog.settledOrderReopenTip",
          this.$t("type." + this.order.payment.type)
        ],
        buttons: [
          { text: "button.removePayment", fn: "resolve" },
          { text: "button.cancel", fn: "reject" }
        ]
      };

      this.$dialog()
        .then(this.removeOrderPayment)
        .catch(this.exitComponent);
    },
    removeOrderPayment() {
      this.exitComponent();
      this.$dialog({
        title: "dialog.removePayment",
        msg: [
          "dialog.removePaymentConfirm",
          this.$t("type." + this.order.payment.type)
        ]
      })
        .then(() => {
          this.exitComponent();
          this.removePayment();
          this.$socket.emit("[ORDER] UPDATE", this.order);
          this.askEditOrder();
        })
        .catch(this.exitComponent);
    },
    askEditOrder() {
      const prompt = {
        title: "dialog.paymentRemoved",
        msg: ["dialog.paymentRemovedTip", this.order.number],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.edit", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(this.editOrder)
        .catch(this.exitComponent);
    },
    switchTable() {
      if (!this.currentTable) return;

      const prompt = {
        title: ["dialog.switchTable", this.currentTable.name],
        msg: "dialog.selectAnEmptyTable"
      };

      this.$dialog(prompt)
        .then(this.processTableSwitch.bind(null, this.currentTable))
        .catch(this.processTableSwitch.bind(null, false));
    },
    processTableSwitch(table) {
      this.$emit("switch", table);
      this.exitComponent();
    },
    combineTicket() {
      this.$open("list", { combineMode: true });
    },
    prePayment() {
      if (this.isEmptyTicket) return;
      if (this.order.settled) {
        this.settledOrder();
      } else if (this.order.print) {
        this.$dialog({
          type: "question",
          title: "dialog.prePayment",
          msg: ["dialog.printPrePaymentConfirm", this.order.table],
          buttons: [
            { text: "button.cancel", fn: "reject" },
            { text: "button.print", fn: "resolve" }
          ]
        })
          .then(() => {
            this.exitComponent();
            this.$nextTick(() => {
              this.order.split
                ? this.askSplitPrePayment()
                : this.printPrePayment();
            });
          })
          .catch(this.exitComponent);
      } else {
        let remain = this.order.content.filter(item => !item.print).length;
        this.$dialog({
          title: "dialog.unablePrintPrePayment",
          msg: ["dialog.itemRemainUnprint", remain],
          buttons: [
            { text: "button.cancel", fn: "reject" },
            { text: "button.printAnyway", fn: "resolve" }
          ]
        })
          .then(this.printPrePayment)
          .catch(this.exitComponent);
      }
    },
    printPrePayment() {
      this.exitComponent();

      const type = "PRE_PAYMENT";
      const cashier = this.op.name;
      const order = Object.assign(
        Object.create(Object.getPrototypeOf(this.order)),
        this.order,
        { type, cashier }
      );

      Printer.setTarget("Receipt").print(order, true);
      this.$socket.emit("[TABLE] STATUS", { _id: order.tableID, status: 3 });
    },
    askSplitPrePayment() {
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
        .then(this.splitPrint)
        .catch(this.printPrePayment);
    },
    splitPrint() {
      this.exitComponent();
      this.$socket.emit("[SPLIT] GET", this.order.children, splits => {
        splits.forEach(ticket => {
          Object.assign(ticket, {
            type: "PRE_PAYMENT",
            cashier: this.op.name
          });
          Printer.setTarget("Receipt").print(ticket, true);
        });
      });

      this.$socket.emit("[TABLE] STATUS", {
        _id: this.order.tableID,
        status: 3
      });
    },
    settle() {
      if (this.isEmptyTicket) return;

      if (this.op.cashCtrl === "disable") {
        this.$accessDenied();
      } else {
        this.order.settled ? this.settledOrder() : this.openPaymentModule();
      }
    },
    settledOrder() {
      const prompt = {
        title: "dialog.invoiceSettled",
        msg: "dialog.invoiceSettledTip",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };
      this.$dialog(prompt).then(this.exitComponent);
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
    split() {
      if (this.isEmptyTicket) return;
      if (this.order.settled) {
        this.settledOrder();
        return;
      }
      this.$open("split");
    },
    exit() {
      this.resetAll();
      this.$router.push({ path: "/main" });
    },
    clearTable() {
      if (!this.currentTable) return;
      if (
        this.currentTable.status === 4 ||
        this.currentTable.invoice.length === 0
      ) {
        const prompt = {
          title: "dialog.tableReset",
          msg: ["dialog.tableStatusClearConfirm", this.currentTable.name],
          buttons: [
            { text: "button.cancel", fn: "reject" },
            { text: "button.clear", fn: "resolve" }
          ]
        };

        this.$dialog(prompt)
          .then(() => {
            this.resetOrder();
            this.$socket.emit("[TABLE] RESET", { _id: this.currentTable._id });
            this.exitComponent();
          })
          .catch(this.exitComponent);
      } else {
        const prompt = {
          type: "info",
          title: "dialog.tableResetFailed",
          msg: ["dialog.tableClearNotAllowed", this.currentTable.name],
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        this.$dialog(prompt).then(this.exitComponent);
      }
    },
    ...mapActions([
      "setOperator",
      "setApp",
      "resetAll",
      "setOrder",
      "setTicket",
      "resetOrder",
      "removePayment",
      "setTableInfo"
    ])
  },
  computed: {
    ...mapGetters([
      "op",
      "tax",
      "order",
      "store",
      "dinein",
      "station",
      "isEmptyTicket",
      "currentTable"
    ])
  }
};
</script>
