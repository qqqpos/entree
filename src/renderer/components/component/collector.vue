<template>
  <div class="popupMask center dark">
    <div class="editor">
      <header class="title">
        <h5>{{cashDrawer}}</h5>
        <h3>{{$t('text.cashInCount')}}</h3>
      </header>
      <div class="banner"></div>
      <section class="inner">
        <aside>
          <div class="currency hundred" @click="change('hundred')">
            <span class="unit">{{hundred}}</span>
            <span class="tooltip">$ 100</span>
          </div>
          <div class="currency fifty" @click="change('fifty')">
            <span class="unit">{{fifty}}</span>
            <span class="tooltip">$ 50</span>
          </div>
          <div class="currency twenty" @click="change('twenty')">
            <span class="unit">{{twenty}}</span>
            <span class="tooltip">$ 20</span>
          </div>
          <div class="currency ten" @click="change('ten')">
            <span class="unit">{{ten}}</span>
            <span class="tooltip">$ 10</span>
          </div>
          <div class="currency five" @click="change('five')">
            <span class="unit">{{five}}</span>
            <span class="tooltip">$ 5</span>
          </div>
          <div class="currency one" @click="change('one')">
            <span class="unit">{{one}}</span>
            <span class="tooltip">$ 1</span>
          </div>
          <div class="currency quarter" @click="change('quarter')">
            <span class="unit">{{quarter}}</span>
            <span class="tooltip">$ 0.25</span>
          </div>
          <div class="currency dime" @click="change('dime')">
            <span class="unit">{{dime}}</span>
            <span class="tooltip">$ 0.1</span>
          </div>
          <div class="currency nickel" @click="change('nickel')">
            <span class="unit">{{nickel}}</span>
            <span class="tooltip">$ 0.05</span>
          </div>
          <div class="currency penny" @click="change('penny')">
            <span class="unit">{{penny}}</span>
            <span class="tooltip">$0.01</span>
          </div>
        </aside>
        <div class="input">
          <div class="display">
            <input type="text" v-model="amount" placeholder="0.00" :disabled="true">
          </div>
          <num-pad v-model="number" @input="input" type="number"></num-pad>
        </div>
      </section>
      <footer>
        <div class="opt">
          <checkbox v-model="detail" title="text.recordDetail"></checkbox>
        </div>
        <button class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</button>
        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import numPad from "../common/numpad";
import checkbox from "../setting/common/checkbox";

export default {
  props: ["init"],
  components: { numPad, checkbox },
  data() {
    return {
      cashDrawer: this.$store.getters.station.cashDrawer.name,
      hundred: 0,
      fifty: 0,
      twenty: 0,
      ten: 0,
      five: 0,
      one: 0,
      quarter: 0,
      dime: 0,
      nickel: 0,
      penny: 0,
      anchor: "",
      reset: true,
      detail: false,
      number: ""
    };
  },
  mounted() {
    this.anchor = "hundred";
  },
  methods: {
    input(num) {
      this[this.anchor] = num;
      this.reset = false;
    },
    change(anchor) {
      this.anchor = anchor;
      this.number = "";
    },
    confirm() {
      this.init.resolve(this.amount);
    }
  },
  watch: {
    anchor(n) {
      let dom = document.querySelector(".active");
      dom && dom.classList.remove("active");
      dom = document.querySelector(`.${n}`);
      dom && dom.classList.add("active");
    }
  },
  computed: {
    amount() {
      return (
        this.hundred * 100 +
        this.fifty * 50 +
        this.twenty * 20 +
        this.ten * 10 +
        this.five * 5 +
        this.one * 1 +
        this.quarter * 0.25 +
        this.dime * 0.1 +
        this.nickel * 0.05 +
        this.penny * 0.01
      );
    }
  }
};
</script>

<style scoped>
.inner {
  display: flex;
}

aside {
  border-right: 1px solid #ddd;
  background: #f5f5f5;
  padding: 5px;
  width: 224px;
}

.currency {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  height: 74px;
  margin: 5px;
  background: #fff;
  opacity: 0.5;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  box-shadow: 0 -1px 3px -1px rgba(0, 0, 0, 0.41);
}

.currency .unit {
  font-family: "Agency FB";
  font-size: 2em;
  font-weight: bold;
  padding: 10px 0;
  color: #3c3c3c;
}

.currency .tooltip {
  display: block;
  background: #607d8b;
  width: inherit;
  text-align: center;
  color: #fff;
  font-family: "Agency FB";
  font-weight: bold;
}

.currency.active {
  opacity: 1;
}
</style>