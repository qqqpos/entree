<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5></h5>
        <h3>{{$t('title.creditVault')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <div class="profiles">
          <template v-if="view">
            <div class="profile" v-for="(opt,index) in opts" :key="index">
              <input type="radio" name="opt" v-model="select" :value="opt" :id="'opt'+index" @change="blur">
              <label :for="'opt'+index">
                <i class="fa fa-unlock" v-if="opt.unlock"></i>
                <i class="fa fa-lock" v-else></i>
                <div class="card">{{opt.number}}</div>
                <div>
                  <span class="value">{{opt.exp}}</span>
                  <span class="value">{{opt.cvc}}</span>
                </div>
                <i class="fa fa-trash trash" @click="remove(index)"></i>
              </label>
            </div>
          </template>
          <template v-else>
            <div class="dialog">
              <header>
                <h5>{{$t('title.create')}}</h5>
                <h3>{{$t('button.newRecord')}}</h3>
              </header>
              <div class="inner">
                <p>{{$t('card.number')}}</p>
                <input type="text" v-model="card" @click="setCursor('card')">
                <p>{{$t('card.expirationDate')}}</p>
                <input type="text" v-model="exp" @click="setCursor('exp')">
                <p>{{$t('card.securityCode')}}</p>
                <input type="text" v-model="cvc" @click="setCursor('cvc')">
              </div>
              <footer>
                <button class="btn" @click="view = true">{{$t('button.cancel')}}</button>
                <button class="btn" @click="save">{{$t('button.save')}}</button>
              </footer>
            </div>
          </template>
        </div>
        <div class="entryWrap">
          <div class="inner">
            <input type="text" v-model="entry">
          </div>
          <num-pad v-model="entry" @enter="unlock" type="string"></num-pad>
        </div>
      </div>
      <footer>
        <div class="f1">
          <button class="btn" @click="newRecord" v-show="opts.length < 4">{{$t('button.new')}}</button>
        </div>
        <button class="btn" @click="confirm" :disabled="!select">{{$t('button.confirm')}}</button>
      </footer>
      <div :is="component" :init="componentData"></div>
    </div>
  </div>
</template>

<script>    
import numPad from "../numpad";
import dialoger from "../dialoger";
import { mapActions } from "vuex";

export default {
  props: ["init"],
  components: { numPad, dialoger },
  data() {
    return {
      componentData: null,
      component: null,
      opts: this.init.opts.map(opt => ({
        number: (opt.card[0] + "********").replace(/(.{4})/g, "$1 ").trim(),
        exp: opt.card[1],
        cvc: opt.card[2],
        cipher: opt.cipher,
        unlock: false
      })),
      select: null,
      cursor: null,
      view: true,
      card: "",
      exp: "",
      cvc: "",
      entry: ""
    };
  },
  methods: {
    encrypt(plaintext, key) {
      return new Promise(next => this.$socket.emit("[CRYPT] ENCRYPT", { plaintext, key }, result => next(result)));
    },
    decrypt(ciphertext, key) {
      return new Promise((next,stop) => this.$socket.emit("[CRYPT] DECRYPT", { ciphertext, key }, json => {
        json ? next(JSON.parse(json)) : stop()
      }));
    },
    unlock() {
      this.decrypt(this.select.cipher, this.entry)
        .then(card => {
          Object.assign(this.select, {
            unlock: true,
            number: card[0]
              .replace(/\s/g, "")
              .replace(/(.{4})/g, "$1 ")
              .trim(),
            exp: card[1],
            cvc: card[2]
          });
        })
        .catch(() => {
          this.entry = "";
        });
    },
    blur() {
      this.entry = "";
      this.cursor = null;
    },
    setCursor(cursor) {
      this.cursor = cursor;
      this.entry = "";
    },
    save() {
      const _id = this.$store.getters.customer._id;
      const card = [this.card.replace(" ", ""), this.exp, this.cvc];
      const key = this.card.split(" ").last();
      this.encrypt(card, key).then(cipher => {
        this.$socket.emit(
          "[CUSTOMER] SAVE_CREDIT_CARD",
          _id,
          {
            card: [this.card.replace(" ", "").slice(0, 8), this.exp, this.cvc],
            cipher,
            lastUse: +new Date()
          },
          () => {
            this.opts.push({
              unlock: true,
              number: this.card,
              exp: this.exp,
              cvc: this.cvc
            });
            this.view = true;
          }
        );
      });
    },
    newRecord() {
      this.view = false;
      this.cursor = "card";
    },
    remove(index) {
      const data = {
        type: "question",
        title: "dialog.removeCreditCard",
        msg: "dialog.removeCreditCardConfirm",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.confirm", fn: "resolve" }
        ]
      };

      const customer = this.$store.getters.customer;

      this.$dialog(data)
        .then(() => {
          this.$socket.emit(
            "[CUSTOMER] REMOVE_CREDIT_CARD",
            customer._id,
            index
          );
          this.opts.splice(index, 1);
          this.entry = "";
          this.$q();
        })
        .catch(() => this.$q());
    },
    confirm() {
      const { unlock, number, exp, cvc } = this.select;
      const card = number.replace(/\s/g, "");

      let tradeMark = "CREDIT";
      if (/^5[1-5]/.test(card)) tradeMark = "Master";
      if (/^4/.test(card)) tradeMark = "Visa";
      if (/^3[47]/.test(card)) tradeMark = "Amex";

      if (unlock) {
        this.setOrder({
          __creditPayment__: {
            number,
            cvc,
            date: exp
          },
          tradeMark
        });
      }
      this.init.resolve();
    },
    ...mapActions(["setOrder"])
  },
  watch: {
    entry(n) {
      switch (this.cursor) {
        case "card":
          if (n.length > 16) return;

          this[this.cursor] = String(n)
            .replace(" ", "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
          break;
        case "exp":
          if (n.length > 4) return;

          this[this.cursor] = String(n)
            .replace("/", "")
            .replace(/(.{2})/, "$1/")
            .trim();
          break;
        case "cvc":
          this[this.cursor] = String(n);
      }
    }
  }
};
</script>

<style scoped>
.wrap {
  display: flex;
  padding: 15px 5px 5px 15px;
}

.profiles {
  width: 400px;
  position: relative;
}

.profile {
  display: flex;
  align-items: center;
  height: 80px;
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 26px;
  color: gray;
}

input:checked + label {
  border: 2px solid #009688;
  background: #e0f2f1;
  color: #3c3c3c;
}

input:checked + label i.trash {
  display: initial;
}

label {
  flex: 1;
  border: 2px solid #eee;
  padding: 5px 15px 5px 60px;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  background: #fff;
}

label i {
  position: absolute;
  left: 22px;
  top: 22px;
}

.value {
  margin-right: 15px;
}

i.trash {
  left: initial;
  right: 22px;
  cursor: pointer;
  display: none;
  color: #f44336;
}

.dialog {
  text-align: center;
  border-radius: 4px;
  background: #fafafa;
  box-shadow: var(--shadow);
}

.dialog header {
  text-align: left;
}

p {
  text-align: left;
  font-weight: bold;
  margin: 10px;
}

.dialog .inner {
  margin: auto;
  padding: 15px 35px 30px;
  background: #f5f5f5;
}

.dialog input {
  border: 2px solid #eee;
  font-family: "Agency FB";
  font-size: 26px;
  font-weight: bold;
  color: #3c3c3c;
  padding: 3px 10px;
  background: #fff;
}
</style>

