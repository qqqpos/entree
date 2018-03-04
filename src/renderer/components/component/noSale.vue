<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5></h5>
        <h3>{{$t('type.NO_SALES')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="display">
        <input type="text" v-model="amount">
        <span class="unit" v-if="payment === 'CASH'" @click="payment = 'CREDIT'">CASH</span>
        <span class="unit" v-else @click="payment = 'CASH'">CREDIT</span>
      </div>
      <num-pad v-model="amount" type="decimal" @enter="enter"></num-pad>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import numPad from "../common/numpad";
import dialoger from "../common/dialoger";
import creditCard from "../payment/creditCard";

export default {
  props: ["init"],
  components: { dialoger, creditCard, numPad },
  computed: {
    ...mapGetters(["op", "station"])
  },
  data() {
    return {
      componentData: null,
      component: null,
      payment: "CASH",
      amount: "0.00"
    };
  },
  methods: {
    enter() {
      this.verifyEntry()
        .then(this.checkPermission)
        .then(this.charge)
        .catch(this.chargeFailed);
    },
    verifyEntry() {
      return new Promise((next, stop) => {
        const noCashDrawerError = {
          title: "dialog.cashDrawerUnavailable",
          msg: "dialog.cashDrawerUnavailableTip",
          timeout: { duration: 5000, fn: "resolve" },
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };
        const invalidEntry = {
          title: "dialog.entryInvalid",
          msg: "dialog.entryMustBeNumber",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        if (this.payment === "CASH" && !this.station.cashDrawer.enable)
          throw noCashDrawerError;

        isNumber(this.amount) ? next() : stop(invalidEntry);
      });
    },
    checkPermission() {
      return new Promise((next, stop) => {
        const prompt = {
          title: "dialog.cashDrawerUnavailable",
          msg: "dialog.permissionDeniedTip",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        this.op.cashCtrl !== "disable" ? next() : stop(prompt);
      });
    },
    chargeFailed(error) {
      typeof error === "object"
        ? this.$dialog(error).then(() => this.$q())
        : this.$q();
    },
    charge() {
      this.$q();
      this.payment === "CASH" ? this.chargeCash() : this.chargeCreditCard();
    },
    chargeCash() {
      const cashDrawer =
        this.op.cashCtrl === "staffBank"
          ? this.op.name
          : this.station.cashDrawer.name;
      const date = today();
      const time = +new Date();

      const activity = {
        type: "CASHFLOW",
        inflow: parseFloat(this.amount),
        outflow: 0,
        time,
        ticket: {
          type: "NO_SALES",
          number: ""
        },
        operator: this.op.name
      };

      const transaction = {
        _id: ObjectId(),
        date,
        time,
        order: null,
        ticket: {
          type: "NO_SALES",
          number: ""
        },
        paid: parseFloat(this.amount),
        change: 0,
        actual: parseFloat(this.amount),
        tip: 0,
        cashier: this.op.name,
        cashDrawer,
        station: this.station.alias,
        type: "CASH",
        for: "Order",
        subType: null,
        credential: null,
        lfd: null
      };

      this.op.cashCtrl === "enable" && Printer.openCashDrawer();

      this.$socket.emit("[TRANSACTION] SAVE", transaction);
      this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });
    },
    chargeCreditCard() {
      const card = {
        creditCard: { number: "", date: "" },
        amount: this.amount,
        tip: 0
      };

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, card };
        this.component = "creditCard";
      })
        .then(data => {
          const date = today();
          const time = +new Date();
          const cashDrawer =
            this.op.cashCtrl === "staffBank"
              ? this.op.name
              : this.station.cashDrawer.name;

          Object.assign(data, {
            order: {
              _id: null,
              type: "NO_SALES",
              number: "",
              cashier: this.op.name
            },
            for: "Order",
            date: today(),
            _id: ObjectId()
          });

          this.$socket.emit("[TERMINAL] SAVE", data, content =>
            this.$socket.emit(
              "[TERMINAL] CONFIG",
              this.station.terminal,
              config => {
                config.print && Printer.printCreditCard(content);
              }
            )
          );

          const transaction = {
            _id: ObjectId(),
            date,
            time,
            order: null,
            ticket: {
              type: "NO_SALES",
              number: ""
            },
            paid: parseFloat(data.amount.approve),
            change: 0,
            actual: parseFloat(data.amount.approve),
            tip: 0,
            cashier: this.op.name,
            cashDrawer,
            station: this.station.alias,
            terminal: this.station.terminal,
            type: "CREDIT",
            for: "Order",
            subType: data.account.type,
            credential: data._id,
            lfd: data.account.number
          };

          this.$socket.emit("[TRANSACTION] SAVE", transaction);
          this.init.resolve();
        })
        .catch(error => {
          console.log(error);
          this.$q();
        });
    }
  }
};
</script>