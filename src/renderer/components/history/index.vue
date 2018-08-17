<template>
  <div class="history-grid">
    <filter-bar :data="targetInvoices" :date="calendarDate || today" :target="targetName" :reset="splits.length" :discountTag.sync="discountTag" @filter="setFilter" @reset="resetFilter" @search="searchInvoice" :on="targetName"></filter-bar>
      <side-buttons :date="calendarDate || today" @change="setCalendar" :splitMode="splits.length > 0"></side-buttons>
      <section class="invoices">
        <div class="wrap">
          <ticket v-for="(invoice,index) in invoices" :key="index" :invoice="invoice" :discountTag="discountTag" @recall="recall" @splits="getSplits" @dblclick.native="getSplits(invoice)"></ticket>
        </div>
        <paginator :of="orders" @page="setPage" :contain="30" :max="12"></paginator>
      </section>
      <section class="ticket">
        <order-list layout="display" :display="true"></order-list>
        <order-buttons :date="calendarDate || today"></order-buttons>
      </section>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import inputModule from "../component/inputer";
import Maintenance from "../dock/maintenance";
import changeLog from "./component/changeLog";
import paginator from "../common/paginator";
import orderList from "../common/orderList";
import dialogModule from "../common/dialog";
import orderButtons from "./orderButtons";
import ticket from "./component/ticket";
import sideButtons from "./sideButtons";
import filterBar from "./filterBar";

