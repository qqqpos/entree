<template>
  <div class="pickup">
    <header>
      <div>
        <h3>{{$t('text.pickUpList')}}</h3>
        <p>{{$t('text.remainTicket',invoices.length)}}</p>
      </div>
    </header>
    <section class="wrap">
      <article v-if="invoices.length">
        <ul class="list">
          <li v-for="(ticket,index) in tickets" :key="index" @click="display(ticket,$event)">
            <div class="ticket">{{ticket.number}}</div>
            <div class="wrap">
              <div class="customer relative">
                <h3>{{ticket.customer.name}}</h3>
                <h5>{{ticket.customer.phone | tel}}</h5>
                <p>$ {{ticket.payment.due | decimal}}</p>
              </div>
              <div class="info">
                <span class="pass">{{ticket.time | fromNow}}</span>
                <span>{{$t('type.'+ticket.type)}}</span>
              </div>
            </div>
          </li>
        </ul>
        <paginator :of="invoices" @page="setPage" :perPage="14" :maxPage="10"></paginator>
      </article>
      <article v-else>
        <div class="placeholder">
          <i class="fa fa-5x fa-thumbs-o-up"></i>
          <h3>Well Done</h3>
          <h5>There is no order for pick up.</h5>
        </div>
      </article>
      <aside>
        <order-list layout="display" :display="true"></order-list>
        <div class="function">
          <button class="btn" @click="edit">
            <i class="fa fa-list-alt"></i>
            <span class="text">{{$t("button.edit")}}</span>
          </button>
          <div class="btn" @click="split">
            <i class="fa fa-clone"></i>
            <span class="text">{{$t("button.split")}}</span>
          </div>
          <div class="btn" @click="print">
            <i class="fa fa-print"></i>
            <span class="text">{{$t("button.receipt")}}</span>
          </div>
          <div class="btn" @click="openPaymentModule">
            <i class="fa fa-print"></i>
            <span class="text">{{$t("button.payment")}}</span>
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
import dialogModule from "./common/dialog";
import paginator from "./common/paginator";
import orderList from "./common/orderList";
import paymentModule from "./payment/main";
import splitModule from "./split/index";

export default {
  components: {
    paymentModule,
    dialogModule,
    splitModule,
    paginator,
    orderList,
    reason
  },
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
      const dom = document.querySelector("li.active");
      dom && dom.classList.remove("active");
      e.currentTarget.classList.add("active");

      this.setOrder(JSON.parse(JSON.stringify(ticket)));
    },
    setPage(page) {
      this.page = page;
    },
    edit() {
      const { type, number, customer } = this.order;

      this.setCustomer(customer);
      this.setApp({ newTicket: false });
      this.setTicket({ type, number });

      this.$router.push({ path: "/main/menu" });
    },
    openPaymentModule(params) {
      new Promise((resolve, reject) => {
        this.componentData = Object.assign({}, { resolve, reject }, params);
        this.component = "paymentModule";
      })
        .then(this.exitComponent)
        .catch(exitParams => {
          this.exitComponent();

          if (exitParams && exitParams.reload === true) {
            this.$splitEvenly(exitParams.split).then(() =>
              this.openPaymentModule(Object.assign({}, params, exitParams))
            );
          }
        });
    },
    print() {
      Printer.print(this.order, { target: "Receipt", receipt: true });

      this.$socket.emit("[ORDER] UPDATE", order, true);
    },
    split() {
      this.$open("splitModule");
    },
    voidTicket() {
      const prompt = {
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
      };

      this.$dialog(prompt)
        .then(confirm => this.$open("reason"))
        .catch(this.exitComponent);
    },
    exit() {
      this.resetOrder();
      this.$router.push({ path: "/main" });
    },
    ...mapActions([
      "setApp",
      "setOrder",
      "resetOrder",
      "setTicket",
      "setCustomer"
    ])
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
      const min = this.page * 14;
      const max = min + 14;
      return this.invoices.slice(min, max);
    },
    ...mapGetters([
      "op",
      "app",
      "tax",
      "store",
      "order",
      "ticket",
      "dineInOpt",
      "station",
      "history"
    ])
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
  display: flex;
  height: 68px;
  background-image: linear-gradient(170deg, rgb(81, 103, 140) 0%, #234c75 100%);
}

header div {
  margin: 14px;
  color: #fff;
}

.wrap {
  display: flex;
  flex: 1;
}

article {
  flex: 1;
}

.function {
  width: 282px;
}

ul {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 620px;
}

li {
  display: flex;
  width: 340px;
  height: 68px;
  background: #fff;
  margin: 4px;
  padding: 5px 14px 5px 5px;
  color: #666;
  filter: opacity(0.6) grayscale(0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  border-top: 2px solid transparent;
}

li .wrap {
  display: flex;
  flex-direction: column;
}

.info {
  border-top: 1px solid #fff;
  padding-top: 5px;
  display: flex;
  align-items: center;
}

.pass {
  font-size: 14px;
  flex: 1;
  color: #ff5722;
}

.customer {
  height: 34px;
  padding: 5px 0 5px;
  color: #3c3c3c;
  border-bottom: 1px dashed rgb(224, 224, 224);
}

.customer p {
  position: absolute;
  right: 5px;
  top: 0px;
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 30px;
  color: #6d6d6d;
}

.ticket {
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 30px;
  width: 45px;
  text-align: center;
  margin-right: 5px;
  color: #3c3c3c;
}

li.active {
  border-top: 2px solid #03a9f4;
  filter: none;
}

.paginator {
  justify-content: center;
  margin: 0px 12px 0 6px;
  display: flex;
}

.paginator .page {
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

.placeholder {
  background: rgba(255, 255, 255, 0.5);
  box-shadow: inset 0 0px 150px 40px rgba(0, 0, 0, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.placeholder i {
  color: rgba(0, 0, 0, 0.8);
  text-shadow: 0 0px 1px #f5f5f5;
}

.placeholder h3 {
  font-size: 30px;
  color: #3c3c3c;
  margin-top: 24px;
}

.placeholder h5 {
  color: rgba(0, 0, 0, 0.7);
  font-size: 16px;
}
</style>
