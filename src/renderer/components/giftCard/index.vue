<template>
  <div class="popupMask dark center" @click.self="init.reject(false)">
    <div class="editor" v-show="!component">
      <header class="tab">
        <div>
          <h5></h5>
          <h3 v-if="giftcard.vip">{{$t('card.vipCard')}}</h3>
          <h3 v-else>{{$t('card.giftCard')}}</h3>
        </div>
        <nav class="tabs">
          <div v-if="activation">
            <input type="radio" v-model="tab" value="activation" name="tab" id="activation">
            <label for="activation">{{$t('card.activation')}}</label>
          </div>
          <div v-else>
            <input type="radio" v-model="tab" value="info" name="tab" id="info">
            <label for="info">{{$t('card.info')}}</label>
          </div>
          <div>
            <input type="radio" v-model="tab" value="reload" name="tab" id="reload">
            <label for="reload">{{$t('card.reload')}}</label>
          </div>
          <div>
            <input type="radio" v-model="tab" value="history" name="tab" id="history">
            <label for="history">{{$t('card.history')}}</label>
          </div>
        </nav>
      </header>
      <transition mode="out-in">
        <template v-if="tab === 'activation'">
          <div>
            <div class="wrap">
              <inputer title="card.number" v-model="giftcard.number" :disabled="true" mask="#### #### #### ####"></inputer>
              <inputer title="card.holder" v-model="giftcard.holder"></inputer>
              <inputer title="card.phone" v-model="giftcard.phone" mask="### ### ####"></inputer>
              <inputer title="card.expirationDate" v-model="giftcard.expiration" mask="####-##-##"></inputer>
              <switches title="card.vip" v-model="giftcard.vip"></switches>
            </div>
            <footer>
              <button class="btn" @click="tab = 'reload'">{{$t('button.activation')}}</button>
            </footer>
          </div>
        </template>
        <template v-else-if="tab === 'info'">
          <div>
            <div class="wrap">
              <inputer title="card.number" v-model="giftcard.number" :disabled="true" mask="#### #### #### ####"></inputer>
              <inputer title="card.holder" v-model="giftcard.holder"></inputer>
              <inputer title="card.phone" v-model="giftcard.phone" mask="### ### ####"></inputer>
              <inputer title="card.expirationDate" v-model="giftcard.expiration" mask="####-##-##"></inputer>
              <inputer title="card.balance" v-model="giftcard.balance" :disabled="true"></inputer>
              <switches title="card.vip" v-model="giftcard.vip"></switches>
            </div>
            <footer>
              <div class="opt">
                <span class="del" @click="deactivation">{{$t('card.deactivation')}}</span>
              </div>
              <button class="btn" @click="updateInfo">{{$t('button.update')}}</button>
              <button class="btn" @click="printInfo">{{$t('button.print')}}</button>
              <button class="btn" v-show="init.callback" @click="applyCard">{{$t('button.confirm')}}</button>
            </footer>
          </div>
        </template>
        <template v-else-if="tab === 'reload'">
          <div class="wrap column">
            <div class="display">
              <input type="text" v-model="amount">
              <span class="unit" v-if="payment === 'CASH'" @click="payment = 'CREDIT'">CASH</span>
              <span class="unit" v-else @click="payment = 'CASH'">CREDIT</span>
              <span class="due">
                <span class="symbol">$</span>
                <span class="balance">{{giftcard.balance | decimal}}</span>
              </span>
            </div>
            <num-pad v-model="amount" type="number" @enter="reload"></num-pad>
          </div>
        </template>
        <template v-else>
          <div class="wrap table">
            <table class="event">
              <thead>
                <tr>
                  <th>{{$t('thead.date')}}</th>
                  <th>{{$t('thead.type')}}</th>
                  <th>{{$t('thead.cashier')}}</th>
                  <th>{{$t('thead.change')}}</th>
                  <th>{{$t('thead.balance')}}</th>
                  <th>{{$t('thead.ticket')}}</th>
                  <th>{{$t('thead.view')}}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(log,index) in records" :key="index">
                  <td>{{log.date}}</td>
                  <td>{{$t('type.'+log.type)}}</td>
                  <td>{{log.cashier}}</td>
                  <td v-if="log.change > 0" class="positive">{{log.change | decimal}}</td>
                  <td v-else class="negative">{{log.change | decimal}}</td>
                  <td>{{log.balance | decimal}}</td>
                  <td v-if="log.order">
                    <span>#{{log.order.number}}</span>
                    <span>{{$t('type.'+log.order.type)}}</span>
                  </td>
                  <td v-else></td>
                  <td>
                    <i class="fa fa-file-text-o" @click="viewReceipt(log.order._id)" v-show="log.order && log.order._id"></i>
                  </td>
                </tr>
              </tbody>
            </table>
            <pagination :of="logs" @page="setPage" :max="10" :contain="15"></pagination>
          </div>
        </template>
      </transition>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import search from "./search";
