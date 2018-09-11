<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <ul v-show="!component">
      <li v-show="type !== 'WALK_IN'" @click="change('WALK_IN')">
        <i class="fa fa-user"></i>
        <span>{{$t('type.WALK_IN')}}</span>
      </li>
      <li v-show="type !== 'PICK_UP'" @click="change('PICK_UP')">
        <i class="fa fa-phone"></i>
        <span>{{$t('type.PICK_UP')}}</span>
      </li>
      <li v-show="type !== 'DELIVERY'" @click="change('DELIVERY')">
        <i class="fa fa-car"></i>
        <span>{{$t('type.DELIVERY')}}</span>
      </li>
      <li v-show="type !=='DINE_IN'" @click="change('DINE_IN')">
        <i class="fa fa-utensils"></i>
        <span>{{$t('type.DINE_IN')}}</span>
      </li>
      <li v-show="(type === 'DINE_IN' || type === 'HIBACHI') && !app.newTicket" @click="togo">
        <i class="fas fa-walking"></i>
        <span>{{$t('type.TO_GO')}}</span>
      </li>
      <li @click="thirdParty" class="thirdParty">
        <i class="fab fa-edge"></i>
        <span>{{$t('type.THIRD')}}</span>
      </li>
    </ul>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import dialogModule from "../common/dialog";
import providerModule from "./source";

export default {
  props: ["init"],
  components: { dialogModule, providerModule },
  computed: {
    ...mapGetters(["app", "tax", "store", "ticket", "order"])
  },
  data() {
    return {
      componentData: null,
      component: null,
      type: null
    };
  },
  created() {
    this.type = this.ticket.type = this.order.type;
  },
  methods: {
    change(type) {
      const msg = [
        "dialog.orderTypeSwitchFrom",
        this.$t("type." + this.ticket.type),
        this.$t("type." + type)
      ];

      const prompt = {
        type: "question",
        title: "dialog.switchOrderType",
        msg
      };

      this.$dialog(prompt)
        .then(() => {
          this.switchType(type);
          this.init.resolve();
        })
        .catch(this.exitComponent);
    },
    switchType(type) {
      this.ticket.type === "DINE_IN" &&
        this.$socket.emit("[TABLE] RESET", { session: this.order.session });
      this.order.payment.delivery =
        type === "DELIVERY" &&
        this.store.deliver.charge &&
        !this.order.deliveryFree
          ? parseFloat(this.store.deliver.baseFee)
          : 0;
      Object.assign(this.order, { type });
      this.setTicket({ type });
      this.applyPrice(type);

      switch (type) {
        case "WALK_IN":
          this.setOrder({ plasticBag: 1 });
          break;
        case "PICK_UP":
        case "DELIVERY":
          this.setOrder({ plasticBag: 1 });
          this.$router.push({ name: "Information" });
          break;
        case "DINE_IN":
          this.setOrder({ plasticBag: 0 });
          this.archiveOrder(this.order);
          this.$router.push({ name: "Table" });
          break;
      }
      this.init.resolve();
    },
    togo() {
      const prompt = {
        type: "question",
        title: "dialog.createTogo",
        msg: "dialog.tip.createTogoList"
      };

      this.$dialog(prompt)
        .then(() => {
          this.setOrder({ plasticBag: 1 });
          this.$bus.emit("FOOD_TOGO");
          this.init.resolve();
        })
        .catch(this.exitComponent);
    },
    applyPrice(type) {
      try {
        const content = this.order.content.map(item => {
          if (
            item.hasOwnProperty("prices") &&
            item.prices.hasOwnProperty(type)
          ) {
            item.price = item.prices[type].split(",");
          } else if (
            item.hasOwnProperty("prices") &&
            item.prices.hasOwnProperty("DEFAULT")
          ) {
            item.price = Array.isArray(item.prices["DEFAULT"])
              ? item.prices["DEFAULT"]
              : item.prices["DEFAULT"].split(",");
          }

          return item;
        });
        this.setOrder({ content });
      } catch (e) {
        console.log(e);
      }
    },
    thirdParty() {
      new Promise((resolve, reject) => {
        const { source } = this.order;
        this.componentData = { resolve, reject, source };
        this.component = "providerModule";
      })
        .then(source => {
          this.setOrder({ source, tradeMark: source });
          this.init.resolve();
        })
        .catch(this.exitComponent);
    },
    ...mapActions(["archiveOrder", "setOrder", "setTicket"])
  }
};
</script>

<style scoped>
ul {
  position: absolute;
  top: 32px;
  left: 40px;
  padding: 5px 5px 0;
  color: #263238;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.6);
  font-weight: initial;
}

li {
  background: linear-gradient(to bottom, #fff 0%, #e5e5e5 100%);
  padding: 20px 10px 20px 15px;
  width: 170px;
  text-shadow: none;
  border-radius: 4px;
  margin-bottom: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
}

li i {
  width: 25px;
  text-align: center;
}

li.thirdParty {
  margin-top: 14px;
}
</style>