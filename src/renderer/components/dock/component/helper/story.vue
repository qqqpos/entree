<template>
    <li @click="$emit('menu')">
        <i :class="getOrderType(invoice.type)"></i>
        <div class="description">
            <h5>
            <span class="ago">{{invoice.time | time(false)}}</span>
            <span class="time">{{invoice.time | time(true)}}</span>
            </h5>
            <div v-html="story(invoice)"></div>
        </div>
        <div class="mask" v-show="focus">
            <span @click.stop="$emit('preview')"><i class="fas fa-file-invoice space"></i>{{$t('button.view')}}</span>
            <span @click.stop="$emit('copy')"><i class="fas fa-copy space"></i>{{$t('button.copy')}}</span>
            <span @click.stop="$emit('reimburse')" v-show="invoice.reimburse"><i class="fas fa-hand-holding-usd space"></i>{{$t('button.reimburse')}}</span>
        </div>
    </li>
</template>

<script>
export default {
  props: ["invoice", "focus"],
  data() {
    return {
      isRepeatVisible: false
    };
  },
  filters: {
    time(value, boolean) {
      return boolean
        ? moment(value).fromNow()
        : moment(value).format("MM-DD HH:mm:ss (ddd)");
    }
  },
  methods: {
    getOrderType(type) {
      switch (type) {
        case "WALK_IN":
          return "fa fa-user";
        case "PICK_UP":
          return "fa fa-phone";
        case "DELIVERY":
          return "fa fa-car";
        case "DINE_IN":
        case "BUFFET":
          return "fa fa-utensils";
        case "BAR":
          return "fa fa-wine";
        case "HIBACHI":
          return "fas fa-fire";
        default:
          return "fas fa-file-invoice";
      }
    },
    story(invoice) {
      const name = invoice.customer.name || this.$t("nav.customer");
      const type = this.$t("type." + invoice.type);
      const items = this.$t("text.placedItemFor", this.count(invoice.content));
      const reason = invoice.status === 0 ? this.getReason(invoice.void) : "";
      const total = invoice.payment.balance.toFixed(2);
      const text = this.$t("text.total");

      return `<span class="danger-text">${name}</span>${items}<span class="danger-text">${type}</span>\
                ${reason}
              <p class="amount">${text} <i class="fas fa-dollar-sign"></i> ${total}</p>`;
    },
    getReason({ by, time, note, flag, join = "" }) {
      const reason = this.$t("reason." + note, join);
      const text = this.$t("text.voidTicketFor");

      return `<p><span class="danger-text">${by}</span>${text}<span class="danger-text">${reason}</span></p>`;
    },
    count(items) {
      return items.reduce((a, c) => a + c.qty, 0);
    }
  }
};
</script>

<style scoped>
li {
  position: relative;
  background: #fff;
  margin: 4px 4px 0;
  border-radius: 2px;
  padding: 10px 7px;
  display: flex;
  box-shadow: 0 1px 2px #424242;
  justify-content: center;
  align-items: center;
  flex: 4;
}

li > i {
  background: #f5f5f5;
  width: 35px;
  height: 35px;
  text-align: center;
  line-height: 35px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 2px #90a4ae;
}

h5 {
  display: flex;
  font-weight: normal;
}

.ago {
  flex: 1;
}

.description {
  flex: 1;
  padding: 0 0 0 10px;
}

.description div {
  font-size: 14px;
  margin-top: 2px;
}

.time {
  color: #795548;
}

.mask {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
}

.mask span {
  background: linear-gradient(to bottom, #fff 0%, #e5e5e5 100%);
  border-radius: 4px;
  padding: 7px 10px;
  margin: 5px;
  box-shadow: 0 1px 3px #333;
}
</style>

