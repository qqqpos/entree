<template>
  <div class="popupMask center dark">
    <div class="driver window">
      <header class="title">
        <span>{{$t('title.setDriver')}}</span>
        <i class="fa fa-times" @click="init.reject"></i>
      </header>
      <div class="inner">
        <section class="outer">
          <v-touch tag="ul" class="orders" :style="scroll" @panup="move" @pandown="move" @panstart="panStart" @panend="panEnd">
            <li v-for="(order,index) in orders" :key="index" :data-ticket="order.number" @click="setTarget(order,$event)">
              <span class="number">{{order.number}}</span>
              <div class="info">
                <span class="phone">{{order.customer.phone | phone}}</span>
                <span class="address">{{order.customer.address}}</span>
              </div>
              <div class="prices">
                <span class="total">{{order.payment.total | decimal}}</span>
                <span class="tip" v-show="order.payment.tip > 0">({{order.payment.tip | decimal}})</span>
              </div>
              <span class="driver">{{order.driver}}</span>
            </li>
          </v-touch>
        </section>
        <ul class="letters">
          <li v-for="letter in letters" :key="letter" @click="setDriver(letter,$event)" :class="letter" :data-letter="letter">{{letter}}</li>
          <li class="clear" @click="clear">{{$t('button.clear')}}</li>
        </ul>
      </div>
      <footer>
        <div class="btn" @click="settle" v-show="assigned">{{$t('button.settle')}}</div>
        <div class="btn" @click="init.resolve">{{$t('button.done')}}</div>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import dialoger from "../../common/dialoger";

export default {
  props: ["init"],
  components: { dialoger },
  computed: {
    scroll() {
      return { transform: `translate3d(0,${this.offset}px,0)` };
    },
    assigned() {
      return this.init.invoices.every(ticket => !!ticket.driver);
    },
    ...mapGetters(["op"])
  },
  data() {
    return {
      letters: [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z"
      ],
      target: null,
      letter: null,
      orders: null,
      order: null,
      loop: true,
      offset: 0,
      lastDelta: 0,
      componentData: null,
      component: null
    };
  },
  created() {
    this.initialData();
    this.init.hasOwnProperty("ticket") && this.next(this.init.ticket);
  },
  methods: {
    initialData() {
      let viewable = this.approval(this.op.view, "invoices");
      this.orders = this.init.invoices;

      !viewable &&
        (this.orders = orders.filter(
          invoice => invoice.cashier === this.op.name
        ));
    },
    setTarget(order, e) {
      let { number, driver } = order;

      let dom = document.querySelector("ul.orders .active");
      dom && dom.classList.remove("active");

      e.currentTarget.classList.add("active");
      this.order = order;
    },
    move(e) {
      this.offset = this.lastDelta + e.deltaY;
    },
    panStart() {
      const dom = document.querySelector(".orders.scrollable");
      dom && dom.classList.remove("scrollable");
    },
    panEnd(e) {
      let dom = document.querySelector("ul.orders");
      dom && dom.classList.add("scrollable");

      let { top, bottom, height } = dom.getBoundingClientRect();
      let offset = this.$route.name === "Menu" ? 55 : 179;
      top -= offset;
      bottom -= offset;
      if (top > 0) {
        this.offset = 0;
      } else if (height < 322) {
        this.offset = 0;
      } else if (height > 322 && bottom < 440) {
        this.offset = -(height - 448);
      }
      this.lastDelta = this.offset;
    },
    clear() {
      if (!this.order) return;
      Object.assign(this.order, { driver: "" });

      const dom = document.querySelector("ul.letters .active");
      dom && dom.classList.remove("active");

      this.$socket.emit("[INVOICE] UPDATE", this.order, false);
    },
    setDriver(letter) {
      if (!this.order) return;

      Object.assign(this.order, { driver: letter });
      this.$socket.emit("[INVOICE] UPDATE", this.order, false);

      this.loop && this.next();
    },
    setTip() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, payment: this.order.payment };
        this.component = "tipper";
      })
        .then(tip => {
          const {
            gratuity,
            total,
            discount,
            paid,
            rounding
          } = this.order.payment;
          const balance = toFixed(
            total - discount + tip + gratuity + rounding,
            2
          );

          this.order.payment.tip = tip;
          this.order.payment.balance = balance;
          this.order.payment.remain = toFixed(balance - paid, 2);
          this.$socket.emit("[INVOICE] UPDATE", this.order, false);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    next(number) {
      if (number) {
        this.order = this.orders.find(ticket => ticket.number === number);
      } else {
        const next = this.orders.find(ticket => !ticket.driver);

        if (next) {
          this.order = next;

          this.$nextTick(() => {
            const dom = document.querySelector("ul.orders .active");
            const { top, height } = dom.getBoundingClientRect();

            if (top > 560.5) this.offset = -height;
          });
        }
      }
    },
    settle() {
      const prompt = {
        title: "dialog.settleConfirm",
        msg: "dialog.settleDeliveryCashTicket"
      };

      this.$dialog(prompt)
        .then(() => this.$socket.emit("[DRIVER] SETTLE", this.init.date, this.exitComponent))
        .catch(this.exitComponent);
    }
  },
  watch: {
    order(n) {
      let dom = document.querySelector("ul.letters .active");
      dom && dom.classList.remove("active");
      dom = document.querySelector("ul.orders .active");
      dom && dom.classList.remove("active");

      document
        .querySelector(`[data-ticket="${n.number}"]`)
        .classList.add("active");

      if (n.driver) {
        document
          .querySelector(`[data-letter="${n.driver.toUpperCase()}"]`)
          .classList.add("active");
      }
    }
  }
};
</script>

<style scoped>
.inner {
  display: flex;
  width: 619px;
}

ul.letters {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
}

.letters li {
  width: 70px;
  height: 60px;
  border: 1px solid #cfd8dc;
  background: #fff;
  margin: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.letters .active {
  background: #009688;
  color: #fff;
}

section.outer {
  height: 448px;
  overflow: hidden;
}
ul.orders {
  width: 320px;
  margin-right: 2px;
}

span.address {
  color: #009688;
}
.orders li {
  display: flex;
  padding: 5px;
  align-items: center;
  color: #3c3c3c;
  border-bottom: 1px solid #eeeeee;
  height: 45px;
  background: #fff;
}

.orders .number {
  width: 35px;
  text-align: center;
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 20px;
  margin-right: 5px;
}
.orders .info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.orders .prices {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.orders .total {
  min-width: 50px;
  text-align: center;
}
.orders .tip {
  color: lightgray;
  font-size: 14px;
}

.f1 {
  display: flex;
  align-items: center;
}

li.clear {
  width: 144px;
  background: #ff5722;
  color: #fff;
}

.orders .active {
  background: #009688;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}

.orders .active .address {
  color: #fff;
}

span.driver {
  width: 24px;
  height: 24px;
  text-indent: 2px;
  border: 2px solid #00897b;
  text-align: center;
  line-height: 24px;
  background: #fafafa;
  border-radius: 50%;
  color: #009688;
  text-shadow: 0 1px 1px #607d8b;
}

.scrollable {
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>