export default {
  components: {
    dialogModule,
    orderButtons,
    inputModule,
    sideButtons,
    Maintenance,
    changeLog,
    paginator,
    filterBar,
    orderList,
    ticket
  },
  data() {
    return {
      discountTag: false,
      componentData: null,
      calendarDate: null,
      prevHistory: null,
      targetName: null,
      component: null,
      today: today(),
      summary: {},
      splits: [],
      filter: "",
      view: "",
      page: 0
    };
  },
  created() {
    this.checkSync();
    this.$bus.on("CALENDAR", this.setCalendar);

    const isDiscountTagVisible = localStorage.getItem("isDiscountTagVisible");
    this.discountTag = isDiscountTagVisible
      ? JSON.parse(isDiscountTagVisible)
      : false;
  },
  mounted() {
    if (this.orders.length) {
      this.setViewOrder(this.orders[0]);
      const dom = document.querySelector(".invoice");
      dom && dom.classList.add("active");
    }
  },
  beforeDestroy() {
    this.$bus.off("CALENDAR", this.setCalendar);
    localStorage.setItem("isDiscountTagVisible", this.discountTag);
  },
  methods: {
    checkSync() {
      this.$socket.emit("ABOUT", ({ lastSync }) => {
        this.sync !== lastSync &&
          this.$socket.emit("[INITIAL] POS", data =>
            this.setAppEnvironment(data)
          );
      });
    },
    setFilter(type, name) {
      this.page = 0;

      switch (type) {
        case "SERVER":
        case "DRIVER":
          this.filter = type;
          this.targetName = name;
          break;
        case "ALL_INVOICES":
          this.splits = [];
        default:
          this.filter = type;
      }
      this.resetViewOrder();
    },
    resetFilter() {
      this.page = 0;
      this.splits = [];
      this.targetName = null;
      this.filter = "ALL_INVOICES";
      this.resetViewOrder();
    },
    resetViewOrder() {
      this.$nextTick(() => {
        if (this.splits.length) {
          this.setViewOrder(this.splits[0]);
        } else {
          this.orders.length
            ? this.setViewOrder(this.invoices[0])
            : this.resetOrder();
        }

        this.highlightTicket(this.invoices[0]);
      });
    },
    setPage(number) {
      const dom = document.querySelector(".ticket.active");
      dom && dom.classList.remove("active");

      this.page = number;
      this.resetViewOrder();
    },
    setSummary(data) {
      this.summary = data;
    },
    setCalendar(date) {
      this.calendarDate = date;
      this.$socket.emit("[ORDER] HISTORY", date, invoices => {
        this.prevHistory = date !== today() ? invoices : null;
        this.page = 0;
        this.splits = [];
        this.resetViewOrder();
        this.exitComponent();
      });
    },
    highlightTicket(ticket) {
      if (ticket) {
        const { number } = ticket;
        this.$nextTick(() => {
          let dom = document.querySelector(".ticket.active");
          dom && dom.classList.remove("active");
          dom = document.querySelectorAll(".ticket");

          for (let i = 0; i < dom.length; i++) {
            if (dom[i].dataset.number == number) {
              dom[i] && dom[i].classList.add("active");
              break;
            }
          }
        });
      }
    },
    recall(_id) {
      this.$socket.emit("[INSTANCE] LIST", _id, records => {
        const prompt = {
          type: "error",
          title: "dialog.unableTraceRecord",
          msg: "dialog.recordMissingOrDeleted",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        records.length
          ? this.$open("changeLog", { records })
          : this.$dialog(prompt).then(this.exitComponent);
      });
    },
    getConsole() {
      this.$open("Maintenance");
    },
    getSplits(invoice) {
      invoice.split &&
        this.$socket.emit("[SPLIT] GET", invoice._id, splits => {
          this.page = 0;
          this.splits = splits.sort((a, b) => a.number.localeCompare(b.number));
          this.resetViewOrder();
        });
    },
    searchInvoice() {
      new Promise((resolve, reject) => {
        const config = {
          title: "text.searchTicket",
          type: "number",
          percentage: false,
          allowPercentage: false,
          amount: "0"
        };

        this.componentData = Object.assign({ resolve, reject }, config);
        this.component = "inputModule";
      })
        .then(this.searchTicket)
        .catch(this.exitComponent);
    },
    searchTicket(input) {
      const ticket = input.amount;
      this.exitComponent();
      //search invoices
      const target = this.targetInvoices.findIndex(i => i.number === ticket);

      if (target === -1) {
        const prompt = {
          title: "dialog.ticketNotFound",
          msg: "dialog.actionProcess",
          buttons: [
            { text: "button.cancel", fn: "reject" },
            { text: "button.retry", fn: "resolve" }
          ]
        };

        this.$dialog(prompt)
          .then(this.searchInvoice)
          .catch(this.exitComponent);
      } else {
        const index = this.findTicketPage(ticket);
        this.$bus.emit("SET_CURRENT_PAGE", index);
        this.$nextTick(() => this.setViewOrder(this.orders[target]));
      }
    },
    findTicketPage(target) {
      const pages = Math.ceil(this.orders.length / 30);
      let index = 0;
      let page = 1;
      let count = 0;

      while (this.orders[index].number !== target) {
        count++;
        if (count === 30) {
          count = 0;
          page++;
        }
        index++;
      }
      return page;
    },
    ...mapActions([
      "resetOrder",
      "setViewOrder",
      "setTodayOrder",
      "setAppEnvironment"
    ])
  },
  computed: {
    targetInvoices() {
      return this.splits.length
        ? this.splits
        : Array.isArray(this.prevHistory) ? this.prevHistory : this.history;
    },
    orders() {
      const { name } = this.op;
      const approval = this.approval(this.op.view, "invoices");
      let invoices = this.targetInvoices.filter(
        ({ server }) =>
          this.targetName
            ? this.targetName === server && view(server)
            : view(server)
      );

      switch (this.filter) {
        case "WALK_IN":
        case "PICK_UP":
        case "DELIVERY":
        case "DINE_IN":
        case "HIBACHI":
        case "BUFFET":
        case "BAR":
          return invoices.filter(invoice => invoice.type === this.filter);
        case "UNSETTLED":
          return invoices.filter(
            invoice => invoice.status === 1 && !invoice.settled
          );
        case "SETTLED":
          return invoices.filter(
            invoice => invoice.status === 1 && invoice.settled
          );
        case "VOIDED":
          return invoices.filter(invoice => invoice.status === 0);
        case "DISCOUNTED":
          return invoices.filter(invoice => invoice.payment.discount > 0);
        case "EDITED":
          return invoices.filter(invoice => invoice.modify > 0);
        case "SERVER":
          return invoices.filter(invoice => invoice.server === this.targetName);
        case "DRIVER":
          return invoices.filter(
            invoice =>
              this.targetName
                ? invoice.driver === this.targetName
                : invoice.type === "DELIVERY"
          );
        default:
          return invoices;
      }

      function view(server) {
        if (!server) return true;
        if (approval) return true;

        return server === name;
      }
    },
    invoices() {
      const min = this.page * 30;
      const max = min + 30;
      return this.orders.slice(min, max);
    },
    ...mapGetters(["op", "sync", "ticket", "order", "history", "store"])
  },
  watch: {
    order: "highlightTicket"
  },
  sockets: {
    UPDATE_SPLIT(order) {
      const index = this.splits.findIndex(split => split._id === order._id);
      if (index !== -1) {
        this.splits.splice(index, 1, order);

        order._id === this.order._id && this.setViewOrder(order);
      }
    }
  }
};
</script>