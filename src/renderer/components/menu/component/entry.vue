<template>
    <div class="popupMask dark" @click.self="init.reject">
      <section class="input">
        <div class="wrap">
          <input type="text" v-model="qty" class="qty" ref="qty" @click="focus('qty')">
          <div class="item">
            <input type="text" v-model="keywords" class="item" ref="item" @click="focus('item')">
          </div>
          <input type="text" v-model="price" class="price" placeholder="0.00" ref="price" @click="focus('price')">
          <i class="fas fa-check fa-2x confirm" @click="confirm"></i>
        </div>
        <!-- <div class="options">
          <i class="fas fa-search light"></i>
          <i class="fas fa-print light"></i>
        </div> -->
      </section>
        <!-- <section class="input">
            <div class="wrap">
                <input type="text" v-model="qty" class="qty" ref="qty" @click="focus('qty')">
                <div class="item">
                    <input type="text" v-model="keywords" class="item" ref="item" @click="focus('item')">
                    <i class="fa fa-angle-double-down fa-2x" @click="dropDown" v-if="!option"></i>
                    <i class="fa fa-angle-double-up fa-2x" @click="closeDropDown" v-else></i>
                    <transition name="fadeDown">
                        <div v-show="option" class="dropDown">
                            <checkbox v-model="devices" :val="printer" :multiple="true" :title="printer" class="printer" v-for="printer in printers" :key="printer" @input="check"></checkbox>
                            <checkbox v-model="toggle" title="button.selectAll" @input="selectAll"></checkbox>
                        </div>
                    </transition>
                </div>
                <input type="text" v-model="price" class="price" placeholder="0.00" ref="price" @click="focus('price')">
                <i class="fas fa-sign-in-alt fa-2x confirm" @click="confirm"></i>
            </div>
            <ul>
                <li v-for="(list,index) in lists" :key="index" @click="fill(list)">
                    <span>{{list[language]}}</span>
                </li>
            </ul>
        </section> -->
        <keyboard :display="true" :alphabet="false" @input="input" @backspace="backspace" @enter="confirm"></keyboard>
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
      lists: [],
      item: {},
      reset: true,
      option: false,
      toggle: false,
      anchor: "item"
    };
  },
  created() {
    this.devices = Object.keys(this.config.printers);
    this.printers = this.$store.getters.item ? Object.keys(this.$store.getters.item.printer) : this.devices.slice();
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
          target.value = (
            (target.value * 100).toFixed(0).slice(0, -1) / 100
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
    ...mapGetters(["config", "language"])
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
  box-shadow: inset 0 3px 6px -2px rgba(0, 0, 0, 0.75);
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

.item {
  display: flex;
}
</style>
