<template>
  <div class="popupMask center dark" @click.self="init.reject(false)">
    <div class="editor">
        <header>
          <div>
            <h5>{{init.subtitle}}</h5>
            <h3>{{$t(init.title)}}</h3>
          </div>
        </header>
        <div class="banner"></div>
        <div class="display">
            <input type="text" v-model="amount" :placeholder="placeholder">
            <template v-if="allowPercentage">
              <span class="unit" v-if="percentage" @click="toggle">%</span>
              <span class="unit" v-else @click="toggle">$</span>
            </template>
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
      placeholder: "0.00",
      amount: "",
      reset: true
    };
  },
  created() {
    this.initial();
  },
  mounted() {
    window.addEventListener("keydown", this.entry, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.entry, false);
  },
  methods: {
    initial() {
      const {
        title = "title.modify",
        type = "decimal",
        percentage = false,
        allowPercentage = false,
        amount = "0.00"
      } = this.init;

      this.title = title;
      this.percentage = percentage;
      this.allowPercentage = allowPercentage;
      this.type = type || (percentage ? "number" : "decimal");

      if (isNumber(amount)) {
        switch (this.type) {
          case "number":
            this.placeholder = parseFloat(amount);
            break;
          case "decimal":
            this.placeholder = parseFloat(amount).toFixed(2);
            break;
          default:
            this.placeholder = parseFloat(amount).toFixed(2);
        }
      } else {
        this.placeholder = "0.00";
      }
    },
    entry(e) {
      switch (e.key) {
        case "/":
          this.transactions = this.transactions.reverse();
          break;
        case "Escape":
          this.clear();
          break;
        case "Enter":
          this.confirm();
          break;
        case "Backspace":
          this.del();
          break;
        default:
          if (e.key.length === 1 && /[0-9.]/i.test(e.key)) {
            this.amount = this.reset ? e.key : this.amount + e.key;
            this.reset = false;
          }
      }
    },
    clear() {
      this.amount = "";
      this.reset = true;
    },
    del() {
      const value = (this.amount.slice(0, -1) / 10).toFixed(2);
      !isNumber(value) || value === "0.00" ? this.clear() : (this.amount = value);
    },
    toggle() {
      if (!this.allowPercentage) return;

      this.percentage = !this.percentage;
      this.type = this.percentage ? "number" : "decimal";
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