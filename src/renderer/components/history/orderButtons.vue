<template>
  <div>
    <button class="btn" @click="thirdParty" :disabled="disable">
      <i class="fa fa-google-wallet"></i>
      <span class="text">{{$t('button.thirdParty')}}</span>
    </button>
    <button class="btn" @click="split" :disabled="disable">
      <i class="fa fa-clone"></i>
      <span class="text">{{$t('button.split')}}</span>
    </button>
    <button class="btn" @click="combine" :disabled="true">
      <i class="fa fa-link"></i>
      <span class="text">{{$t('button.combine')}}</span>
    </button>
    <button class="btn" @click="discount" :disabled="disable || !discountable">
      <i class="fa fa-tag"></i>
      <span class="text">{{$t('button.discount')}}</span>
    </button>
    <button class="btn" @click="exit">
      <i class="fa fa-times"></i>
      <span class="text">{{$t('button.exit')}}</span>
    </button>
    <button class="btn" @click="driver" :disabled="order.type !== 'DELIVERY' || !assignable">
      <i class="fa fa-id-card-o"></i>
      <span class="text">{{$t('button.driver')}}</span>
    </button>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import thirdPartyPayment from "../payment/mark";
import discount from "../payment/discount";
import dialoger from "../common/dialoger";
import driver from "./component/driver";
import viewer from "../split/viewer";
import split from "../split/index";

export default {
  props: ["date"],
  components: { driver, dialoger, split, discount, viewer, thirdPartyPayment },
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
      if (this.order.split) {
        this.$socket.emit("[SPLIT] GET", this.order.children, splits => {
          new Promise((resolve, reject) => {
            this.componentData = { resolve, reject, splits };
            this.component = "viewer"
          }).then(order => this.$open("thirdPartyPayment", { order })).catch(() => this.$q())
        });
      } else {
        this.$open("thirdPartyPayment");
      }
    },
    split() {
      this.$open("split");
    },
    combine() { 
      
    },
    discount() {
      this.$socket.emit("[COUPON] LIST", coupons => {
        new Promise((resolve, reject) => {
          const { payment } = this.order;
          this.componentData = { payment, coupons, resolve, reject };
          this.component = "discount";
        })
          .then(this.updatePayment)
          .catch(() => this.$q());
      });
    },
    updatePayment({ discount, coupon }) {
      let coupons = this.order.coupons.filter(coupon => coupon.code !== 'UnitedPOS Inc');

      discount > 0 && coupons.push(coupon);
      this.order.coupons = coupons;

      this.$calculatePayment(this.order.content)
      this.$socket.emit("[UPDATE] INVOICE", this.order);
      this.$q();
    },
    driver() {
      this.$open("driver", { ticket: this.order.number });
    },
    exit() {
      this.resetMenu();
      this.$router.push({ path: "/main" });
    },
    ...mapActions(["resetMenu"])
  },
  computed: {
    disable() {
      return (
        this.order.settled ||
        this.today !== this.date ||
        this.order.status === 0
      );
    },
    ...mapGetters(["op", "tax", "order", "store", "ticket", "dinein", "isEmptyTicket"])
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
