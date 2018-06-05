<template>
  <div>
    <button class="btn" @click="isSettled" :disabled="order.settled">
      <i class="fa fa-money"></i>
      <span class="text">{{$t('button.payment')}}</span>
    </button>
    <button class="btn" @contextmenu.stop="evenSplit" @click.stop="split" :disabled="disable">
      <i class="fa fa-clone"></i>
      <span class="text">{{$t('button.split')}}</span>
    </button>
    <button class="btn" @click="thirdParty" :disabled="disable">
      <i class="fa fa-google-wallet"></i>
      <span class="text">{{$t('button.thirdParty')}}</span>
    </button>
    <button class="btn" @click="discount" :disabled="disable || !discountable">
      <i class="fa fa-tag"></i>
      <span class="text">{{$t('button.discount')}}</span>
    </button>
    <button class="btn" @click="exit">
      <i class="fa fa-times"></i>
      <span class="text">{{$t('button.exit')}}</span>
    </button>
    <button class="btn" @click="driver" :disabled="!assignable">
      <i class="fa fa-id-card-o"></i>
      <span class="text">{{$t('button.driver')}}</span>
    </button>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import paymentMarker from "../payment/mark";
import discount from "../payment/discount";
import dialoger from "../common/dialoger";
import inputer from "./component/inputer";
import driver from "./component/driver";
import payment from "../payment/index";
import viewer from "../split/viewer";
import split from "../split/index";

export default {
  props: ["date"],
  components: {
    split,
    driver,
    viewer,
    payment,
    inputer,
    dialoger,
    discount,
    paymentMarker
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
    this.discountable = this.approval(this.op.modify, "discount");
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

            this.componentData = { resolve, reject, config };
            this.component = "inputer";
          })
            .then(this.confirmEvenSplit)
            .catch(this.exitComponent);
    },
    confirmEvenSplit(number) {
      if (number > 1) {
        const prompt = {
          type: "question",
          title: "dialog.evenSplit",
          msg: ["dialog.evenSplitConfirm", number]
        };

        this.$dialog(prompt)
          .then(this.processEvenSplit.bind(null, number))
          .catch(this.exitComponent);
      } else {
        this.exitComponent();
      }
    },
    processEvenSplit(number) {
      if (number > 100) {
        const prompt = {
          type: "error",
          title: "dialog.cantExecute",
          msg: "dialog.exceedAllowLimit",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        this.$dialog(prompt).then(this.exitComponent);
        return;
      }

      //deep copy target & assign parent id
      const parent = this.order._id;
      const ticketNumber = this.order.number;

      const splited = JSON.parse(JSON.stringify(this.order));
      splited.parent = parent;

      splited.content.forEach(item => {
        if (item.qty === number) {
          item.qty = 1;
          item.deno = item.qty;
          item.total = item.single.toFixed(2);
        } else {
          item.single = toFixed(item.single / number, 2);
          item.total = (item.single * item.qty).toFixed(2);
        }

        item.choiceSet.forEach(set => {
          set.single = toFixed(set.single / number, 2);
          set.price = toFixed(set.single * set.qty, 2);
        });
      });

      let splits = [];

      for (let i = 1; i <= number; i++) {
        splits.push(
          Object.assign({}, splited, {
            _id: ObjectId(),
            number: ticketNumber + "-" + i,
            payment: this.$calculatePayment(splited, {
              selfAssign: false,
              callback: true
            })
          })
        );
      }

      this.$socket.emit("[SPLIT] SAVE", { splits, parent });

      this.order.content.forEach(item => (item.split = true));
      this.order.children = splits.map(i => i._id);
      this.order.split = true;

      this.setOrder(this.order);
      this.$socket.emit("[UPDATE] INVOICE", this.order);
      this.exitComponent();
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
          ? this.$open("payment")
          : this.askSettleType();
    },
    handleSettledInvoice() {
      const prompt = {
        title: "dialog.orderSettled",
        msg: "dialog.orderSettledTip",
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
        .catch(() => this.$open("payment", { regular: true }));
    },
    discount() {
      if (this.isEmptyTicket) return;

      this.$socket.emit("[COUPON] LIST", coupons => {
        new Promise((resolve, reject) => {
          const { payment } = this.order;
          this.componentData = { payment, coupons, resolve, reject };
          this.component = "discount";
        })
          .then(this.updatePayment)
          .catch(this.exitComponent);
      });
    },
    updatePayment({ discount, coupon }) {
      let coupons = this.order.coupons.filter(
        coupon => coupon.code !== "UnitedPOS Inc"
      );

      discount > 0 && coupons.push(coupon);
      this.order.coupons = coupons;

      this.$calculatePayment(this.order, { selfAssign: true });
      this.$socket.emit("[UPDATE] INVOICE", this.order);
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
      this.resetMenu();
      this.$router.push({ path: "/main" });
    },
    ...mapActions(["resetMenu", "setOrder"])
  },
  computed: {
    disable() {
      return (
        this.order.settled ||
        this.today !== this.date ||
        this.order.status === 0
      );
    },
    ...mapGetters([
      "op",
      "tax",
      "order",
      "store",
      "ticket",
      "dinein",
      "history",
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
