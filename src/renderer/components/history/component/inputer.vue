<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="editor">
      <header>
        <div>
          <h5></h5>
          <h3>{{$t(title)}}</h3>
        </div>
      </header>
      <div class="banner"></div>
      <div class="display">
        <input type="text" v-model="amount" :placeholder="placeholder">
      </div>
      <num-pad v-model="amount" @enter="confirm" :type="type"></num-pad>
    </div>
  </div>
</template>

<script>
import numPad from "../../common/numpad";
export default {
  props: ["init"],
  components: { numPad },
  data() {
    return {
      title: "",
      amount: "0.00",
      type: "decimal",
      placeholder: "0.00"
    };
  },
  created() {
    const {
      title = "title.inputer",
      type = "decimal",
      amount = "0.00"
    } = this.init.config;

    this.title = title;

    if (type !== "decimal") {
      this.type = type;
      this.amount = amount;
      this.placeholder = amount;
    }
  },
  methods: {
    confirm() {
      isNumber(this.amount) && this.init.resolve(parseFloat(this.amount));
    }
  }
};
</script>
