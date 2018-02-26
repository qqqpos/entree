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
      </div>
      <num-pad v-model="tip" @enter="confirm" :type="'decimal'"></num-pad>
    </div>
  </div>
</template>

<script>
import numPad from "../../common/numpad"
export default {
  props: ["init"],
  components: { numPad },
  data() {
    return {
      tip: "0.00"
    };
  },
  methods: {
    confirm() {
      this.init.resolve(this.tip.toFloat());
    }
  }
};
</script>
