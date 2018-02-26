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
        <i class="fa fa-cutlery"></i>
        <span>{{$t('type.DINE_IN')}}</span>
      </li>
      <li v-show="type ==='DINE_IN' && !app.newTicket" @click="togo">
        <i class="fa fa-hand-o-right"></i>
        <span>{{$t('type.TO_GO')}}</span>
      </li>
      <li @click="thirdParty" class="thirdParty">
        <i class="fa fa-edge"></i>
        <span>{{$t('type.THIRD')}}</span>
      </li>
    </ul>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dialoger from "../common/dialoger";
import tpp from "./source";

export default {
  props: ["init"],
  components: { dialoger, tpp },
  computed: {
    ...mapGetters(["app", "store", "ticket", "order"])
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
        "dialog.orderTypeSwitchTip",
        this.$t("type." + this.ticket.type),
        this.$t("type." + type)
      ];

      const prompt = {
        type: "question",
        title: "dialog.orderTypeSwitchConfirm",
        msg
      };

      this.$dialog(prompt)
        .then(() => {
          this.switchType(type);
          this.init.resolve();
        })
        .catch(() => this.$q());
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
        case "PICK_UP":
        case "DELIVERY":
          this.$router.push({ name: "Information" });
          break;
        case "DINE_IN":
          this.$router.push({ name: "Table" });
          break;
      }
      this.init.resolve();
    },
    togo() {
      this.$dialog({
        type: "question",
        title: "dialog.foodTogo",
        msg: "dialog.togoConfirm"
      })
        .then(() => {
          this.$bus.emit("FOOD_TOGO");
          this.init.resolve();
        })
        .catch(() => this.$q());
    },
    applyPrice(type) {
      const content = this.order.content.map(item => {
        if (item.hasOwnProperty("prices") && item.prices[type])
          item.price = item.prices[type];
        return item;
      });
      this.setOrder({ content });
    },
    thirdParty() {
      new Promise((resolve, reject) => {
        const { source } = this.order;
        this.componentData = { resolve, reject, source };
        this.component = "tpp";
      })
        .then(type => {
          this.setOrder({ source: type, tradeMark: type });
          this.init.resolve();
        })
        .catch(() => this.$q());
    },
    ...mapActions(["setOrder", "setTicket"])
  }
};
</script>

<style scoped>
.popupMask {
  margin-top: 30px;
}

ul {
  position: absolute;
  top: 5px;
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
  padding: 18px 10px 18px 15px;
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
  margin-top: 15px;
}
</style>