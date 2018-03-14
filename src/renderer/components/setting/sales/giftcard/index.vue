<template>
    <div>
        <header class="nav">
            <div class="title">
                <h3>{{$t('title.giftcardStats')}}</h3>
            </div>
            <nav>
                <span>{{$t('button.search')}}</span>
            </nav>
        </header>
        <div class="data-status">
            <h3>{{$t('card.stats.giftcardCount')}}</h3>
            <h5>0</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('card.stats.giftcardTotal')}}</h3>
            <h5>0</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('card.stats.vipCount')}}</h3>
            <h5>0</h5>
        </div>
        <div class="statistic">
            <h3>{{$t('card.stats.giftcardSalesToday')}}</h3>
            <h5>
                <span>{{$t('card.activation')}}</span>
                <span class="value"></span>
            </h5>
            <h5>
                <span>{{$t('card.giftCardCredit')}}</span>
                <span class="value"></span>
            </h5>
            <h5>
                <span>{{$t('card.giftCardDebit')}}</span>
                <span class="value"></span>
            </h5>
            <h5>
                <span></span>
                <span class="value"></span>
            </h5>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {

    };
  },
  methods: {

  }
};
</script>