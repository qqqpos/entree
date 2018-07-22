<template>
  <div>
    <button class="btn" @click="isSettled" :disabled="order.settled">
      <i class="fas fa-hand-holding-usd"></i>
      <span class="text">{{$t('button.payment')}}</span>
    </button>
    <button class="btn" @contextmenu.stop="evenSplit" @click.stop="split" :disabled="disableSplit">
      <i class="fa fa-copy"></i>
      <span class="text">{{$t('button.split')}}</span>
    </button>
    <button class="btn" @click="thirdParty" :disabled="disable">
      <i class="fab fa-google-wallet"></i>
      <span class="text">{{$t('button.thirdParty')}}</span>
    </button>
    <button class="btn" @click="openDiscountModule">
      <i class="fa fa-tags"></i>
      <span class="text">{{$t('button.discount')}}</span>
    </button>
    <button class="btn" @click="exit">
      <i class="fa fa-times"></i>
      <span class="text">{{$t('button.exit')}}</span>
    </button>
    <button class="btn" @click="driver" :disabled="!assignable">
      <i class="far fa-id-card"></i>
      <span class="text">{{$t('button.driver')}}</span>
    </button>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import inputModule from "../component/inputer";
import dialogModule from "../common/dialog";
import paymentMarker from "../payment/mark";
import paymentModule from "../payment/main";
import driver from "./component/driver";
import viewer from "../split/viewer";
import split from "../split/index";

