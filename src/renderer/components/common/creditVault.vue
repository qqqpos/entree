<template>
  <dialog open class="flex-center" @click.self="init.reject">
    <div class="frame-common">
      <header>
        <h3>{{$t('title.creditVault')}}</h3>
        <h5>Select one credit card to apply into ticket</h5>
      </header>
      <div class="wrap relative">
        <ul class="column" v-if="cards.length">
          <card v-for="(card,index) in cards" :data="card" :key="index" :index="index" @click="select" @remove="remove" :class="{selected:selectIndex === index}"></card>
        </ul>
        <div class="placeholder" v-else>
          <i class="fab fa-cc-visa"></i>
          <p>{{$t('card.tip.noCard')}}</p>
        </div>
      </div>
      <footer>
        <button class="btn" @click="create" v-show="cards.length < 4">{{$t('button.new')}}</button>
        <div class="f1"></div>
        <button class="btn" @click="confirm">{{$t('button.apply')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </dialog>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import card from "./helper/card";
import dialogModule from "./dialog";
import creator from "./helper/creditCreator";

export default {
  props: ["init"],
  components: { card, creator, dialogModule },
  data() {
    return {
      cards: this.init.cards,
      componentData: null,
      component: null,
      selectIndex: -1
    };
  },
  computed: {
    ...mapGetters(["customer"])
  },
  methods: {
    create() {
      this.$promise("creator")
        .then(this.refreshData)
        .catch(this.exitComponent);
    },
    async remove(index) {
      const data = {
        title: "dialog.confirm.remove",
        msg: "dialog.tip.removeCreditCardConfirm",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.remove", fn: "resolve" }
        ]
      };

      try {
        await this.$dialog(data);
        this.$socket.emit(
          "[CUSTOMER] REMOVE_CREDIT_CARD",
          this.customer._id,
          index
        );
        this.cards.splice(index, 1);
        this.exitComponent();
      } catch (e) {
        this.exitComponent();
      }
    },
    select(index) {
      this.selectIndex = this.selectIndex === index ? -1 : index;
    },
    decrypt(ciphertext, key) {
      return new Promise((next, stop) =>
        this.$socket.emit("[CRYPT] DECRYPT", { ciphertext, key }, json => {
          json ? next(JSON.parse(json)) : stop();
        })
      );
    },
    async confirm() {
      if (this.selectIndex !== -1) {
        const [number, date, cvc] = await this.decrypt(
          this.cards[this.selectIndex].cipher,
          "whoisyourdaddy"
        );

        let tradeMark = "CREDIT";
        if (/^5[1-5]/.test(card)) tradeMark = "Master";
        if (/^4/.test(card)) tradeMark = "Visa";
        if (/^3[47]/.test(card)) tradeMark = "Amex";

        this.setOrder({
          __creditCard__: { number: number.replace(/\s/g, ""), date, cvc },
          tradeMark
        });
      } else {
        this.setOrder({ __creditCard__: undefined });
      }

      this.init.resolve();
    },
    refreshData() {
      this.$socket.emit(
        "[CUSTOMER] GET_CREDIT_CARD",
        this.customer._id,
        cards => {
          this.cards = cards;
          this.exitComponent();
        }
      );
    },
    ...mapActions(["setOrder"])
  }
};
</script>

<style scoped>
.wrap {
  width: 565px;
  height: 250px;
  padding: 15px;
  background: #f1f3f5;
}

.selected {
  opacity: 1;
}
</style>


