<template>
  <div class="popupMask center dark" @click.self="init.reject(true)">
    <div class="editor">
        <header>
          <div>
            <h5></h5>
            <h3>{{$t(init.title)}}</h3>
          </div>
        </header>
        <div class="banner"></div>
        <div class="display">
            <input type="text" v-model="amount" placeholder="0.00">
            <span class="unit">$</span>
        </div>
        <num-pad v-model="amount" @enter="confirm" type="decimal"></num-pad>
    </div>
  </div>
</template>

<script>
import numPad from "../common/numpad";

export default {
  props: ["init"],
  components: { numPad },
  data() {
    return {
      amount: isNumber(this.init.amount) ? this.init.amount.toFixed(2) : "0.00"
    };
  },
  methods: {
    confirm() {
      const amount = this.amount.toFloat();
      this.init.resolve(amount);
    }
  }
};
</script>