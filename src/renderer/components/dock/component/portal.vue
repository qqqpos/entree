<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="portal">
          <ul class="invoices">
            <li v-for="(invoice,index) in invoices" :key="index">
              <div class="info">
                <i :class="getOrderType(invoice.type)"></i>
                <div class="description">
                  <h5>
                    <span class="ago">{{invoice.time | time(false)}}</span>
                    <span class="time">{{invoice.time | time(true)}}</span>
                  </h5>
                  <p v-html="story(invoice)"></p>
                </div>
              </div>
              <!-- <i class="fa fa-search icon"></i>
              <i class="fa fa-clone icon"></i> -->
            </li>
          </ul>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["init"],
  data() {
    return {
      invoices: []
    };
  },
  computed: {
    ...mapGetters(["customer"])
  },
  created() {
    this.invoices = this.init.invoices;
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
          break;
        case "DINE_IN":
        case "BUFFET":
          return "fa fa-utensils";
        case "BAR":
          return "fa fa-wine";
          break;
        case "HIBACHI": 
          break;
      }
    },
    story(invoice) {
      const name = invoice.customer.name || this.$t("nav.customer");
      const type = this.$t("type." + invoice.type);
      const items = this.$t("text.placedItemFor", this.count(invoice.content));
      const total = invoice.payment.balance.toFixed(2);

      return `<span class="heavy-text">${name}</span><span>${items}</span><span class="heavy-text">${type}</span>\
              <p class="amount">${this.$t("text.total")} <i class="fas fa-dollar-sign"></i> ${total}</p>`;
    },
    count(items) {
      return items.reduce((a, c) => a + c.qty, 0);
    }
  }
};
</script>

<style scoped>
.portal {
  position: fixed;
  right: 285px;
  top: 30px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0 0 4px 4px;
  width: 340px;
  padding-bottom: 4px;
}

.invoices li {
  background: #fff;
  margin: 4px 4px 0;
  border-radius: 2px;
  padding: 10px 0;
  display: flex;
  box-shadow: 0 1px 2px #424242;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.info {
  flex: 4;
  padding: 0 7px;
  display: flex;
  align-items: center;
}

.icon {
  flex: 1;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #fff;
}

.info i {
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
  padding: 0 5px 0 10px;
}

.description p {
  font-size: 14px;
  margin-top: 2px;
}

.time {
  color: #607d8b;
}

.fa-search {
  background: var(--green);
}

.fa-clone {
  background: var(--deepBlue);
}
</style>


