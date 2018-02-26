<template>
  <div class="pad">
    <section>
      <div @click="input('7')" class="numKey">7</div>
      <div @click="input('8')" class="numKey">8</div>
      <div @click="input('9')" class="numKey">9</div>
      <div @click="input('4')" class="numKey">4</div>
      <div @click="input('5')" class="numKey">5</div>
      <div @click="input('6')" class="numKey">6</div>
      <div @click="input('1')" class="numKey">1</div>
      <div @click="input('2')" class="numKey">2</div>
      <div @click="input('3')" class="numKey">3</div>
      <div @click="input('0')" class="numKey">0</div>
      <div @click="input('00')" class="double numKey">00</div>
    </section>
    <aside class="padCtrl">
      <div @click="del">&#8592;</div>
      <div @click="clear">C</div>
      <div @click="$emit('enter')">&#8626;</div>
    </aside>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Number],
      default: "0.00"
    },
    type: {
      type: String,
      default: "decimal"
    },
    max: {
      type: [String, Number],
      default: Infinity
    }
  },
  data() {
    return {
      reset: true
    };
  },
  methods: {
    input(value) {
      switch (this.type) {
        case "number":
          const changeValue =
            this.value + value > this.max ? this.value : this.value + value;
          this.reset
            ? this.$emit("input", Number(value))
            : this.$emit("input", Number(changeValue));
          break;
        case "decimal":
          const changeDecimal = (
            ((this.value * 100).toFixed(0) + value) /
            100
          ).toFixed(2);
          this.reset
            ? this.$emit("input", (value / 100).toFixed(2))
            : this.$emit("input", changeDecimal);
          break;
        case "string":
          const changeString =
            this.value + value > this.max ? this.value : this.value + value;
          this.reset
            ? this.$emit("input", String(value))
            : this.$emit("input", String(changeString));
      }
      this.reset = false;
    },
    del() {
      switch (this.type) {
        case "number":
          if (isNumber(this.value)) {
            this.$emit("input", String(this.value).slice(0, -1) || 0);
          } else {
            this.$emit("input", 0);
            this.reset = true;
          }
          break;
        case "decimal":
          this.$emit("input", (this.value.slice(0, -1) / 10).toFixed(2));
          break;
        case "string":
        if (this.value) {
            this.$emit("input", String(this.value).slice(0, -1) || 0);
          } else {
            this.$emit("input", "");
            this.reset = true;
          }
          break;
      }
    },
    clear() {
      switch (this.type) {
        case "number":
          this.$emit("input", 0);
          break;
        case "decimal":
          this.$emit("input", "0.00");
          break;
        case "string":
          this.$emit("input", "");
          break;
      }

      this.$emit("clear", true);
      this.reset = true;
    }
  },
  watch: {
    type(n) {
      this.clear();
    }
  }
};
</script>

<style scoped>
.pad {
  display: flex;
  padding: 5px 4px 1px 6px;
}

section {
  display: flex;
  flex-wrap: wrap;
  width: 315px;
}

aside {
  display: flex;
  flex-direction: column;
}
</style>