<template>
    <div class="popupMask dark" @click.self="init.reject">
      <section class="input">
        <div class="wrap">
          <input type="text" v-model="qty" class="qty" ref="qty" @click="focus('qty',false)">
          <div class="row relative">
            <input type="text" v-model="keywords" class="item" ref="item" @click="focus('item',true)">
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
      alphabet: true
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
      this.alphabet = keyboardLayout;
      this.anchor = field;

      document.querySelector("input.active").classList.remove("active");

      this.reset = true;
      this.option = false;

      this.$refs[this.anchor].focus();
      document.activeElement.classList.add("active");
    },
    input(s) {
      if ((this.anchor === "price" || this.anchor === "qty") && !isNumber(s))
        return;

      let target = this.$refs[this.anchor];
      let caret = target.selectionStart;
      const a = target.value.substr(0, caret);
      const b = target.value.substr(caret);

      if (this.anchor === "price") {
        if (this.reset) {
          target.value = "0.0" + s;
        } else {
          let value = toFixed(target.value * 100, 0);
          target.value = toFixed((String(value) + s) / 100, 2).toFixed(2);
        }
        caret = target.value.length;
      } else {
        target.value = this.reset ? s : a + s + b;
      }

      this.reset = false;

      target.dispatchEvent(new Event("input"));
      target.setSelectionRange(++caret, caret);
      target.focus();
    },
    complete(item) {
      this.item = item;
      this.keywords = item[this.language];
      this.price = item.price.toFixed(2);
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
    ...mapActions(["setChoiceSet"])
  },
  computed: {
    ...mapGetters(["layouts", "config", "language"])
  },
  watch: {
    keywords(n) {
      if (n) {
        this.$socket.emit("[REQUEST] SEARCH", n, items => {
          this.items = items;
        });
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
  background: none;
  border: none;
  outline: none;
  font-size: 40px;
  width: 100%;
  font-family: "Yuanti-SC";
  color: #444;
  padding: 0 16px;
  background: #fff;
  opacity: 0.7;
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
