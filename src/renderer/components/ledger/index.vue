<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="editor">
      <header>
        <div>
          <h5>{{today}}</h5>
          <h3>{{$t('title.ledger')}}</h3>
        </div>
        <nav class="tabs">
          <div>
            <input type="radio" v-model="tab" value="overview" name="tab" id="overview">
            <label for="overview">{{$t('nav.overview')}}</label>
          </div>
          <div>
            <input type="radio" v-model="tab" value="department" name="tab" id="department">
            <label for="department">{{$t('nav.department')}}</label>
          </div>
          <div>
            <input type="radio" v-model="tab" value="transaction" name="tab" id="transaction">
            <label for="transaction">{{$t('text.income')}}</label>
          </div>
          <div>
            <input type="radio" v-model="tab" value="invoice" name="tab" id="invoice">
            <label for="invoice">{{$t('text.invoice')}}</label>
          </div>
        </nav>
      </header>
      <transition name="slide" mode="out-in">
        <template v-if="tab === 'overview'">
          <div class="wrap" :key="0">
            <div class="statistics">
              <div class="chart">
                <line-chart :chart-data="collection"></line-chart>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="tab === 'department'">
          <div class="wrap" :key="1">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>{{$t('type.WALK_IN')}}</th>
                  <th>{{$t('type.PICK_UP')}}</th>
                  <th>{{$t('type.DELIVERY')}}</th>
                  <th>{{$t('type.DINE_IN')}}</th>
                  <th>{{$t('type.HIBACHI')}}</th>
                  <th>{{$t('text.commission')}}</th>
                  <th>{{$t('text.subtotal')}}</th>
                  <th>{{$t('text.tax')}}</th>
                  <th>{{$t('text.total')}}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(department,index) in departments" :key="index">
                  <td>{{department[language]}}</td>
                  <td>{{department.WALK_IN.subtotal | decimal}}</td>
                  <td>{{department.PICK_UP.subtotal | decimal}}</td>
                  <td>{{department.DELIVERY.subtotal | decimal}}</td>
                  <td>{{department.DINE_IN.subtotal | decimal}}</td>
                  <td>{{department.HIBACHI.subtotal | decimal}}</td>
                  <td>{{department.commission | decimal}}</td>
                  <td>{{department.subtotal | decimal}}</td>
                  <td>{{department.tax | decimal}}</td>
                  <td>{{department.total | decimal}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <template v-else-if="tab === 'transaction'">
          <div class="wrap">
            <div class="vertical">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>{{$t('text.count')}}</th>
                    <th>{{$t('text.tip')}}</th>
                    <th>{{$t('text.amount')}}</th>
                    <th>{{$t('text.total')}}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(payment,index) in payments" :key="index">
                    <td>{{payment.type}}</td>
                    <td>{{payment.count}}</td>
                    <td>{{payment.tip | decimal}}</td>
                    <td>{{payment.amount | decimal}}</td>
                    <td>{{payment.total | decimal}}</td>
                  </tr>
                </tbody>
              </table>
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>{{$t('text.count')}}</th>
                    <th>{{$t('text.tip')}}</th>
                    <th>{{$t('text.amount')}}</th>
                    <th>{{$t('text.total')}}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(creditcard,index) in creditcards" :key="index">
                    <td>{{creditcard.type}}</td>
                    <td>{{creditcard.count}}</td>
                    <td>{{creditcard.tip | decimal}}</td>
                    <td>{{creditcard.amount | decimal}}</td>
                    <td>{{creditcard.total | decimal}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="vertical">
              <!-- <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>{{$t('text.count')}}</th>
                    <th>{{$t('text.tip')}}</th>
                    <th>{{$t('text.amount')}}</th>
                    <th>{{$t('text.total')}}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(creditcard,index) in creditcards" :key="index">
                    <td>{{creditcard.type}}</td>
                    <td>{{creditcard.count}}</td>
                    <td>{{creditcard.tip | decimal}}</td>
                    <td>{{creditcard.amount | decimal}}</td>
                    <td>{{creditcard.total | decimal}}</td>
                  </tr>
                </tbody>
              </table> -->
            </div>
          </div>
        </template>
        <template v-else>
          <div class="wrap" :key="2">

          </div>
        </template>
      </transition>
      <footer>
        <button class="btn" @click="init.resolve">{{$t('button.done')}}</button>
      </footer>
      <loader :display="loading"></loader>
    </div>
  </div>
</template>

<script>
import loader from "../common/loader";
import lineChart from "./component/lineChart";

export default {
  props: ["init"],
  components: { loader, lineChart },
  data() {
    return {
      language: this.$store.getters.language,
      tax: this.$store.getters.tax,
      today: today(),
      departments: [],
      creditcards: [],
      payments: [],
      dateRange: {
        from: +moment()
          .subtract(4, "hours")
          .set({ hour: 4, minute: 0, second: 0 }),
        to: +moment()
          .subtract(4, "hours")
          .set({ hour: 3, minute: 59, second: 59 })
          .add(1, "days")
      },
      summary: {},
      collection: [],
      loading: true,
      tab: "overview"
    };
  },
  created() {
    this.initialDepartment()
      .then(this.fetchData)
      .then(this.initialData)
      .catch(this.initialFailed);
  },
  methods: {
    initialDepartment() {
      const departments = this.$store.getters.config.hasOwnProperty(
        "departments"
      )
        ? JSON.parse(JSON.stringify(this.$store.getters.config.departments))
        : [];
      return new Promise(next => {
        this.departments = departments.map(department => {
          Object.assign(department, {
            WALK_IN: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            PICK_UP: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            DELIVERY: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            DINE_IN: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            BUFFET: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            HIBACHI: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            BAR: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            SALES: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            }
          });

          return department;
        });

        this.departments.push({
          zhCN: this.$t("type.other"),
          usEN: "Other",
          contain: [],

          WALK_IN: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          PICK_UP: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          DELIVERY: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          DINE_IN: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          BUFFET: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          HIBACHI: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          BAR: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          SALES: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          }
        });

        next();
      });
    },
    fetchData() {
      return new Promise(next => {
        this.$socket.emit("[REPORT] INITIAL_DATA", this.dateRange, data => {
          next(data);
        });
      });
    },
    initialData({ invoices, transactions }) {
      //console.log(invoices, transactions);
      this.departmentAnalysis(invoices);
      this.dataSummerize(invoices);
      this.transactionDetail(transactions);
      this.paymentDetail(transactions);
      this.hourlySalesAnalysis(invoices);

      this.loading = false;
    },
    initialFailed(e) {
      console.log(e);
    },
    dataSummerize(invoices) {
      let summary = {
        count: 0,
        subtotal: 0,
        tax: 0,
        total: 0
      };

      invoices.forEach(invoice => {
        if (invoice.status) {
          summary.count++;
          summary.subtotal += invoice.payment.subtotal;
          summary.tax += invoice.payment.tax;
          summary.total += invoice.payment.total;
        }
      });

      this.summary = summary;
    },
    departmentAnalysis(invoices) {
      const departments = this.departments.map(d => d.contain);
      const last = departments.length - 1;

      invoices.forEach(invoice => {
        const { type, status, content, taxFree = false } = invoice;
        if (status) {
          content.forEach(item => {
            const { category, choiceSet, qty, single, taxClass } = item;
            const Tax = this.tax.class[taxClass];

            const index = departments.findIndex(contain =>
              contain.includes(category)
            );

            let tax = 0;
            let subtotal = 0;
            let amount = toFixed(qty * single, 2);

            item.choiceSet.forEach(set => {
              const p = parseFloat(set.single);
              const s = set.qty || 1;
              const t = toFixed(p * s, 2);
              amount = toFixed(amount + t, 2);
            });

            subtotal = toFixed(subtotal + amount, 2);

            if (!taxFree && Tax.apply[type])
              tax += toFixed(Tax.rate / 100 * amount, 2);

            if (index !== -1) {
              let pointer = this.departments[index][type];
              pointer.count += qty;
              pointer.tax += tax;
              pointer.subtotal += subtotal;
              pointer.total += subtotal + tax;
            } else {
              let pointer = this.departments[last][type];
              pointer.count += qty;
              pointer.tax += tax;
              pointer.subtotal += subtotal;
              pointer.total += subtotal + tax;
            }
          });
        }
      });

      this.departments.forEach(department => {
        let subtotal = 0;
        let tax = 0;
        let total = 0;
        Object.keys(department).forEach(key => {
          if (department[key].hasOwnProperty("subtotal")) {
            subtotal += department[key].subtotal;
          }
          if (department[key].hasOwnProperty("tax")) {
            tax += department[key].tax;
          }
          if (department[key].hasOwnProperty("total")) {
            total += department[key].total;
          }
        });

        Object.assign(department, { subtotal, tax, total });
      });

      this.calculateCommission();

      this.departments.push({
        zhCN: this.$t("report.overallTotal"),
        usEN: "Overall",
        WALK_IN: {
          subtotal: this.departments.reduce((a, c) => a + c.WALK_IN.subtotal, 0)
        },
        PICK_UP: {
          subtotal: this.departments.reduce((a, c) => a + c.PICK_UP.subtotal, 0)
        },
        DELIVERY: {
          subtotal: this.departments.reduce(
            (a, c) => a + c.DELIVERY.subtotal,
            0
          )
        },
        DINE_IN: {
          subtotal: this.departments.reduce((a, c) => a + c.DINE_IN.subtotal, 0)
        },
        HIBACHI: {
          subtotal: this.departments.reduce((a, c) => a + c.HIBACHI.subtotal, 0)
        },
        subtotal: this.departments.reduce((a, c) => a + c.subtotal, 0),
        tax: this.departments.reduce((a, c) => a + c.tax, 0),
        total: this.departments.reduce((a, c) => a + c.total, 0)
      });
    },
    hourlySalesAnalysis(invoices) {
      let hours = {};

      invoices.forEach(invoice => {
        if (invoice.status === 1) {
          const hour = new Date(invoice.time).getHours();
          const { due } = invoice.payment;

          if (hours.hasOwnProperty(hour)) {
            hours[hour].value += due;
            hours[hour].count++;
          } else {
            hours[hour] = {
              count: 1,
              value: due
            };
          }
        }
      });

      let data = [];
      const labels = Object.keys(hours).map(
        hour => `${("0" + hour).slice(-2)}:00`
      );

      Object.keys(hours).forEach(hour =>
        data.push(toFixed(hours[hour].value, 2))
      );

      this.collection = {
        labels,
        datasets: [
          {
            backgroundColor: "rgba(255, 99, 132, 0.1)",
            borderColor: "rgb(255, 99, 132)",
            data,
            fill: "start",
            label: this.$t("report.hourlyReport"),
            cubicInterpolationMode: "monotone",
            borderWidth: 4,
            pointHoverRadius: 10,
            pointStyle: "none"
          }
        ]
      };
    },
    transactionDetail(transactions) {
      let creditcards = [];
      let types = new Set();

      transactions
        .filter(t => t.type === "CREDIT")
        .map(t => t.subType)
        .forEach(type => types.add(type));
      Array.from(types).forEach(type => {
        const _transaction = transactions
          .filter(t => t.type === "CREDIT")
          .filter(t => t.subType === type);
        const content = {
          type,
          count: _transaction.length,
          amount: _transaction.reduce((a, c) => a + c.actual, 0),
          tip: _transaction.reduce((a, c) => a + c.tip, 0),
          total: _transaction.reduce((a, c) => a + c.actual + c.tip, 0)
        };
        creditcards.push(content);
      });

      const total = {
        type: this.$t("text.total"),
        count: creditcards.reduce((a, c) => a + c.count, 0),
        amount: creditcards.reduce((a, c) => a + c.amount, 0),
        tip: creditcards.reduce((a, c) => a + c.tip, 0),
        total: creditcards.reduce((a, c) => a + c.total, 0)
      };

      creditcards.push(total);
      this.creditcards = creditcards;
    },
    paymentDetail(transactions) {
      let payments = [];
      let types = new Set();

      transactions
        .filter(t => t.for === "Order")
        .map(t => t.type)
        .forEach(type => types.add(type));
      Array.from(types).forEach(type => {
        const _transaction = transactions.filter(t => t.type === type);
        const content = {
          type: this.$t("type." + type),
          count: _transaction.length,
          amount: _transaction.reduce((a, c) => a + c.actual, 0),
          tip: _transaction.reduce((a, c) => a + c.tip, 0),
          total: _transaction.reduce((a, c) => a + c.actual + c.tip, 0)
        };
        payments.push(content);
      });
      const total = {
        type: this.$t("text.total"),
        count: payments.reduce((a, c) => a + c.count, 0),
        amount: payments.reduce((a, c) => a + c.amount, 0),
        tip: payments.reduce((a, c) => a + c.tip, 0),
        total: payments.reduce((a, c) => a + c.total, 0)
      };
      payments.push(total);
      this.payments = payments;
    },
    calculateCommission() {
      const departments = this.$store.getters.config.hasOwnProperty(
        "departments"
      )
        ? JSON.parse(JSON.stringify(this.$store.getters.config.departments))
        : [];

      departments.forEach(dep => {
        if (isNumber(dep.commission)) {
          const index = this.departments.findIndex(
            each => each.usEN === dep.usEN && each.zhCN === dep.zhCN
          );

          if (index !== -1) {
            this.departments[index].commission =
              this.departments[index].subtotal * dep.commission / 100;
          }
        }
      });
    },
    confirm() {}
  }
};
</script>

<style scoped>
.editor {
  width: 900px;
  overflow: hidden;
  position: relative;
}

header {
  flex-direction: row;
  justify-content: flex-start;
}
.wrap {
  min-height: 410px;
}

table {
  box-shadow: var(--shadow);
  border-radius: 4px;
  overflow: hidden;
}

tr td {
  text-align: center;
  padding: 10px 0;
}

tr th {
  border-bottom: 1px solid #eceff1;
  padding: 5px 0;
  color: rgba(0, 0, 0, 0.75);
}

.vertical table {
  width: calc(50% - 5px);
  margin: 10px 0 0;
}

.vertical {
  display: flex;
}

.vertical table:first-child {
  margin-right: 10px;
}
</style>