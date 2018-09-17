<template>
    <div>
      <header class="date-picker">
        <div class="f1">
            <h3>{{$t('setting.title.giftcardSummary')}}</h3>
            <p>{{$t('tip.foundRecords',cards.length)}}</p>
        </div>
    </header>
    <div class="summary-wrap">
      <section class="list relative">
          <gift-card v-for="(giftcard,index) in cards" :key="index" :card="giftcard"></gift-card>
          <paginator :of="Array(summary.count).fill()" @page="setPage" :perPage="11" :maxPage="15" :static="true" v-if="summary.count > 11" class="bottom-page"></paginator>
      </section>
      <section class="overview">
        <div class="wrap relative">
          <h3>{{$t('nav.overview')}}</h3>
          <p>
            <span class="f1">Total Giftcard Count</span>
            <span class="value">{{summary.count}}</span>
          </p>
          <p>
            <span class="f1">{{$t('report.giftcard.remain')}}</span>
            <span class="value">$ {{summary.remain | decimal}}</span>
          </p>
          <h3>{{$t('card.stats.giftcardSalesToday')}}</h3>
          <div class="group">
            <p>
              <span class="f1">{{$t('report.giftcard.activation')}}</span>
              <span class="value">{{summary.activated}}</span>
            </p>
            <p>
              <span class="f1">{{$t('report.giftcard.bonus')}}</span>
              <span class="value">$ {{summary.bonusAmount | decimal}}</span>
            </p>            
            <p>
              <span class="f1">{{$t('report.giftcard.reload')}}</span>
              <span class="value">$ {{summary.reloadAmount | decimal}}</span>
            </p>
            <p>
              <span class="f1">{{$t('report.giftcard.redeem')}}</span>
              <span class="value">$ {{summary.redeemAmount | decimal}}</span>
            </p>            
          </div>
          <h3>{{$t('button.search')}} {{$t('card.giftCard')}}</h3>
          <div class="group row boxCenter">
            <i class="fa fa-search"></i><input v-model="cardNumber">
          </div>
        </div>
      </section>
      </div>
    </div>
</template>

<script>
import giftCard from "./helper/giftcard";
import paginator from "../../common/paginator";

export default {
  components: { giftCard, paginator },
  data() {
    return {
      componentData: null,
      component: null,
      cardNumber: "",
      today: today(),
      summary: {},
      cards: [],
      page: 0
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[GIFTCARD] LIST", 0, cards => {
      appSocket.emit("[GIFTCARD] SUMMARY", summary => {
        next(vm => {
          vm.cards = cards;
          vm.summary = summary;
        });
      });
    });
  },
  methods: {
    fetchData() {
      this.$socket.emit("[GIFTCARD] LIST", this.page, cards => {
        console.log(this.page, cards);
        this.cards = cards;
      });
    },
    setPage(page) {
      this.page = page;
      this.fetchData();
    }
  }
};
</script>

<style scoped>
.bottom-page {
  position: absolute;
  width: 611px;
  bottom: 15px;
}

input {
  padding: 5px;
  margin: 10px 0 10px 15px;
  border: none;
  outline: none;
  width: 200px;
}
</style>