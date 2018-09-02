<template>
  <div class="popupMask center dark">
    <div class="wrap" v-show="!component">
      <header>
        <div>
          <h3>{{$t('title.paymentHistory')}}</h3>
          <h5>{{$t('tip.foundRecords',transactions.length)}}</h5>
        </div>
        <nav class="filter">
          <dropdown label="filter.cashier" :options="cashiers" filter="cashier"></dropdown>
          <dropdown label="filter.server" :options="servers" filter="server"></dropdown>
          <dropdown label="filter.order" :options="types" filter="type"></dropdown>
          <dropdown label="filter.payment" :options="payments" filter="payment"></dropdown>
        </nav>
      </header>
      <table>
        <thead>
          <tr class="banner">
            <th class="num">{{$t('thead.ticket')}}</th>
            <th class="type" @click="toggleType" v-if="!showTable">{{$t('thead.orderType')}}</th>
            <th class="type" @click="toggleType" v-else>{{$t('thead.table')}}</th>
            <th>{{$t('thead.time')}}</th>
            <th>{{$t('thead.cashier')}}</th>
            <th>{{$t('thead.server')}}</th>
            <th class="settlement">{{$t('thead.paymentType')}}</th>
            <th>{{$t('thead.tip')}}</th>
            <th @click="togglePaid" v-if="!showPaid">{{$t('thead.amount')}}</th>
            <th @click="togglePaid" v-else>{{$t('thead.paid')}}</th>
            <th class="split"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record,index) in records" :key="index">
            <template v-if="record.for === 'Order'">
              <td class="num">{{record.ticket.number}}</td>
              <td class="type" v-if="!showTable">{{$t('type.'+record.ticket.type)}}</td>
              <td class="type" v-else>{{record.ticket.table || $t('type.'+record.ticket.type)}}</td>
            </template>
            <template v-else>
              <td class="num"></td>
              <td class="type">({{$t('type.'+record.for)}})</td>
            </template>
            <td>{{record.time | moment("HH:mm:ss")}}</td>
            <td class="name">{{record.cashier}}</td>
            <td class="name">{{record.server}}</td>
            <td class="settlement">
              <span class="main">{{$t('type.'+record.type)}}</span>
              <span class="sub">{{record.subType}}</span>
            </td>
            <td class="amount adjustable" :class="{zero:record.tip === 0}" v-if="record.type ==='THIRD' && editable" @click="setTip(record)">$ {{record.tip | decimal}}</td>
            <td class="amount" :class="{zero:record.tip === 0}" v-else>$ {{record.tip | decimal}}</td>
            <td class="amount" v-if="!showPaid">$ {{record.actual | decimal}}</td>
            <td class="amount" v-else>$ {{record.paid | decimal}}</td>
            <td class="split" v-if="!isNaN(record.splitPayment)">#{{record.splitPayment + 1}}</td>
            <td class="split" v-else></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td class="num">{{totalCount}}</td>
            <td class="type"></td>
            <td></td>
            <td></td>
            <td></td>
            <td class="settlement"></td>
            <td class="amount">$ {{totalTip | decimal}}</td>
            <td class="amount" :class="{invisible:!totalViewable}">$ {{totalAmount | decimal}}</td>
            <td class="split"></td>
          </tr>
        </tfoot>
      </table>
      <footer>
        <div class="f1">
          <paginator :of="filteredTransactions" :maxPage="12" :perPage="13" @page="setPage"></paginator>
        </div>
        <div class="btn" @click="init.resolve">{{$t('button.exit')}}</div>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import inputModule from "../component/inputer";
import dropdown from "./component/dropdown";
import paginator from "../common/paginator";

