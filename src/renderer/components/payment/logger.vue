<template>
  <div class="popupMask dark center">
    <div class="record">
      <header>
        <div>
          <h3>{{$t('title.paymentLog')}}</h3>
          <h5>{{$t('tip.paidRecords',init.number,init.logs.length)}}</h5>
        </div>
      </header>
      <table class="event">
        <thead>
          <tr>
            <th>{{$t('thead.time')}}</th>
            <th>{{$t('thead.operator')}}</th>
            <th>{{$t('thead.paymentType')}}</th>
            <th>{{$t('thead.amount')}}</th>
            <th>{{$t('thead.tip')}}</th>
            <th class="action">{{$t('thead.action')}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log,index) in logs" :key="index">
            <td>{{log.time | moment("HH:mm:ss")}}</td>
            <td>{{log.cashier}}</td>
            <td v-if="log.type ==='CASH'">{{$t('type.'+log.type)}}</td>
            <td v-else-if="log.type === 'CREDIT'" class="info">
              <span>{{$t('type.'+log.type)}}
                <span class="last">({{log.lfd}})</span>
              </span>
              <span>{{log.subType}}</span>
            </td>
            <td v-else-if="log.type ==='GIFT'">
              <span>{{$t('type.'+log.type)}}
                <span class="last">({{log.lfd}})</span>
              </span>
            </td>
            <td v-else class="info">
              <span>{{$t('type.'+log.type)}}</span>
              <span>{{log.subType}}</span>
            </td>
            <td class="amount" :title="tenderDetail(log)">$ {{log.actual | decimal}}</td>
            <td class="amount" :class="{zero:log.tip === 0}">$ {{log.tip | decimal}}</td>
            <td class="action">
              <button @click="removeConfirm(log,index)">{{$t("button.remove")}}</button>
              <span v-if="log.splitPayment" class="split">#{{log.splitPayment + 1}}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <footer>
        <div class="f1">
          <paginator :of="init.logs" @page="setPage" :perPage="10" :maxPage="6"></paginator>
        </div>
        <button class="btn" @click="edit">{{$t('button.edit')}}</button>
        <button class="btn" @click="close">{{$t('button.close')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import dialogModule from "../common/dialog";
import paginator from "../common/paginator";

export default {
  props: ["init"],
  components: { dialogModule, paginator },
  computed: {
    logs() {
      let min = this.page * 10;
      let max = min + 10;
      return this.init.logs.slice(min, max);
    },
    ...mapGetters(["op", "station"])
  },
  data() {
    return {
      componentData: null,
      component: null,
      terminal: null,
      printTicket: true,
      page: 0
    };
  },
  methods: {
    setPage(number) {
      this.page = number;
    },
    tenderDetail({ paid, change }) {
      paid = paid || 0;
      change = change || 0;
      return this.$t("text.tenderDetail", paid.toFixed(2), change.toFixed(2));
    },
    removeConfirm(payment, index) {
      const paid = (payment.actual || 0).toFixed(2);
      const tip = (payment.tip || 0).toFixed(2);
      const msg =
        payment.tip > 0
          ? ["dialog.removePaymentAndTipConfirm", paid, tip]
          : ["dialog.removePaymentConfirm", paid];

      const prompt = {
        type: "warning",
        title: ["dialog.removePayment", this.$t("type." + payment.type)],
        msg,
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.remove", fn: "resolve", load: true }
        ]
      };

      this.$dialog(prompt)
        .then(() => {
          switch (payment.type) {
            case "CASH":
              this.remove(payment, index);
              Printer.openCashDrawer();
              break;
            case "CREDIT":
              this.getDetail(payment.credential)
                .then(this.initialParser)
                .then(this.voidTransaction)
                .then(this.remove.bind(null, payment, index))
                .catch(this.voidFailed);
              break;
            case "GIFT":
              this.$socket.emit(
                "[GIFTCARD] REFUND",
                payment.credential,
                callback => this.remove(payment, index)
              );
              break;
            default:
              this.remove(payment, index);
          }
        })
        .catch(this.exitComponent);
    },
    getDetail(_id) {
      return new Promise((resolve, reject) => {
        this.$socket.emit("[TERMINAL] GET_TRANSACTION", _id, transaction => {
          transaction
            ? resolve(transaction)
            : reject({
                type: "warning",
                title: "dialog.somethingWrong",
                msg: "terminal.notFound",
                buttons: [{ text: "button.confirm", fn: "resolve" }]
              });
        });
      });
    },
    initialParser(record) {
      return new Promise((next, stop) => {
        const station = this.station.alias;

        this.$socket.emit(
          "[TERMINAL] CONFIG",
          record.terminal,
          ({ alias, ip, port, sn, model, print = true }) => {
            this.terminal = this.getParser(model).default();
            this.printTicket = print;

            this.terminal
              .initial(ip, port, sn, station, record.terminal)
              .then(response => {
                const device = this.terminal.check(response.data);
                const prompt = {
                  type: "error",
                  title: "terminal.connectError",
                  msg: ["terminal.initialFailed", alias, device.code],
                  buttons: [{ text: "button.confirm", fn: "resolve" }]
                };

                device.code === "000000" ? next(record) : stop(prompt);
              });
          }
        );
      });
    },
    voidTransaction(record) {
      return new Promise((next, stop) => {
        const invoice = record.order.number;
        const transaction = record.trace.trans;

        this.terminal.voidSale(invoice, transaction).then(response => {
          let voidSale = this.terminal.explainTransaction(response.data);

          if (voidSale.code === "000000") {
            this.printTicket && Printer.printCreditCard(voidSale, {});
            Object.assign(record, voidSale, { status: 0 });
            this.$socket.emit("[TERMINAL] VOID", record);
            next();
          } else {
            stop({
              type: "error",
              title: voidSale.msg,
              msg: ["terminal.error", voidSale.code],
              buttons: [{ text: "button.confirm", fn: "resolve" }]
            });
          }
        });
      });
    },
    remove(transaction, index) {
      this.init.logs.splice(index, 1);
      this.$socket.emit("[PAYMENT] REMOVE", transaction);
      this.exitComponent();
    },
    voidFailed(error) {
      this.$dialog(error).then(this.exitComponent);
    },
    edit() {
      const invoice = JSON.parse(JSON.stringify(this.$store.getters.order));
      const { type, number, customer } = invoice;

      this.setApp({ newTicket: false });
      this.setCustomer(customer);
      this.setTicket({ type, number });
      this.setViewOrder(invoice);

      this.$router.push({ path: "/main/menu" });
    },
    close() {
      this.init.resolve();
    },
    getParser(device) {
      switch (device) {
        case "SP30":
        case "S80":
        case "S300":
          return require("./parser/pax.js");
        case "NX2200":
          return require("./parser/exadigm.js");
        default:
          return require("./parser/pax.js");
      }
    },
    ...mapActions(["setApp", "setViewOrder", "setCustomer", "setTicket"])
  }
};
</script>

<style scoped>
.record {
  background: #fff;
  width: 550px;
  border-radius: 4px 4px 0 0;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.4);
}

header {
  padding: 15px 20px 10px;
  border-bottom: 1px solid #eee;
}

h3 {
  color: #333;
}

h5 {
  font-weight: normal;
  color: #757575;
  margin-top: 3px;
}

.amount {
  font-weight: bold;
  font-family: "Agency FB";
  color: #3c3c3c;
}

footer {
  display: flex;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.f1 {
  display: flex;
  justify-content: center;
}

.last {
  font-size: 14px;
  margin-left: 5px;
  color: #ff5722;
}

.info {
  display: flex;
  flex-direction: column;
}

.split {
  color: #607d8b;
  font-style: italic;
  width: 40px;
  display: inline-block;
}

.action {
  width: 120px;
}

.zero {
  opacity: 0.15;
}
</style>
