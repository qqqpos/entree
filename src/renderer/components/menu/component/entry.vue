<template>
    <div class="popupMask dark" @click.self="init.reject">
      <section class="input">
        <div class="wrap">
          <input type="text" v-model="qty" class="qty" ref="qty" @click="focus('qty',false)">
          <div class="row relative">
            <input type="text" v-model="keywords" class="item" ref="item" @click="focus('item',true)">
            <span class="prefix" v-show="isPrefix" @click="togglePrefix" :class="{ghost:disablePrefix}">{{$t('text.prefix')}}</span>
            <i class="fa fa-times reset clickable" @click="resetKeyword" v-show="keywords.length"></i>
            <ul class="predict row" v-show="items.length">
              <li v-for="(item,index) in items" :key="index" @click="complete(item)">{{item[language]}}</li>
            </ul>
          </div>
          <input type="text" v-model="price" class="price" placeholder="0.00" ref="price" @click="focus('price',false)">
          <i class="fas fa-check fa-2x confirm" @click="confirm"></i>
        </div>
      </section>
        <keyboard :display="true" :alphabet.sync="alphabet" :length="keywords.length" @input="input" @backspace="backspace" @enter="confirm"></keyboard>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import checkbox from "../../setting/common/checkbox";
import keyboard from "../../common/keyboard";
export default {
  props: ["init"],
  components: { keyboard, checkbox },
  data() {
    return {
      qty: 1,
      price: "0.00",
      keywords: "",
      printers: [],
      devices: [],
      items: [],
      item: {},
      reset: true,
      option: false,
      toggle: false,
      anchor: "item",
      alphabet: true,
      prefix: undefined,
      disablePrefix: false
    };
  },
  created() {
    this.devices = Object.keys(this.config.printers);
    this.printers = this.$store.getters.item
      ? Object.keys(this.$store.getters.item.printer)
      : this.devices.slice();
  },
  mounted() {
    this.$refs.item.focus();
    document.activeElement.classList.add("active");
  },
  methods: {
    focus(field, keyboardLayout) {
      if (field === this.anchor) return;

      this.alphabet = keyboardLayout;
      this.anchor = field;

      document.querySelector("input.active").classList.remove("active");

      this.reset = true;
      this.option = false;

      this.$refs[this.anchor].focus();
      document.activeElement.classList.add("active");
    },
    input(char) {
      if ((this.anchor === "price" || this.anchor === "qty") && !isNumber(char))
        return;

      let target = this.$refs[this.anchor];
      let caret = target.selectionStart;
      const a = target.value.substr(0, caret);
      const b = target.value.substr(caret);

      if (this.anchor === "price") {
        if (this.reset) {
          target.value = "0.0" + char;
        } else {
          let value = toFixed(target.value * 100, 0);
          target.value = toFixed((String(value) + char) / 100, 2).toFixed(2);
        }
        caret = target.value.length;
      } else {
        target.value = this.reset ? char : a + char + b;
      }

      this.reset = false;

      target.dispatchEvent(new Event("input"));
      target.setSelectionRange(++caret, caret);
      target.focus();
    },
    complete(item) {
      if (!this.disablePrefix && this.prefix) {
        // if prefix is enter apply with prefix
        const action = this.prefix;
        const reg = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
        const primarySpace = item.usEN.match(reg) ? "" : " ";
        const secondarySpace = item.zhCN.match(reg) ? "" : " ";

        if (action.prefix) {
          item.zhCN = action.zhCN + secondarySpace + item.zhCN;
          item.usEN = action.usEN + primarySpace + item.usEN;
        } else {
          item.zhCN = item.zhCN + secondarySpace + action.zhCN;
          item.usEN = item.usEN + primarySpace + action.usEN;
        }

        this.item = item;
        this.keywords = item[this.language];
        //if has condition multiplier
        if (action.multiplier) {
          this.price = toFixed(
            price * (isNumber(action.multiply) ? action.multiply : 0),
            2
          );
        }
      } else {
        this.item = item;
        this.keywords = item[this.language];
        this.price = item.price.toFixed(2);
      }

      this.focus("price", false);
    },
    backspace() {
      let target = this.$refs[this.anchor];
      let caret = target.selectionStart;

      switch (this.anchor) {
        case "qty":
          if (target.value > 10) {
            target.value = target.value.slice(0, -1);
          } else {
            target.value = 1;
            this.reset = true;
          }
          break;
        case "item":
          target.value =
            target.value.substr(0, caret - 1) + target.value.substr(caret);
          target.setSelectionRange(--caret, caret);

          break;
        case "price":
          target.value = (
            (target.value * 100).toFixed(0).slice(0, -1) / 100
          ).toFixed(2);
          break;
      }

      target.focus();
      target.dispatchEvent(new Event("input"));
    },
    resetKeyword() {
      this.keywords = "";
      this.items = [];
    },
    clear() {
      let target = this.$refs[this.anchor];
      target.value = "";

      target.setSelectionRange(0, 0);
      target.focus();
      target.dispatchEvent(new Event("input"));
    },
    confirm() {
      if (!this.keywords && parseFloat(this.price) === 0) {
        this.init.resolve();
        return;
      }

      const single = parseFloat(this.price) || 0;

      Object.assign(this.item, {
        qty: parseInt(this.qty) || 1,
        zhCN: this.item.zhCN || this.keywords,
        usEN: this.item.usEN || this.keywords,
        print: this.printers.length > 0 ? this.printers : undefined,
        price: single.toFixed(2),
        single
      });
      this.setChoiceSet(this.item);
      this.init.resolve();
    },
    dropDown() {
      this.focus("item");
      this.option = true;
      this.lists = [];
    },
    closeDropDown() {
      this.option = false;
    },
    selectAll() {
      this.toggle
        ? (this.devices = this.printers.slice(0))
        : (this.devices = []);
    },
    check() {
      this.toggle = this.devices.length === this.printers.length;
    },
    togglePrefix() {
      this.disablePrefix = !this.disablePrefix;
      this.search(this.keywords);
    },
    search(keyword) {
      if (!this.disablePrefix && this.isPrefix) {
        const text = keyword
          .split(" ")
          .slice(1)
          .join(" ");

        this.$socket.emit("[REQUEST] SEARCH", text, items => {
          this.items = items;
        });
      } else {
        this.$socket.emit("[REQUEST] SEARCH", keyword, items => {
          this.items = items;
        });
      }
    },
    ...mapActions(["setChoiceSet"])
  },
  computed: {
    isPrefix() {
      const text = this.keywords.split(" ")[0];
      const actions = this.layouts.action.filter(prefix => prefix.usEN);

      this.prefix = text
        ? actions.find(p => p.usEN.toLowerCase() === text.toLowerCase())
        : undefined;

      return typeof this.prefix === "object";
    },
    ...mapGetters(["layouts", "config", "language"])
  },
  watch: {
    keywords(text) {
      if (text) {
        this.search(text);
      } else {
        this.items = [];
      }
    }
  }
};
</script>

