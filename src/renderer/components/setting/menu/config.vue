<template>
  <div>
    <div class="tab-content">
    <header class="nav">
      <h3 class="title">{{$t('setting.default.orderLogic')}}</h3>
    </header>
    <toggle title="text.menuID" v-model="defaults.menuID"></toggle>
    <toggle title="text.favoriteItem" v-model="defaults.favorite"></toggle>
    <toggle title="setting.default.autoStack" tooltip="tip.default.autoStackItemQty" v-model="defaults.autoStackItem"></toggle>
    <toggle title="setting.default.matchQty" tooltip="tip.default.matchItemQty" v-model="defaults.matchItemQty"></toggle>
    <text-list title="setting.default.menuSort" v-model="defaults.menuSortBy" :opts="types"></text-list>
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
      types: ["DEFAULT", "ALPHABETICAL", "PINYIN", "PRICE", "ID"].map(type => ({
        label: this.$t("sort." + type),
        tooltip: "",
        value: type
      })),
      defaults: {},
      sort: null
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
      menuSortBy: "DEFAULT"
    };

    this.defaults = this.$store.getters.config.defaults || defaults;
    this.sort = this.defaults.menuSortBy;
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