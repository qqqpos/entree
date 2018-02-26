<template>
  <div class="popupMask center dark">
    <div class="window" v-show="!component">
      <header class="title">
        <span>{{$t('title.markPaymentType')}}</span>
        <i class="fa fa-times" @click="init.reject(false)"></i>
      </header>
      <div class="inner">
        <div v-for="(option,index) in options" :key="index">
          <input type="radio" name="type" v-model="type" :value="option" :id="'type'+index">
          <label class="type" :for="'type'+index">{{option}}</label>
        </div>
      </div>
      <footer>
        <div class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</div>
        <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import dialoger from "../common/dialoger";
export default {
  props: ["init"],
  components: { dialoger },
  data() {
    return {
      options: [
        "GrubHub",
        "Seamless",
        "Eat 24",
        "Uber Eats",
        "Postmates",
        "EatStreet",
        "BeyondMenu",
        "Simpon",
        "ChowNow",
        "UnionPay",
        "Online Order",
        "CASH",
        "Visa",
        "Master",
        "Discover",
        "AE"
      ],
      type: "CASH",
      order: null,
      releaseComponentLock: true,
      componentData: null,
      component: null
    };
  },
  created() {
    this.order = this.init.hasOwnProperty("order")
      ? this.init.order
      : this.$store.getters.order;

    this.checkComponentUsage()
      .then(this.checkPermission)
      .catch(this.initialFailed);
  },
  beforeDestroy() {
    this.releaseComponentLock &&
      this.$socket.emit("[COMPONENT] UNLOCK", {
        component: "thirdParty",
        lock: this.order._id
      });
  },
  mounted() {
    if (this.order.source !== "POS") this.type = this.order.source;
  },
  methods: {
    checkComponentUsage() {
      return new Promise((next, stop) => {
        let data = {
          component: "thirdParty",
          operator: this.op.name,
          lock: this.order._id,
          time: +new Date(),
          exp: +new Date() + 1000 * 120
        };

        if (this.init.hasOwnProperty("callback")) {
          this.$socket.emit("[COMPONENT] LOCK", data, lock => {
            lock ? stop({ error: "paymentPending", data }) : next();
          });
        } else {
          this.releaseComponentLock = false;
          next();
        }
      });
    },
    checkPermission() {
      return new Promise((next, stop) => {
        this.op.cashCtrl === "disable"
          ? stop({ error: "accessDenied" })
          : next();
      });
    },
    initialFailed({ error, data }) {
      switch (error) {
        case "paymentPending":
          const current = +new Date();
          const exp = data.exp;
          const duration = exp - current;

          this.releaseComponentLock = false;

          this.$dialog({
            title: "dialog.pending",
            msg: "dialog.pendingOrderAccessDenied",
            timeout: { duration, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => this.exit());
          break;
        case "accessDenied":
          this.$dialog({
            type: "warning",
            title: "dialog.accessDenied",
            msg: "dialog.accessDeniedTip",
            timeout: { duration: 10000, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => this.exit());
          break;
      }
    },
    confirm() {
      this.init.hasOwnProperty("callback")
        ? this.init.resolve(this.type)
        : this.checkTip().then(this.saveToDatabase);
    },
    checkTip() {
      return new Promise(next =>
        this.$socket.emit("[PAYMENT] CHECK", this.order._id, result =>
          next(result)
        )
      );
    },
    saveToDatabase(paid) {
      const cashDrawer =
        this.op.cashCtrl === "staffBank"
          ? this.op.name
          : this.station.cashDrawer.name;

      let { remain } = this.order.payment;
      let tip = 0;

      const parent = this.order.hasOwnProperty("parent")
        ? this.order.parent
        : this.order._id;
      const split = this.order.hasOwnProperty("parent") ? this.order._id : null;

      const transaction = {
        _id: ObjectId(),
        date: today(),
        time: +new Date(),
        order: parent,
        split,
        ticket: {
          number: this.order.number || this.ticket.number,
          type: this.order.type || this.ticket.type
        },
        paid: this.order.payment.remain,
        change: 0,
        actual: remain,
        tip,
        cashier: this.op.name,
        server: this.order.server || this.op.name,
        cashDrawer,
        station: this.station.alias,
        type: "THIRD",
        for: "Order",
        subType: this.type,
        credential: null,
        lfd: null
      };

      this.$socket.emit("[TRANSACTION] SAVE", transaction, () => {
        this.order.cashier = this.op.name;
        this.order.payment.type = this.type;
        this.order.payment.log.push(transaction);
        this.$socket.emit("[UPDATE] INVOICE", this.order, false);
        this.init.resolve();
      });
    },
    exit() {
      this.init.resolve();
    }
  },
  computed: {
    ...mapGetters(["op", "store", "station"])
  }
};
</script>

<style scoped>
.inner {
  width: 540px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.inner > div {
  display: flex;
}

input {
  display: none;
}

label {
  width: 90px;
  padding: 20px 15px;
  margin: 5px;
  background: #fff;
  border: 2px solid #e0e0e0;
  position: relative;
  text-align: center;
  border-radius: 4px;
  color: #bdbdbd;
}

input:checked + label {
  background: #66bb6a;
  color: #fafafa;
  border: 2px solid #009688;
  text-shadow: 0 2px 1px rgba(0, 0, 0, 0.5);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

input:checked + label:before {
  position: absolute;
  content: " ";
  width: 23px;
  height: 15px;
  background: #009688;
  bottom: 0;
  right: 0;
  border-top-left-radius: 4px;
}

input:checked + label:after {
  position: absolute;
  content: "\f00c";
  font-family: fontAwesome;
  bottom: 0;
  right: 3px;
}
</style>