<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="editor" v-show="!component">
      <header>
        <div>
          <h5>{{reportRange.from | moment('YYYY-MM-DD HH:mm')}} ~ {{reportRange.to | moment('YYYY-MM-DD HH:mm')}}</h5>
          <h3>{{$t('title.report')}}</h3>
        </div>
      </header>
      <div class="banner"></div>
      <div class="inner">
        <section class="option">
          <div class="for">
            <span>{{$t('report.range')}}</span>
          </div>
          <div class="rangeWrap">
            <div>
              <input type="radio" name="range" v-model="range" value="today" id="today" @click="getRange('today')">
              <label for="today">{{$t('report.today')}}</label>
            </div>
            <div>
              <input type="radio" name="range" v-model="range" value="week" id="week" @click="getRange('week')">
              <label for="week">{{$t('report.currentWeek')}}</label>
            </div>
            <div>
              <input type="radio" name="range" v-model="range" value="month" id="month" @click="getRange('month')">
              <label for="month">{{$t('report.currentMonth')}}</label>
            </div>
            <div>
              <input type="radio" name="range" v-model="range" value="last" id="last" @click="getRange('last')">
              <label for="last">{{$t('report.lastMonth')}}</label>
            </div>
            <div>
              <input type="radio" name="range" v-model="range" value="custom" id="custom" @click="openCalendar">
              <label for="custom">{{$t('report.custom')}}</label>
            </div>
          </div>
        </section>
        <section class="option">
          <div class="for">
            <span>{{$t('report.details')}}</span>
          </div>
          <div class="detailWrap">
            <div class="left">
              <h1>{{$t('report.configuration')}}</h1>
              <radiobox v-model="reportDetail" name="detail" val="simple" label="report.simple"></radiobox>
              <radiobox v-model="reportDetail" name="detail" val="customize" label="report.customize"></radiobox>
              <transition-group name="fadeDown" tag="div" class="options">
                <template v-if="reportDetail === 'customize'">
                  <checkbox v-model="detailPayment" title="report.detailPayment" :key="1"></checkbox>
                  <checkbox v-model="itemSales" title="report.itemSales" :key="2"></checkbox>
                  <checkbox v-model="categorySales" title="report.categorySales" :key="3"></checkbox>
                  <!-- <checkbox v-model="departmentSales" title="report.departmentSales" :key="4" :disabled="departments.length === 0"></checkbox> -->
                  <checkbox v-model="hourly" title="report.hourlyReport" :key="5"></checkbox>
                  <checkbox v-model="managerWaive" title="report.redemptionReport" :key="6"></checkbox>
                  <checkbox v-model="voidedTicket" title="report.voidedReport" :key="7"></checkbox>
                </template>
              </transition-group>
            </div>
            <div class="right">
              <h1>{{$t('report.performance')}}</h1>
              <checkbox v-model="cashier" title="report.cashierLiability"></checkbox>
              <checkbox v-model="waitStaff" title="report.staffLiability"></checkbox>
              <checkbox v-model="driver" title="report.driverLiability"></checkbox>
              <checkbox v-model="thirdParty" title="report.thirdPartySummary"></checkbox>
            </div>
          </div>
        </section>
      </div>
      <footer>
        <div class="opt">
          <checkbox v-model="daily" title="report.dailyReport" v-show="range !== 'today'"></checkbox>
        </div>
        <button class="btn" @click="init.reject">{{$t('button.back')}}</button>
        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import calendar from "./calendar";
