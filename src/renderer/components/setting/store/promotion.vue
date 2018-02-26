<template>
    <div>
        <toggle title="setting.rewardSystem" v-model="store.reward" @update="updateReward"></toggle>
        <external title="setting.coupon" tooltip="tip.couponList" @open="$router.push({name:'Setting.promotion.coupon'})"></external>
    </div>
</template>

<script>
import toggle from "../common/toggle";
import options from "../common/options";
import external from "../common/external";
export default {
  components: { toggle, options, external },
  data() {
    return {
      store: Object.assign({}, this.$store.getters.store)
    };
  },
  methods: {
    updateReward(value) {
      this.$socket.emit("[CONFIG] UPDATE", {
        key: "store.reward",
        value
      });
    }
  }
};
</script>