<template>
  <div class="popupMask center dark" @click.self="exit">
    <div class="editor">
      <header class="title">
        <h5>{{$t('title.create')}}</h5>
        <h3>{{$t('text.openFood')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <inputer v-model="item" title="text.item" :autoFocus="true" model="item" @click.native="setInput(true)" @focus="setCaret"></inputer>
        <inputer v-model.number="single" title="text.price" placeholder="0.00" @keydown.enter.native="confirm" model="single" @click.native="setInput(false)" @focus="setCaret"></inputer>
        <inputer v-model="comment" title="text.comment" type="textarea" @click.native="setInput(true)" @focus="setCaret" model="comment"></inputer>
        <div class="printers">
          <label>{{$t('text.printer')}}</label>
          <div class="inner">
            <checkbox v-model="printer" v-for="(device,index) in printers" :val="device" :multiple="true" :key="index" :title="device"></checkbox>
          </div>
        </div>
      </div>
      <footer>
        <div class="opt">
          <switches title="text.osk" v-model="keyboard" :reverse="true"></switches>
        </div>
        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
      </footer>
    </div>
    <keyboard :display="keyboard" :alphabet.sync="alphabet" v-model="entry" @input="input" @enter="confirm" @backspace="remove" :executeText="$t('button.done')"></keyboard>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import keyboard from "../../common/keyboard";
import inputer from "../../setting/common/inputer";
import switches from "../../setting/common/switches";
import checkbox from "../../setting/common/checkbox";

export default {
  props: ["init"],
  components: { inputer, switches, checkbox, keyboard },
  computed: {
    ...mapGetters(["config"])
  },
  data() {
    return {
      item: "",
      single: "",
      keyboard: false,
      printers: [],
      printer: [],
      alphabet: true,
      entry: "",
      comment: "",
      caret: 0
    };
  },
  created() {
    this.printers = Object.keys(this.config.printers).filter(
      d => !/cashier/i.test(d)
    );

    const preset = Object.keys(this.init.item.printer).filter(
      d => !/cashier/i.test(d)
    );

    this.printer = preset.length > 0 ? preset : this.printers.slice();
  },
  methods: {
    setInput(boolean) {
      this.alphabet = boolean;
    },
    input(string) {
      const { model } = document.activeElement.dataset;

      if (model) {
        const value = this[model];

        this[model] =
          value.substr(0, this.caret) + string + value.substr(this.caret);
        this.caret++;

        if (this[model][this.caret] === " ") this.caret++;

        this.$nextTick(() => {
          document.activeElement.setSelectionRange(this.caret, this.caret);
        });
      }
    },
    remove() {
      const { model } = document.activeElement.dataset;

      if (model) {
        const value = this[model];

        this[model] =
          value.substr(0, this.caret - 1) + value.substr(this.caret);
        this.caret--;

        this.$nextTick(() => {
          document.activeElement.setSelectionRange(this.caret, this.caret);
        });
      }
    },
    setCaret(value) {
      this.caret = value;
    },
    confirm() {
      let item = JSON.parse(JSON.stringify(this.init.item));

      const single = isNumber(this.single) ? parseFloat(this.single) : 0;
      const name = this.item
        ? this.item.replace(/\b[a-z]/g, t => t.toUpperCase())
        : "Open Food";

      let printer = {};

      Object.keys(this.config.printers)
        .filter(d => /cashier/i.test(d))
        .forEach(name => this.printer.push(name));

      this.printer.forEach(name => {
        printer[name] = {
          replace: false,
          zhCN: "",
          usEN: ""
        };
      });

      Object.assign(item, {
        zhCN: `* ${name} *`,
        usEN: `* ${name} *`,
        single,
        price: [single],
        comment: this.comment,
        temporary: true,
        printer,
        prices: {},
        choiceSet: []
      });

      this.comment.split(String.fromCharCode(10)).forEach(line => {
        line &&
          item.choiceSet.push({
            qty: 1,
            zhCN: line,
            usEN: line,
            single: 0,
            price: "0.00",
            key: Math.random()
              .toString(36)
              .substr(2, 6)
          });
      });

      this.addToOrder(item);
      this.setSides(Array(11).fill({ zhCN: "", usEN: "", disable: true }));
      this.init.resolve();
    },
    exit() {
      this.keyboard ? (this.keyboard = false) : this.init.reject();
    },
    ...mapActions(["addToOrder", "setSides"])
  }
};
</script>