import processor from "../common/processor";
import radiobox from "../setting/common/radio";
import checkbox from "../setting/common/checkbox";
export default {
  props: ["init"],
  components: { checkbox, radiobox, calendar, processor },
  computed: {
    ...mapGetters(["language", "departments"])
  },
  data() {
    return {
      reportDetail: "simple",
      componentData: null,
      component: null,
      detailPayment: false,
      cashier: false,
      waitStaff: false,
      driver: false,
      thirdParty: false,
      range: "today",
      report: {},
      daily: false,
      hourly: false,
      itemSales: false,
      categorySales: false,
      departmentSales: false,
      managerWaive: false,
      voidedTicket: false
    };
  },
  created() {
    this.getRange(this.range);
    this.getPreferences();
  },
  beforeDestroy() {
    this.savePreferences();
  },
  methods: {
    getPreferences() {
      const saved = localStorage.getItem("reportPreferences");

      if (saved) {
        const preferences = JSON.parse(saved);

        Object.keys(preferences).forEach(key => {
          this[key] = preferences[key];
        });
      }
    },
    savePreferences() {
      const preferences = {
        reportDetail: this.reportDetail,
        detailPayment: this.detailPayment,
        cashier: this.cashier,
        waitStaff: this.waitStaff,
        driver: this.driver,
        thirdParty: this.thirdParty,
        daily: this.daily,
        hourly: this.hourly,
        itemSales: this.itemSales,
        categorySales: this.categorySales,
        managerWaive: this.managerWaive,
        voidedTicket: this.voidedTicket
      };
      localStorage.setItem("reportPreferences", JSON.stringify(preferences));
    },
    getRange(type) {
      let from, to;
      switch (type) {
        case "today":
          from = +moment()
            .subtract(4, "hours")
            .hours(4)
            .minutes(0)
            .seconds(0)
            .milliseconds(0);
          to = +moment()
            .subtract(4, "hours")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .add(1, "days");
          break;
        case "week":
          from = +moment()
            .subtract(4, "hours")
            .startOf("week")
            .hours(4);
          to = +moment()
            .subtract(4, "hours")
            .endOf("week")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
        case "month":
          from = +moment()
            .subtract(4, "hours")
            .startOf("month")
            .hours(4);
          to = +moment()
            .subtract(4, "hours")
            .endOf("month")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
        case "last":
          from = +moment()
            .subtract(4, "hours")
            .subtract(1, "months")
            .startOf("month")
            .hours(4);
          to = +moment()
            .subtract(4, "hours")
            .subtract(1, "months")
            .endOf("month")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
      }
      this.reportRange = { from, to };
    },
    openCalendar() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "calendar";
      })
        .then(date => {
          this.reportRange = date;
          this.$q();
        })
        .catch(() => {
          this.range = "today";
          this.getRange("today");
          this.$q();
        });
    },
    confirm() {
      this.$p("processor", { timeout: 300000 });
      this.daily
        ? this.printDailyReport()
        : this.fetchData()
            .then(this.dataAnalysis.bind(null, this.reportRange))
            .then(this.printReport.bind(null, true))
            .catch(this.reportError);
    },
    printDailyReport() {
      let { from, to } = this.reportRange;
      let loop = moment(to).diff(moment(from), "days") + 1;
      this.looper(from, loop);
    },
    looper(from, loop) {
      from = moment(from)
        .subtract(4, "hours")
        .hours(4)
        .minutes(0)
        .milliseconds(0)
        .subtract(1, "days");
      for (let i = 0; i < loop; i++) {
        from = from.clone().add(1, "days");
        let to = from
          .clone()
          .subtract(4, "hours")
          .hours(3)
          .minutes(59)
          .milliseconds(0)
          .add(1, "days");
        this.reportRange = { from: +from, to: +to };
        this.fetchData()
          .then(this.dataAnalysis.bind(null, this.reportRange))
          .then(this.printReport)
          .catch(this.reportError);
      }
      this.init.resolve();
    },
    fetchData() {
      return new Promise(next => {
        this.$socket.emit("[REPORT] INITIAL_DATA", this.reportRange, data => {
          next(data);
        });
      });
    },
    dataAnalysis(range, data) {
      return new Promise(next => {
        let { invoices, transactions } = data;

        if (transactions.length === 0)
          transactions = this.getTransactionsFromInvoices(invoices);

        this.report["General Report"] = this.salesAnalysis(range, data);
        if (this.hourly)
          this.report["Hourly Report"] = this.hourlySalesReport(invoices);
        if (this.managerWaive)
          this.report["Manager Waived Report"] = this.managerWaiveReport(
            invoices
          );
        if (this.itemSales)
          this.report["Item Sales"] = this.itemSalesReport(invoices);
        if (this.categorySales)
          this.report["Category Sales"] = this.categorySalesReport(invoices);

        if (this.departmentSales)
          this.report["Department Sales"] = this.departmentSalesReport(
            invoices
          );

        if (this.voidedTicket)
          this.report["Voided Tickets"] = this.voidedTicketReport(invoices);
        if (this.cashier)
          this.report["Cashier Report"] = this.cashierReport(data);
        if (this.waitStaff)
          this.report["Waitstaff Report"] = this.waitStaffReport(transactions);
        if (this.thirdParty)
          this.report["Third Party Report"] = this.thirdPartyReport(invoices);

        if (this.driver) this.report["Driver Report"] = this.driverReport(data);
        next();
      });
    },
    salesAnalysis(range, { invoices, transactions, giftcards }) {
      let report = [];

      const validInvoices = invoices.filter(invoice => invoice.status === 1);
      const sum = (a, b) => a + b;

      if (this.range === "today") {
        report.push({
          text: this.$t("report.date"),
          style: "bold space",
          value: today()
        });
      } else {
        report.push({
          text: this.$t("report.fromDate"),
          style: "bold",
          value: moment(range.from).format("YYYY-MM-DD HH:mm")
        });

        report.push({
          text: this.$t("report.toDate"),
          style: "bold space",
          value: moment(range.to).format("YYYY-MM-DD HH:mm")
        });
      }

      const foodSales = validInvoices.reduce(
        (a, c) => a + parseFloat(c.payment.subtotal),
        0
      );

      report.push({
        text: this.$t("report.itemSales"),
        style: "",
        value: foodSales.toFixed(2)
      });

      let discountedItem = [];

      validInvoices.forEach(invoice => {
        invoice.content.forEach(item => {
          item.choiceSet
            .filter(set => set.type === "discount")
            .forEach(set => discountedItem.push(set));
        });
      });

      discountedItem.length > 0 &&
        report.push({
          text:
            this.$t("report.itemDiscount") + ` ( ${discountedItem.length} )`,
          style: "indent",
          value: `( $ ${discountedItem
            .reduce((a, c) => a + Math.abs(c.price), 0)
            .toFixed(2)} )`
        });

      const tax = validInvoices.reduce(
        (a, c) => a + parseFloat(c.payment.tax),
        0
      );

      report.push({
        text: this.$t("report.tax"),
        style: "",
        value: tax.toFixed(2)
      });

      const discount = validInvoices.reduce(
        (a, c) => a + parseFloat(c.payment.discount),
        0
      );

      discount &&
        report.push({
          text: this.$t("report.discount"),
          style: "",
          value: "- " + discount.toFixed(2)
        });

      const salesTotal = foodSales + tax - discount;

      report.push({
        text: this.$t("report.salesTotal"),
        style: "space bold total",
        value: salesTotal.toFixed(2)
      });

      if (this.reportDetail === "simple") return report;
      //--------- End of Sales Total ---------

      const deliveryFee = validInvoices.reduce(
        (a, c) => a + c.payment.delivery,
        0
      );

      report.push({
        text: this.$t("report.deliveryFee"),
        style: "",
        value: `${deliveryFee.toFixed(2)}`
      });

      const gratuity = validInvoices.reduce(
        (a, c) => a + c.payment.gratuity,
        0
      );

      report.push({
        text: this.$t("report.gratuity"),
        style: "space",
        value: `${gratuity.toFixed(2)}`
      });

      const rounding = validInvoices.reduce(
        (a, c) => a + (c.payment.rounding || 0),
        0
      );

      rounding &&
        report.push({
          text: this.$t("report.rounding"),
          style: "space",
          value: `${rounding.toFixed(2)}`
        });

      const activation = giftcards
        .filter(t => t.type === "Activation")
        .reduce((a, c) => a + c.change, 0);

      activation &&
        report.push({
          text:
            this.$t("report.giftcard.activation") +
            ` ( ${giftcards.filter(t => t.type === "Activation").length} )`,
          style: "",
          value: `${activation.toFixed(2)}`
        });

      const reload = giftcards
        .filter(t => t.type === "Reload")
        .reduce((a, c) => a + c.change, 0);

      reload &&
        report.push({
          text:
            this.$t("report.giftcard.reload") +
            ` ( ${giftcards.filter(t => t.type === "Reload").length} )`,
          style: "",
          value: `${reload.toFixed(2)}`
        });

      const bonus = giftcards
        .filter(t => t.type === "Bonus")
        .reduce((a, c) => a + c.change, 0);

      bonus &&
        report.push({
          text:
            this.$t("report.giftcard.bonus") +
            ` ( ${giftcards.filter(t => t.type === "Bonus").length} )`,
          style: "",
          value: `( ${bonus.toFixed(2)} )`
        });

      const overallTotal = (
        salesTotal +
        deliveryFee +
        gratuity +
        rounding +
        activation +
        reload
      ).toFixed(2);

      report.push({
        text: this.$t("report.overallTotal"),
        style: "space total bold",
        value: `$ ${overallTotal}`
      });

      //-----End of overall total -----

      const orderPayments = transactions.filter(t => t.for === "Order");

      const cashTotal = orderPayments
        .filter(t => t.type === "CASH")
        .reduce((a, c) => a + c.actual, 0);

      report.push({
        text: this.$t("report.cashTotal"),
        style: "",
        value: cashTotal.toFixed(2)
      });

      const creditTransactions = orderPayments.filter(t => t.type === "CREDIT");
      const creditTotal = creditTransactions.reduce((a, c) => a + c.actual, 0);

      if (this.detailPayment) {
        let creditType = new Set();
        creditTransactions.map(t => t.subType).forEach(t => creditType.add(t));

        report.push({
          text:
            this.$t("report.creditTotal") + ` ( ${creditTransactions.length} )`,
          style: this.creditTotal > 0 ? "bold" : "",
          value: creditTotal.toFixed(2)
        });

        Array.from(creditType).forEach(type => {
          const tmp = creditTransactions.filter(t => t.subType === type);
          const total = tmp.reduce((a, c) => a + c.actual, 0);

          report.push({
            text: type + ` ( ${tmp.length} )`,
            style: "indent",
            value: `( ${total.toFixed(2)} )`
          });
        });

        report.push({
          text: "",
          style: "space",
          value: ""
        });
      } else {
        creditTotal &&
          report.push({
            text: this.$t("report.creditTotal"),
            style: "",
            value: creditTotal.toFixed(2)
          });
      }

      const thirdPartyTransactions = orderPayments.filter(
        t => t.type === "THIRD"
      );
      const thirdPartyTotal = thirdPartyTransactions.reduce(
        (a, c) => a + c.actual,
        0
      );

      if (this.detailPayment) {
        let thirdType = new Set();
        thirdPartyTransactions
          .map(t => t.subType)
          .forEach(t => thirdType.add(t));

        report.push({
          text: this.$t("report.thirdPartyTotal"),
          style: this.thirdPartyTotal > 0 ? "bold" : "",
          value: thirdPartyTotal.toFixed(2)
        });

        Array.from(thirdType).forEach(type => {
          const total = thirdPartyTransactions
            .filter(t => t.subType === type)
            .reduce((a, c) => a + c.actual, 0);

          total &&
            report.push({
              text: type,
              style: "indent",
              value: `( ${total.toFixed(2)} )`
            });
        });

        report.push({
          text: "",
          style: "space",
          value: ""
        });
      } else {
        thirdPartyTotal &&
          report.push({
            text: this.$t("report.thirdPartyTotal"),
            style: "space",
            value: thirdPartyTotal.toFixed(2)
          });
      }

      const giftcardSales = activation + reload;
      giftcardSales &&
        report.push({
          text: this.$t("report.giftcard.purchase"),
          style: "",
          value: giftcardSales.toFixed(2)
        });

      const giftcardSpends = giftcards
        .filter(t => t.type === "Purchase")
        .reduce((a, c) => a + c.change, 0);
      giftcardSpends &&
        report.push({
          text:
            this.$t("report.giftcard.spends") +
            `( ${giftcards.filter(t => t.type === "Purchase").length} )`,
          style: "space",
          value: Math.abs(giftcardSpends).toFixed(2)
        });

      const settledTotal = orderPayments.reduce((a, c) => a + c.actual, 0);
      const allSettledTotal = settledTotal + giftcardSales;

      report.push({
        text: this.$t("report.settled"),
        style: "",
        value: allSettledTotal.toFixed(2)
      });

      const unsettled = validInvoices.filter(invoice => !invoice.settled);
      const refunds = transactions.filter(t => t.for === "Refund");

      report.push({
        text: this.$t("report.unsettled") + ` ( ${unsettled.length} )`,
        style: refunds.length > 0 ? "space" : "space breakline",
        value: unsettled.reduce((a, c) => a + c.payment.due, 0).toFixed(2)
      });

      refunds.length > 0 &&
        report.push({
          text: this.$t("report.refund") + ` ( ${refunds.length} )`,
          style: "space breakline bold",
          value: refunds.reduce((a, c) => a + c.actual, 0).toFixed(2)
        });

      const tipTotal = orderPayments.reduce((a, c) => a + c.tip, 0);

      if (this.detailPayment) {
        let tipFrom = new Set();
        let tipTrans = orderPayments.filter(t => t.tip > 0);
        tipTrans.forEach(t => tipFrom.add(t.subType || t.type));

        if (tipTotal === 0) {
          report.push({
            text: this.$t("report.tips"),
            style: "space",
            value: "0.00"
          });
        } else {
          report.push({
            text: this.$t("report.tipsTotal"),
            style: "bold",
            value: "$ " + tipTotal.toFixed(2)
          });

          Array.from(tipFrom).forEach(type => {
            const total = tipTrans
              .filter(t => (t.subType ? t.subType === type : t.type === type))
              .reduce((a, c) => a + c.tip, 0);

            report.push({
              text: this.$t("report.from", type),
              style: "indent",
              value: `( ${total.toFixed(2)} )`
            });
          });

          report.push({
            text: "",
            style: "space",
            value: ""
          });
        }
      } else {
        report.push({
          text: this.$t("report.tipTotal"),
          style: "space",
          value: tipTotal.toFixed(2)
        });
      }

      return report;
    },
    hourlySalesReport(invoices) {
      let hours = {};

      invoices.forEach(invoice => {
        if (invoice.status === 1) {
          let hour = new Date(invoice.time).getHours();
          let { due } = invoice.payment;
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

      let report = [];

      Object.keys(hours).forEach(hour => {
        report.push({
          text: `${hour}:00 (${hours[hour].count})`,
          style: "",
          value: hours[hour].value.toFixed(2)
        });
      });

      return report;
    },
    managerWaiveReport(invoices) {
      let records = {};

      invoices.forEach(invoice => {
        if (
          invoice.status === 0 &&
          invoice.void.note === "Manager Redemption"
        ) {
          let { total } = invoice.payment;
          if (records.hasOwnProperty(invoice.void.by)) {
            records[invoice.void.by].count++;
            records[invoice.void.by].value += total;
          } else {
            records[invoice.void.by] = {
              count: 1,
              value: total
            };
          }
        }
      });

      let report = [];

      Object.keys(records).forEach(manager => {
        report.push({
          text: manager + ` ( ${records[manager].count} )`,
          style: "",
          value: records[manager].value.toFixed(2)
        });
      });

      return report;
    },
    itemSalesReport(invoices) {
      let records = {};
      invoices.forEach(ticket => {
        ticket.content.forEach(item => {
          if (records.hasOwnProperty(item.usEN)) {
            records[item.usEN].count += item.qty;
            records[item.usEN].value += item.single * item.qty;
          } else {
            records[item.usEN] = {
              text: item[this.language],
              count: item.qty,
              value: item.single * item.qty
            };
          }
        });
      });

      let report = [];
      Object.values(records)
        .filter(item => item.value > 0)
        .sort((a, b) => (a.count > b.count ? -1 : 1))
        .forEach(item => {
          report.push({
            text: `( ${item.count} ) ` + item.text,
            style: "",
            value: item.value.toFixed(2)
          });
        });

      return report;
    },
    categorySalesReport(invoices) {
      let records = {};
      invoices.forEach(ticket => {
        ticket.content.forEach(item => {
          if (!records.hasOwnProperty(item.category)) {
            records[item.category] = {
              text:
                this.language === "zhCN"
                  ? item.categoryCN || item.category
                  : item.category,
              count: 1,
              value: item.single * item.qty
            };
          } else {
            records[item.category].count += item.qty;
            records[item.category].value += toFixed(item.single * item.qty, 2);
          }
        });
      });

      let report = [];

      Object.values(records)
        .filter(category => category.value > 0)
        .sort((a, b) => (a.count > b.count ? -1 : 1))
        .forEach(category => {
          report.push({
            text: `( ${category.count} ) ` + category.text,
            style: "",
            value: category.value.toFixed(2)
          });
        });

      return report;
    },
    departmentSalesReport() {},
    voidedTicketReport(data) {
      let report = [];
      const invoices = data.filter(i => i.status === 0);

      invoices.forEach(invoice => {
        const text = `#${invoice.number}&nbsp;&nbsp;&nbsp;${this.$t(
          "type." + invoice.type
        )}&nbsp;&nbsp;&nbsp;$ ${invoice.payment.balance.toFixed(
          2
        )}&nbsp;&nbsp;&nbsp;${this.$t("reason." + invoice.void.note)}`;
        const style = "";
        const value = invoice.void.by;
        report.push({ text, style, value });
      });

      report.push({
        text: this.$t("report.voided") + ` ( ${invoices.length} )`,
        style: "bold",
        value:
          "$ " + invoices.reduce((a, c) => a + c.payment.balance, 0).toFixed(2)
      });

      return report;
    },
    cashierReport({ invoices, transactions }) {
      let cashiers = new Set();

      invoices
        .filter(i => i.status === 1 && i.cashier)
        .forEach(invoice => cashiers.add(invoice.cashier));

      let report = [];

      Array.from(cashiers).forEach(cashier => {
        const handledInvoice = invoices.filter(
          i => i.status === 1 && i.cashier === cashier
        );
        const handledTrans = transactions.filter(t => t.cashier === cashier);

        report.push({
          text: this.$t("report.cashier"),
          style: "bold",
          value: cashier
        });

        report.push({
          text: this.$t("report.tips"),
          style: "",
          value: handledTrans.reduce((a, c) => a + c.tip, 0).toFixed(2)
        });

        report.push({
          text: this.$t("report.handleInvoice"),
          style: "",
          value: handledInvoice.length
        });

        report.push({
          text: this.$t("report.expectTotal"),
          style: "",
          value: handledInvoice
            .reduce((a, c) => a + (c.payment.subtotal + c.payment.tax), 0)
            .toFixed(2)
        });

        let types = new Set();
        let actualAmount = 0;
        handledTrans.filter(t => t !== "CASH").forEach(t => {
          types.add(t.subType || t.type);
        });

        Array.from(types).forEach(type => {
          const amount = handledTrans
            .filter(
              t => t.subType === type || (t.type === type && t.for === "Order")
            )
            .map(t => t.actual)
            .reduce((a, b) => a + b, 0);

          actualAmount += amount;

          report.push({
            text: type,
            style: "indent",
            value: `( ${amount.toFixed(2)} )`
          });
        });

        report.push({
          text: this.$t("report.actualTotal"),
          style: "bold total",
          value: "$ " + actualAmount.toFixed(2)
        });

        const payoutAmount = handledTrans
          .filter(t => t.for === "Payout")
          .reduce((a, c) => a + c.actual, 0);

        payoutAmount > 0 &&
          report.push({
            text: this.$t("report.payout"),
            style: "",
            value: "- " + payoutAmount.toFixed(2)
          });

        const grandTotal = actualAmount - payoutAmount;

        grandTotal !== actualAmount &&
          report.push({
            text: this.$t("report.total"),
            style: "space total",
            value: "$ " + grandTotal.toFixed(2)
          });
      });
      return report;
    },
    waitStaffReport(transactions) {
      let waitStaffs = new Set();
      let report = [];
      transactions.map(t => t.server).forEach(name => waitStaffs.add(name));

      Array.from(waitStaffs).forEach(name => {
        let invoices = transactions.filter(t => t.server === name);

        report.push({
          text: this.$t("report.waitStaff"),
          style: "bold",
          value: name
        });

        report.push({
          text: this.$t("report.settled"),
          style: "space",
          value: invoices
            .map(t => t.actual)
            .reduce((a, b) => a + b, 0)
            .toFixed(2)
        });

        report.push({
          text: this.$t("report.cashTotal"),
          style: "bold",
          value:
            "$ " +
            invoices
              .filter(t => t.type === "CASH")
              .map(t => t.actual)
              .reduce((a, b) => a + b, 0)
              .toFixed(2)
        });

        report.push({
          text: this.$t("report.creditTotal"),
          style: "",
          value: invoices
            .filter(t => t.type === "CREDIT")
            .map(t => t.actual)
            .reduce((a, b) => a + b, 0)
            .toFixed(2)
        });

        let creditType = new Set();

        invoices
          .filter(t => t.type === "CREDIT")
          .map(t => t.subType)
          .forEach(type => creditType.add(type));

        Array.from(creditType).forEach(type => {
          let tmp = invoices.filter(t => t.subType === type);
          let amount = tmp.map(t => t.actual).reduce((a, b) => a + b, 0);

          report.push({
            text: type,
            style: "indent",
            value: `( ${amount.toFixed(2)} )`
          });
        });

        report.push({
          text: this.$t("report.thirdPartyTotal"),
          style: "",
          value: invoices
            .filter(t => t.type === "THIRD")
            .map(t => t.actual)
            .reduce((a, b) => a + b, 0)
            .toFixed(2)
        });

        let thirdType = new Set();

        invoices
          .filter(t => t.type === "THIRD")
          .map(t => t.subType)
          .forEach(type => thirdType.add(type));

        Array.from(thirdType).forEach(type => {
          let tmp = invoices.filter(t => t.subType === type);
          let amount = tmp.map(t => t.actual).reduce((a, b) => a + b, 0);

          report.push({
            text: type,
            style: "indent",
            value: `( ${amount.toFixed(2)} )`
          });
        });

        report.push({
          text: this.$t("report.tips"),
          style: "bold",
          value:
            "$ " +
            invoices
              .map(t => t.tip)
              .reduce((a, b) => a + b, 0)
              .toFixed(2)
        });

        report.push({
          text: "",
          style: "space",
          value: ""
        });
      });
      return report;
    },
    driverReport(data) {
      let { invoices, transactions } = data;
      let drivers = new Set();
      let deliveries = invoices.filter(
        invoice => invoice.type === "DELIVERY" && invoice.status === 1
      );

      deliveries.forEach(invoice => {
        invoice.driver && drivers.add(invoice.driver);
      });

      let report = [];

      drivers.forEach(driver => {
        let order = deliveries.filter(invoice => invoice.driver === driver);
        let tips = order.map(i => i.payment.tip).reduce((a, b) => a + b, 0);
        let count = order.length;
        let fees = order
          .map(i => i.payment.delivery)
          .reduce((a, b) => a + b, 0);

        let settledInvoice = order.filter(i => i.settled);

        let settled = settledInvoice
          .map(i => i.payment.due)
          .reduce((a, b) => a + b, 0);

        let unsettledInvoice = order.filter(i => !i.settled && i.status === 1);
        let unsettled = unsettledInvoice
          .map(i => i.payment.due)
          .reduce((a, b) => a + b, 0);

        report.push({
          text: this.$t("report.driver"),
          style: "bold",
          value: "# " + driver
        });

        report.push({
          text: this.$t("report.count"),
          style: "total",
          value: count
        });

        report.push({
          text: this.$t("report.deliveryFee"),
          style: "",
          value: fees.toFixed(2)
        });

        report.push({
          text: this.$t("text.tip"),
          style: "",
          value: tips.toFixed(2)
        });

        report.push({
          text: this.$t("report.settled") + ` ( ${settledInvoice.length} )`,
          style: "",
          value: settled.toFixed(2)
        });

        report.push({
          text: this.$t("report.unsettled") + ` ( ${unsettledInvoice.length} )`,
          style: "bold space",
          value: unsettled.toFixed(2)
        });

        const accountsPayable = fees + tips;

        report.push({
          text: this.$t("report.accountsPayable"),
          style: "space",
          value: "- " + accountsPayable.toFixed(2)
        });

        report.push({
          text: this.$t("report.expectTotal"),
          style: "total bold",
          value: "$ " + (unsettled - accountsPayable).toFixed(2)
        });
      });

      return report;
    },
    thirdPartyReport(invoices) {
      const validInvoices = invoices.filter(
        i => i.source !== "POS" && i.status === 1
      );
      let providers = {};
      validInvoices.forEach(invoice => {
        let provider = invoice.source;
        let { subtotal, tax, tip, delivery, discount, due } = invoice.payment;

        if (providers.hasOwnProperty(provider)) {
          providers[provider].count++;
          providers[provider].subtotal += subtotal;
          providers[provider].tax += tax;
          providers[provider].tip += tip;
          providers[provider].delivery += delivery;
          providers[provider].discount += discount;
          providers[provider].total += due;
        } else {
          providers[provider] = {
            count: 1,
            subtotal,
            tax,
            tip,
            delivery,
            discount,
            total: due
          };
        }
      });

      let report = [];
      Object.keys(providers).forEach(provider => {
        const data = providers[provider];
        report.push({
          text: this.$t("report.provider") + ` ( ${data.count} )`,
          style: "bold",
          value: provider
        });

        report.push({
          text: this.$t("report.subtotal"),
          style: "",
          value: data.subtotal.toFixed(2)
        });

        report.push({
          text: this.$t("report.deliveryFee"),
          style: "",
          value: data.delivery.toFixed(2)
        });

        report.push({
          text: this.$t("report.tax"),
          style: "",
          value: data.tax.toFixed(2)
        });

        report.push({
          text: this.$t("report.tips"),
          style: "",
          value: data.tip.toFixed(2)
        });

        report.push({
          text: this.$t("report.total"),
          style: "total bold space",
          value: "$" + (data.total + data.tip).toFixed(2)
        });
      });
      return report;
    },
    printReport(close) {
      Printer.printReport(this.report);
      close && this.init.resolve();
    },
    executeLoop() {
      return new Promise((resolve, reject) => {
        try {
          Printer.printReport(this.report);
          resolve();
        } catch (e) {
          console.log(e);
          resolve();
        }
      });
    },
    getTransactionsFromInvoices() {},
    reportError(error) {
      console.log(error);
      this.$q();
      this.$socket.emit("[SYS] RECORD", {
        type: "Software",
        event: "reportError",
        status: 0,
        cause: error,
        data: this.reportRange
      });
    }
  }
};
</script>

<style scoped>
.inner {
  padding: 15px;
}

.rangeWrap {
  display: flex;
  border: 1px solid #ddd;
  margin: 10px;
  background: #fff;
  border-radius: 4px;
}

.rangeWrap input {
  display: none;
}

.rangeWrap > div {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ddd;
}

.rangeWrap > div:last-child {
  border-right: none;
}

.detailWrap {
  display: flex;
  margin: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  width: 500px;
  height: 250px;
}

.detailWrap > div {
  flex: 1;
}

.options {
  padding-left: 25px;
}

h1 {
  text-align: center;
  font-size: 20px;
  margin-bottom: 10px;
  color: #37474f;
}

.left {
  border-right: 1px solid #ddd;
}

.right {
  margin-left: 10px;
}

.rangeWrap label {
  padding: 10px;
  width: 100%;
  text-align: center;
  cursor: pointer;
}

.rangeWrap input:checked + label {
  background: #2196f3;
  color: #fff;
}

.for {
  display: flex;
}

.range {
  flex: 1;
  text-align: center;
  color: #009688;
}

.range span {
  background: #fff;
  border-radius: 4px;
  padding: 1px 10px 0;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}
</style>
