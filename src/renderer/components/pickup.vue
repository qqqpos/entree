<template>
  <div class="pickup">
    <header>
      <div>
        <h3>{{$t('text.pickUpList')}}</h3>
        <h5>{{$t('text.remainTicket',invoices.length)}}</h5>
      </div>
    </header>
    <section class="wrap">
      <article>
        <ul class="list">
          <li v-for="(ticket,index) in tickets" :key="index" @click="display(ticket,$event)">
            <div class="ticket">
              <span class="number">{{ticket.number}}</span>
              <span class="time">{{ticket.time | moment('HH:mm')}}</span>
            </div>
            <div class="info">
              <span>{{ticket.customer.phone | phone}}</span>
              <span>{{ticket.customer.name}}</span>
            </div>
            <span class="amount">$ {{ticket.payment.due}}</span>
          </li>
        </ul>
        <div class="pagination" v-if="totalPage > 1">
          <div class="page" @click="page = page > 0 ? page - 1 : 0">
            <i class="fa fa-angle-left"></i>
          </div>
          <div class="page" v-for="i in totalPage" @click="page = (i-1)" :key="i" :class="{active:page === (i-1)}">{{i}}</div>
          <div class="page" @click="page = page === (totalPage-1) ? page : page + 1">
            <i class="fa fa-angle-right"></i>
          </div>
        </div>
      </article>
      <aside>
        <order-list layout="display" :display="true"></order-list>
        <div class="function">
          <button class="btn" @click="edit">
            <i class="fa fa-list-alt"></i>
            <span class="text">{{$t("button.edit")}}</span>
          </button>
          <div class="btn" @click="settle">
            <i class="fa fa-print"></i>
            <span class="text">{{$t("button.payment")}}</span>
          </div>
          <div class="btn" @click="print">
            <i class="fa fa-print"></i>
            <span class="text">{{$t("button.print")}}</span>
          </div>
          <div class="btn" @click="split">
            <i class="fa fa-clone"></i>
            <span class="text">{{$t("button.split")}}</span>
          </div>
          <div class="btn" @click="exit">
            <i class="fa fa-times"></i>
            <span class="text">{{$t("button.exit")}}</span>
          </div>
          <div class="btn" @click="voidTicket">
            <i class="fa fa-ban"></i>
            <span class="text">{{$t("button.void")}}</span>
          </div>
        </div>
      </aside>
    </section>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import reason from "./history/component/reason";
import orderList from "./common/orderList";
import dialoger from "./common/dialoger";
import payment from "./payment/index";
import split from "./split/index";

export default {
  components: { orderList, payment, split, reason, dialoger },
  data() {
    return {
      componentData: null,
      component: null,
      page: 0
    };
  },
  mounted() {
    if (this.invoices.length > 0) {
      document.querySelector("li").classList.add("active");
      this.setOrder(JSON.parse(JSON.stringify(this.invoices[0])));
    }
  },
  methods: {
    display(ticket, e) {
      let dom = document.querySelector("li.active");
      dom && dom.classList.remove("active");
      e.currentTarget.classList.add("active");
      this.setOrder(JSON.parse(JSON.stringify(ticket)));
    },
    edit() {
      this.setTicket({ type: this.order.type, number: this.order.number });
      this.setApp({ mode: "edit" });
      this.setCustomer(this.order.customer);
      this.$router.push({ path: "/main/menu" });
    },
    settle() {
      this.$p("payment");
    },
    print() {
      let order = JSON.parse(JSON.stringify(this.order));
      Printer.setTarget("Receipt").print(order);
      order.content.forEach(item => {
        delete item.new;
        item.print = true;
        item.pending = false;
      });
      this.$socket.emit("[UPDATE] INVOICE", order);
    },
    split() {
      this.$p("split");
    },
    voidTicket() {
      this.$dialog({
        type: "warning",
        title: [
          "dialog.voidOrderConfirm",
          this.order.number,
          this.$t("type." + this.order.type)
        ],
        msg: "dialog.voidOrderConfirmTip",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.delete", fn: "resolve" }
        ]
      })
        .then(confirm => {
          this.$p("reason");
        })
        .catch(() => {
          this.$q();
        });
    },
    exit() {
      this.resetMenu();
      this.$router.push({ path: "/main" });
    },
    ...mapActions([
      "setApp",
      "setTicket",
      "setOrder",
      "setCustomer",
      "resetMenu"
    ])
  },
  filters: {
    phone(number) {
      return number.replace(/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "($1) $2-$3");
    }
  },
  computed: {
    invoices() {
      return this.history.filter(
        ticket =>
          ticket.status === 1 &&
          !ticket.settled &&
          (ticket.type === "WALK_IN" || ticket.type === "PICK_UP")
      );
    },
    tickets() {
      let min = this.page * 20;
      let max = this.page + 20;
      return this.invoices.slice(min, max);
    },
    totalPage() {
      return Math.ceil(this.invoices.length / 20);
    },
    ...mapGetters(["order", "history"])
  }
};
</script>

<style scoped>
.pickup {
  display: flex;
  flex-direction: column;
  height: 738px;
  margin-top: 30px;
  width: 100%;
  background: url(../assets/image/grid.png) #ebeff1;
}

header {
  height: 70px;
  background: #234c75;
  color: #fff;
}

header div {
  margin: 14px;
}

h3,
h5 {
  font-weight: normal;
}

.wrap {
  display: flex;
  flex: 1;
}

article {
  flex: 1;
}

ul {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 620px;
}

.function {
  width: 282px;
}

li {
  display: flex;
  width: 360px;
  background: #fff;
  margin: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  transition: background 0.3s ease;
}

li.active {
  background: #eceff1;
}

li > * {
  display: flex;
  flex-direction: column;
  padding: 1px 10px;
}

.ticket {
  width: 60px;
  align-items: center;
  background: #009688;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}

ul.list .info {
  flex: 1;
  justify-content: center;
  font-size: 20px;
}

span.number {
  font-size: 32px;
  font-family: "Agency FB";
  font-weight: bold;
}

.amount {
  justify-content: center;
}

.pagination {
  justify-content: center;
  margin: 0px 12px 0 6px;
  display: flex;
}

.pagination .page {
  margin: 5px 5px 10px;
  width: 20px;
  text-align: center;
  cursor: pointer;
  padding: 10px 10px;
  border-radius: 4px;
  text-shadow: 0 1px 1px #fff;
  background: linear-gradient(#fefefe, #cfd0d3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
}

.page.active {
  font-weight: bold;
  background: #676767;
  color: #fff;
  text-shadow: 0 1px 1px #000;
  box-shadow: rgba(0, 0, 0, 0.75) 0 0 0 0 inset;
}
</style>
