<template>
  <div class="popupMask center dark">
    <div class="terminal" v-show="!component">
      <header>
        <div class="title">
          <h3>{{$t('title.terminalRecords')}}</h3>
          <h5>{{$t('tip.foundRecords',filteredTransactions.length)}}</h5>
        </div>
        <nav class="filter">
          <div class="picker">
            <i class="fa fa-angle-left" @click="prev"></i>
            <span class="date">{{date}}</span>
            <i class="fa fa-angle-right" @click="next"></i>
          </div>
          <dropdown label="filter.station" :options="stations" filter="filterStation"></dropdown>
        </nav>
      </header>
      <table>
        <thead>
          <tr>
            <th class="index">ID</th>
            <th>{{$t('thead.type')}}</th>
            <th>{{$t('thead.time')}}</th>
            <th>{{$t('thead.station')}}</th>
            <th>{{$t('thead.for')}}</th>
            <th class="ticket">{{$t('thead.ticket')}}</th>
            <th>{{$t('thead.card')}}</th>
            <th>{{$t('thead.auth')}}</th>
            <th>{{$t('thead.amount')}}</th>
            <th>{{$t('thead.tip')}}</th>
            <th class="action">{{$t('thead.action')}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record,index) in records" :key="index" :class="{voided:record.status === 0}">
            <td class="index">{{record.index}}</td>
            <td>{{record.transType}}</td>
            <td>{{record.time | moment("HH:mm:ss")}}</td>
            <td>{{record.station}}</td>
            <td>{{$t('type.'+record.for)}}</td>
            <td v-if="record.for === 'Order'" class="ticket">
              <span class="type">{{$t('type.'+record.order.type)}}</span>
              <span class="number">#{{record.order.number}}</span>
            </td>
            <td v-else class="ticket"></td>
            <td class="card">
              <i :class="ccType(record.account.type)"></i>
              <span class="number" :title="record.addition.CARDBIN">...{{record.account.number}}</span>
            </td>
            <td class="auth">
              <span>{{record.host.auth}}</span>
            </td>
            <td class="amount">$ {{record.amount.approve}}</td>
            <td class="amount" :class="{zero:record.amount.tip === '0.00'}">$ {{record.amount.tip}}</td>
            <td v-if="!record.close" class="action">
              <span class="print" @click="print(record)">{{$t('button.print')}}</span>
              <span class="void" @click="voidSale(record)">{{$t('button.void')}}</span>
            </td>
            <td v-else class="action">
              <span class="refund" @click="askRefund(record)">{{$t('button.refund')}}</span>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>
              <div class="value">
                <span class="text">{{$t('text.tip')}}</span>
                <span class="amount">($ {{totalTip}})</span>
              </div>
              <div class="value">
                <span class="text">{{$t('text.total')}}</span>
                <span class="amount">$ {{totalAmount}}</span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
      <footer>
        <button class="btn" @click="openAdjuster">{{$t('button.adjustTips')}}</button>
        <div class="f1">
          <pagination :of="filteredTransactions" :max="12" :contain="13" @page="setPage"></pagination>
        </div>
        <button class="btn" @click="exit">{{$t('button.exit')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData" @refresh="initialTodayData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import batch from "./component/batch";
import dialoger from "../common/dialoger";
import dropdown from "./component/dropdown";
import pagination from "../common/pagination";
import processor from "../common/processor";
import adjuster from "./component/adjuster";

export default {
  props: ["init"],
  components: { dialoger, dropdown, pagination, processor, adjuster, batch },
  computed: {
    filteredTransactions() {
      let records = this.transactions;

      if (this.filterStation)
        records = records.filter(t => (t.station = this.station.alias));

      return records;
    },
    records() {
      let min = this.page * 13;
      let max = min + 13;

      return this.filteredTransactions.slice(min, max);
    },
    totalAmount() {
      return this.filteredTransactions
        .filter(i => i.transType === "SALE" && !i.close)
        .map(i => parseFloat(i.amount.approve))
        .reduce((a, b) => a + b, 0)
        .toFixed(2);
    },
    totalTip() {
      return this.filteredTransactions
        .filter(i => i.transType === "SALE" && !i.close)
        .map(i => parseFloat(i.amount.tip))
        .reduce((a, b) => a + b, 0)
        .toFixed(2);
    },
    ...mapGetters(["op", "station"])
  },
  data() {
    return {
      releaseComponentLock: false,
      transactions: [],
      componentData: null,
      component: null,
      adjustable: false,
      filterStation: null,
      stations: [],
      devices: [],
      terminal: null,
      date: today(),
      printTicket: true,
      page: 0
    };
  },
  created() {
    this.checkTerminal()
      .then(this.checkOccupy)
      .then(this.initialConfig)
      .then(this.initialTodayData)
      .catch(this.initialFailed);
    this.$bus.on("filter", this.applyFilter);
  },
  beforeDestroy() {
    this.$bus.off("filter", this.applyFilter);
  },
  methods: {
    checkTerminal() {
      return new Promise((next, stop) => {
        this.$socket.emit("[TERMINAL] DEVICE", devices => {
          const reason = {
            title: "dialog.noTerminal",
            msg: "dialog.missTerminalConfig",
            timeout: { duration: 1000, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          devices.length > 0 ? next() : stop(reason);
        });
      });
    },
    checkOccupy() {
      return new Promise((next, reject) => {
        let data = {
          title: "dialog.accessDenied",
          msg: "dialog.terminalBatching",
          timeout: { duration: 1000, fn: "resolve" },
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };
        next();
      });
    },
    initialConfig() {
      return new Promise((next, stop) => {
        this.$socket.emit("[TERMINAL] DEVICE", devices => {
          const reason = {
            type: "warning",
            title: "dialog.noTerminal",
            msg: "dialog.missTerminalConfig",
            timeout: { duration: 1000, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          this.devices = devices;
          devices.length === 0 ? stop(reason) : next();
        });
      });
    },
    initialTodayData() {
      this.$socket.emit("[TERMINAL] TODAY", data => this.initializing(data));
    },
    initialFailed(content) {
      this.$dialog(content).then(() => this.init.resolve());
    },
    initializing(transaction) {
      let stations = new Set();
      transaction.map(t => t.station).forEach(name => stations.add(name));
      this.stations = Array.from(stations).map(n => ({ text: n, value: n }));
      let status = new Set();

      this.transactions = transaction;
    },
    getParser(model) {
      switch (model) {
        case "SP30":
        case "S80":
        case "S300":
          return require("../payment/parser/pax.js");
        case "NX2200":
          return require("../payment/parser/exadigm.js");
        default:
          return require("../payment/parser/pax.js");
      }
    },
    ccType(card) {
      switch (card) {
        case "Visa":
          return "fa fa-cc-visa";
        case "MasterCard":
          return "fa fa-cc-mastercard";
        case "American Express":
          return "fa fa-cc-amex";
        case "Discover":
          return "fa fa-cc-discover";
        default:
          return "fa fa-credit-card-alt";
      }
    },
    setPage(num) {
      this.page = num;
    },
    applyFilter({ value, type }) {
      this[type] = value;
      this.page = 0;

      this.$nextTick(() => this.$bus.emit("applied"));
    },
    print(record) {
      Printer.printCreditCard(record, true);
    },
    voidSale(record) {
      const msg =
        record.for === "Order"
          ? [
              "dialog.voidCreditInvoice",
              record.order.number,
              this.$t("type." + record.order.type)
            ]
          : "dialog.voidCreditReload";

      const prompt = {
        title: "dialog.voidCreditSale",
        msg,
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.confirmPrint", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => {
          this.$p("processor", { timeout: 30000 });
          this.initialParser(record.terminal)
            .then(this.executeVoidSale.bind(null, record))
            .catch(this.executeFailed);
        })
        .catch(() => this.$q());
    },
    askRefund(record) {
      const amount = record.amount.approve;
      const prompt = {
        title: "terminal.refundConfirm",
        msg: ["terminal.refundAmount", amount],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.refund", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => this.refund(record))
        .catch(() => this.$q());
    },
    refund(record) {
      const amount = record.amount.approve;
      const order = record.order || {};
      const number = order.number || "";

      this.$p("processor", { timeout: 60000 });
      this.initialParser(this.station.terminal).then(() => {
        this.terminal.refund(amount, number).then(response => {
          let result = this.terminal.explainTransaction(response.data);
          result._id = ObjectId();

          if (result.code === "000000") {
            const transaction = {
              _id: ObjectId(),
              date: today(),
              time: +new Date(),
              order: order._id || "",
              ticket: {
                number: order.number || "",
                type: order.type || ""
              },
              paid: 0,
              change: 0,
              actual: -result.amount.approve,
              tip: 0,
              cashier: this.op.name,
              server: null,
              cashDrawer: null,
              station: this.station.alias,
              terminal: this.station.terminal,
              type: "CREDIT",
              for: "Refund",
              subType: result.account.type,
              credential: result._id,
              lfd: result.account.number
            };

            this.$socket.emit("[TERMINAL] SAVE", result);
            this.$socket.emit("[TRANSACTION] SAVE", transaction);
            this.$q();
          } else {
            const prompt = {
              title: ["terminal.error", result.code],
              msg: result.msg,
              buttons: [{ text: "button.confirm", fn: "resolve" }]
            };

            this.$dialog(prompt).then(() => this.$q());
          }
        });
      });
    },
    initialParser(terminal) {
      return new Promise((next, stop) => {
        try {
          const { ip, port, sn, model, print } = this.devices.find(
            d => d.alias === terminal
          );
          this.printTicket = print;
          this.terminal = this.getParser(model).default();
          this.terminal
            .initial(ip, port, sn, this.station.alias, terminal)
            .then(response => {
              this.device = this.terminal.check(response.data);
              this.device.code === "000000" ? next() : stop();
            });
        } catch (error) {
          this.$log({
            eventID: 9010,
            type: "failure",
            note: `Can not find terminal config. \n\nError Message:\n${error}`
          });

          stop();
        }
      });
    },
    executeVoidSale(record) {
      const invoice = record.order.number;
      const transaction = record.trace.trans;

      this.terminal.voidSale(invoice, transaction).then(response => {
        let voidSale = this.terminal.explainTransaction(response.data);
        delete voidSale.order;

        if (voidSale.code === "000000") {
          this.printTicket && Printer.printCreditCard(voidSale);
          Object.assign(record, voidSale, { status: 0 });
          this.$socket.emit("[TERMINAL] VOID", record);
          this.$socket.emit("[TRANSACTION] FIND", record._id, payment => {
            console.log(payment);
            //this.$socket.emit("[PAYMENT] REMOVE", payment);
          });
          this.$q();
        } else {
          const prompt = {
            type: "error",
            title: voidSale.msg,
            msg: ["terminal.error", voidSale.code],
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          this.$dialog(prompt).then(() => this.$q());
        }
      });
    },
    executeFailed(error) {
      const prompt = {
        type: "error",
        title: "dialog.cantExecute",
        msg: "dialog.errorOccurred",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.$dialog(prompt).then(() => this.$q());
    },
    accessAdjuster() {
      this.$checkPermission("modify", "transaction")
        .then(this.openAdjuster)
        .catch(() => this.log());
    },
    openAdjuster() {
      new Promise((resolve, reject) => {
        const transactions = this.filteredTransactions;
        const devices = this.devices;

        this.componentData = { resolve, reject, transactions, devices };
        this.component = "adjuster";
      })
        .then(this.preBatch)
        .catch(() => this.$q());
    },
    preBatch() {
      const prompt = {
        title: "dialog.batchClose",
        msg: "dialog.batchCloseTip",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.batch", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(this.batch)
        .catch(() => this.$q());
    },
    batch() {
      this.$p("batch", {
        devices: this.devices,
        transactions: this.transactions
      });
    },
    prev() {
      this.page = 0;
      this.date = moment(this.date, "YYYY-MM-DD")
        .subtract(1, "days")
        .format("YYYY-MM-DD");
      this.$socket.emit("[TERMINAL] DATE", this.date, data =>
        this.initializing(data)
      );
    },
    next() {
      this.page = 0;
      this.date = moment(this.date, "YYYY-MM-DD")
        .add(1, "days")
        .format("YYYY-MM-DD");
      this.$socket.emit("[TERMINAL] DATE", this.date, data =>
        this.initializing(data)
      );
    },
    exit() {
      this.init.resolve();
    }
  }
};
</script>

<style scoped>
.terminal {
  background: #fff;
  width: 950px;
  border-radius: 4px 4px 0 0;
  box-shadow: var(--shadow);
}

header {
  display: flex;
  padding: 10px 20px;
}

h5 {
  color: #666;
  font-weight: normal;
  margin-top: 2px;
}

nav.filter {
  flex: 1;
  position: relative;
  align-items: center;
  margin-left: 35px;
  display: flex;
  justify-content: flex-end;
}

thead tr {
  background: #009688;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}

thead th {
  font-weight: normal;
  padding: 3px 0;
  border-bottom: 1px solid #eeeeee;
}

tbody {
  display: block;
  height: 507px;
  text-align: center;
}

thead,
tbody tr,
tfoot tr {
  display: table;
  table-layout: fixed;
  width: 100%;
}

tbody td {
  padding: 10px 0;
}

tbody tr {
  background: #fafafa;
}

tbody tr:nth-child(even) {
  background: #eeeeee;
}

tfoot tr {
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

tfoot td {
  padding: 5px 0;
  background: #eeeeee;
}

footer {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.print {
  background: #607d8b;
}

.void {
  background: #f44336;
}

.refund {
  background: #ff9800;
}

.fa-cc-visa {
  color: #5050e2;
}

.fa-cc-mastercard {
  color: #ff2b1c;
}

.fa-cc-discover {
  color: #ff9800;
}

.fa-cc-amex {
  color: var(--deepBlue);
}

.ticket {
  width: 105px;
}

.ticket .number {
  color: gray;
}

.amount {
  font-weight: bold;
  font-family: "Agency FB";
  color: #3c3c3c;
}

.action {
  width: 150px;
}

.auth span {
  background: #ff5722;
  color: #fff;
  padding: 2px 4px;
  border-radius: 4px;
  text-shadow: 0 1px 1px #631b05;
  box-shadow: 0 1px 1px #b5afaf;
}

.action span {
  padding: 4px 6px;
  margin: 0 2px;
  color: #fff;
  cursor: pointer;
  border-radius: 2px;
  box-shadow: 0 1px 1px #b5afaf;
}

.adjustable {
  cursor: pointer;
  color: #ff9800;
}

.sub {
  margin-left: 5px;
  color: gray;
}

.index {
  width: 40px;
}

.value {
  display: inline-flex;
  margin: 0 10px;
}

.value .text {
  margin-right: 10px;
}

tbody tr.voided {
  background: #ffab91;
  filter: grayscale(0.75) opacity(0.5);
  pointer-events: none;
}

.zero {
  color: lightgray;
}

.picker {
  display: flex;
  justify-content: center;
  align-items: baseline;
  font-weight: bold;
  color: #3c3c3c;
}

.picker i {
  padding: 10px 30px;
  cursor: pointer;
}
</style>