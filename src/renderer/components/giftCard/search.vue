<template>
  <div class="popupMask dark center" @click.self="exit">
    <template v-if="results.length === 0">
      <div class="editor">
        <header>
          <div>
            <h5></h5>
            <h3>{{$t('title.search')}}</h3>
          </div>
        </header>
        <div class="banner"></div> 
        <div class="wrap">
          <inputer title="card.giftCard" v-model="number" mask="#### #### #### ####" :autoFocus="true" model="number" @click.native="setInput(false)" @focus="setCaret"></inputer>
          <inputer title="text.phone" v-model="phone" mask="### ### ####" model="phone" @click.native="setInput(false)" @focus="setCaret"></inputer>
          <inputer title="text.name" v-model="name" model="name" @click.native="setInput(true)" @focus="setCaret"></inputer>
        </div>
        <footer>
          <div class="opt">
            <switches title="text.osk" v-model="keyboard" :reverse="true"></switches>
          </div>
          <button class="btn" @click="search">{{$t('button.search')}}</button>
        </footer>
      </div>
    </template>
    <template v-else>
      <div class="editor">
        <header>
          <div>
            <h3>{{$t('card.giftCard')}}</h3>
            <h5>{{$t('tip.foundRecords',results.length)}}</h5>
          </div>
        </header>
        <div class="banner"></div>
        <div class="wrap">
          <ul>
            <li v-for="(card,index) in results" @click="pick(card)" :key="index">
              <div class="f1">
                <h5>{{card.name}}</h5>
                <h3>{{card.number | card}}</h3>
              </div>
              <span class="balance">$ {{card.balance | decimal}}</span>
            </li>
          </ul>
        </div>
        <footer>
          <button class="btn" :disabled="!card" @click="init.resolve(card)">{{$t('button.done')}}</button>
        </footer>
      </div>
    </template>
    <div :is="component" :init="componentData"></div>
    <keyboard :display="keyboard" :alphabet.sync="alphabet" v-model="entry" @input="input" @enter="search" @backspace="remove" :executeText="$t('button.search')"></keyboard>
  </div>
</template>

<script>
import keyboard from "../common/keyboard";
import inputer from "../setting/common/inputer";
import switches from "../setting/common/switches";
import dialogModule from "../common/dialog";

export default {
  props: ["init"],
  components: { inputer, switches, keyboard, dialogModule },
  data() {
    return {
      component: null,
      componentData: null,
      keyboard: true,
      alphabet: false,
      results: [],
      card: null,
      number: "",
      phone: "",
      name: "",
      entry: "",
      caret: 0
    };
  },
  methods: {
    setInput(boolean) {
      this.alphabet = boolean;
      this.keyboard = true;
    },
    setCaret(value) {
      this.caret = value;
    },
    input(string) {
      const { model } = document.activeElement.dataset;

      if (model) {
        const value = this[model];

        this[model] =
          value.substr(0, this.caret) + string + value.substr(this.caret);
        this.caret++;

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
    search() {
      this.keyboard = false;
      
      const query = {
        number: this.number.replace(/\D/g, ""),
        phone: this.phone.replace(/\D/g, ""),
        name: this.name
      };

      this.$socket.emit("[GIFTCARD] SEARCH", query, results => {
        if (results.length) {
          this.keyboard = false;
          this.results = results;
        } else if (query.number.length) {
          // when no match results
          // ask if needs activation
          const prompt = {
            title: "giftcard.dialog.noFound",
            msg: ["giftcard.tip.activateCard", query.number],
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.activate", fn: "resolve" }
            ]
          };
          this.$dialog(prompt)
            .then(() => this.init.reject(query.number))
            .catch(this.exitComponent);
        } else {
          const prompt = {
            title: "giftcard.dialog.noFound",
            msg: ["giftcard.tip.noResult", query.phone || query.name],
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          this.$dialog(prompt).then(this.exitComponent);
        }
      });
    },
    pick(card) {
      this.card = card;
    },
    exit() {
      if (this.keyboard) this.keyboard = false;
      else this.init.reject(false);
    }
  }
};
</script>

<style scoped>
.editor {
  transform: translateY(-25%);
}

.wrap {
  overflow: scroll;
  max-height: 300px;
}

li {
  display: flex;
  align-items: center;
  cursor: pointer;
  min-height: 36px;
  padding: 0 10px;
  background: #f9f9f9;
}

li:nth-child(even) {
  background: #eee;
  border-radius: 4px;
}

li h5 {
  color: rgba(0, 0, 0, 0.75);
  font-weight: normal;
}

.balance {
  font-family: "Agency FB";
  font-weight: bold;
  color: #009688;
}
</style>