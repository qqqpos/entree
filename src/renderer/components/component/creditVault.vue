<template>
  <dialog open class="boxCenter" @click.self="init.reject">
    <div class="frame-common">
      <header>
        <h3>{{$t('title.creditVault')}}</h3>
        <h5>All available card list below</h5>
      </header>
      <div class="wrap">
        <div class="row" v-if="cards.length">
          <credit-card v-for="(card,index) in cards" :key="index" :card="card"></credit-card>
        </div>
        <div class="placeholder" v-else>
          <i class="fab fa-cc-visa"></i>
          <p>{{$t('card.noCard')}}</p>
        </div>
      </div>
      <footer>
        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </dialog>
</template>

<script>
import { mapActions } from "vuex";

import dialogModule from "../common/dialog";
import creditCard from "./helper/creditCard";

export default {
  props: ["init"],
  components: { creditCard, dialogModule },
  data() {
    return {
      componentData: null,
      component: null,
      cards: []
    };
  },
  methods: {
    confirm() {}
  }
};
</script>

<style scoped>
.wrap {
  width: 765px;
  height: 350px;
  padding: 15px;
}

.row {
  flex-wrap: wrap;
}
</style>