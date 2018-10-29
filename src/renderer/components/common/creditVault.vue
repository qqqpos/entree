<template>
  <dialog open class="flex-center" @click.self="init.reject">
    <div class="frame-common">
      <header>
        <h3>{{$t('title.creditVault')}}</h3>
        <h5>Customer used credit card list</h5>
      </header>
      <div class="wrap relative">
        <ul class="column" v-if="init.cards.length">
          <card v-for="(card,index) in cards" :data="card" :key="index" :index="index" @click="select" @edit="edit" @remove="remove" :class="{selected:selectIndex === index}"></card>
        </ul>
        <div class="placeholder" v-else>
          <i class="fab fa-cc-visa"></i>
          <p>{{$t('card.tip.noCard')}}</p>
        </div>
      </div>
      <footer>
        <button class="btn" @click="create" v-show="cards.length < 4">{{$t('button.new')}}</button>
        <div class="f1"></div>
        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </dialog>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import card from "./helper/card";
import dialogModule from "./dialog";
import editor from "./helper/creditEditor";

export default {
  props: ["init"],
  components: { card, dialogModule },
  data() {
    return {
      componentData:null,
      component:null,
      cards: this.init.cards.map(card =>
        Object.assign(card, { selected: false })
      ),
      selectIndex: -1
    };
  },
  computed: {
    ...mapGetters(["customer"])
  },
  methods: {
    create() {},
    edit(card) {},
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
      this.selectIndex = index;
    },
    confirm() {},
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


