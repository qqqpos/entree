<template>
    <div class="popupMask dark" @click.self="init.reject">
        <section class="input">
            <div class="wrap">
                <input type="text" v-model="qty" class="qty" ref="qty" @click="focus('qty')">
                <div class="item">
                    <input type="text" v-model="keywords" class="item" ref="item" @click="focus('item')">
                    <i class="fa fa-angle-double-down fa-2x" @click="dropDown" v-if="!option"></i>
                    <i class="fa fa-angle-double-up fa-2x" @click="closeDropDown" v-else></i>
                    <transition name="fadeDown">
                        <div v-show="option" class="dropDown">
                            <checkbox v-model="devices" :val="printer" :multiple="true" :title="printer" class="printer" v-for="(printer,index) in printers" :key="printer" @input="check"></checkbox>
                            <checkbox v-model="toggle" title="button.selectAll" @input="selectAll"></checkbox>
                        </div>
                    </transition>
                </div>
                <input type="text" v-model="price" class="price" placeholder="0.00" ref="price" @click="focus('price')">
                <i class="fa fa-sign-in fa-2x confirm" @click="confirm"></i>
            </div>
            <ul>
                <li v-for="(list,index) in lists" :key="index" @click="fill(list)">
                    <span>{{list[language]}}</span>
                </li>
            </ul>
        </section>
        <keyboard></keyboard>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import checkbox from "../../setting/common/checkbox";
import keyboard from "./keyboard";
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
      lists: [],
      item: {},
      reset: true,
      option: false,
      toggle: false,
      anchor: "item"
    };
  },
  created() {
    this.$bus.on("input", this.input);
    this.$bus.on("backspace", this.backspace);
    this.$bus.on("clear", this.clear);

    this.printers = Object.keys(this.config.printers);
  },
  mounted() {
    this.$refs.item.focus();
    document.activeElement.classList.add("active");
  },
  methods: {
    focus(field) {
      this.anchor = field;
      document.querySelector("input.active").classList.remove("active");

      this.reset = true;
      this.option = false;
      this.$refs[this.anchor].focus();
      document.activeElement.classList.add("active");
    },
    input(s) {
      let target = this.$refs[this.anchor];
      let caret = target.selectionStart;
      let a = target.value.substr(0, caret);
      let b = target.value.substr(caret);

      if (this.anchor === "price") {
        if (!isNumber(s)) return;

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
    fill(item) {
      this.item = item;
      this.keywords = item[this.language];
      this.price = item.price.toFixed(2);

      this.anchor = "price";
      this.$refs.price.focus();

      document.querySelector("input.active").classList.remove("active");
      document.activeElement.classList.add("active");
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
          target.value = ((target.value * 100).toFixed(0).slice(0, -1) / 100
          ).toFixed(2);
          break;
      }

      target.focus();
      target.dispatchEvent(new Event("input"));
    },
    clear() {
      let target = this.$refs[this.anchor];
      target.value = "";

      target.setSelectionRange(0, 0);
      target.focus();
      target.dispatchEvent(new Event("input"));
    },
    confirm() {
      let single = isNumber(this.price) ? parseFloat(this.price) : 0;
      Object.assign(this.item, {
        qty: isNumber(this.qty) ? ~~this.qty : 1,
        zhCN: this.item.zhCN || this.keywords,
        usEN: this.item.usEN || this.keywords,
        single,
        print: this.devices.length > 0 ? this.devices : undefined,
        price: single.toFixed(2)
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
  beforeDestroy() {
    this.$bus.off("input", this.input);
    this.$bus.off("backspace", this.backspace);
    this.$bus.off("clear", this.clear);
  },
  computed: {
    ...mapGetters(["language", "config"])
  },
  watch: {
    keywords(n) {
      if (n) {
        this.$socket.emit("[REQUEST] SEARCH", n, data => {
          this.lists = data;
        });
      } else {
        this.lists = [];
      }
    }
  }
};
</script>

<style scoped>
input {
  background: none;
  border: none;
  outline: none;
  font-size: 40px;
  width: 100%;
  font-family: "Yuanti-SC";
  text-transform: uppercase;
  color: #444;
  padding: 0 10px;
  margin-right: 10px;
  border-radius: 6px;
  background: #fff;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

input.active {
  opacity: 1;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
}

section.input {
  width: 100%;
  margin-top: 100px;
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

.input .wrap {
  height: 65px;
  display: flex;
  justify-content: center;
}

ul {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 25px;
}

li {
  background: #fff;
  margin: 5px;
  border-radius: 4px;
  width: 119px;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  text-align: center;
}

i.confirm {
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 30px;
  border-radius: 6px;
  color: #555;
}

.item {
  display: flex;
  position: relative;
}

.item i {
  position: absolute;
  right: 10px;
  top: 0px;
  padding: 17px 29px;
  cursor: pointer;
  color: #555;
}

.dropDown {
  position: absolute;
  background: #fff;
  z-index: -1;
  top: 50px;
  padding: 20px 10px 10px;
  margin: 10px;
  width: 430px;
  display: flex;
  flex-wrap: wrap;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.dropDown > div {
  width: 120px;
  padding: 5px 0;
}
</style>
