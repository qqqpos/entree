<template>
  <div class="popupMask dark center">
    <div class="record">
      <header>
        <h3>{{$t('title.payLog')}}</h3>
        <h5>{{$t('tip.paidRecords',init.number,init.logs.length)}}</h5>
      </header>
      <table class="event">
        <thead>
          <tr>
            <th>{{$t('thead.time')}}</th>
            <th>{{$t('thead.paymentType')}}</th>
            <th>{{$t('thead.amount')}}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log,index) in logs" :key="index">
            <td>{{log.time | moment("HH:mm:ss")}}</td>
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
            <td>
              <button @click="removeConfirm(log,index)">{{$t("button.remove")}}</button>
              <span v-if="log.hasOwnProperty('splitPayment')" class="split">#{{log.splitPayment + 1}}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <footer>
        <div class="f1">
          <pagination :of="init.logs" @page="setPage" :contain="10" :max="6"></pagination>
        </div>
        <button class="btn" @click="close">{{$t('button.close')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import dialoger from "../common/dialoger";
import pagination from "../common/pagination";

export default {
  props: ["init"],
  components: { dialoger, pagination },
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
    tenderDetail(log) {
      return this.$t(
        "text.tenderDetail",
        log.paid.toFixed(2),
        log.change.toFixed(2)
      );
    },
    removeConfirm(payment, index) {
      let data = {
        type: "warning",
        title: ["dialog.paymentRemoveConfirm", this.$t("type." + payment.type)],
        msg: ["dialog.paymentRemoveConfirmTip", payment.actual.toFixed(2)],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.remove", fn: "resolve", load: true }
        ]
      };

      this.$dialog(data)
        .then(() => {
          switch (payment.type) {
            case "CASH":
              this.remove(payment,index);
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
        .catch(() => this.$q());
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
        const { alias } = this.station;

        this.$socket.emit(
          "[TERMINAL] CONFIG",
          record.terminal,
          ({ ip, port, sn, model, print = true }) => {
            this.terminal = this.getParser(model).default();
            this.printTicket = print;

            this.terminal
              .initial(ip, port, sn, alias, record.terminal)
              .then(response => {
                const device = this.terminal.check(response.data);
                const prompt = {
                  type: "error",
                  title: "terminal.connectError",
                  msg: ["terminal.initialFailed", device.code],
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
            this.printTicket && Printer.printCreditCard(voidSale);
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
    remove(payment, index) {
      this.$socket.emit("[PAYMENT] REMOVE", payment);
      this.init.logs.splice(index, 1);
      this.$q();
    },
    voidFailed(error) {
      this.$dialog(error).then(() => this.$q());
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
    }
  }
};
</script>

<style scoped>
.record {
  background: #fff;
  width: 500px;
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
</style>