<template>
  <div class="request">
    <section class="content">
      <div class="category">
        <div v-for="(category,index) in layouts.request" @click="getItems(category.contain)" :key="index">{{category[language]}}</div>
      </div>
      <div class="prefix">
        <div v-for="(action,index) in layouts.action" @click="getPrefix(action,$event)" :key="index">{{action[language]}}</div>
      </div>
      <div class="items">
        <div v-for="(item,index) in items" @click="setChoice(item)" :class="{disable:!item._id}" :key="index">{{item[language]}}</div>
      </div>
      <div class="shortCut">
        <div v-for="(price,index) in prices" :key="index" @click="setPrice(price)"><i class="fas fa-dollar-sign space light"></i>{{price | decimal}}</div>
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
      componentData: null,
      prices: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4]
    };
  },
  created() {
    this.getItems(this.layouts.request[0].contain);
  },
  methods: {
    getItems(categories) {
      let request = [];

      categories.forEach(category => {
        let items = Array.isArray(this.request[category])
          ? JSON.parse(JSON.stringify(this.request[category]))
          : [];

        let fill = 6 - items.length % 3;
        if (fill === 6) fill = 3;

        Array(fill)
          .fill()
          .forEach(() => items.push({ zhCN: "", usEN: "" }));

        request.push(...items);
      });

      request.length < 33 &&
        Array(33 - request.length)
          .fill()
          .forEach(() => request.push({ zhCN: "", usEN: "" }));

      this.items = request.slice(0,33);
    },
    getPrefix(action, e) {
      const dom = document.querySelector(".acting");
      dom && dom.classList.remove("acting");
      if (this.action === action) {
        this.action = null;
      } else {
        this.action = action;
        e.currentTarget.classList.add("acting");
      }
    },
    setChoice({ _id, zhCN, usEN, price, affix }) {
      if (!_id) return;

      price = isNumber(price) ? parseFloat(price) : 0;

      if (this.action) {
        //has prefix to change direction
        if (this.action.prefix) {
          zhCN = this.action.zhCN + zhCN;
          usEN = this.action.usEN + " " + usEN;
        } else {
          zhCN = zhCN + this.action.zhCN;
          usEN = usEN + " " + this.action.usEN;
        }
        //if has condition multiplier
        if (this.action.multiplier) {
          price = toFixed(
            price * (isNumber(this.action.multiply) ? this.action.multiply : 0),
            2
          );
        }
      } else if (affix) {
        //check default prefix
        const action = this.actions.find(act => act.key === affix);

        if (action) {
          if (action.prefix) {
            zhCN = action.zhCN + zhCN;
            usEN = action.usEN + " " + usEN;
          } else {
            zhCN = zhCN + action.zhCN;
            usEN = usEN + " " + action.usEN;
          }
          //if has condition multiplier
          if (action.multiplier) {
            price = toFixed(
              price * (isNumber(action.multiply) ? action.multiply : 0),
              2
            );
          }
        }
      }

      const content = {
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
        : this.$open("modify", {
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
    ...mapGetters(["layouts", "request", "language"])
  }
};
</script>

<style scoped>
.request {
  position: absolute;
  width: 738px;
  left: 0;
}

section.content {
  display: grid;
  grid-template-columns: 142.5px 142.5px 1fr 113px;
  background: url(../../../assets/image/grid.png) #fcfcfc;
}

.category,
.prefix {
  display: grid;
  grid-template-rows: repeat(11, 1fr);
}

.category div {
  border: 1px solid #2196f3;
  background: #29b6f6;
}

.prefix div {
  border: 1px solid #607d8b;
  background: #b0bec5;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1px;
}

.prefix div.acting {
  color: #fff;
  background: #009688;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

div.items div:hover {
  transition: background 0.22s linear;
}

div.items div:active {
  background: rgba(166, 195, 201, 0.55);
}

.items{

}

.items div {
  border: 1px solid #78909c;
  background: #92aaaf;
}

.items .disable {
  background: rgba(166, 195, 201, 0.55);
}

div.shortCut {
  display: grid;
  grid-template-rows: repeat(11, 1fr);
}

div.shortCut div {
  display: flex;
  width: 111px;
  margin: 1px;
  vertical-align: top;
  font-size: 1.15em;
  border: 1px solid #9e9e9e;
  background: rgba(206, 206, 206, 0.66);
  justify-content: center;
  align-items: center;
}
</style>
