<template>
  <div class="request">
    <section class="content">
      <div class="category">
        <div v-for="(category,index) in request" @click="getItems(category)" :key="index">{{category[language]}}</div>
      </div>
      <div class="prefix">
        <div v-for="(action,index) in actions" @click="getPrefix(action,$event)" :key="index">{{action[language]}}</div>
      </div>
      <div class="item">
        <div v-for="(item,index) in items" @click="setChoice(item)" :class="{disable:!item.clickable}" :key="index">{{item[language]}}</div>
      </div>
      <div class="shortCut">
        <div @click="setPrice(0.50)">$ 0.50</div>
        <div @click="setPrice(0.75)">$ 0.75</div>
        <div @click="setPrice(1.00)">$ 1.00</div>
        <div @click="setPrice(1.25)">$ 1.25</div>
        <div @click="setPrice(1.50)">$ 1.50</div>
        <div @click="setPrice(1.75)">$ 1.75</div>
        <div @click="setPrice(2.00)">$ 2.00</div>
        <div @click="setPrice(2.50)">$ 2.50</div>
        <div @click="setPrice(3.00)">$ 3.00</div>
        <div @click="setPrice(4.00)">$ 4.00</div>
        <div @click="setPrice()">{{$t('button.inputPrice')}}</div>
      </div>
    </section>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import modify from "./modify";
export default {
  components: { modify },
  data() {
    return {
      items: [],
      action: null,
      component: null,
      componentData: null
    };
  },
  mounted() {
    this.items = [].concat.apply([], this.request[0].item);
  },
  methods: {
    getItems(category) {
      this.items = [].concat.apply([], category.item);
    },
    getPrefix(action, e) {
      const dom = document.querySelector(".acting");
      dom && dom.classList.remove("acting");

      this.action = action;
      e.currentTarget.classList.add("acting");
    },
    setChoice({ zhCN, usEN, price, clickable }) {
      if (!clickable) return;

      if (this.action) {
        if (this.action.prefix) {
          zhCN = this.action.zhCN + zhCN;
          usEN = this.action.usEN + " " + usEN;
        } else {
          zhCN = zhCN + this.action.zhCN;
          usEN = usEN + " " + this.action.usEN;
        }
      }
      price =
        this.action && this.action.ignoreDefaultPrice
          ? 0
          : isNumber(price) ? parseFloat(price) : 0;
          
      let content = {
        qty: 1,
        zhCN,
        usEN,
        single: price,
        price: price.toFixed(2),
        key: String().random()
      };
      this.action = null;
      let dom = document.querySelector(".sub.target");
      dom ? this.alertChoiceSet(content) : this.setChoiceSet(content);
      dom = document.querySelector(".acting");
      dom && dom.classList.remove("acting");
    },
    setPrice(total) {
      total
        ? this.setPriceForChoiceSet({ total })
        : this.$p("modify", {
          item: {
            qty: 1,
            single: 0,
            discount: 0
          },
          type: "choiceSet"
        });
    },
    ...mapActions([
      "setChoiceSet",
      "alertChoiceSet",
      "setPriceForChoiceSet",
      "setChoiceSetTarget"
    ])
  },
  computed: {
    ...mapGetters(["request", "language", "actions"])
  }
};
</script>

<style scoped>
.request {
  display: flex;
  flex-direction: row;
  position: absolute;
  left: 0;
}

.request .content {
  background: url(../../../assets/image/grid.png) #fcfcfc;
  display: flex;
  flex-direction: row;
  width: 739px;
}

div.category,
div.prefix {
  width: 142px;
}

.category div,
div.prefix div {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 1px;
  vertical-align: top;
  font-size: 1.15em;
  height: 62.5px;
  width: 138px;
}

.category div {
  border: 1px solid #2196f3;
  background: #29b6f6;
}

.prefix div {
  border: 1px solid #607d8b;
  background: #b0bec5;
}

.prefix div.acting {
  background: #009688;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

div.item {
  width: 342px;
}

div.item div:hover {
  transition: background 0.22s linear;
}

div.item div:active {
  background: rgba(166, 195, 201, 0.55);
}

div.item div {
  display: inline-flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  height: 62.5px;
  width: calc(33% - 3px);
  border: 1px solid #78909c;
  background: #92aaaf;
  margin: 1px;
  vertical-align: top;
  font-size: 1.15em;
  text-align: center;
}

.item .disable {
  background: rgba(166, 195, 201, 0.55);
}

div.shortCut {
  width: 114px;
}

div.shortCut div {
  display: inline-flex;
  width: 111px;
  height: 62.5px;
  margin: 1px;
  vertical-align: top;
  font-size: 1.15em;
  border: 1px solid #9e9e9e;
  background: rgba(206, 206, 206, 0.66);
  justify-content: center;
  align-items: center;
}
</style>