export default {
  props: ["date"],
  components: {
    split,
    driver,
    viewer,
    inputModule,
    dialogModule,
    paymentMarker,
    paymentModule
  },
  data() {
    return {
      componentData: null,
      component: null,
      assignable: false,
      discountable: false,
      today: today()
    };
  },
  created() {
    this.assignable = this.approval(this.op.modify, "driver");
  },
  methods: {
    thirdParty() {
      if (this.isEmptyTicket) return;

      if (this.order.split) {
        this.$socket.emit("[SPLIT] GET", this.order.children, splits => {
          new Promise((resolve, reject) => {
            this.componentData = { resolve, reject, splits };
            this.component = "viewer";
          })
            .then(order => this.$open("paymentMarker", { order }))
            .catch(this.exitComponent);
        });
      } else {
        this.$open("paymentMarker");
      }
    },
    split() {
      if (this.isEmptyTicket) return;

      this.$open("split");
    },
    evenSplit() {
      if (this.isEmptyTicket) return;

      const prompt = {
        title: "dialog.cantExecute",
        msg: "dialog.ticketAlreadySplit",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.order.split
        ? this.$dialog(prompt).then(this.exitComponent)
        : new Promise((resolve, reject) => {
            const config = {
              title: "title.evenSplit",
              type: "number",
              amount: 1
            };

            this.componentData = Object.assign({ resolve, reject }, config);
            this.component = "inputModule";
          })
            .then(this.confirmEvenSplit)
            .catch(this.exitComponent);
    },
    confirmEvenSplit({ amount }) {
      if (amount > 1) {
        const prompt = {
          type: "question",
          title: "dialog.evenSplit",
          msg: ["dialog.evenSplitConfirm", amount],
          buttons: [
            { text: "button.cancel", fn: "reject" },
            { text: "button.confirm", fn: "resolve", load: true }
          ]
        };

        this.$dialog(prompt)
          .then(() => this.$splitEvenly(amount))
          .catch(this.exitComponent);
      } else {
        this.exitComponent();
      }
    },
    isSettled() {
      if (this.isEmptyTicket) return;

      if (this.order.status === 0) {
        const prompt = {
          title: "dialog.orderVoided",
          msg: "dialog.settleVoidedOrder",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        this.$dialog(prompt).then(this.exitComponent);
        return;
      }
      this.order.settled
        ? this.handleSettledInvoice()
        : this.order.source === "POS"
          ? this.openPaymentModule()
          : this.askSettleType();
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
    handleSettledInvoice() {
      const prompt = {
        title: "dialog.orderSettled",
        msg: "dialog.orderHasBeenSettled",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.$dialog(prompt).then(this.exitComponent);
    },
    askSettleType() {
      const prompt = {
        type: "question",
        title: "dialog.thirdPartyInvoice",
        msg: "dialog.thirdPartyInvoiceTip",
        buttons: [
          { text: "button.pay", fn: "reject" },
          { text: "button.markAsPaid", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => this.$open("paymentMarker"))
        .catch(() => this.openPaymentModule({ thirdPartyPayment: true }));
    },
    openDiscountModule() {
      this.$checkPermission("modify", "discount")
        .then(this.setDiscount)
        .catch(() =>
          this.$log({
            eventID: 5000,
            note: `${this.op.name} attempt to set discount on ticket # ${
              this.order.number
            } (Total: $${this.order.payment.balance})`
          })
        );
    },
    setDiscount() {
      if (this.isEmptyTicket) return;

      new Promise((resolve, reject) => {
        const {
          defaults = {
            percentageDiscount: false
          }
        } = this.config;

        const config = {
          title: "title.discount",
          type: defaults.percentageDiscount ? "number" : "decimal",
          percentage: defaults.percentageDiscount,
          allowPercentage: true,
          amount: "0.00"
        };

        this.componentData = Object.assign({ resolve, reject }, config);
        this.component = "inputModule";
      })
        .then(this.checkDiscount)
        .then(this.applyDiscount)
        .catch(this.exitComponent);
    },
    checkDiscount(input) {
      const { amount, percentage } = input;

      return new Promise((apply, unapply) => {
        const ticketTotal = this.tax.beforeDiscount
          ? this.order.payment.subtotal
          : this.order.payment.total;

        const discount = percentage
          ? toFixed(amount * ticketTotal / 100, 2)
          : amount;

        if (discount > ticketTotal) {
          const prompt = {
            type: "warning",
            title: "dialog.cantExecute",
            msg: "dialog.discountAmountNotAllow",
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.retry", fn: "resolve" }
            ]
          };

          this.$dialog(prompt)
            .then(this.setDiscount)
            .catch(() => unapply());
        } else {
          apply(Object.assign(input, { discount }));
        }
      });
    },
    applyDiscount({ amount, percentage, discount }) {
      const coupon = percentage
        ? {
            code: "Entree POS",
            alias: `${amount} % OFF`,
            discount: amount,
            stack: true,
            expire: {},
            count: 0,
            type: "discount",
            apply: "order"
          }
        : {
            code: "Entree POS",
            alias: `$ ${amount} OFF`,
            discount: amount,
            stack: true,
            expire: {},
            count: 0,
            type: "voucher",
            apply: "order"
          };

      let coupons = this.order.coupons.filter(c => c.code !== "Entree POS");

      discount > 0 && coupons.push(coupon);

      this.order.coupons = coupons;
      this.$calculatePayment(this.order, { selfAssign: true });
      this.$socket.emit("[ORDER] UPDATE", this.order);
      this.exitComponent();
    },
    driver() {
      const date = document.querySelector("#calendar .text").innerText;
      if (date !== this.today) {
        this.$socket.emit("[INQUIRY] HISTORY_ORDER", date, data => {
          const invoices = data.filter(i => i.type === "DELIVERY");
          this.$open("driver", { invoices });
        });
      } else {
        const invoices = this.history.filter(i => i.type === "DELIVERY");
        this.$open("driver", { ticket: this.order.number, invoices, date });
      }
    },
    exit() {
      this.resetOrder();
      this.$router.push({ path: "/main" });
    },
    ...mapActions(["resetOrder", "setOrder"])
  },
  computed: {
    disable() {
      return (
        this.order.settled ||
        this.today !== this.date ||
        this.order.status === 0
      );
    },
    disableSplit() {
      return this.disable || this.order.hasOwnProperty("parent");
    },
    ...mapGetters([
      "op",
      "tax",
      "app",
      "order",
      "store",
      "config",
      "ticket",
      "dineInOpt",
      "history",
      "station",
      "customer",
      "isEmptyTicket"
    ])
  }
};
</script>

<style scoped>
div {
  padding: 3px 0px 0px 3px;
}

div button {
  margin: 3px 0;
}
</style>
