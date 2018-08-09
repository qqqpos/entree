<template>
    <div>
      <header class="date-picker">
        <div class="f1">
            <h3>{{$t('setting.title.giftcard')}}</h3>
            <p>{{$t('tip.giftcardList')}}</p>
        </div>
    </header>
    <div class="summary-wrap">
      <section class="list">
          <gift-card v-for="(giftcard,index) in cards" :key="index" :card="giftcard"></gift-card>
      </section>
      <section class="overview">

      </section>
      </div>
    </div>
</template>

<script>
import datePicker from "../common/datePicker";
import giftCard from "./helper/giftcard";

export default {
  components: { datePicker, giftCard },
  data() {
    return {
      componentData: null,
      component: null,
      cards: []
    };
  },
  methods: {}
};
</script>