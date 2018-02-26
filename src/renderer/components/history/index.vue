<template>
  <div class="history">
    <header>
      <div class="logo" @click.ctrl="getConsole">
        <span>U</span>
      </div>
      <order-summary :data="Array.isArray(this.prevHistory) ? prevHistory : history" :date="calendarDate || today" @filter="setFilter"></order-summary>
    </header>
    <article>
      <side-buttons :date="calendarDate || today" @change="setCalendar"></side-buttons>
      <section class="tickets">
        <div class="inner">
          <ticket v-for="(invoice,index) in invoices" :key="index" :invoice="invoice"></ticket>
        </div>
        <pagination :of="orders" @page="setPage" :contain="30" :max="12"></pagination>
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
import pagination from "../common/pagination";
import orderList from "../common/orderList";
import dialoger from "../common/dialoger";
import orderButtons from "./orderButtons";
import sideButtons from "./sideButtons";
import orderSummary from "./summary";
import ticket from "./component/ticket";

export default {
  components: {
    orderButtons,
    sideButtons,
    orderSummary,
    Maintenance,
    pagination,
    orderList,
    dialoger,
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
        case "UNSETTLE":
          this.filter = "UNSETTLE";
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
      let dom = document.querySelector(".ticket.active");
      dom && dom.classList.remove("active");

      this.$nextTick(() => {
        this.orders.length && this.getInvoice(this.invoices[0]);
        let dom = document.querySelector(".ticket");
        dom && dom.classList.add("active");
      });
    },
    setPage(number) {
      let dom = document.querySelector(".ticket.active");
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
        this.$q();
        this.prevHistory = invoices;
        this.resetViewOrder();
      });
    },
    highlightTicket(number) {
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
    getConsole() {
      this.$p("Maintenance");
    },
    ...mapActions(["setViewOrder"])
  },
  computed: {
    orders() {
      let operator = this.op.name;
      let approval = this.approval(this.op.view, "invoices");
      switch (this.filter) {
        case "WALK_IN":
        case "PICK_UP":
        case "DELIVERY":
        case "DINE_IN":
        case "BAR":
          return Array.isArray(this.prevHistory)
            ? this.prevHistory.filter(
              invoice => invoice.type === this.filter && view(invoice.server)
            )
            : this.history.filter(
              invoice => invoice.type === this.filter && view(invoice.server)
            );
        case "UNSETTLE":
          return Array.isArray(this.prevHistory)
            ? this.prevHistory.filter(
              invoice =>
                invoice.status === 1 &&
                !invoice.settled &&
                view(invoice.server)
            )
            : this.history.filter(
              invoice =>
                invoice.status === 1 &&
                !invoice.settled &&
                view(invoice.server)
            );
        case "DRIVER":
          return Array.isArray(this.prevHistory)
            ? this.prevHistory.filter(
              invoice =>
                (this.driver
                  ? invoice.driver === this.driver
                  : invoice.type === "DELIVERY") && view(invoice.server)
            )
            : this.history.filter(
              invoice =>
                (this.driver
                  ? invoice.driver === this.driver
                  : invoice.type === "DELIVERY") && view(invoice.server)
            );
        default:
          return Array.isArray(this.prevHistory)
            ? this.prevHistory.filter(invoice => view(invoice.server))
            : this.history.filter(invoice => view(invoice.server));
      }

      function view(server) {
        if (!server) return true;
        if (approval) return true;
        return server === operator;
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
    order(ticket) {
      this.highlightTicket(ticket.number);
    }
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

header {
  margin-top: 30px;
  display: flex;
  height: 63px;
  background-image: linear-gradient(170deg, rgb(81, 103, 140) 0%, #234c75 100%);
}

article {
  flex: 1;
  display: flex;
  background: url(../../assets/image/grid.png) #ebeff1;
}

.logo {
  margin: 7px 20px;
}

.summary {
  flex: 1;
  display: flex;
  align-items: center;
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