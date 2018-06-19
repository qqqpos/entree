<template>
  <div class="history">
    <filter-bar :data="targetInvoices" :date="calendarDate || today" @filter="setFilter" @trigger="openComponent"></filter-bar>
    <article>
      <side-buttons :date="calendarDate || today" @change="setCalendar"></side-buttons>
      <section class="tickets">
        <div class="inner">
          <ticket v-for="(invoice,index) in invoices" :key="index" :invoice="invoice" @recall="recall"></ticket>
        </div>
        <paginator :of="orders" @page="setPage" :contain="30" :max="12"></paginator>
      </section>
      <section class="ticket">
        <order-list layout="display" :display="true"></order-list>
        <order-buttons :date="calendarDate || today"></order-buttons>
      </section>
    </article>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Maintenance from "../dock/maintenance";
import paginator from "../common/paginator";
import orderList from "../common/orderList";
import dialoger from "../common/dialoger";
import orderButtons from "./orderButtons";
import inputer from "./component/inputer";
import ticket from "./component/ticket";
import sideButtons from "./sideButtons";
import filterBar from "./filterBar";

export default {
  components: {
    orderButtons,
    sideButtons,
    Maintenance,
    paginator,
    filterBar,
    orderList,
    dialoger,
    inputer,
    ticket
  },
  data() {
    return {
      today: today(),
      component: null,
      componentData: null,
      calendarDate: null,
      prevHistory: null,
      summary: {},
      page: 0,
      view: "",
      filter: "",
      driver: null
    };
  },
  created() {
    this.checkSync();
    this.$bus.on("CALENDAR", this.setCalendar);
  },
  mounted() {
    if (this.orders.length) {
      this.setViewOrder(this.orders[0]);
      let dom = document.querySelector(".invoice");
      dom && dom.classList.add("active");
    }
  },
  beforeDestroy() {
    this.$bus.off("CALENDAR", this.setCalendar);
  },
  methods: {
    checkSync() {
      this.$socket.emit("[SYNC] POS", time => {
        time !== this.sync && this.$socket.emit("[SYNC] ORDER_LIST");
      });
    },
    getInvoice(invoice) {
      this.setViewOrder(invoice);
    },
    setFilter(type, id) {
      this.driver = null;
      this.page = 0;

      switch (type) {
        case "WALK_IN":
        case "PICK_UP":
        case "DELIVERY":
        case "DINE_IN":
        case "BAR":
          this.filter = type;
          break;
        case "UNSETTLED":
        case "EDIT":
        case "VOID":
        case "DISCOUNT":
          this.filter = type;
          break;
        case "DRIVER":
          this.filter = "DRIVER";
          this.driver = id;
          break;

        default:
          this.filter = type;
      }
      this.resetViewOrder();
    },
    resetViewOrder() {
      const dom = document.querySelector(".ticket.active");
      dom && dom.classList.remove("active");

      this.$nextTick(() => {
        this.orders.length && this.getInvoice(this.invoices[0]);
        const dom = document.querySelector(".ticket");
        dom && dom.classList.add("active");
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
      this.$socket.emit("[INQUIRY] HISTORY_ORDER", date, invoices => {
        this.prevHistory = invoices;
        this.resetViewOrder();
        this.exitComponent();
      });
    },
    highlightTicket({ number }) {
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
    },
    recall(_id) {
      this.$socket.emit("[INSTANCE] LIST", _id, results => {
        console.log(results);
      });
    },
    getConsole() {
      this.$open("Maintenance");
    },
    openComponent(name) {
      switch (name) {
        case "SEARCH":
          new Promise((resolve, reject) => {
            const config = {
              title: "title.searchTicket",
              type: "number",
              amount: "0"
            };

            this.componentData = { resolve, reject, config };
            this.component = "inputer";
          })
            .then(this.searchTicket)
            .catch(this.exitComponent);
          break;
      }
    },
    searchTicket(number) {
      this.exitComponent();
      //search invoices
      const target = this.targetInvoices.findIndex(
        invoice => invoice.number === number
      );

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
          .then(this.openComponent.bind(null, "SEARCH"))
          .catch(this.exitComponent);
      } else {
        const index = this.findTicketPage(number);
        this.$bus.emit("SET_CURRENT_PAGE", index);
        this.$nextTick(() => this.setViewOrder(this.targetInvoices[target]));
      }
    },
    findTicketPage(target) {
      const pages = Math.ceil(this.targetInvoices.length / 30);
      let index = this.targetInvoices.length;
      let page = 1;
      let count = 0;
      while (index !== target) {
        count++;
        if (count === 30) {
          count = 0;
          page++;
        }
        index--;
      }
      return page;
    },
    ...mapActions(["setViewOrder"])
  },
  computed: {
    targetInvoices() {
      return Array.isArray(this.prevHistory) ? this.prevHistory : this.history;
    },
    orders() {
      const { name } = this.op;
      const approval = this.approval(this.op.view, "invoices");
      const invoices = this.targetInvoices.filter(({ server }) => view(server));

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
        case "DRIVER":
          return invoices.filter(
            invoice =>
              this.driver
                ? invoice.driver === this.driver
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
  }
};
</script>

<style scoped>
.history {
  width: 100%;
  height: 100%;
  background: #f6f6f6;
  flex-direction: column;
}

article {
  flex: 1;
  display: flex;
  background: url(../../assets/image/grid.png) #ebeff1;
}

section.ticket {
  width: 285px;
  background: rgba(255, 255, 255, 0.5);
}

.tickets {
  display: flex;
  flex-direction: column;
  width: 641px;
  padding: 2px 0 0;
}

.inner {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  flex: 1;
  max-height: 616px;
}
</style>