<template>
    <div class="popupMask dark center" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <div>
                    <h5>{{$t('title.create')}}</h5>
                    <h3>{{$t('title.creditVault')}}</h3>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap" @mousedown.self.prevent="">
                <inputer v-model="number" title="card.number" model="number" mask="#### #### #### ####" @click.native="setInput('number')" @focus="setCaret" :autoFocus="true"></inputer>
                <inputer v-model="date" title="card.expirationDate" mask="##/##" model="date" @click.native="setInput('date')" @focus="setCaret"></inputer>
                <inputer v-model="cvc" title="card.cvc" model="cvc" mask="####" @click.native="setInput('cvc')" @focus="setCaret"></inputer>
            </div>
            <footer>
                <button class="btn" @click="save">{{$t('button.create')}}</button>
            </footer>
        </div>
        <mini-pad v-show="display" :show.sync="display" @input="input" @remove="remove" @reset="reset"></mini-pad>
    </div>
</template>

<script>
import miniPad from "./miniPad";
import inputer from "../../setting/common/inputer";
import { isSymbol, isNullOrUndefined } from "util";

export default {
  props: ["init"],
  components: { miniPad, inputer },
  data() {
    return {
      display: true,
      number: "",
      date: "",
      cvc: "",
      caret: 0
    };
  },
  methods: {
    setCaret(caret) {
      this.caret = caret;
    },
    setInput(target) {
      this.display = true;
    },
    reset() {
      const { model } = document.activeElement.dataset;

      if (model) {
        this[model] = "";
        this.caret = 0;
      }
    },
    input(char) {
      const { model, mask } = document.activeElement.dataset;

      if (model) {
        let value = this[model];
        const atLast = this.caret >= value.length;

        value = value.substr(0, this.caret) + char + value.substr(this.caret);

        if (mask) {
          value = value.replace(/\D/g, "");

          let i = 0;
          let format = "";
          mask.split("").some(symbol => {
            if (/[#]/.test(symbol)) {
              format += value[i++];
            } else {
              format += symbol;

              this.caret += this.caret >= i ? 1 : 0;
            }

            return !value[i];
          });
          value = format;
        }

        this.caret++;
        this[model] = value;

        if (this[model][this.caret] === " ") this.caret++;

        this.$nextTick(() =>
          document.activeElement.setSelectionRange(this.caret, this.caret)
        );
      }
    },
    remove() {
      const { model } = document.activeElement.dataset;

      if (model) {
        const value = this[model];

        this[model] =
          value.substr(0, this.caret - 1) + value.substr(this.caret);

        this.caret = this.caret > 0 ? this.caret - 1 : this.caret;

        this.$nextTick(() =>
          document.activeElement.setSelectionRange(this.caret, this.caret)
        );
      }
    },
    encrypt(plaintext, key) {
      return new Promise(next =>
        this.$socket.emit("[CRYPT] ENCRYPT", { plaintext, key }, result =>
          next(result)
        )
      );
    },
    async save() {
      try {
        const unique = String().random();
        const { _id } = this.$store.getters.customer;
        const number = this.number
          .split(" ")
          .join("")
          .slice(0, 8);

        const card = [number, this.date, this.cvc];
        const cipher = await this.encrypt(
          [number.split(" ").join(""), this.date, this.cvc],
          "whoisyourdaddy"
        );

        this.$socket.emit(
          "[CUSTOMER] SAVE_CREDIT_CARD",
          _id,
          { unique, card, cipher },
          this.init.resolve
        );
      } catch (e) {
        this.exitComponent();
      }
    }
  }
};
</script>

<style scoped>
.editor {
  z-index: 2;
}
</style>
