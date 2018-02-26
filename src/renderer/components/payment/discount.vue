<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5></h5>
        <h3>{{$t('title.discount')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="display">
        <input type="text" v-model="discount" :placeholder="placeholder">
        <span class="unit" v-if="unit === '%'" @click="switchUnit">%</span>
        <span class="unit" v-else @click="switchUnit">$</span>
      </div>
      <num-pad v-model="discount" @enter="confirm" :type="type"></num-pad>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import numPad from "../common/numpad";
export default {
  props: ["init"],
  components: { numPad },
  computed: {
    ...mapGetters(["order"])
  },
  data() {
    return {
      unit: "%",
      type: "number",
      discount: "0",
      reset: true,
      placeholder: "0.00"
    };
  },
  created() {
    this.placeholder = this.init.payment.discount.toFixed(2);
  },
  methods: {
    switchUnit() {
      this.unit = this.unit === '%' ? '$' : '%';
      this.type = this.unit === '%' ? 'number' : 'decimal';
    },
    confirm() {
      let discount = parseFloat(this.discount);
      let { payment } = this.init;
      let coupon;
      if (this.unit === "%") {
        coupon = {
          code: "UnitedPOS Inc",
          alias: `${this.discount} % OFF`,
          discount,
          stack: true,
          expire: {
            enable: false
          },
          count: 0,
          type: "discount",
          apply: "order"
        };
      } else {
        coupon = {
          code: "UnitedPOS Inc",
          alias: `$ ${this.discount} OFF`,
          discount,
          stack: true,
          expire: {
            enable: false
          },
          count: 0,
          type: "voucher",
          apply: "order"
        };
      }

      this.init.resolve({ discount, coupon });
    }
  }
};
</script>