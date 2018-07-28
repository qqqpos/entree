<template>
  <div>
    <div class="tab-content">
    <header class="nav">
      <h3 class="title">{{$t('setting.default.orderLogic')}}</h3>
    </header>
    <toggle title="text.menuID" v-model="defaults.menuID"></toggle>
    <toggle title="text.favoriteItem" v-model="defaults.favorite"></toggle>
    <toggle title="text.alphabetical" tooltip="tip.alphabetical" v-model="defaults.alphabetical"></toggle>
    <toggle title="setting.default.autoStack" tooltip="tip.default.autoStackItemQty" v-model="defaults.autoStackItem"></toggle>
    <toggle title="setting.default.matchQty" tooltip="tip.default.matchItemQty" v-model="defaults.matchItemQty"></toggle>
  </div>
</div>

</template>

<script>
import { mapActions } from "vuex";
import toggle from "../common/toggle";
import textList from "../common/textList";

export default {
  components: { toggle, textList },
  data() {
    return {
      defaults: {},
      alphabetical: false
    };
  },
  created() {
    //hot patch
    const defaults = {
      paymentType: "CASH",
      percentageDiscount: true,
      percentageTip: true,
      autoStackItem: false,
      matchItemQty: false,
      menuID: false,
      favorite: true,
      alphabetical: false
    };

    this.defaults = this.$store.getters.config.defaults || defaults;
    this.alphabetical = this.defaults.alphabetical;
  },
  beforeDestroy() {
    this.alphabetical !== this.defaults.alphabetical && this.setMenu();
  },
  beforeRouteLeave(to, from, next) {
    this.$socket.emit("[CONFIG] UPDATE", {
      key: "defaults",
      value: this.defaults
    });

    next();
  },
  methods: {
    ...mapActions(["setMenu"])
  }
};
</script>