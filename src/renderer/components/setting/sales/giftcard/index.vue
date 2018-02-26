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
<<<<<<< HEAD
            <h5>0</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('card.stats.giftcardTotal')}}</h3>
            <h5>0</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('card.stats.vipCount')}}</h3>
            <h5>0</h5>
=======
            <h5>435</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('card.stats.giftcardTotal')}}</h3>
            <h5>34</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('card.stats.vipCount')}}</h3>
            <h5>345</h5>
>>>>>>> f7d469e753790ba8af114fb5bdfde7c912cfed1f
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