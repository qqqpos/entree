<template>
  <div class="offer" :class="{invalid}">
    <div class="header">
      <span>{{coupon.alias}}</span>
      <switches v-model="coupon.redeem" :disabled="unqualify || !coupon.enable" @input="$emit('change',coupon)"></switches>
    </div>
    <div class="inner">
      <p>{{coupon.description}}</p>
    </div>
    <div class="info">
      <span class="tip" :class="{unqualify}">{{tooltip}}</span>
      <span class="type">{{$t('type.'+coupon.type)}}</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import switches from "../../setting/common/switches";
export default {
  props: ["promotion", "overstack"],
  components: { switches },
  computed: {
    invalid() {
      const { enable, count, date } = this.coupon.expire;

      if (!enable) {
        return false;
      } else {
        if (count > 0 && this.coupon.count >= count) return true;
        if (!!date && date < today()) return true;
      }

      return false;
    },
    unqualify() {
      const { enable, amount, item, exclude } = this.coupon.require;

      if (!enable) {
        return false;
      } else {
        if (amount > 0) {
          let items = this.order.content;
          if (exclude.length > 0) {
            items = items.filter(i => !exclude.includes(i.category));
          }
          const subtotal = items
            .map(i => i.single * i.qty)
            .reduce((a, b) => a + b, 0)
            .toFixed(2)
            .toFloat();
          const insufficient = subtotal < amount;
          this.tooltip = insufficient
            ? this.$t(
              "tip.coupon.requireAmount",
              (amount - subtotal).toFixed(2)
            )
            : this.$t("tip.coupon.conditionMet");
          return insufficient;
        }
        if (item.length > 0) {
          const unsatisfied =
            this.order.content.filter(i => item.includes(i._id)).length === 0;
          this.tooltip = unsatisfied
            ? this.$t("tip.coupon.requireItem")
            : this.$t("tip.coupon.conditionMet");
          return unsatisfied;
        }
      }

      return false;
    },
    ...mapGetters(["order"])
  },
  data() {
    return {
      tooltip: "",
      coupon: Object.assign({}, this.promotion)
    };
  },
  created() {
    this.$bus.on("Enable Coupon", this.enable);
    this.$bus.on("Disable Coupon", this.disable);
  },
  beforeDestroy() {
    this.$bus.off("Enable Coupon", this.enable);
    this.$bus.off("Disable Coupon", this.disable);
  },
  methods: {
    enable(coupon) {
      this.coupon.enable = true;
    },
    disable(coupon) {
      if (coupon._id !== this.coupon._id)
        Object.assign(this.coupon, {
          enable: false,
          redeem: false
        });
    }
  }
};
</script>

<style scoped>
.offer {
  width: 225px;
  margin: 5px;
  background: #fff;
  padding: 5px 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  border-radius: 2px;
}

.offer.invalid {
  pointer-events: none;
  filter: opacity(0.5);
}

.header {
  display: flex;
  align-items: center;
  height: 30px;
  border-bottom: 1px solid #ddd;
}

.header span {
  flex: 1;
  font-weight: bold;
  color: #3c3c3c;
}

.offer .inner {
  min-height: 40px;
  display: flex;
  align-items: center;
  padding: 5px 0;
  border-top: 1px solid #fff;
}

p {
  color: #656565;
}

.info {
  display: flex;
  align-items: center;
}

.tip {
  flex: 1;
  color: #009688;
}

.tip.unqualify {
  color: #ff9800;
}

.type {
  color: #cbcdd8;
}
</style>