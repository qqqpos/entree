<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5></h5>
        <h3>{{$t('title.coupon')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <offer v-for="(coupon,index) in coupons" :key="index" :promotion="coupon" :overstack="stack" @change="checkStack"></offer>
      </div>
      <footer>
        <div class="opt">

        </div>
        <button class="btn" @click="swipe">{{$t('card.vip')}}</button>
        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import offer from "./offer";
import { mapActions } from "vuex";
import giftcard from "../../giftcard/index";
import dialoger from "../../common/dialoger";

export default {
  props: ["init"],
  components: { offer, giftcard, dialoger },
  data() {
    return {
      componentData: null,
      component: null,
      order: this.init.hasOwnProperty("order")
        ? this.init.order
        : this.$store.getters.order,
      callback: this.init.hasOwnProperty("order"),
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
          this.$q();
          if (card.vip) {
            this.setOrder({ __vip__: card });
            card.holder && this.setCustomer({})
          } else {
            const prompt = {
              title: "dialog.cantExecute",
              msg: "card.notVipCard",
              buttons: [{ text: "button.confirm", fn: "resolve" }]
            };
            this.$dialog(prompt).then(() => this.$q());
          }
        })
        .catch(() => this.$q());
    },
    confirm() {
      const coupons = this.coupons.filter(coupon => coupon.redeem);
      const discount = this.order.coupons.filter(
        coupon => coupon.code === "UnitedPOS Inc"
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
  max-width: 765px;
  min-width: 510px;
  display: flex;
  flex-wrap: wrap;
}
</style>