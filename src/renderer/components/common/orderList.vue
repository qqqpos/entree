<template>
  <div>
    <header v-if="layout === 'order'" class="simple">
      <span class="qty">{{$t('text.qty')}}</span>
      <span class="item">{{$t('text.item')}}</span>
      <span class="price">{{$t('text.price')}}</span>
    </header>
    <header v-else class="info">
      <div class="content">
        <template v-if="order.type === 'DINE_IN' || order.type === 'HIBACHI' || order.type === 'BAR'">
          <span class="table">{{order.table}} - {{order.guest}} - {{order.server}}</span>
          <span class="time">{{order.time | moment('YYYY-MM-DD HH:mm:ss')}}</span>
          <span class="corner" v-if="undoneItems">{{$t('text.progressTicket',undoneItems)}}</span>
          <span class="corner" v-else>{{$t('text.doneTicket')}}</span>
        </template>
        <template v-else>
          <template v-if="order.customer">
            <div class="detail">
              <p>
                <i class="fa fa-phone"></i>
                <span class="phone">{{order.customer.phone | phone}}</span>
                <i class="fa fa-id-card-o"></i>
                <span class="name">{{order.customer.name}}</span>
              </p>
              <p>
                <i class="fa fa-user"></i>
                <span>{{order.server}}</span>
                <i class="fa fa-clock-o"></i>
                <span>{{order.time | moment('MMM DD HH:mm')}}</span>
              </p>
              <p>
                <i class="fa fa-map-marker"></i>
                <span>{{order.customer.address}}</span>
              </p>
            </div>
          </template>
        </template>
      </div>
      <div class="bar">
        <template v-if="!isEmptyTicket">
          <span class="number">{{order.number}}</span>
          <span class="type">{{$t('type.' + order.type)}}</span>
          <span class="provider" v-show="order.source !== 'POS'">{{order.source}}</span>
          <span class="time">{{order.time | fromNow}}</span>
        </template>
      </div>
    </header>
    <div class="order" v-if="order.type === 'HIBACHI' && $route.name === 'Menu'">
      <v-touch class="inner" :style="scroll" @panup="move" @pandown="move" @panstart="panStart" @panend="panEnd">
        <group-item :items="order.content" :seats="seats" @update="setSeat"></group-item>
      </v-touch>
    </div>
    <div class="order" @click.self="resetHighlight" v-else-if="layout === 'order'">
      <v-touch class="inner" :style="scroll" @panup="move" @pandown="move" @panstart="panStart" @panend="panEnd" tag="ul">
        <list-item v-for="(item,index) in order.content" :data-category="item.category" :key="index" :item="item" :checkbox="todo"></list-item>
      </v-touch>
      <shortcut :items="shortcutItems" @add="add" v-if="customer._id && shortcutItems.length > 0 && offset >=0"></shortcut>
    </div>
    <div class="order" v-else>
      <v-touch class="inner" :style="scroll" @panup="move" @pandown="move" @panstart="panStart" @panend="panEnd" tag="ul">
        <list-item v-for="(item,index) in order.content" :data-category="item.category" :key="index" :item="item" :class="{print:!item.print,pending:item.pending}" @click.native="addToSpooler(item)"></list-item>
      </v-touch>
    </div>
    <div class="middle">
      <div class="fnWrap">
        <button class="fn fa fa-credit-card-alt" @click="openVault" :disabled="!customer._id"></button>
        <button class="fn" @click="separator" :disabled="$route.name !== 'Menu'">-----</button>
        <button class="fn fa fa-print" @click="directPrint" v-if="$route.name !=='Menu'"></button>
        <button class="fn fa fa-check-square-o" v-else @click="toggleTodoList" :disabled="!app.newTicket || order.type === 'HIBACHI'"></button>
        <button class="fn fa fa-keyboard-o" @click="openKeyboard" :disabled="$route.name !== 'Menu'"></button>
      </div>
      <div class="settle" @click="openConfig">
        <template v-if="payment.discount === 0">
          <p>
            <span class="text">{{$t("text.subtotal")}}:</span>
            <span class="value">{{payment.subtotal | decimal}}</span>
          </p>
          <p>
            <span class="text">{{$t("text.tax")}}:</span>
            <span class="value">{{(payment.tax + (payment.plasticTax | 0)) | decimal}}</span>
          </p>
          <p :class="{hidden:parseFloat(payment.tip) === 0}">
            <span class="text">{{$t("text.tip")}}:</span>
            <span class="value">{{payment.tip | decimal}}</span>
          </p>
          <p v-if="order.type === 'DELIVERY'">
            <span class="text">{{$t("text.deliveryFee")}}:</span>
            <span class="value">{{payment.delivery | decimal}}</span>
          </p>
          <p :class="{hidden:parseFloat(payment.gratuity) === 0}" v-else>
            <span class="text">{{$t("text.gratuity")}}:</span>
            <span class="value">{{payment.gratuity | decimal}}</span>
          </p>
        </template>
        <template v-else>
          <p>
            <span class="text">{{$t("text.sum")}}:</span>
            <span class="value">{{payment.total | decimal}}</span>
          </p>
          <p>
            <span class="text">{{$t("text.discount")}}:</span>
            <span class="value">- {{payment.discount | decimal}}</span>
          </p>
          <p :class="{hidden:parseFloat(payment.tip) === 0}">
            <span class="text">{{$t("text.tip")}}:</span>
            <span class="value">{{payment.tip | decimal}}</span>
          </p>
          <p v-if="order.type === 'DELIVERY'">
            <span class="text">{{$t("text.deliveryFee")}}:</span>
            <span class="value">{{payment.delivery | decimal}}</span>
          </p>
          <p :class="{hidden:parseFloat(payment.gratuity) === 0}" v-else>
            <span class="text">{{$t("text.gratuity")}}:</span>
            <span class="value">{{payment.gratuity | decimal}}</span>
          </p>
        </template>
        <p>
          <span class="text">{{$t("text.total")}}:</span>
          <span class="value">{{(payment.due + (payment.rounding || 0) + (payment.tip || 0) + payment.gratuity) | decimal}}</span>
        </p>
      </div>
    </div>
    <div :is="component" :init="componentData" @trigger="update"></div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import creditVault from "./component/creditVault";
