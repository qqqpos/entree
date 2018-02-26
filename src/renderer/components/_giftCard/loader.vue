<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5>{{giftCard}}</h5>
        <h3>{{$t('title.reload')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="display">
        <input type="text" v-model="reload">
        <span class="unit" v-if="payment === 'CASH'" @click="payment = 'CREDIT'">CASH</span>
        <span class="unit" v-else @click="payment = 'CASH'">CREDIT</span>

        <span class="due">
          <span class="symbol">$</span>
          <span class="balance">{{balance}}</span>
        </span>
      </div>
      <num-pad v-model="reload" type="number" @enter="enter"></num-pad>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import TWEEN from "@tweenjs/tween.js";
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
      giftCard: null,
      balance: "0.00",
      payment: "CASH",
      reload: "0.00",
      value: 0
    };
  },
  created() {
    let number = this.init.number.replace(
      /^\D?(\d{4})\D?\D?(\d{4})\D?(\d{4})\D?(\d{4})/,
      "$1 $2 $3 $4"
    );
    this.giftCard = this.$t("tip.forGiftCard", number);
    this.balance = this.init.balance.toFixed(2);
  },
  methods: {
    enter() {
      this.verifyEntry()
        .then(this.confirmReload)
        .then(this.charge)
        .catch(this.reloadFailed);
    },
    verifyEntry() {
      return new Promise((resolve, reject) => {
        let noCashDrawerError = {
          title: "dialog.cashDrawerUnavailable",
          msg: "dialog.cashDrawerUnavailableTip",
          timeout: { duration: 5000, fn: "resolve" },
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };
        let invalidEntry = {
          title: "dialog.entryInvalid",
          msg: "dialog.entryMustBeNumber",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        if (this.payment === "CASH" && !this.station.cashDrawer.enable)
          throw noCashDrawerError;

        isNumber(this.reload) ? resolve() : reject(invalidEntry);
      });
    },
    confirmReload() {
      return new Promise((resolve, reject) => {
        this.$dialog({
          title: "dialog.giftCardReload",
          msg: ["dialog.confirmEntryValue", this.reload]
        })
          .then(() => resolve())
          .catch(() => this.$q());
      });
    },
    reloadFailed(error) {
      typeof error === "object"
        ? this.$dialog(error).then(() => {
            this.$q();
            this.clear();
          })
        : this.$q();
    },
    charge() {
      this.$q();
      this.payment === "CASH" ? this.chargeCash() : this.chargeCreditCard();
    },
    chargeCash() {
      let cashDrawer =
        this.op.cashCtrl === "staffBank"
          ? this.op.name
          : this.station.cashDrawer.name;
      let date = today();
      let time = +new Date();

      let activity = {
        type: "CASHFLOW",
        inflow: parseFloat(this.reload),
        outflow: 0,
        time,
        ticket: {},
        operator: this.op.name
      };

      let transaction = {
        _id: ObjectId(),
        date,
        time,
        order: null,
        ticket: null,
        paid: parseFloat(this.reload),
        change: 0,
        actual: parseFloat(this.reload),
        tip: 0,
        cashier: this.op.name,
        cashDrawer,
        station: this.station.alias,
        type: "CASH",
        for: "Reload",
        subType: null,
        credential: null,
        lfd: null
      };

      this.op.cashCtrl === "enable" && Printer.openCashDrawer();

      this.$socket.emit("[TRANSACTION] SAVE", transaction);
      this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });

      this.init.activation ? this.activation() : this.reloadBalance();
    },
    chargeCreditCard() {
      let card = {
        creditCard: { number: "", date: "" },
        amount: this.reload,
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
            order: null,
            for: "Reload",
            date: today(),
            _id: ObjectId()
          });

          Printer.printCreditCard(data);

          const transaction = {
            _id: ObjectId(),
            date,
            time,
            order: null,
            paid: parseFloat(data.amount.approve),
            change: 0,
            actual: parseFloat(data.amount.approve),
            tip: 0,
            cashier: this.op.name,
            cashDrawer,
            station: this.station.alias,
            terminal: this.station.terminal,
            type: "CREDIT",
            for: "Reload",
            subType: data.account.type,
            credential: data._id,
            lfd: data.account.number
          };

          this.$socket.emit("[TERMINAL] SAVE", data);
          this.$socket.emit("[TRANSACTION] SAVE", transaction);

          this.init.activation ? this.activation() : this.reloadBalance();
        })
        .catch(error => {
          this.$q();
        });
    },
    activation() {
      const activation = {
        number: this.init.number,
        date: today(),
        time: +new Date(),
        cashier: this.op.name,
        balance: parseFloat(this.reload),
        activation: +new Date(),
        transaction: 1
      };
      this.$socket.emit("[GIFTCARD] ACTIVATION", activation, card => {
        Printer.printGiftCard("Activation", card);
        this.$emit("reloaded", card);
      });
    },
    reloadBalance() {
      const reload = {
        date: today(),
        time: +new Date(),
        type: "Reload",
        cashier: this.op.name,
        number: this.init.number,
        change: parseFloat(this.reload),
        balance: parseFloat(this.init.balance) + parseFloat(this.reload)
      };
      this.$socket.emit("[GIFTCARD] RELOAD", reload, card => {
        Printer.printGiftCard("Reload", card);
        this.$emit("reloaded", card);
      });
    }
  },
  watch: {
    reload: function(now, was) {
      let oldValue = parseFloat(was) + this.init.balance;
      let newValue = parseFloat(now) + this.init.balance;

      function animate() {
        TWEEN.update() && requestAnimationFrame(animate);
      }

      new TWEEN.Tween({ tweeningNumber: oldValue })
        .easing(TWEEN.Easing.Quadratic.Out)
        .to({ tweeningNumber: newValue }, 500)
        .onUpdate(e => {
          this.balance = e.tweeningNumber.toFixed(2);
        })
        .start();

      animate();
    }
  }
};
</script>

<style scoped>
.balance {
  width: 100px;
  display: inline-block;
  text-align: left;
}
.due {
  position: absolute;
  left: 110px;
  font-size: 2em;
  font-weight: bold;
  font-family: "Agency FB";
  color: #9e9e9e;
}
</style>