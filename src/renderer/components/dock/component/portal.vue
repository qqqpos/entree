<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="portal">
          <ul class="invoices">
            <li v-for="(invoice,index) in invoices" :key="index">
              <div class="info">
                <i :class="getOrderType(invoice.type)"></i>
                <div>
                  <h5>{{getOrderTime(invoice.time)}}</h5>
                  <p></p>
                </div>
              </div>
              <i class="fa fa-search icon"></i>
              <i class="fa fa-clone icon"></i>
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
    getOrderTime(time) {},
    countItem(invoice) {
      return invoice.reduce((a, c) => a + c.qty, 0);
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
  height: 470px;
}

.invoices li {
  border: 1px solid #e0e0e0;
  background: #fff;
  margin: 6px 6px 0;
  border-radius: 4px;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.info {
  flex: 4;
  padding: 0 7px;
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

.fa-search {
  background: var(--green);
}

.fa-clone {
  background: var(--deepBlue);
}
</style>