import groupItem from "./component/groupItem";
import listItem from "./component/listItem";
import entry from "../menu/component/entry";
import shortcut from "./component/shortcut";
import dialoger from "../common/dialoger";
import config from "./component/config";

export default {
  components: {
    entry,
    config,
    shortcut,
    dialoger,
    listItem,
    groupItem,
    creditVault
  },
  props: ["layout", "group", "display", "seats", "seat"],
  data() {
    return {
      payment: {
        subtotal: 0,
        tax: 0,
        plasticTax: 0,
        total: 0, // subtotal + tax
        discount: 0,
        due: 0, // total + delivery - discount
        balance: 0, // due + surcharge
        paid: 0,
        remain: 0, // balance - paid
        tip: 0,
        gratuity: 0,
        delivery: 0,
        rounding: 0,
        log: []
      },
      lastDelta: 0,
      offset: 0,
      todo: false,
      component: null,
      componentData: null,
      prevsItems: [],
      spooler: []
    };
  },
  mounted() {
    this.$route.name === "Table" && this.order.content.length > 0
      ? (this.payment = this.order.payment)
      : this.calculator(this.order.content);

    this.$route.name === "Menu" && this.getShortCutItems();
  },
  methods: {
    resetHighlight() {
      let dom = document.querySelector("li.item.active");
      dom && dom.classList.remove("active");
      dom = document.querySelector(".sub.target");
      dom && dom.classList.remove("target");

      this.resetChoiceSet();
      this.resetPointer();
    },
    openConfig() {
      if (this.component === "config" || this.$route.name !== "Menu") return;

      const taxFree =
        typeof this.order.taxFree === "boolean" ? this.order.taxFree : false;
      const { deliveryFree = false, gratuityFree = false } = this.order;
      const { menuID } = this.config.display;
      const { seatOrder } = this.dinein;

      this.$p("config", {
        taxFree,
        deliveryFree,
        gratuityFree,
        menuID,
        seatOrder
      });
    },
    getShortCutItems() {
      this.customer._id &&
        this.$socket.emit(
          "[CUSTOMER] FAVORITE_ITEMS",
          this.customer._id,
          items => {
            this.prevsItems = items;
          }
        );
    },
    add(item) {
      this.pushToOrder(JSON.parse(JSON.stringify(item)));
      this.resetChoiceSet();
      this.resetPointer();
    },
    addToSpooler(item) {
      if (item.print) return;

      for (let i = 0; i < this.spooler.length; i++) {
        if (this.spooler[i].unique === item.unique) {
          item.pending = false;
          this.spooler.splice(i, 1);
          return;
        }
      }

      item.pending = true;
      this.spooler.push(item);
    },
    directPrint() {
      if (this.spooler.length === 0) return;

      let error = false;
      let sendItem = this.spooler.length;
      let order = JSON.parse(JSON.stringify(this.order));
      let items = order.content.map(item => {
        if (item.pending) item.print = true;
        return item;
      });

      const remain = items.filter(item => !item.print).length;

      order.content = this.spooler;
      order.schedule = +new Date();
      Printer.setTarget("Order").print(order);
      this.spooler.forEach(item => {
        item.print = true;
      });
      if (remain === 0) {
        Object.assign(this.order, { print: true });
      } else {
        const txt =
          remain > 0
            ? this.$t("dialog.remainPrintItem", remain)
            : this.$t("dialog.noRemainItem");

        const prompt = {
          type: "info",
          title: "dialog.itemSent",
          msg: ["dialog.printResult", sendItem, txt],
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        this.$dialog(prompt).then(() => this.$q());
      }
      this.spooler = [];
      this.$socket.emit("[UPDATE] INVOICE", this.order);
    },
    move(e) {
      this.offset = this.lastDelta + e.deltaY;
    },
    panStart(e) {
      let dom = document.querySelector(".order .scrollable");
      dom && dom.classList.remove("scrollable");

      document.querySelector("div.order").classList.add("block");
    },
    panEnd() {
      const dom = document.querySelector(".order .inner");
      dom && dom.classList.add("scrollable");

      let { top, bottom, height } = dom.getBoundingClientRect();
      let offset = this.$route.name === "Menu" ? 55 : 179;
      top -= offset;
      bottom -= offset;
      if (top > 0) {
        this.offset = 0;
      } else if (height < 350) {
        this.offset = 0;
      } else if (height > 350 && bottom < 335) {
        this.offset = -(height - 329);
      }
      this.lastDelta = this.offset;

      setTimeout(() => {
        const dom = document.querySelector("div.order");
        dom && dom.classList.remove("block");
      }, 150);
    },
    separator() {
      if (!this.item) return;

      const content = {
        zhCN: `----------`,
        usEN: `----------`,
        qty: 1,
        single: 0,
        price: "0.00",
        key: String().random()
      };

      this.setChoiceSet(content);
    },
    openKeyboard() {
      if (this.isEmptyTicket) return;
      this.component === "entry" ? (this.component = null) : this.$p("entry");
    },
    update(config) {
      this.setOrder(config);
      this.calculator(this.order.content);
    },
    openVault() {
      this.$socket.emit("[CUSTOMER] GET_CREDIT_CARD", this.customer._id, opts =>
        this.$p("creditVault", { opts })
      );
    },
    toggleTodoList() {
      this.todo = !this.todo;

      !this.todo && this.order.content.forEach(item => (item.pending = false));
    },
    calculator(items) {
      if (items.length === 0) {
        let delivery =
          this.ticket.type === "DELIVERY" &&
          this.store.delivery &&
          !this.order.deliveryFree
            ? parseFloat(this.store.deliveryCharge)
            : 0;

        this.payment = Object.assign(this.order.payment, {
          subtotal: 0,
          tax: 0,
          plasticTax: 0,
          total: 0, // subtotal + tax
          discount: 0,
          due: 0, // total + delivery - discount
          balance: 0, // due + gratuity + rounding
          paid: 0,
          remain: 0, // balance - paid
          tip: 0,
          gratuity: 0,
          delivery,
          rounding: 0,
          log: []
        });
        return;
      }

      const {
        type,
        guest,
        coupons,
        taxFree = false,
        deliveryFree = false,
        gratuityFree = false
      } = this.order;
      const { enable, rules } = this.dinein.surcharge;

      let delivery = 0;

      if (type === "DELIVERY" && !deliveryFree) {
        if (this.store.deliver.charge)
          delivery = parseFloat(this.store.deliver.baseFee);

        if (this.store.deliver.surcharge) {
          const duration = parseFloat(
            this.customer.distance.replace(/[^\d.]/g, "")
          );

          const distance = isNumber(duration) ? duration : 0;
          const surcharge = this.store.deliver.rules
            .sort((a, b) => a.distance < b.distance)
            .find(rule => rule.distance < distance);

          if (surcharge) {
            delivery += parseFloat(surcharge.fee);
          }
        }

        if (this.order.hasOwnProperty("$delivery"))
          delivery = this.order.$delivery;
      }

      let {
        tip = 0,
        gratuity = 0,
        paid = 0,
        rounding = 0,
        log = []
      } = this.order.payment;
      let subtotal = 0,
        tax = 0,
        discount = 0;

      items.forEach(item => {
        if (item.void) return;

        const single = parseFloat(item.single);
        const qty = item.qty || 1;
        const taxClass = this.tax.class[item.taxClass];

        let amount = toFixed(single * qty, 2);
        item.choiceSet.forEach(set => {
          const _price = parseFloat(set.single);

          if (_price !== 0) {
            const _qty = set.qty || 1;
            const _total = toFixed(_qty * _price, 2);
            amount = toFixed(amount + _total, 2);
          }
        });

        subtotal = toFixed(subtotal + amount, 2);

        if (!taxFree && taxClass.apply[type])
          tax += taxClass.rate / 100 * amount;
      });

      if (this.tax.deliveryTax) {
        /*
            is Delivery fee taxable?
            Find out default tax rate and apply to delivery charge
        */

        let taxRate = 0;
        Object.keys(this.tax.class).forEach(type => {
          this.tax.class[type].default === true &&
            (taxRate = this.tax.class[type].rate);
        });
        /**
         * Tax apply Before Discount (For Example: 10% Tax Rate, 20% Discount)
         *
         * Subtotal: 10.00
         * Tax:       1.00
         * Discount:  2.00
         * Total:     9.00
         * ------------------------------------------------------------------
         **/
        tax += delivery * taxRate / 100;
      }

      let plasticTax = 0;
      if (this.tax.plasticPenalty) {
        //calculate plastic bag penalty
        const { plasticBag = 1 } = this.order;
        const fine = isNumber(this.tax.plasticCharge)
          ? this.tax.plasticCharge
          : 0.5;
        plasticTax = toFixed(plasticBag * fine, 2);
      }

      if (type === "DINE_IN" && !gratuityFree && enable) {
        //find rule
        try {
          const { fee, percentage } = rules
            .sort((a, b) => a.guest < b.guest)
            .find(r => guest >= r.guest);
          gratuity = percentage ? toFixed(subtotal * fee / 100, 2) : fee;
        } catch (e) {}

        if (this.order.hasOwnProperty("$gratuity"))
          gratuity = this.order.$gratuity;
      } else {
        gratuity = 0;
      }

      if (coupons && coupons.length > 0) {
        let offer = 0;
        coupons.forEach(coupon => {
          const { reference } = coupon;

          switch (coupon.type) {
            // 'rebate':        '满减券',
            // 'giveaway':      '礼物券',
            // 'voucher':       '现金券',
            // 'discount':      '折扣券',
            case "rebate":
              offer += coupon.discount;
              break;
            case "voucher":
              offer += coupon.discount;
              break;
            case "discount":
              switch (coupon.apply) {
                case "category":
                  let _offer = 0;
                  this.order.content.forEach(item => {
                    if (reference.includes(item.category)) {
                      _offer += coupon.discount / 100 * item.single * item.qty;
                    }
                  });
                  offer += _offer;
                  break;
                case "item":
                  break;
                default:
                  offer += coupon.discount / 100 * subtotal;
              }
              break;
          }
        });
        discount += offer;
      }

      const total = subtotal + plasticTax + toFixed(tax, 2);
      const due = toFixed(Math.max(0, total + delivery - discount), 2);
      const _total = toFixed((due + gratuity) * 100, 2);

      switch (this.store.rounding) {
        case "quarter":
          rounding = toFixed((25 - _total % 25) / 100, 2);
          rounding = rounding === 0.25 ? 0 : rounding;
          break;
        case "roundUp":
          const near = Math.ceil(_total / 5) * 5;
          rounding = toFixed((near - _total) / 100, 2);
          rounding = rounding === 0.05 ? 0 : rounding;
          break;
        case "roundDown":
          rounding = -toFixed((_total % 5) / 100, 2);
          break;
        case "auto":
          if (_total % 5 < 3) {
            rounding =
              _total % 5 === 0
                ? 0
                : -toFixed((_total - Math.floor(_total / 5) * 5) / 100, 2);
          } else {
            rounding = toFixed((Math.ceil(_total / 5) * 5 - _total) / 100, 2);
          }
          break;
        default:
          rounding = 0;
      }

      const balance = due + gratuity + rounding;
      const remain = balance - paid;

      this.payment = Object.assign({}, this.payment, {
        subtotal: toFixed(subtotal, 2),
        tax: toFixed(tax, 2),
        plasticTax: toFixed(plasticTax, 2),
        total: toFixed(total, 2),
        discount: toFixed(discount, 2),
        due: toFixed(due, 2),
        balance: toFixed(balance, 2),
        paid: toFixed(paid, 2),
        remain: toFixed(remain, 2),
        tip: toFixed(tip, 2),
        gratuity: toFixed(gratuity, 2),
        delivery: toFixed(delivery, 2),
        rounding: toFixed(rounding, 2),
        log
      });

      Object.assign(this.order, { payment: this.payment });
    },
    setSeat(seat) {
      this.$emit("update", seat);
    },
    ...mapActions([
      "setChoiceSet",
      "setPointer",
      "resetPointer",
      "resetChoiceSet",
      "setChoiceSetTarget",
      "pushToOrder",
      "setOrder"
    ])
  },
  computed: {
    scroll() {
      return { transform: `translate3d(0,${this.offset}px,0)` };
    },
    undoneItems() {
      return this.order.content.map(i => !i.print).reduce((a, b) => a + b, 0);
    },
    shortcutItems() {
      const items = this.order.content.map(i => i._id);

      return this.prevsItems.filter(({ _id }) => !items.includes(_id));
    },
    // viewHistory() {
    //   return (
    //     this.$route.name === "Menu" &&
    //     this.order.content.length === 0 &&
    //     this.app.newTicket &&
    //     this.customer._id
    //   );
    // },
    ...mapGetters([
      "app",
      "tax",
      "store",
      "config",
      "dinein",
      "item",
      "order",
      "ticket",
      "language",
      "customer",
      "isEmptyTicket"
    ])
  },
  watch: {
    "order.content": {
      handler(items) {
        this.display
          ? (this.payment = this.order.payment)
          : this.calculator(items);
      },
      deep: true
    },
    customer() {
      this.calculator(this.order.content);
    },
    payment() {
      this.$nextTick(() => {
        const dom = document.querySelector(".order .inner");
        const target = document.querySelector(".item.active");
        const { height } = dom.getBoundingClientRect();

        height > 329 && dom.classList.add("scrollable");

        if (this.todo) return;

        if (target && height > 329) {
          const topDiff =
            target.getBoundingClientRect().top -
            dom.getBoundingClientRect().top;
          const offset = target.getBoundingClientRect().height - 329;
          this.offset = -(topDiff + offset);
        } else {
          this.offset = height > 329 ? 329 - height : 0;
        }
        this.lastDelta = this.offset;
      });
    }
  }
};
</script>

<style scoped>
header.simple {
  display: flex;
  flex-direction: row;
  height: 25px;
  line-height: 25px;
  border-bottom: 1px solid #ccc;
  background: #fafafa;
  color: #333;
}

header.info {
  background: #f5f5f5;
  color: #555;
  position: relative;
  height: 93px;
  display: flex;
  flex-direction: column;
}

.number {
  width: 40px;
  text-align: center;
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 16px;
}

.bar {
  height: 26px;
  background: #607d8b;
  display: flex;
  align-items: center;
  color: #fafafa;
  position: relative;
  text-shadow: 0 1px 1px #333;
}

.table {
  padding: 0 10px;
}

.simple .qty {
  width: 35px;
  text-align: center;
}

.simple .item {
  flex: 1;
}

.simple .price {
  width: 45px;
  text-align: center;
}

.order {
  height: 329px;
  width: 285px;
  background: rgba(238, 238, 238, 0.5);
  overflow: hidden;
  position: relative;
}

.scrollable {
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.mark {
  position: absolute;
  width: 100%;
  top: -9px;
  font-size: 10px;
  left: 0;
  height: 10px;
  line-height: 10px;
  text-align: center;
  font-weight: 700;
  color: #ff5722;
  white-space: nowrap;
}

.list .price {
  min-width: 45px;
  text-align: right;
  padding-right: 10px;
  vertical-align: top;
  font-size: initial;
}

.middle {
  display: flex;
  margin-top: 1px;
}

.fnWrap {
  width: 127px;
  padding-left: 3px;
}

.fn {
  background: linear-gradient(#fefefe, #cfd0d3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  text-shadow: 0 1px 1px #fff;
  width: 60px;
  height: 53px;
  text-align: center;
  padding: 16px 0;
  border-radius: 4px;
  border: none;
  font-family: fontAwesome;
  font-size: 18px;
  outline: none;
}

.fn:nth-child(n + 3) {
  margin-top: 4px;
}

.fn:active {
  background: linear-gradient(#e2e3e4, #aaadb4);
  color: #333;
}

.settle {
  width: 155px;
}

.settle p {
  border-bottom: 1px solid #eee;
  background: #fff;
  padding: 1px;
  display: flex;
}

.settle .text {
  width: 70px;
}

.settle .value {
  flex: 1;
  padding-right: 5px;
  overflow: hidden;
  vertical-align: text-top;
  text-overflow: ellipsis;
}

.settle .text,
.settle .value {
  text-align: right;
}

.settle p:last-child {
  font-weight: 700;
  font-size: larger;
  padding: 2.5px 0;
}

.time {
  flex: 1;
  text-align: right;
  padding: 0 10px;
  font-size: 14px;
}

.print .itemWrap {
  width: 200px;
}

.list.print.pending {
  background: #eceff1;
}

.list i {
  display: none;
  padding-right: 25px;
}

.showCategory .item {
  position: relative;
}

.showCategory .item:before {
  content: attr(data-category);
  position: absolute;
  top: 0px;
  right: 0px;
  font-size: 9px;
  font-family: "Microsoft YaHei";
  background: #009688;
  color: #fff;
  padding: 0 5px;
  -webkit-font-smoothing: antialiased;
  font-weight: lighter;
}

.driver {
  width: 275px;
  margin: 5px;
  height: 40px;
  font-size: initial;
}

.content > div {
  display: flex;
  flex-direction: column;
}

.detail i {
  color: rgba(0, 0, 0, 0.75);
  width: 15px;
  text-align: center;
}

.detail p {
  color: #3c3c3c;
}

.detail span {
  margin-right: 5px;
}

.content .time {
  position: absolute;
  right: 0px;
  bottom: 40px;
  color: #9e9e9e;
  font-family: "Agency FB";
  font-weight: bold;
}

.content .corner {
  position: absolute;
  right: 5px;
  bottom: 26px;
  color: #e06d40;
  font-size: 14px;
  font-style: italic;
  font-weight: bold;
}

.content .text {
  min-width: 65px;
  text-align: right;
  padding-right: 10px;
  color: #607d8b;
}

.content {
  flex: 1;
  padding: 6px 6px 0;
  background: #fff;
}

.phone {
  min-width: 108px;
  display: inline-block;
}

.name {
  margin-left: 10px;
  font-size: 14px;
  color: #009688;
}

.content .value {
  color: #676767;
}

.hidden span {
  visibility: hidden;
}

.provider {
  margin-left: 10px;
}

.block:after {
  content: " ";
  position: absolute;
  top: 0;
  left: 0;
  height: 329px;
  width: 285px;
}

.table {
  font-weight: bold;
  font-family: "Agency FB";
  font-size: 1.5em;
}

.inner.search {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: inherit;
  cursor: pointer;
  color: #3c3c3c;
  text-shadow: 0 1px 3px #fff;
  background: rgba(0, 0, 0, 0.1);
}

.inner.search h3 {
  margin-top: 15px;
}
</style>
