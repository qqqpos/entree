<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="editor">
        <header>
          <h5></h5>
          <h3>{{$t('title.tip')}}</h3>
        </header>
        <div class="banner"></div>
        <div class="display">
            <input type="text" v-model="tip" placeholder="0.00">
            <span class="unit" v-if="unit === '%'" @click="unit = '$'">%</span>
            <span class="unit" v-else @click="unit = '%'">$</span>
        </div>
        <num-pad v-model="tip" @enter="confirm" :type="unit === '%' ? 'number':'decimal'"></num-pad>
    </div>
  </div>
</template>

<script>
import numPad from "../common/numpad"
export default {
  props: ["init"],
  components: { numPad },
  data() {
    return {
      unit: "$",
      tip: "0.00"
    };
  },
  methods: {
    confirm() {
      let tip = this.tip.toFloat();

      if (this.unit === "%")
        tip = toFixed(this.init.payment.subtotal * tip / 100, 2);

      this.init.resolve(tip);
    }
  }
};
</script>