export default {
  props: ["init"],
  components: { inputModule, paginator, dropdown },
  computed: {
    filteredTransactions() {
      let data = this.transactions;
      if (this.cashier) data = data.filter(t => t.cashier === this.cashier);
      if (this.server) data = data.filter(t => t.server === this.server);
      if (this.type)
        data = data.filter(t => t.ticket && t.ticket.type === this.type);
      if (this.payment)
        data = data.filter(t => this.payment === (t.subType || t.type));

      return data;
    },
    records() {
      let min = this.page * 13;
      let max = min + 13;

      return this.filteredTransactions.slice(min, max);
    },
    totalCount() {
      return this.filteredTransactions.length;
    },
    totalTip() {
      return this.filteredTransactions.reduce((a, c) => a + c.tip, 0);
    },
    totalAmount() {
      return this.filteredTransactions.reduce((a, c) => {
        const amount = isNumber(c.actual) ? parseFloat(c.actual) : 0;
        switch (c.for) {
          case "Order":
            return a + amount;
          case "Payout":
            return a - amount;
          default:
            return a + amount;
        }
      }, 0);
    },
    ...mapGetters(["op"])
  },
  data() {
    return {
      componentData: null,
      component: null,
      transactions: [],
      editable: false,
      reportable: false,
      totalViewable: false,
      cashiers: [],
      servers: [],
      payments: [],
      types: [],
      showPaid: false,
      showTable: false,
      cashier: null,
      server: null,
      payment: null,
      type: null,
      page: 0
    };
  },
  created() {
    this.checkPermission()
      .then(this.initialData)
      .catch(this.initialFailed);

    this.$bus.on("filter", this.applyFilter);
  },
  beforeDestroy() {
    this.$bus.off("filter", this.applyFilter);
  },
  methods: {
    checkPermission() {
      return new Promise(next => {
        this.editable = this.approval(this.op.modify, "tip");
        this.totalViewable = this.approval(this.op.view, "summary");
        this.reportable = true;
        next();
      });
    },
    initialData() {
      this.transactions = this.init.data;

      let cashiers = new Set();
      let servers = new Set();
      let payments = new Set();
      let types = new Set();

      this.transactions.forEach(transaction => {
        cashiers.add(transaction.cashier);
        transaction.server && servers.add(transaction.server);
        payments.add(transaction.subType || transaction.type);
        transaction.ticket && types.add(transaction.ticket.type);
      });

      this.cashiers = Array.from(cashiers).map(cashier => {
        return {
          text: cashier,
          value: cashier
        };
      });
      this.servers = Array.from(servers).map(server => {
        return {
          text: server,
          value: server
        };
      });
      this.payments = Array.from(payments).map(payment => {
        return {
          text: this.$t("type." + payment),
          value: payment
        };
      });
      this.types = Array.from(types).map(type => {
        return {
          text: this.$t("type." + type),
          value: type
        };
      });
    },
    applyFilter({ value, type }) {
      this[type] = value;
      this.page = 0;

      this.$nextTick(() => this.$bus.emit("applied"));
    },
    initialFailed() {},
    setTip(record) {
      new Promise((resolve, reject) => {
        const config = {
          title: "title.tip",
          type: "decimal",
          percentage: false,
          allowPercentage: false,
          amount: "0.00"
        };

        this.componentData = Object.assign({ resolve, reject }, config);
        this.component = "inputModule";
      })
        .then(({ amount }) => {
          const paid = record.actual + amount;
          Object.assign(record, { tip: amount, paid });
          this.$socket.emit("[TRANSACTION] ADJUST_TIP", record);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    setPage(number) {
      this.page = number;
    },
    togglePaid() {
      this.showPaid = !this.showPaid;
    },
    toggleType() {
      this.showTable = !this.showTable;
    }
  }
};
</script>

<style scoped>
.wrap {
  box-shadow: var(--shadow);
  background: #fff;
  width: 920px;
  border-radius: 4px 4px 0 0;
}

h5 {
  color: #666;
  font-weight: normal;
  margin-top: 4px;
}

nav.filter {
  flex: 1;
  position: relative;
  align-items: center;
  margin-left: 35px;
  display: flex;
  justify-content: flex-end;
}

table {
  border-spacing: 0;
  table-layout: auto;
  width: 100%;
}

.wrap header {
  display: flex;
  padding: 10px 20px;
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

.amount,
tfoot .num {
  font-family: "Agency FB";
  font-weight: bold;
}

.zero {
  color: #979797;
}

footer {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

tfoot tr {
  border-top: 1px solid #e0e0e0;
  padding: 5px 0;
  background: #eee;
  text-align: center;
}

.num {
  width: 70px;
}

.type {
  width: 100px;
}

.adjustable {
  cursor: pointer;
  color: #ff9800;
}

.settlement {
  width: 220px;
}

.sub {
  margin-left: 5px;
  color: gray;
}

.split {
  width: 35px;
  font-style: italic;
  text-align: left;
  color: #979797;
}

td.name {
  width: 99px;
  height: 19px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>