import capture from "./capture";
import ticket from "../common/ticket";
import numPad from "../common/numpad";
import dialoger from "../common/dialoger";
import pagination from "../common/pagination";
import creditCard from "../payment/creditCard";
import inputer from "../setting/common/inputer";
import switches from "../setting/common/switches";

export default {
  props: ["init"],
  components: {
    search,
    ticket,
    numPad,
    inputer,
    capture,
    switches,
    dialoger,
    pagination,
    creditCard
  },
  data() {
    return {
      componentData: null,
      activation: false,
      activated: false,
      tab: "activation",
      component: null,
      payment: "CASH",
      giftcard: {},
      amount: 0,
      page: 0,
      logs: []
    };
  },
  mounted() {
    this.swipeCard(this.init.vip)
      .then(this.initialData)
      .catch(this.initialFailed);
  },
  computed: {
    records() {
      const min = this.page * 15;
      const max = min + 15;

      return this.logs.slice(min, max);
    },
    ...mapGetters(["op", "station"])
  },
  methods: {
    swipeCard(vip) {
      return new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, vip };
        this.component = "capture";
      });
    },
    inputCard() {
      return new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "search";
      });
    },
    initialData(card) {
      this.giftcard = card;
      this.tab = "info";
      this.$socket.emit("[GIFTCARD] HISTORY", card.number, logs => {
        this.logs = logs;
        this.$q();
      });
    },
    initialFailed(exception) {
      if (typeof exception === "boolean") {
        this.init.reject();
      } else {
        switch (exception) {
          case "manual":
            this.inputCard()
              .then(this.initialData)
              .catch(this.initialFailed);
            break;
          default:
            this.activatePrompt(exception);
        }
      }
    },
    activatePrompt(card) {
      const number = card.replace(
        /^\D?(\d{4})\D?(\d{4})\D?(\d{4})\D?(\d{4})/,
        "$1 $2 $3 $4"
      );
      const prompt = {
        title: "dialog.cardActivation",
        msg: ["dialog.cardActivationConfirm", number]
      };
      const cashier = this.$store.getters.op.name;
      this.$dialog(prompt)
        .then(() => {
          this.giftcard = {
            number: card,
            date: today(),
            time: +new Date(),
            phone: "",
            name: "",
            cashier,
            balance: 0,
            activation: +new Date(),
            transaction: 0,
            vip: false,
            expiration: null
          };
          this.activation = true;
          this.$q();
        })
        .catch(() => this.init.reject());
    },
    viewReceipt(id) {
      this.$socket.emit("[VIEW] INVOICE", id, ticket =>
        this.$open("ticket", { ticket, exit: true })
      );
    },
    setPage(page) {
      this.page = page;
    },
    reload() {
      this.verifyEntry()
        .then(this.confirmPrompt)
        .then(this.charge)
        .catch(this.reloadFailed);
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
    confirmPrompt() {
      return new Promise((next, stop) => {
        let prompt = {
          title: "dialog.giftCardReload",
          msg: ["dialog.confirmReloadAmount", this.amount.toFixed(2)]
        };

        this.$dialog(prompt)
          .then(() => next())
          .catch(() => this.$q());
      });
    },
    charge() {
      this.$q();

      this.payment === "CASH" ? this.chargeCash() : this.chargeCreditCard();
    },
    chargeCash() {
      const { cashCtrl, name } = this.op;
      const cashDrawer =
        cashCtrl === "staffBank" ? name : this.station.cashDrawer.name;
      const date = today();
      const time = +new Date();

      const activity = {
        type: "CASHFLOW",
        inflow: parseFloat(this.amount),
        outflow: 0,
        time,
        ticket: {},
        operator: name
      };

      const transaction = {
        _id: ObjectId(),
        date,
        time,
        order: null,
        ticket: null,
        paid: parseFloat(this.amount),
        change: 0,
        actual: parseFloat(this.amount),
        tip: 0,
        cashier: name,
        cashDrawer,
        station: this.station.alias,
        type: "CASH",
        for: "Reload",
        subType: null,
        credential: null,
        lfd: null
      };

      cashCtrl === "enable" && Printer.openCashDrawer();
      console.log(transaction);
      this.$socket.emit("[TRANSACTION] SAVE", transaction);
      this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });

      this.activation ? this.activateCard() : this.reloadBalance();
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
          this.$q();

          const date = today();
          const time = +new Date();
          const { cashCtrl, name } = this.op;
          const cashDrawer =
            cashCtrl === "staffBank" ? name : this.station.cashDrawer.name;

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
            cashier: name,
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

          this.activation ? this.activateCard() : this.reloadBalance();
        })
        .catch(error => {
          console.log(error);
          this.$q();
        });
    },
    reloadFailed(error) {
      typeof error === "object"
        ? this.$dialog(error).then(() => this.$q())
        : this.$q();
    },
    activateCard() {
      Object.assign(this.giftcard, {
        number: this.giftcard.number.replace(/\D/g, ""),
        phone: this.giftcard.phone
          ? this.giftcard.phone.replace(/\D/g, "")
          : "",
        balance: parseFloat(this.amount),
        transaction: 1,
        activation: +new Date()
      });
      this.tab = "info";
      this.$socket.emit("[GIFTCARD] ACTIVATION", this.giftcard, card => {
        Printer.printGiftCard("Activation", card, {});
        this.activation = false;
        this.reloadBonus();
      });
    },
    reloadBalance() {
      this.giftcard.balance =
        parseFloat(this.giftcard.balance) + parseFloat(this.amount);

      const reload = {
        date: today(),
        time: +new Date(),
        type: "Reload",
        cashier: this.op.name,
        number: this.giftcard.number.replace(/\D/g, ""),
        change: parseFloat(this.amount),
        balance: this.giftcard.balance
      };

      this.$socket.emit("[GIFTCARD] RELOAD", reload, card => {
        this.giftcard = card;
        this.tab = "info";
        this.reloadBonus(card);
      });
    },
    reloadBonus(card) {
      const { giftcard = null } = this.$store.getters.store;

      if (giftcard && giftcard.bonus) {
        const matched = giftcard.rules
          .sort((a, b) => a.amount < b.amount)
          .find(rule => this.amount >= rule.amount);

        if (matched) {
          const { amount, bonus, initial } = matched;

          const reload = {
            date: today(),
            time: +new Date(),
            type: "Bonus",
            cashier: this.op.name,
            number: this.giftcard.number.replace(/\D/g, ""),
            change: parseFloat(bonus),
            balance: this.giftcard.balance + parseFloat(bonus)
          };

          this.$socket.emit("[GIFTCARD] RELOAD", reload, card => {
            this.giftcard = card;
            Printer.printGiftCard("Reload", card, {
              bonus,
              reload: this.amount
            });
          });
        } else {
          Printer.printGiftCard("Reload", card, { reload: this.amount });
        }
      } else {
        Printer.printGiftCard("Reload", card, { reload: this.amount });
      }
      this.refreshData();
    },
    updateInfo() {
      this.$socket.emit("[GIFTCARD] UPDATE", this.giftcard, {});
    },
    printInfo() {
      Printer.printGiftCard("Balance", this.giftcard, {});
    },
    refreshData() {
      this.amount = "";

      const number = this.giftcard.number.replace(/\D/g, "");

      this.$socket.emit("[GIFTCARD] QUERY", number, card => {
        this.card = card;
      });
      this.$socket.emit("[GIFTCARD] HISTORY", number, logs => {
        this.logs = logs;
      });
    },
    deactivation() {
      const prompt = {
        type: "question",
        title: "dialog.cardDeactivation",
        msg: ["dialog.cardDeactivationConfirm", this.giftcard.number]
      };

      this.$dialog(prompt)
        .then(() => {
          const { cashCtrl, name } = this.op;
          const cashDrawer =
            cashCtrl === "staffBank" ? name : this.station.cashDrawer.name;

          const transaction = {
            _id: ObjectId(),
            date: today(),
            time: +new Date(),
            order: null,
            paid: -parseFloat(this.giftcard.balance),
            change: 0,
            actual: -parseFloat(this.giftcard.balance),
            tip: 0,
            cashier: this.op.name,
            cashDrawer,
            station: this.station.alias,
            terminal: this.station.terminal,
            type: "CASH",
            for: "Refund",
            subType: null,
            credential: null,
            lfd: null
          };

          const activity = {
            type: "REFUND",
            inflow: 0,
            outflow: this.giftcard.balance,
            time: +new Date(),
            ticket: {},
            operator: this.op.name
          };

          this.$socket.emit("[TRANSACTION] SAVE", transaction);
          this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });

          this.$socket.emit("[GIFTCARD] DEACTIVATION", this.giftcard, () => {
            const prompt = {
              title: "dialog.cardDeactivated",
              msg: "dialog.cardDataRemoved",
              buttons: [{ text: "button.confirm", fn: "resolve" }]
            };

            cashCtrl === "enable" && Printer.openCashDrawer();
            this.$dialog(prompt).then(() => this.init.resolve());
          });
        })
        .catch(() => this.$q());
    },
    applyCard(){
      this.init.resolve(this.giftcard);
    }
  }
};
</script>

<style scoped>
.popupMask {
  padding: inherit;
}

.editor {
  max-width: 600px;
}

.table.wrap {
  padding: initial;
}

.tab > div,
.column {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.positive {
  color: green;
}

.column {
  padding: initial;
}

.negative {
  color: #ff5722;
}

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