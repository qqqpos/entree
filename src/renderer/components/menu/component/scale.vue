<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="editor">
        <header>
            <h3>{{$t('text.weightScale')}}</h3>
            <h5>{{item[language]}}</h5>
        </header>
        <div class="banner"></div>
        <div class="input">
         <div>
            <h3>{{$t('text.weight')}}</h3>
            <input type="text" v-model.number="weight" ref="weight" placeholder="0.00"  @keydown.enter="done" class="value">
          </div>
          <div>
            <h3>{{item.weightItem.value.toFixed(2)}} per {{item.weightItem.unit}}</h3>
            <span class="value">{{total}}</span>
          </div>
        </div>
        <div class="wrap">
          <section class="numpad">
            <div @click="input('7')" class="numKey">7</div>
            <div @click="input('8')" class="numKey">8</div>
            <div @click="input('9')" class="numKey">9</div>
            <div @click="input('4')" class="numKey">4</div>
            <div @click="input('5')" class="numKey">5</div>
            <div @click="input('6')" class="numKey">6</div>
            <div @click="input('1')" class="numKey">1</div>
            <div @click="input('2')" class="numKey">2</div>
            <div @click="input('3')" class="numKey">3</div>
            <div @click="input('.')" class="numKey">.</div>
            <div @click="input('0')" class="numKey double">0</div>
          </section>
          <aside class="padCtrl">
            <div @click="del">&#8592;</div>
            <div @click="weight = ''">C</div>
            <div @click="done">&#8626;</div>
          </aside>
        </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  props: ["init"],
  data() {
    return {
      weight: "",
      item: JSON.parse(JSON.stringify(this.init.item))
    };
  },
  computed: {
    total() {
      return isNumber(this.weight)
        ? (parseFloat(this.weight) * this.item.weightItem.value).toFixed(2)
        : "0.00";
    },
    ...mapGetters(["language"])
  },
  methods: {
    input(char) {
      if (char === "." && String(this.weight).includes(".")) return;

      this.weight = String(this.weight) + char;
    },
    del() {
      this.weight = String(this.weight).slice(0, -1);
    },
    done() {
      const { value, unit } = this.item.weightItem;
      const price = parseFloat(this.total);
      const name = `${this.weight} @ ${value.toFixed(2)} / per ${unit}`;
      Object.assign(this.item, {
        single: price,
        price: [price],
        total: this.total,
        prices: {},
        choiceSet: [
          {
            qty: 1,
            zhCN: name,
            usEN: name,
            single: 0,
            price: 0
          }
        ]
      });
      this.addToOrder(this.item);
      this.setSides(Array(11).fill({ zhCN: "", usEN: "", disable: true }));
      this.init.resolve();
    },
    ...mapActions(["addToOrder", "setSides"])
  }
};
</script>

<style scoped>
.wrap {
  display: flex;
  padding: 0 1px 0 4px;
}

section.numpad {
  display: flex;
  flex-wrap: wrap;
  width: 315px;
}
</style>


