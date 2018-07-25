<template>
  <li class="item" :class="{disable:$route.name === 'Menu' && (item.split || item.pending)}" @click.prevent.stop="select(item,$event)" v-if="!checkbox">
    <div class="main">
      <span class="itemQty">{{item.qty}}</span>
      <div class="wrap">
        <span class="name">{{item[language]}}</span>
        <span class="side">{{item.side[language]}}</span>
      </div>
      <i class="fa fa-sort splitor" v-if="splitBtnVisible" @click="splitItem(item)"></i>
      <span class="price">{{item.total | decimal}}</span>
    </div>
    <div class="sub" v-for="(set,index) in item.choiceSet" :key="index" @click.stop="adjustChoiceSet(set,$event)" :data-key="set.key">
      <span class="itemQty" :class="{hide:set.qty === 1}">{{set.qty}}</span>
      <span class="item">{{set[language]}}</span>
      <span class="price" :class="{hide:parseFloat(set.price) === 0}">({{set.price | decimal}})</span>
    </div>
  </li>
  <li class="item todo" v-else>
    <div class="main">
      <checkbox v-model="item.todo" :title="item[language]" :disabled="item.print" :translate="false"></checkbox>
    </div>
  </li>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import checkbox from "../../setting/common/checkbox";
export default {
  props: ["item", "ignore", "checkbox"],
  components: { checkbox },
  computed: {
    splitBtnVisible() {
      return (
        this.$route.name === "Menu" &&
        this.item.qty > 1 &&
        this.item.choiceSet.length === 0
      );
    },
    ...mapGetters(["language", "choiceSet"])
  },
  methods: {
    select(item, e) {
      if (this.ignore) return;

      this.$route.name === "Menu" && this.focus(item, e);
    },
    focus(item, e) {
      if (
        item === this.$store.getters.item &&
        item !== this.$store.getters.order.content.last()
      ) {
        let dom = document.querySelector("li.item.active");
        dom && dom.classList.remove("active");
        this.resetPointer();
      } else {
        let dom = document.querySelector("li.item.active");
        dom && dom.classList.remove("active");
        dom = document.querySelector(".choiceSet.target");
        dom && dom.classList.remove("target");

        this.resetChoiceSet();
        e.currentTarget.classList.add("active");
        this.setPointer(item);
      }
    },
    adjustChoiceSet(choice, e) {
      if (this.ignore) return;
      if (this.$route.name !== "Menu") return;

      let dom = document.querySelector(".sub.target");
      dom && dom.classList.remove("target");

      if (this.choiceSet === choice) {
        this.setChoiceSetTarget(null);
      } else {
        e.currentTarget.classList.add("target");
        this.setChoiceSetTarget(choice);
      }
    },
    ...mapActions([
      "splitItem",
      "setPointer",
      "resetPointer",
      "resetChoiceSet",
      "setChoiceSetTarget"
    ])
  }
};
</script>

<style scoped>
li {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-bottom: 1px solid #ddd;
  background: #fff;
  padding: 10px 5px 10px 0;
}

.main,
.sub {
  display: flex;
  position: relative;
}

.itemQty {
  width: 35px;
  text-align: center;
}

.main .wrap {
  flex: 1;
  display: flex;
  max-width: 215px;
  margin-right: 5px;
}

.sub .item {
  color: #666;
  max-width: 245px;
}

.sub .item:before {
  content: "·";
  color: rgba(154, 154, 154, 0.5);
  padding: 0 2px;
}

.sub.target {
  background: #bcaaa4;
  border-radius: 2px;
  color: #fff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}

.sub .price {
  min-width: 35px;
  padding-left: 4px;
  color: darkgray;
}

.active .sub .item:before,
.sub.target .item,
.active .sub .item,
.active .price,
.target .price {
  color: #fff;
}

.side {
  color: #666;
  margin-left: 3px;
  position: relative;
}

.active {
  background: #a1887f;
  color: #fff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}

.active .side {
  color: #fff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}

.item.print .price {
  visibility: hidden;
}

.item.print:after {
  content: "\F04C";
  font-family: fontAwesome;
  font-weight: 600;
  position: absolute;
  right: 10px;
  color: #ff9800;
}

.item.print.pending:after {
  content: "\f017";
}

.item.print.pending {
  background: #eceff1;
  border-bottom: 1px dashed #ddd;
}

.hide {
  visibility: hidden;
}

.price.hide {
  display: none;
}

.todo {
  height: 18px;
}

li.disable {
  opacity: 0.75;
  background: #fafafa;
  color: #9e9e9e;
  border-bottom: 1px dashed #ddd;
  pointer-events: none;
}

li.disable .side {
  color: #9e9e9e;
}

.splitor {
  position: absolute;
  right: 50px;
  top: -9px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.44);
  border-radius: 4px;
  cursor: pointer;
  display: none;
  color: #fff;
  box-shadow: 0 1px 1px #735448;
}

.active .splitor {
  display: inline-block;
}
</style>