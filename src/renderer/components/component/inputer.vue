<template>
  <div class="popupMask center dark" @click.self="init.reject(false)">
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
            <span class="unit" v-if="percentage" @click="toggle">%</span>
            <span class="unit" v-else @click="toggle">$</span>
        </div>
        <num-pad v-model="amount" @enter="confirm" :type="type"></num-pad>
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
      type: "decimal",
      title: "title.modify",
      percentage: false,
      allowPercentage: false,
      amount: "0.00"
    };
  },
  created() {
    const {
      title = "title.modify",
      percentage = false,
      allowPercentage = false,
      amount = "0.00"
    } = this.init;

    this.title = title;
    this.type = percentage ? "number" : "decimal";
    this.percentage = percentage;
    this.allowPercentage = allowPercentage;

    if (isNumber(amount)) {
      this.amount = percentage
        ? parseFloat(amount)
        : parseFloat(amount).toFixed(2);
    } else {
      this.amount = "0.00";
    }
  },
  methods: {
    toggle() {
      if (!this.allowPercentage) return;

      this.percentage = !this.percentage;
    },
    confirm() {
      this.init.resolve({
        amount: parseFloat(this.amount),
        percentage: this.percentage
      });
    }
  }
};
</script>