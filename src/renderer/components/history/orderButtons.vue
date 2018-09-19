<template>
  <div>
    <button class="btn" @click="isSettled" :disabled="order.settled">
      <i class="fas fa-hand-holding-usd"></i>
      <span class="text">{{$t('button.payment')}}</span>
    </button>
    <button class="btn" v-press="evenSplit" @click="split" :disabled="disableSplit">
      <i class="fa fa-copy"></i>
      <span class="text">{{$t('button.split')}}</span>
    </button>
    <button class="btn" @click="thirdParty" :disabled="disable || order.split">
      <i class="fab fa-google-wallet"></i>
      <span class="text">{{$t('button.thirdParty')}}</span>
    </button>
    <button class="btn" @click="openDiscountModule" :disabled="order.settled" v-if="config.defaults.btn === 'DISCOUNT'">
      <i class="fa fa-tags"></i>
      <span class="text">{{$t('button.discount')}}</span>
    </button>
    <button class="btn" @click="openGratuityDialog" :disabled="order.settled" v-else>
      <i class="fas fa-comments-dollar"></i>
      <span class="text">{{$t('text.gratuity')}}</span> 
    </button>
    <button class="btn" @click="exit">
      <i class="fa fa-times"></i>
      <span class="text">{{$t('button.exit')}}</span>
    </button>
    <button class="btn" @click="driver">
      <i class="far fa-id-card"></i>
      <span class="text">{{$t('button.driver')}}</span>
    </button>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import driverModule from "./driver";
import splitModule from "../split/index";
import dialogModule from "../common/dialog";
import unlockModule from "../common/unlock";
import paymentMarker from "../payment/mark";
import paymentModule from "../payment/main";
import inputModule from "../component/inputer";

export default {
  props: ["date"],
  components: {
    splitModule,
    inputModule,
    driverModule,
    dialogModule,
    unlockModule,
    paymentMarker,
    paymentModule
  },
  data() {
    return {
      today: today(),
      componentData: null,
      component: null
    };
  },
  created() {
    this.$bus.on("pay", this.openPaymentModule);
  },
  beforeDestroy() {
    this.$bus.off("pay", this.openPaymentModule);
  },
  methods: {
    thirdParty() {
      if (this.isEmptyTicket || this.order.children) return;

      this.$open("paymentMarker");
    },
    split() {
      if (this.isEmptyTicket) return;

      this.$open("splitModule");
    },
    evenSplit() {
      if (this.isEmptyTicket) return;

      const prompt = {
        title: "dialog.cantExecute",
        msg: "dialog.ticketAlreadySplit",
        buttons: [
          { text: "button.confirm", fn: "reject" },
          { text: "button.view", fn: "resolve" }
        ]
      };

      this.order.split
        ? this.$dialog(prompt)
            .then(this.split)
            .catch(this.exitComponent)
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
          this.$log(
            `${this.op.name} attempt to set discount on ticket # [${
              this.order.number
            }] (Total: $${this.order.payment.balance})`
          )
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
          title: "title.setDiscount",
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
      this.$calculatePayment(this.order);
      this.$socket.emit("[ORDER] UPDATE", this.order);
      this.exitComponent();
    },
    driver() {
      this.$socket.emit("[OPERATOR] LIST", operators => {
        const drivers = operators
          .filter(op => op.role === "Driver")
          .map(op => op.name);
        const date = document.querySelector("#calendar .text").innerText;

        if (date !== this.today) {
          this.$socket.emit("[ORDER] HISTORY", date, data =>
            this.$open("driverModule", {
              invoices: data.filter(
                i => i.type === "DELIVERY" && i.status === 1
              ),
              drivers,
              date
            })
          );
        } else {
          const invoices = this.history.filter(
            i => i.type === "DELIVERY" && i.status === 1
          );
          this.$open("driverModule", {
            invoices,
            drivers,
            date
          });
        }
      });
    },
    openGratuityDialog() {
      if (this.isEmptyTicket) return;

      this.$checkPermission("modify", "gratuity")
        .then(this.setGratuity)
        .catch(() => {});
    },
    setGratuity() {
      new Promise((resolve, reject) => {
        const title = "button.setGratuity";
        const amount =
          this.order.gratuityPercentage || this.order.gratuityFee || 0;
        const percentage = true;
        const allowPercentage = true;
        this.componentData = {
          resolve,
          reject,
          title,
          amount,
          percentage,
          allowPercentage,
          type: "number"
        };
        this.component = "inputModule";
      })
        .then(({ amount, percentage }) => {
          const prompt = {
            type: "warning",
            title: "dialog.entryInvalid",
            msg: "dialog.exceedAllowLimit",
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          //invalid checking

          if (percentage && amount >= 100) {
            this.$dialog(prompt).then(this.exitComponent);
          } else if (!percentage && amount > this.order.payment.subtotal) {
            this.$dialog(prompt).then(this.exitComponent);
          } else if (amount > 0) {
            if (percentage) {
              delete this.order.gratuityFee;
              this.setOrder({ gratuityPercentage: amount });
            } else {
              delete this.order.gratuityPercentage;
              this.setOrder({ gratuityFee: amount });
            }
            this.updatePayment();
          } else {
            delete this.order.gratuityFee;
            delete this.order.gratuityPercentage;
            this.order.payment.gratuity = 0;
            this.updatePayment();
          }
        })
        .catch(this.exitComponent);
    },
    updatePayment() {
      this.$calculatePayment(this.order, {
        selfAssign: true,
        callback: false
      });
      this.$socket.emit("[ORDER] UPDATE", this.order, false, () =>
        this.exitComponent()
      );
    },
    exit() {
      this.resetOrder();
      this.$router.push({ path: "/main" });
    },
    ...mapActions(["setOrder", "resetOrder"])
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