<style scoped>
section.input {
  width: 808px;
  margin: auto;
  transform: translateY(100px);
  background: #fff;
}

.input .wrap {
  height: 65px;
  display: flex;
  justify-content: center;
}

input {
  width: 100%;
  color: #444;
  padding: 0 16px;
  background: #fff;
  opacity: 0.7;
  font-size: 32px;
  transition: opacity, box-shadow 0.3s ease;
}

input.active {
  opacity: 1;
  box-shadow: inset 0 1px 6px -1px rgba(0, 0, 0, 0.75);
}

input.qty {
  width: 50px;
  text-align: center;
}

input.price {
  width: 120px;
  text-align: center;
}

input.item {
  width: 450px;
}

i.confirm {
  display: flex;
  align-items: center;
  padding: 0 30px;
  border-left: 1px solid #eeeeee;
}

i.reset {
  position: absolute;
  right: 0;
  padding: 25px;
}

.prefix {
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid #4caf50;
  color: #2e7d32;
  position: absolute;
  top: 23px;
  right: 65px;
}

ul.predict {
  position: absolute;
  top: 65px;
  width: 462px;
  background: #fff;
  z-index: 0;
  padding: 5px 10px;
  flex-wrap: wrap;
  box-shadow: 0 6px 8px -4px;
}

.predict li {
  border: 1px solid #e0e0e0;
  padding: 12px 10px;
  margin: 5px;
  min-width: 81px;
  text-align: center;
  border-radius: 3px;
  background: #f5f5f5;
}
</style>
