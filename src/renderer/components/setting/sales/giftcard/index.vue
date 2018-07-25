<template>
    <div>
        <header class="nav">
            <div class="title">
                <h3>{{$t('title.giftcardSummary')}}</h3>
            </div>
        </header>
        <div class="data-status">
            <h3>{{$t('card.stats.giftcardCount')}}</h3>
            <h5>{{summary.count}}</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('card.stats.giftcardTotal')}}</h3>
            <h5>$ {{summary.remain | decimal}}</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('card.stats.vipCount')}}</h3>
            <h5>0</h5>
        </div>
        <div class="statistic">
            <h3>{{$t('card.stats.giftcardSalesToday')}}</h3>
            <h5>
                <span>{{$t('card.activation')}}</span>
                <span class="value">{{summary.activated}}</span>
            </h5>
            <h5>
                <span>{{$t('card.giftCardCredit')}}</span>
                <span class="value">{{summary.reloadAmount | decimal}}</span>
            </h5>
            <h5>
                <span>{{$t('card.giftCardDebit')}}</span>
                <span class="value">{{summary.spendAmount | decimal}}</span>
            </h5>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      summary: {}
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[GIFTCARD] SUMMARY", data => {
      next(vm => {
        vm.summary = data;
      });
    });
  }
};
</script>