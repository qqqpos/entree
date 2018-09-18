<template>
  <div>
    <div class="tab-content">
      <header class="nav">
        <h3 class="title">{{$t('giftcard.setting.title')}}</h3>
      </header>
      <toggle title="giftcard.setting.enable" v-model="giftcard.enable"></toggle>
      <!-- <toggle title="giftcard.setting.manual" v-model="giftcard.manual"></toggle> -->
      <!-- <div class="slider">
        <label>{{$t('giftcard.setting.expire')}}<span class="value">{{periods[giftcard.expire]}}</span></label>
        <slider v-model="giftcard.expire" :min="0" :max="5" :piecewise="true" tooltip="hover" :lazy="true"></slider>        
      </div> -->
      <toggle title="giftcard.setting.expire" v-model="giftcard.expire"></toggle> 
      <div class="slider">
        <label>{{$t('giftcard.setting.format')}}<span class="value">{{$t('giftcard.setting.length',giftcard.format)}}</span></label>
        <slider v-model="giftcard.format" :min="4" :max="16" :piecewise="true" tooltip="hover" :lazy="true"></slider>
      </div>
      <toggle title="giftcard.setting.bonus" v-model="giftcard.bonus">
        <transition name="dropdown">
          <div v-if="giftcard.bonus" class="opt">
            
          </div>
        </transition>
      </toggle>
    </div>
  </div>
</template>

<script>
import toggle from "../common/toggle";
import inputer from "../common/inputer";
import switches from "../common/switches";
import selector from "../common/selector";
import textInput from "../common/textInput";
import slider from "../common/slider";

export default {
  components: { toggle, switches, inputer, selector, textInput, slider },
  data() {
    return {
      authorized: this.$store.getters.authorized,
      giftcard: this.$store.getters.store.giftcard,
      // periods: [
      //   this.$t("card.lifetime"),
      //   this.$t("card.periodYears", 1),
      //   this.$t("card.periodYears", 2),
      //   this.$t("card.periodYears", 3),
      //   this.$t("card.periodYears", 4),
      //   this.$t("card.periodYears", 5)
      // ]
    };
  },
  beforeDestroy() {
    this.$socket.emit("[CONFIG] UPDATE", {
      key: "store.giftcard",
      value: this.giftcard
    });
  }
};
</script>

<style scoped>
.slider {
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
  border-bottom: 1px solid #eee;
}

.slider label {
  padding-bottom: 5px;
}

.value {
  float: right;
  padding-right: 4px;
  color: #2196f3;
}
</style>
