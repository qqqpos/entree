<template>
  <dialog open class="boxCenter" @click.self="init.reject">
    <div class="frame-common">
      <header>
        <h3>{{$t('title.coupon')}}</h3>
        <h5>All available coupon list below</h5>
      </header>
      <div class="wrap">
        <div class="row" v-if="coupons.length">
          <offer v-for="(coupon,index) in coupons" :key="index" :promotion="coupon" :stack="stack" @change="checkStack"></offer>
        </div>
        <div class="placeholder" v-else>
          <i class="far fa-smile"></i>
          <p>{{$t('coupon.tip.noCoupon')}}</p>
        </div>
      </div>
      <footer>
        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </dialog>
</template>

<script>
import { mapActions } from "vuex";

import offer from "./helper/offer";
import giftcard from "../../giftcard/index";
import dialogModule from "../../common/dialog";

export default {
  props: ["init"],
  components: { offer, giftcard, dialogModule },
  data() {
    return {
      componentData: null,
      component: null,
      order: this.init.hasOwnProperty("order")
        ? this.init.order
        : this.$store.getters.order,
      callback: this.init.hasOwnProperty("order"),
      vip: this.$store.getters.store.giftcard.vip,
      coupons: [],
      stack: false
    };
  },
  created() {
    let coupons = this.init.coupons;

    this.order.coupons.forEach(coupon => {
      const index = coupons.findIndex(offer => offer._id === coupon._id);
      if (index !== -1) {
        coupons[index].redeem = true;
        this.$nextTick(() => this.checkStack(coupons[index]));
      }
    });

    this.coupons = coupons;
  },
  methods: {
    checkStack(coupon) {
      const index = this.coupons.findIndex(c => c._id === coupon._id);
      this.coupons.splice(index, 1, coupon);

      !coupon.stack && coupon.redeem
        ? this.$bus.emit("Disable Coupon", coupon)
        : this.$bus.emit("Enable Coupon");

      if (!coupon.redeem) {
        switch (coupon.type) {
          case "giveaway":
            coupon.reference.forEach(free => {
              const index = this.order.content.findIndex(
                item => item._id === free._id
              );

              if (index !== -1) {
                this.order.content.splice(index, 1);
                this.resetPointer();
              }
            });
            break;
          case "discount":
            break;
        }
      }
    },
    swipe() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, callback: true, vip: true };
        this.component = "giftcard";
      })
        .then(card => {
          this.exitComponent();
          if (card.vip) {
            this.setOrder({ __vip__: card });
            card.holder && this.setCustomer({});
          } else {
            const prompt = {
              title: "dialog.cantExecute",
              msg: "card.notVipCard",
              buttons: [{ text: "button.confirm", fn: "resolve" }]
            };
            this.$dialog(prompt).then(this.exitComponent);
          }
        })
        .catch(this.exitComponent);
    },
    confirm() {
      const coupons = this.coupons.filter(coupon => coupon.redeem);
      const discount = this.order.coupons.filter(
        coupon => coupon.code === "Entree POS"
      );
      coupons.push(...discount);

      this.callback ? this.init.resolve(coupons) : this.applyCoupon(coupons);
    },
    applyCoupon(coupons) {
      const refs = coupons
        .filter(coupon => coupon.type === "giveaway")
        .map(coupon => coupon.reference)
        .reduce((a, b) => a.concat(b), []);

      refs.forEach(item => this.addToOrder(item));
      this.setOrder({ coupons });
      this.init.resolve();
    },
    ...mapActions(["setOrder", "setCustomer", "addToOrder", "resetPointer"])
  }
};
</script>

<style scoped>
.wrap {
  width: 765px;
  height: 350px;
  padding: 15px;
}

.row {
  flex-wrap: wrap;
}
</style>