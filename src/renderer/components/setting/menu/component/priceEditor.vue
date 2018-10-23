<template>
  <div class="popupMask setting dark center" @click.self="init.reject(false)">
    <div class="editor">
      <header>
        <div>
          <h5>{{$t('title.edit')}}</h5>
          <h3>{{$t('text.price')}}</h3>
        </div>
      </header>
      <div class="banner"></div>
      <div class="wrap row">
        <div class="space-right">
          <inputer title="type.WALK_IN" v-model="prices.WALK_IN" :placeholder="placeholder"></inputer>
          <inputer title="type.PICK_UP" v-model="prices.PICK_UP" :placeholder="placeholder"></inputer>
          <inputer title="type.DELIVERY" v-model="prices.DELIVERY" :placeholder="placeholder"></inputer>
          <inputer title="type.DINE_IN" v-model="prices.DINE_IN" :placeholder="placeholder"></inputer>
          <inputer title="type.HIBACHI" v-model="prices.HIBACHI" :placeholder="placeholder"></inputer>
          <inputer title="type.SALES" v-model="prices.SALES" :placeholder="placeholder"></inputer>
        </div>
        <div class="space-left">
          <inputer title="type.THIRD" v-model="prices.THIRD" :placeholder="placeholder"></inputer>
          <inputer title="GrubHub" v-model="prices['GrubHub']" :placeholder="placeholder"></inputer>
          <inputer title="Uber Eats" v-model="prices['Uber Eats']" :placeholder="placeholder"></inputer>
        </div>
      </div>
      <footer>
        <div class="opt">
          <span class="del" @click="reset">{{$t('button.reset')}}</span>
        </div>
        <button class="btn" @click="confirm">{{$t('button.done')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import inputer from "../../common/inputer";
import switches from "../../common/switches";

export default {
  props: ["init"],
  components: { inputer, switches },
  data() {
    return {
      prices: {
        WALK_IN: "",
        PICK_UP: "",
        DELIVERY: "",
        DINE_IN: "",
        HIBACHI: "",
        BUFFET: "",
        SALES: "",
        THIRD: "",
        GrubHub: "",
        "Uber Eats": ""
      },
      placeholder: ""
    };
  },
  created() {
    Object.keys(this.init.prices).forEach(type => {
      this.prices[type] = this.init.prices[type];
    });

    this.placeholder = this.init.price.join(",");
  },
  methods: {
    reset() {
      this.prices = {
        WALK_IN: "",
        PICK_UP: "",
        DELIVERY: "",
        DINE_IN: "",
        HIBACHI: "",
        BUFFET: "",
        SALES: "",
        THIRD: ""
      };
    },
    confirm() {
      let prices = {};

      Object.keys(this.prices).forEach(type => {
        if (!this.prices[type] || type === "DEFAULT") return;

        const priceArray = this.prices[type].split(",");

        if (priceArray.every(price => isNumber(price))) {
          prices[type] = priceArray.join(",");
        }
      });

      prices["DEFAULT"] = this.init.price.join(",");
      this.init.resolve(prices);
    }
  }
};
</script>