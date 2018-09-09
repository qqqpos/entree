<template>
    <div class="popupMask dark center">
        <div class="redeem">
            <h5 class="light">{{$t('reward.redeemPoint')}}</h5>
            <h1 class="agency">$ {{redeem | decimal}}</h1>
            <slider v-model="redeem" :dotSize="22" tooltip="hover" :min="1" :max="init.value" :piecewise="true" :interval="interval"></slider>
            <ul>
                <li class="mini-btn" @click="select('REDUCE')">Reduce Ticket Price</li>
                <li v-for="(card,index) in init.cards" :key="index" class="mini-btn" @click="select('TRANSFER',card.number)">Redeem Value to <i class="far fa-credit-card space"></i><span class="agency">{{card.number | card}}</span></li>
                <li class="mini-btn" @click="init.reject"><i class="far fa-times-circle space"></i>{{$t('button.cancel')}}</li>
            </ul>
        </div>
    </div>
</template>

<script>
import slider from "../../../setting/common/slider";

export default {
  components: { slider },
  props: ["init"],
  data() {
    return {
      redeem: this.init.redeem,
      interval: 1
    };
  },
  methods: {
    select(type, card) {
      this.init.resolve({
        redeem: this.redeem,
        type,
        card
      });
    }
  }
};
</script>

<style scoped>
.redeem {
  background: #f4f4f4;
  border-radius: 6px;
  padding: 8px 14px;
  text-align: center;
}

h1 {
  font-size: 48px;
}

ul {
  margin-top: 10px;
}

li {
  padding: 14px 20px;
  margin-top: 5px;
  cursor: pointer;
}
</style>
