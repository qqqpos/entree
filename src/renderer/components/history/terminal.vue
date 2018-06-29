<template>
  <div class="popupMask center dark">
    <div class="terminal" v-show="!component">
      <header>
        <div class="title">
          <h3>{{$t('title.terminalRecords')}}</h3>
          <h5>{{$t('tip.foundRecords',filteredTransactions.length)}}
            <i class="fa fa-eye-slash" :title="$t('text.portionDisplay')" v-if="portionDisplay"></i>
          </h5>
        </div>
        <nav class="filter">
          <div class="picker">
            <i class="fa fa-angle-left" @click="prev"></i>
            <span class="date">{{date}}</span>
            <i class="fa fa-angle-right" @click="next"></i>
          </div>
          <dropdown label="filter.order" :options="types" filter="filterType"></dropdown>
          <dropdown label="filter.cashier" :options="cashiers" filter="filterCashier"></dropdown>
          <dropdown label="filter.terminal" :options="terminals" filter="filterTerminal"></dropdown>
        </nav>
      </header>
      <table>
        <thead>
          <tr>
            <th class="index" @click="sortBy('id')">ID<i class="fas fa-sort"></i></th>
            <th>{{$t('thead.type')}}</th>
            <th>{{$t('thead.time')}}</th>
            <th>{{$t('thead.terminal')}}</th>
            <th>{{$t('thead.for')}}</th>
            <th class="ticket" @click="sortBy('ticket')">{{$t('thead.ticket')}}<i class="fas fa-sort"></i></th>
            <th>{{$t('thead.card')}}</th>
            <th>{{$t('thead.auth')}}</th>
            <th>{{$t('thead.amount')}}</th>
            <th>{{$t('thead.tip')}}</th>
            <th class="action">{{$t('thead.action')}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record,index) in records" :key="index" :class="{voided:record.status === 0}">
            <td class="index" :title="'Ref #'+record.trace.trans">{{record.index}}</td>
            <td>{{record.transType}}</td>
            <td>{{record.time | moment("HH:mm:ss")}}</td>
            <td>{{record.station}}</td>
            <td>{{$t('type.'+record.for)}}</td>
            <td v-if="record.for === 'Order'" class="ticket">
              <span class="type">{{$t('type.'+record.order.type)}}</span>
              <span class="number" v-show="record.order.number">(#{{record.order.number}})</span>
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
              <span class="print" @click="print(record)">{{$t('button.print')}}</span>
              <span class="refund" @click="askRefund(record)">{{$t('button.refund')}}</span>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>
              <div class="value">
                <span class="text">{{$t('text.subtotal')}}</span>
                <span class="amount">$ {{baseAmount | decimal}}</span>
              </div>
              <div class="value">
                <span class="text">{{$t('text.tip')}}</span>
                <span class="amount">$ {{totalTip | decimal}}</span>
              </div>
              <div class="value">
                <span class="text">{{$t('text.total')}}</span>
                <span class="amount">$ {{totalAmount | decimal}}</span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
      <footer>
        <button class="btn" @click="openAdjuster">{{$t('button.adjustTips')}}</button>
        <div class="f1">
          <paginator :of="filteredTransactions" :max="12" :contain="13" @page="setPage"></paginator>
        </div>
        <button class="btn" @click="exit">{{$t('button.exit')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData" @refresh="refetchData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import inputModule from "../component/inputer";
import dialogModule from "../common/dialog";
import dropdown from "./component/dropdown";
import paginator from "../common/paginator";
import processor from "../common/processor";
import adjuster from "./component/adjuster";
import batch from "./component/batch";

export default {
  props: ["init"],
  components: {
    dialogModule,
    inputModule,
    dropdown,
    paginator,
    processor,
    adjuster,
    batch
  },
  computed: {
    filteredTransactions() {
      let records = this.transactions;

      if (this.filterType)
        records = records.filter(
          t => t.order && t.order.type === this.filterType
        );

      if (this.filterCashier)
        records = records.filter(
          t => t.order && t.order.cashier === this.filterCashier
        );

      if (this.filterTerminal)
        records = records.filter(t => t.station === this.filterTerminal);

      return records;
    },
    records() {
      const min = this.page * 13;
      const max = min + 13;

      return this.filteredTransactions.slice(min, max);
    },
    baseAmount() {
      return this.filteredTransactions
        .filter(i => i.transType === "SALE" && !i.close)
        .reduce(
          (a, c) => a + parseFloat(c.amount.approve) - parseFloat(c.amount.tip),
          0
        );
    },
    totalTip() {
      return this.filteredTransactions
        .filter(i => i.transType === "SALE" && !i.close)
        .reduce((a, c) => a + parseFloat(c.amount.tip), 0);
    },
    totalAmount() {
      return this.filteredTransactions
        .filter(i => i.transType === "SALE" && !i.close)
        .reduce((a, c) => a + parseFloat(c.amount.approve), 0);
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
      portionDisplay: false,
      filterTerminal: null,
      filterCashier: null,
      filterType: null,
      terminals: [],
      cashiers: [],
      types: [],
      devices: [],
      terminal: null,
      date: today(),
      printTicket: true,
      page: 0
    };
  },
  created() {
    this.getConfig()
      .then(this.initial)
      .catch(this.initialFailed);

    this.$bus.on("filter", this.applyFilter);
  },
  beforeDestroy() {
    this.$bus.off("filter", this.applyFilter);
  },
  methods: {
    getConfig() {
      return new Promise((next, stop) => {
        this.$socket.emit("[TERMINAL] DEVICE", devices => {
          const reason = {
            type: "warning",
            title: "dialog.noTerminal",
            msg: "dialog.missTerminalConfig",
            timeout: { duration: 10000, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          this.devices = devices;
          devices.length === 0 ? stop(reason) : next();
        });
      });
    },
    refetchData() {
      this.$socket.emit("[TERMINAL] TODAY", data => this.initial(data));
    },
    initialFailed(content) {
      this.$dialog(content).then(() => this.init.resolve());
    },
    initial(data) {
      let transactions = data || this.init.transactions;
      const { name } = this.op;
      const allowViewAll = this.approval(this.op.view, "invoices");

      if (!allowViewAll) {
        transactions = transactions.filter(
          t => t.order && (t.order.cashier === name || t.order.server === name)
        );
      }

      this.transactions = transactions;
      this.portionDisplay = !allowViewAll;

      let terminals = new Set();
      let cashiers = new Set();
      let types = new Set();

      transactions.forEach(t => {
        terminals.add(t.station);

        if (t.order) {
          types.add(t.order.type);
          t.order.cashier && cashiers.add(t.order.cashier);
        }
      });

      this.terminals = Array.from(terminals).map(t => ({ text: t, value: t }));
      this.cashiers = Array.from(cashiers).map(t => ({ text: t, value: t }));
      this.types = Array.from(types).map(t => ({
        text: this.$t("type." + t),
        value: t
      }));
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
          return "fab fa-cc-visa";
        case "MasterCard":
        case "Master Card":
          return "fab fa-cc-mastercard";
        case "American Express":
        case "AmEx":
          return "fab fa-cc-amex";
        case "Discover":
          return "fab fa-cc-discover";
        default:
          return "fas fa-credit-card";
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
      Printer.printCreditCard(record, {}, true);
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
          this.$open("processor", { timeout: 30000 });
          this.initialParser(record.terminal)
            .then(this.executeVoidSale.bind(null, record))
            .catch(this.executeFailed);
        })
        .catch(this.exitComponent);
    },
    askRefund(record) {
      const amount = record.amount.approve;
      const order = record.order || {};
      const number = order.number || "";

      const prompt = {
        title: "terminal.refundConfirm",
        msg: ["terminal.refundAmount", amount],
        buttons: [
          { text: "button.partiallyRefund", fn: "reject" },
          { text: ["button.fullRefund", amount], fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => this.refund({ amount, order, number }))
        .catch(() => this.partiallyRefund({ order, number }));
    },
    partiallyRefund({ order, number }) {
      new Promise((resolve, reject) => {
        const config = {
          title: "title.refund",
          percentage: false,
          allowPercentage: false,
          amount: "0.00"
        };
        this.componentData = Object.assign({ resolve, reject }, config);
        this.component = "inputModule";
      })
        .then(({ amount }) => {
          this.exitComponent();
          this.refund({ amount, order, number });
        })
        .catch(this.exitComponent);
    },
    refund({ amount, order, number }) {
      this.$open("processor", { timeout: 60000 });
      this.initialParser(this.station.terminal).then(() => {
        this.terminal
          .refund(amount, number)
          .then(response => {
            let result = this.terminal.explainTransaction(response.data);

            Object.assign(result, {
              _id: ObjectId(),
              date: today(),
              for: "Refund",
              refund: result.amount.approve
            });

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
              this.exitComponent();

              Printer.printCreditCard(result, {});
            } else {
              const prompt = {
                title: ["terminal.error", result.code],
                msg: result.msg,
                buttons: [{ text: "button.confirm", fn: "resolve" }]
              };

              this.$dialog(prompt).then(this.exitComponent);
            }
          })
          .catch(() => {
            const prompt = {
              title: "terminal.terminalError",
              msg: "terminal.creditCard.aborted",
              buttons: [{ text: "button.confirm", fn: "resolve" }]
            };
            this.$dialog(prompt).then(this.exitComponent);
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
          this.printTicket && Printer.printCreditCard(voidSale, {});
          Object.assign(record, voidSale, { status: 0 });
          this.$socket.emit("[TERMINAL] VOID", record);
          this.$socket.emit("[TRANSACTION] FIND", record._id, payment => {
            console.log(payment);
            //this.$socket.emit("[PAYMENT] REMOVE", payment);
          });
          this.exitComponent();
        } else {
          const prompt = {
            type: "error",
            title: voidSale.msg,
            msg: ["terminal.error", voidSale.code],
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          this.$dialog(prompt).then(this.exitComponent);
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

      this.$dialog(prompt).then(this.exitComponent);
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
        .catch(this.exitComponent);
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
        .catch(this.exitComponent);
    },
    batch() {
      this.$open("batch", {
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
    sortBy(type) {
      switch (type) {
        case "ticket":
          this.transactions.sort((a, b) =>
            String(b.order ? b.order.number : -1).localeCompare(
              a.order ? a.order.number : -1,
              undefined,
              {
                numeric: true,
                sensitivity: "base"
              }
            )
          );
          break;
        case "id":
          this.transactions.sort((a, b) => a.index - b.index);
          break;
      }
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

td.card {
  text-align: left;
  padding: 10px 0 10px 8px;
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
  width: 120px;
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
  padding: 10px 25px;
  cursor: pointer;
}

.fa-eye-slash {
  color: #e6190a;
  margin-left: 10px;
}

th .fas {
  color: #fff;
  margin-left: 5px;
}
</style>