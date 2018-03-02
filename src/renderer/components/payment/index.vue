<template>
  <div class="popupMask center dark">
    <transition-group name="fadeIn" mode="out-in" appear>
      <div class="window" v-show="!component" :key="0">
        <header class="title">
          <span>{{$t('title.payment')}}</span>
          <div v-if="!payInFull && splits.length > 1" class="viewer">
            <label v-for="(split,index) in splits" :key="index">
              <input type="radio" name="split" :id="'split_'+index" :value="index" v-model="current" @change="switchInvoice(index)">
              <label :for="'split_'+index" class="tag">{{index + 1}}</label>
              <div class="preview" @click="preview(index)">
                <i class="fa fa-wpforms"></i>
                <span>{{$t('text.preview')}}</span>
              </div>
            </label>
          </div>
          <i class="fa fa-times" @click="init.reject(false)"></i>
        </header>
        <nav>
          <div class="paymentTypes">
            <div class="type">
              <input type="radio" v-model="paymentType" name="paymentType" value="CASH" id="CASH" @change="setPaymentType('CASH')">
              <label for="CASH">{{$t('type.CASH')}}</label>
            </div>
            <div class="type" v-if="!isThirdPartyPayment">
              <input type="radio" v-model="paymentType" name="paymentType" value="CREDIT" id="CREDIT" @change="setPaymentType('CREDIT')">
              <label for="CREDIT">{{$t('type.CREDIT')}}</label>
            </div>
            <div class="type" v-else>
              <input type="radio" v-model="paymentType" name="paymentType" value="THIRD" id="THIRD" @change="setPaymentType('THIRD')">
              <label for="THIRD">{{$t('type.THIRD')}}</label>
            </div>
            <div class="type" v-if="!order.hasOwnProperty('__vip__')">
              <input type="radio" v-model="paymentType" name="paymentType" value="GIFT" id="GIFT" @change="setPaymentType('GIFT',false)">
              <label for="GIFT">{{$t('type.GIFT')}}</label>
            </div>
            <div class="type" v-else>
              <input type="radio" v-model="paymentType" name="paymentType" value="GIFT" id="GIFT" @change="setPaymentType('GIFT',true)">
              <label for="GIFT">{{$t('type.VIP')}}</label>
            </div>
          </div>
          <div class="balanceDue" @dblclick="roundUp">
            <span class="for">{{$t('text.balanceDue')}}:</span>
            <div class="inner">
              <div class="due">
                <span class="symbol">$</span>
                <span v-if="!isThirdPartyPayment">{{payment.remain | decimal}}</span>
                <span v-else>{{payment.remain + payment.tip | decimal}}</span>
              </div>
              <div class="addition" v-show="payment.discount > 0">
                <span class="text">{{$t('text.includeDiscount')}}</span>
                <span class="value">({{payment.discount | decimal}})</span>
              </div>
              <div class="addition" v-show="payment.tip > 0">
                <span class="text">{{$t('text.tip')}}</span>
                <span class="value">{{payment.tip | decimal}}</span>
              </div>
              <div class="addition" v-show="payment.gratuity > 0">
                <span class="text">{{$t('text.includeGratuity')}}</span>
                <span class="value">({{payment.gratuity | decimal}})</span>
              </div>
            </div>
          </div>
          <div class="fn">
            <button class="btn" :disabled="!isThirdPartyPayment" @click="setTip">{{$t('button.setTip')}}</button>
            <button class="btn" @click="setDiscount" :disabled="!discountable || this.order.split">{{$t('button.setDiscount')}}</button>
            <button class="btn" @click="save">{{$t('button.save')}}</button>
          </div>
        </nav>
        <article>
          <section class="numpad">
            <div @click="input('7')" class="numKey">7</div>
            <div @click="input('8')" class="numKey">8</div>
            <div @click="input('9')" class="numKey">9</div>
            <div @click="input('4')" class="numKey">4</div>
            <div @click="input('5')" class="numKey">5</div>
            <div @click="input('6')" class="numKey">6</div>
            <div @click="input('1')" class="numKey">1</div>
            <div @click="input('2')" class="numKey">2</div>
            <div @click="input('3')" class="numKey">3</div>
            <div @click="input('0')" class="numKey">0</div>
            <div @click="input('00')" class="double numKey">00</div>
          </section>
          <section class="field">
            <template v-if="paymentType === 'CASH'">
              <div class="inputs">
                <div class="input" @click="setAnchor($event)" data-anchor="paid" data-format="money">
                  <span class="text">{{$t('text.paid')}}</span>
                  <span class="value">{{paid}}</span>
                </div>
                <div class="input" @click="setAnchor($event)" data-anchor="tip" data-format="money">
                  <span class="text">{{$t('text.tip')}}</span>
                  <span class="value">{{tip}}</span>
                </div>
                <div class="input">
                  <span class="text">{{$t('text.total')}}</span>
                  <span class="value">$ {{paidTotal | decimal}}</span>
                </div>
                <div class="input" @click="setAnchor($event)" data-anchor="evenly" data-format="number">
                  <span class="text">{{$t('text.separate')}}
                    <span class="people">$ {{(payment.balance / evenly) | decimal}}</span>
                  </span>
                  <span class="value">{{evenly}}</span>
                </div>
              </div>
              <aside class="padCtrl">
                <div @click="del">&#8592;</div>
                <div @click="clear">C</div>
                <div @click="charge" :class="{disabled:payment.remain <= 0 || paidTotal === 0}">&#8626;</div>
              </aside>
            </template>
            <template v-else-if="paymentType === 'CREDIT'">
              <div class="inputs">
                <div class="input" @click="setAnchor($event)" data-anchor="paid" data-format="money">
                  <span class="text">{{$t('text.paid')}}</span>
                  <span class="value">{{paid}}</span>
                </div>
                <div class="input" @click="setAnchor($event)" data-anchor="tip" data-format="money">
                  <span class="text">{{$t('text.tip')}}</span>
                  <span class="value">{{tip}}</span>
                </div>
                <div class="input" @click="setAnchor($event)" data-anchor="creditCard" data-format="number">
                  <div class="text">
                    <span class="f1">{{$t('card.number')}}</span>
                    <checkbox title="button.save" v-model="saveCard" v-if="(customer._id && !order.__creditPayment__)"></checkbox>
                  </div>
                  <input v-model="creditCard" v-mask="'#### #### #### ####'">
                </div>
                <div class="input" @click="setAnchor($event)" data-anchor="expiration" data-format="number">
                  <span class="text">{{$t('card.expirationDate')}}</span>
                  <input v-model="expiration" v-mask="'## / ##'">
                </div>
              </div>
              <aside class="padCtrl">
                <div @click="del">&#8592;</div>
                <div @click="clear">C</div>
                <div @click="charge">&#8626;</div>
              </aside>
            </template>
            <template v-else-if="paymentType === 'THIRD'">
              <div class="inputs">
                <div class="input" @click="setAnchor($event)" data-anchor="paid" data-format="money">
                  <span class="text">{{$t('text.paid')}}</span>
                  <span class="value">{{paid}}</span>
                </div>
                <div class="input" @click="setAnchor($event)" data-anchor="tip" data-format="money" v-if="!isThirdPartyPayment">
                  <span class="text">{{$t('text.tip')}}</span>
                  <span class="value">{{tip}}</span>
                </div>
                <div class="input disabled" v-else>
                  <span class="text">{{$t('text.tip')}}</span>
                  <span class="value">{{tip}}</span>
                </div>
                <div class="options">
                  <div class="type">
                    <input type="radio" v-model="thirdPartyType" value="Visa" id="Visa">
                    <label for="Visa">Visa</label>
                  </div>
                  <div class="type">
                    <input type="radio" v-model="thirdPartyType" value="Master" id="Master">
                    <label for="Master">Master</label>
                  </div>
                  <div class="type">
                    <input type="radio" v-model="thirdPartyType" value="Discover" id="Discover">
                    <label for="Discover">Discover</label>
                  </div>
                  <div class="type">
                    <input type="radio" v-model="thirdPartyType" value="AE" id="AE">
                    <label for="AE">AE</label>
                  </div>
                  <div class="type">
                    <input type="radio" v-model="thirdPartyType" value="GrubHub" id="GrubHub">
                    <label for="GrubHub">GrubHub</label>
                  </div>
                  <div class="type">
                    <input type="radio" v-model="thirdPartyType" value="Eat 24" id="Eat">
                    <label for="Eat">Eat 24</label>
                  </div>
                </div>
              </div>
              <aside class="padCtrl">
                <div @click="del">&#8592;</div>
                <div @click="clear">C</div>
                <div @click="charge">&#8626;</div>
              </aside>
            </template>
            <template v-else>
              <div class="inputs">
                <div class="input" @click="setAnchor($event)" data-anchor="paid" data-format="money">
                  <span class="text">{{$t('text.paid')}}</span>
                  <span class="value">{{paid}}</span>
                </div>
                <div class="input" @click="setAnchor($event)" data-anchor="tip" data-format="money">
                  <span class="text">{{$t('text.tip')}}</span>
                  <span class="value">{{tip}}</span>
                </div>
                <div class="input" @click="setAnchor($event)" data-anchor="giftCard" data-format="number" v-if="typeof giftCard === 'string'">
                  <span class="text">{{$t('card.number')}}</span>
                  <input v-model="giftCard" type="text" v-mask="'#### #### #### ####'">
                </div>
                <div class="input" v-else>
                  <span class="text">{{$t('card.number')}}</span>
                  <input v-model="giftCard.number" v-mask="'#### #### #### ####'">
                </div>
                <div class="input" v-if="typeof giftCard === 'string'">
                  <span class="text">{{$t('text.balance')}}</span>
                  <span class="value">0.00</span>
                </div>
                <div class="input" v-else>
                  <span class="text">{{$t('text.balance')}}</span>
                  <span class="value">$ {{giftCard.balance | decimal}}</span>
                </div>
              </div>
              <aside class="padCtrl">
                <div @click="del">&#8592;</div>
                <div @click="clear">C</div>
                <div @click="queryGiftCard" v-if="anchor === 'giftCard' && typeof giftCard === 'string'" :class="{disabled:giftCard.length < 19}">
                  <i class="fa fa-search"></i>
                </div>
                <div @click="charge" v-else>&#8626;</div>
              </aside>
            </template>
          </section>
          <section class="quickInput">
            <div class="numKey" v-for="(num,index) in quickInput" @click="setQuickInput(num)" :key="index">{{num}}</div>
          </section>
        </article>
      </div>
      <div :is="component" :init="componentData" :key="1"></div>
    </transition-group>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import checkbox from "../setting/common/checkbox";
import dialoger from "../common/dialoger";
import capture from "../giftcard/capture";
import ticket from "../common/ticket";
import creditCard from "./creditCard";
import discount from "./discount";
import thirdParty from "./mark";
import tiper from "./tiper";

export default {
  props: ["init"],
  components: {
    tiper,
    ticket,
    capture,
    dialoger,
    discount,
    checkbox,
    creditCard,
    thirdParty
  },
  computed: {
    isNewTicket() {
      return this.app.newTicket && this.$route.name === "Menu";
    },
    paidTotal() {
      const total = parseFloat(this.paid) + parseFloat(this.tip);
      return isNumber(total) ? total : 0;
    },
    ...mapGetters([
      "op",
      "app",
      "store",
      "ticket",
      "device",
      "station",
      "customer"
    ])
  },
  data() {
    return {
      releaseComponentLock: true,
      isThirdPartyPayment: true,
      thirdPartyType: null,
      discountable: false,
      componentData: null,
      component: null,
      order: null,
      paymentType: "CASH",
      payInFull: true,
      quickInput: [],
      creditCard: "",
      expiration: "",
      giftCard: "",
      anchor: "paid",
      saveCard: false,
      splits: [],
      tipped: 0,
      evenly: 1,
      current: 0,
      reset: true,
      paid: "0.00",
      tip: "0.00"
    };
  },
  created() {
    this.initialData()
      .then(this.checkComponentOccupy)
      .then(this.checkDate)
      .then(this.checkPermission)
      .then(this.checkSplit)
      .catch(this.initialFailed);
  },
  mounted() {
    this.order.source === "POS"
      ? this.setPaymentType(this.store.defaultPaymentType || "CASH")
      : this.init.hasOwnProperty("regular")
        ? this.setPaymentType(this.store.defaultPaymentType || "CASH")
        : this.setPaymentType("THIRD");
  },
  beforeDestroy() {
    this.releaseComponentLock &&
      this.$socket.emit("[COMPONENT] UNLOCK", {
        component: "payment",
        lock: this.order._id
      });
  },
  methods: {
    initialData() {
      return new Promise(next => {
        this.order = this.init.hasOwnProperty("order")
          ? JSON.parse(JSON.stringify(this.init.order))
          : JSON.parse(JSON.stringify(this.$store.getters.order));

        this.payment = this.order.payment;

        this.isThirdPartyPayment = this.init.hasOwnProperty("regular")
          ? false
          : !this.station.terminal || this.order.source !== "POS";

        if (
          this.station.terminal &&
          this.order.hasOwnProperty("__creditPayment__")
        ) {
          const { number, date, cvc } = this.order.__creditPayment__;
          this.creditCard = number;
          this.expiration = date;
        }

        if (this.order.hasOwnProperty("__vip__")) {
          this.giftCard = this.order.__vip__;
        }

        this.$socket.emit("[PAYMENT] CHECK", this.order._id, paid => {
          this.payment.remain = Math.max(0, this.payment.balance - paid)
            .toPrecision(12)
            .toFloat();

          this.tip = this.payment.tip.toFixed(2) || "0.00";

          next();
        });
      });
    },
    checkComponentOccupy() {
      return new Promise((next, stop) => {
        const data = {
          component: "payment",
          operator: this.op.name,
          lock: this.order._id,
          time: +new Date(),
          exp: +new Date() + 1000 * 120
        };

        this.$socket.emit("[COMPONENT] LOCK", data, lock => {
          lock ? stop({ error: "paymentPending", data }) : next();
        });
      });
    },
    checkDate() {
      return new Promise((next, stop) => {
        this.order.date === today() ? next() : stop({ error: "expired" });
      });
    },
    checkPermission() {
      return new Promise((next, stop) => {
        this.discountable = this.approval(this.op.modify, "discount");
        this.op.cashCtrl === "disable"
          ? stop({ error: "permissionDenied" })
          : next();
      });
    },
    checkSplit() {
      this.order.split ? this.askPayMode() : this.initialized();
    },
    askPayMode() {
      const prompt = {
        type: "question",
        title: "dialog.splitPayment",
        msg: "dialog.splitPaymentTip",
        buttons: [
          { text: "button.payBalanceDue", fn: "reject" },
          { text: "button.splitPay", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(this.payAsSplit)
        .catch(this.payAsWhole);
    },
    payAsSplit() {
      this.getSplitOrder()
        .then(this.switchInvoice)
        .catch(this.unableToPaySplit);
    },
    payAsWhole() {
      this.$q();
      this.payInFull = true;
      this.initialized();
    },
    getSplitOrder() {
      this.$q();
      return new Promise((next, stop) => {
        this.$socket.emit("[SPLIT] GET", this.order.children, splits => {
          this.splits = splits;
          this.payInFull = false;

          const remain = this.order.content.filter(i => !i.split).length;
          remain === 0 ? next() : stop(remain);
        });
      });
    },
    unableToPaySplit(remain) {
      const prompt = {
        type: "error",
        title: "dialog.cantExecute",
        msg: ["dialog.splitTicketItemRemain", remain],
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.$dialog(prompt).then(() => this.init.resolve());
    },
    initialized() {
      if (this.payment.remain > 0) {
        this.getQuickInput(this.payment.remain);
        this.poleDisplay(
          ["Balance Due:", ""],
          ["", this.payment.remain.toFixed(2)]
        );
      } else {
        this.exceptionTicketSettled();
      }
    },
    initialFailed({ error, data }) {
      switch (error) {
        case "paymentPending":
          this.releaseComponentLock = false;

          const current = +new Date();
          const exp = data.exp;
          const duration = exp - current;

          this.$dialog({
            title: "dialog.pending",
            msg: "dialog.pendingOrderAccessDenied",
            timeout: { duration, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => this.exit());
          break;
        case "permissionDenied":
          this.$dialog({
            type: "warning",
            title: "dialog.accessDenied",
            msg: "dialog.accessDeniedTip",
            timeout: { duration: 10000, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => this.exit());
          break;
        case "expired":
          this.$dialog({
            type: "error",
            title: "dialog.paymentFailed",
            msg: "dialog.canNotPayPrevTicket",
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => this.exit());
      }
    },
    setAnchor(target) {
      let dom = document.querySelector(".input.active");
      dom && dom.classList.remove("active");

      if (target instanceof Event) {
        this.anchor = target.currentTarget.dataset.anchor;
        target.currentTarget.classList.add("active");
        target.currentTarget.dataset.anchor === "tip"
          ? this.getQuickTip(this.payment.remain)
          : this.getQuickInput(this.payment.remain);
      } else {
        document
          .querySelector(`[data-anchor="${target}"]`)
          .classList.add("active");
      }

      this.reset = true;
    },
    del() {
      const { anchor, format } = document.querySelector(
        ".input.active"
      ).dataset;
      let val = this[anchor];

      switch (format) {
        case "money":
          this[anchor] = (val.slice(0, -1) / 10).toFixed(2);
          break;
        case "number":
          this[anchor] = val.length > 0 ? val.slice(0, -1) : val;
          break;
      }
      this.reset = false;
    },
    clear() {
      const { anchor, format } = document.querySelector(
        ".input.active"
      ).dataset;

      switch (format) {
        case "money":
          this[anchor] = "0.00";
          break;
        case "number":
          this[anchor] = "";
          break;
      }
      this.reset = true;
    },
    charge() {
      switch (this.paymentType) {
        case "CASH":
          this.checkCashDrawer()
            .then(this.chargeCash)
            .then(this.saveTransaction)
            .then(this.postToDatabase)
            .then(this.tenderCash)
            .then(this.checkBalance)
            .catch(this.payFailed);
          break;
        case "CREDIT":
          this.checkOverPay()
            .then(this.checkEntryInput)
            .then(this.chargeCreditCard)
            .then(this.saveTransaction)
            .then(this.postToDatabase)
            .then(this.askReceipt)
            .then(this.checkBalance)
            .catch(this.payFailed);
          break;
        case "THIRD":
          this.checkOverPay()
            .then(this.chargeThirdParty)
            .then(this.saveTransaction)
            .then(this.postToDatabase)
            .then(this.askReceipt)
            .then(this.checkBalance)
            .catch(this.payFailed);
          break;
        case "GIFT":
          this.swipeGiftCard()
            .then(this.checkGiftCard)
            .then(this.checkGiftCardBalance)
            .then(this.checkOverPay)
            .then(this.chargeGiftCard)
            .then(this.saveTransaction)
            .then(this.postToDatabase)
            .then(this.askReceipt)
            .then(this.checkBalance)
            .catch(this.payFailed);
          break;
      }
    },
    payFailed(error) {
      this.$log({
        eventID: 9009,
        type: "failure",
        data: this.order._id,
        note: `Failed to pay bill.\n\nError message:\n${JSON.stringify(error)}`
      });

      error === Object(error)
        ? this.$dialog(error).then(() => this.$q())
        : this.$q();
    },
    setPaymentType(type, vip) {
      this.paymentType = type;

      switch (type) {
        case "CASH":
          this.paid = "0.00";
          break;
        case "CREDIT":
        case "THIRD":
          this.paid = this.payment.remain.toFixed(2);
          break;
        case "GIFT":
          if (!vip) {
            this.giftCard = "";
            this.swipeGiftCard()
              .then(this.checkGiftCard)
              .catch(() => this.$q());
          }
          this.paid = this.payment.remain.toFixed(2);
          break;
      }

      this.tip = "0.00";
      this.thirdPartyType = null;

      this.setAnchor("paid");
      this.getQuickInput(this.payment.remain);
    },
    checkOverPay() {
      return new Promise(next => {
        const paidZeroError = {
          type: "error",
          title: "dialog.paymentFailed",
          msg: "dialog.canNotPayZeroAmount",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };
        if (this.paidTotal === 0) throw paidZeroError;
        if (this.paid > this.payment.remain) {
          const extra = toFixed(this.paid - this.payment.remain, 2);
          const content = {
            title: "dialog.paidAmountGreaterThanDue",
            msg: ["dialog.extraAmountSetAsTip", extra.toFixed(2)],
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.setTip", fn: "resolve" }
            ]
          };

          this.$dialog(content)
            .then(() => {
              this.paid = (this.paid - extra).toFixed(2);
              this.tip = extra.toFixed(2);

              this.$q();
              this.recalculatePayment();
              next(true);
            })
            .catch(() => {
              this.tip = "0.00";
              this.$q();
            });
        } else {
          next(false);
        }
      });
    },
    checkCashDrawer() {
      return new Promise((resolve, reject) => {
        const paidZeroError = {
          type: "error",
          title: "dialog.paymentFailed",
          msg: "dialog.canNotPayZeroAmount",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };
        const noCashDrawerError = {
          title: "dialog.cashDrawerUnavailable",
          msg: "dialog.cashDrawerUnavailableTip",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        if (this.paidTotal === 0) throw paidZeroError;

        this.station.cashDrawer.enable || this.op.cashCtrl === "staffBank"
          ? resolve()
          : reject(noCashDrawerError);
      });
    },
    checkEntryInput() {
      return new Promise((resolve, reject) => {
        const number = this.creditCard.replace(/[^0-9\.]+/g, "");
        const date = this.expiration.replace(/[^0-9\.]+/g, "");
        const today = moment().format("MMYY");

        const tip = parseFloat(this.tip);

        const cardLengthError = {
          type: "error",
          title: "dialog.invalidCreditCard",
          msg: "dialog.creditCardLengthIncorrect",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };
        const expError = {
          type: "error",
          title: "dialog.invalidCreditCard",
          msg: "dialog.expirationDateIncorrect",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        if (number.length > 0 && number.length < 15) throw cardLengthError;
        if (date.length > 0 && date.length !== 4 && date < today)
          throw expError;

        resolve({
          creditCard: { number, date },
          amount: this.paid,
          tip
        });
      });
    },
    chargeCash() {
      return new Promise(next => {
        this.op.cashCtrl === "enable" && Printer.openCashDrawer();
        next();
      });
    },
    chargeCreditCard(card) {
      return new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, card };
        this.component = "creditCard";
      });
    },
    swipeGiftCard(number) {
      return new Promise((resolve, reject) => {
        if (typeof this.giftCard === "string") {
          this.componentData = number
            ? { resolve, reject, number }
            : { resolve, reject };
          this.component = "capture";
        } else {
          resolve(this.giftCard);
        }
      });
    },
    queryGiftCard() {
      this.swipeGiftCard(this.giftCard.replace(/\D/g, ""))
        .then(this.checkGiftCard)
        .catch(() => this.$q());
    },
    checkGiftCard(card) {
      this.$q();
      return new Promise((resolve, reject) => {
        if (typeof card === "object") {
          this.giftCard = card;
          this.setAnchor("paid");
          this.$forceUpdate();
          resolve();
        } else {
          const prompt = {
            type: "error",
            title: "dialog.giftCardActivation",
            msg: ["dialog.giftCardNotActivated", card],
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          this.$dialog(prompt).then(() => reject());
        }
      });
    },
    chargeGiftCard() {
      return new Promise((resolve, reject) => {
        const paid = parseFloat(this.paid);
        this.giftCard.balance = toFixed(this.giftCard.balance - paid, 2);

        const log = {
          balance: this.giftCard.balance,
          change: -paid,
          date: today(),
          time: +new Date(),
          type: "Purchase",
          cashier: this.op.name,
          number: this.giftCard.number.replace(/\D/g, ""),
          order: {
            _id: this.order._id,
            number: this.order.number || this.ticket.number,
            type: this.order.type || this.ticket.type
          }
        };

        this.$socket.emit("[GIFTCARD] ACTIVITY", log, _id => resolve(_id));
      });
    },
    chargeThirdParty() {
      return new Promise(charge => {
        if (this.thirdPartyType) {
          charge(this.thirdPartyType);
        } else {
          new Promise((resolve, reject) => {
            this.componentData = { resolve, reject, callback: true };
            this.component = "thirdParty";
          })
            .then(charge)
            .catch(() => this.$q());
        }
      });
    },
    saveTransaction(data) {
      const type =
        this.paymentType === "THIRD" ? this.thirdPartyType : this.paymentType;
      const cashDrawer =
        this.op.cashCtrl === "staffBank"
          ? this.op.name
          : this.station.cashDrawer.name;

      this.poleDisplay(`PAID by ${type}`, "THANK YOU");

      const actual = Math.min(this.paid, this.payment.remain)
        .toPrecision(12)
        .toFloat();
      const paid = (parseFloat(this.paid) + parseFloat(this.tip))
        .toPrecision(12)
        .toFloat();

      const tip = parseFloat(this.tip);

      const _id = ObjectId();
      const date = today();
      const time = +new Date();
      const order = this.order._id;
      const split = this.payInFull ? null : this.splits[this.current]._id;
      const ticket = {
        number: this.order.number || this.ticket.number,
        type: this.order.type || this.ticket.type
      };

      let change, transaction;

      return new Promise((resolve, reject) => {
        switch (this.paymentType) {
          case "CASH":
            this.currentTender = change = Math.max(
              0,
              toFixed(this.paid - this.payment.remain, 2)
            );
            transaction = {
              _id,
              date,
              time,
              order,
              split,
              ticket,
              paid,
              change,
              tip,
              actual,
              cashier: this.op.name,
              server: this.order.server || this.op.name,
              cashDrawer,
              station: this.station.alias,
              type: "CASH",
              for: "Order",
              subType: null,
              credential: null,
              lfd: null
            };

            const activity = {
              type: "CASHFLOW",
              inflow: paid,
              outflow: change,
              time,
              ticket,
              operator: this.op.name
            };

            this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });
            break;
          case "CREDIT":
            Object.assign(data, {
              order: {
                _id: order,
                type: this.order.type || this.ticket.type,
                number: this.order.number || this.ticket.number,
                cashier: this.op.name,
                server: this.order.server || this.op.name
              },
              for: "Order",
              date,
              _id: ObjectId()
            });

            transaction = {
              _id,
              date,
              time,
              order,
              split,
              ticket,
              paid,
              tip,
              actual,
              change: 0,
              cashier: this.op.name,
              server: this.order.server || this.op.name,
              cashDrawer,
              station: this.station.alias,
              terminal: this.station.terminal,
              type: "CREDIT",
              for: "Order",
              subType: data.account.type,
              credential: data._id,
              lfd: data.account.number
            };

            this.$socket.emit("[TERMINAL] SAVE", data, content =>
              this.$socket.emit(
                "[TERMINAL] CONFIG",
                this.station.terminal,
                config => {
                  config.print && Printer.printCreditCard(content);
                }
              )
            );

            delete this.order.__creditPayment__;

            //save credit card
            if (this.saveCard) {
              const { _id } = this.customer;
              const card = [
                this.creditCard.replace(" ", ""),
                this.expiration,
                ""
              ];
              const key = this.creditCard.split(" ").last();
              this.encrypt(card, key).then(cipher => {
                this.$socket.emit(
                  "[CUSTOMER] SAVE_CREDIT_CARD",
                  _id,
                  {
                    card: [
                      this.creditCard.replace(" ", "").slice(0, 8),
                      this.expiration,
                      ""
                    ],
                    cipher,
                    lastUse: +new Date()
                  },
                  () => {}
                );
              });
            }
            break;
          case "THIRD":
            transaction = {
              _id,
              date,
              time,
              order,
              split,
              ticket,
              paid,
              change: 0,
              tip,
              actual,
              cashier: this.op.name,
              server: this.order.server || this.op.name,
              cashDrawer,
              station: this.station.alias,
              type: "THIRD",
              for: "Order",
              subType: this.thirdPartyType || data,
              credential: null,
              lfd: null
            };
            break;
          case "GIFT":
            transaction = {
              _id,
              date,
              time,
              order,
              split,
              ticket,
              paid,
              change: 0,
              tip,
              actual,
              cashier: this.op.name,
              server: this.order.server || this.op.name,
              cashDrawer,
              station: this.station.alias,
              type: "GIFT",
              for: "Order",
              subType: null,
              credential: data,
              lfd: this.giftCard.number.replace(/\D/g, "").slice(12, 16)
            };
            break;
        }
        !this.payInFull &&
          Object.assign(transaction, { splitPayment: this.current });
        this.payment.log.push(transaction);
        this.$socket.emit("[TRANSACTION] SAVE", transaction);

        this.payment.paid += parseFloat(actual);
        this.recalculatePayment();

        delete this.order.__vip__;

        resolve();
      });
    },
    postToDatabase() {
      return new Promise((resolve, reject) => {
        const settled = this.isTicketSettled();

        if (this.isNewTicket) {
          Object.assign(this.order, {
            payment: this.payment,
            customer: JSON.parse(JSON.stringify(this.customer)),
            type: this.ticket.type,
            station: this.station.alias,
            cashier: this.op.name,
            modify: 0,
            status: 1,
            date: today(),
            time: +new Date(),
            settled
          });
          this.$socket.emit("[SAVE] INVOICE", this.order, false, order => {
            this.order = order;
            resolve();
          });
        } else {
          let order = this.payInFull ? this.order : this.splits[this.current];
          Object.assign(order, {
            payment: this.payment,
            cashier: this.op.name,
            print: true,
            settled
          });

          this.$socket.emit("[UPDATE] INVOICE", order, false);
          resolve();
        }
      });
    },
    isTicketSettled() {
      if (this.payInFull) {
        return this.payment.remain === 0;
      } else {
        return this.splits.every(order => order.payment.remain === 0);
      }
    },
    tenderCash() {
      return new Promise(next => {
        const paid = this.paidTotal.toFixed(2);
        const tender = this.currentTender.toFixed(2);

        this.poleDisplay(["Paid CASH", paid], ["Change Due", tender]);

        const tenderWithoutDialog = {
          title: ["dialog.cashChange", tender],
          msg: ["dialog.cashChangeTip", paid],
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        const tenderWithDialog = {
          title: ["dialog.cashChange", tender],
          msg: ["dialog.cashChangeTip", paid],
          buttons: [
            { text: "button.noReceipt", fn: "reject" },
            { text: "button.printReceipt", fn: "resolve" }
          ]
        };

        if (this.currentTender > 0) {
          switch (this.store.receipt) {
            case "always":
              this.printCurrentReceipt();
              next();
              break;
            case "never":
              this.$dialog(tenderWithoutDialog).then(() => {
                this.$q();
                next();
              });
              break;
            default:
              this.$dialog(tenderWithDialog)
                .then(() => {
                  this.printCurrentReceipt();
                  next();
                })
                .catch(() => {
                  this.$q();
                  next();
                });
          }
        } else {
          this.askReceipt().then(() => next());
        }
      });
    },
    askReceipt() {
      return new Promise(next => {
        const prompt = {
          type: "question",
          title: "dialog.printReceiptConfirm",
          msg: "dialog.printReceiptConfirmTip",
          buttons: [
            { text: "button.noReceipt", fn: "reject" },
            { text: "button.printReceipt", fn: "resolve" }
          ]
        };

        switch (this.store.receipt) {
          case "never":
            next();
            break;
          case "always":
            this.printCurrentReceipt();
            next();
            break;
          default:
            this.$dialog(prompt)
              .then(() => {
                this.printCurrentReceipt();
                next();
              })
              .catch(() => next());
        }
      });
    },
    printCurrentReceipt() {
      if (this.payInFull) {
        Printer.setTarget("Receipt").print(this.order, true);
      } else {
        const order = Object.assign({}, this.splits[this.current], {
          payment: this.payment
        });
        Printer.setTarget("Receipt").print(order, true);
      }
    },
    checkBalance() {
      this.$q();
      if (this.payInFull) {
        this.$socket.emit("[PAYMENT] CHECK", this.order._id, paid => {
          const remain = Math.max(0, this.payment.balance - paid)
            .toPrecision(12)
            .toFloat();

          if (remain > 0) {
            this.$q();
            this.setPaymentType("CASH");
            this.poleDisplay("Balance Due:", `$ ${remain.toFixed(2)}`);
          } else {
            this.poleDisplay("Thank You", "Please Come Again!");
            if (this.isNewTicket) {
              Printer.setTarget("Order").print(this.order);
              this.$socket.emit("[UPDATE] INVOICE", this.order, true);
            }
            this.exitPayment();
          }
        });
      } else {
        this.switchInvoice();
      }
    },
    checkGiftCardBalance() {
      return new Promise((resolve, reject) => {
        const noBalanceError = {
          type: "error",
          title: "dialog.paymentFailed",
          msg: "dialog.insufficientAmount",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };
        const insufficientError = {
          type: "warning",
          title: "dialog.paymentFailed",
          msg: "dialog.insufficientAmount",
          buttons: [
            { text: "button.cancel", fn: "reject" },
            { text: "button.chargeRemain", fn: "resolve" }
          ]
        };

        if (toFixed(this.giftCard.balance.toFixed(2), 2) <= 0)
          throw noBalanceError;
        if (this.giftCard.balance < this.paid) {
          this.$dialog(insufficientError)
            .then(() => {
              this.$q();
              this.paid = this.giftCard.balance.toFixed(2);
              resolve();
            })
            .catch(() => {
              this.$q();
              reject();
            });
        } else {
          resolve();
        }
      });
    },
    switchInvoice(index) {
      if (!isNumber(index))
        index = this.splits.findIndex(order => order.payment.remain > 0);
      if (index === -1) {
        this.settled();
      } else {
        this.current = index;
        this.payment = Object.assign({}, this.splits[index].payment);
        this.setPaymentType("CASH");
        this.getQuickInput(this.payment.remain);
        this.$nextTick(() => {
          this.paid = "0.00";
          this.tip = "0.00";
        });
      }
    },
    input(val) {
      const { anchor, format } = document.querySelector(
        ".input.active"
      ).dataset;
      let value = this[anchor];

      switch (format) {
        case "money":
          value = this.reset ? val : (value * 100).toFixed(0) + val;
          this[anchor] = (value / 100).toFixed(2);
          break;
        case "number":
          value = this.reset ? val : value + val;
          this[anchor] = value;
          break;
      }

      this.reset = false;
    },
    setDiscount() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, payment: this.payment };
        this.component = "discount";
      })
        .then(({ discount, coupon }) => {
          if (coupon.type === "discount")
            discount = toFixed(this.payment.subtotal * discount / 100, 2);

          Object.assign(this.payment, { discount });

          let coupons = this.order.coupons.filter(
            coupon => coupon.code !== "UnitedPOS Inc"
          );

          discount > 0 && coupons.push(coupon);
          this.order.coupons = coupons;

          this.recalculatePayment();
          this.paid = "0.00";
          this.poleDisplay(
            ["Discount:", -discount.toFixed(2)],
            ["Due:", this.payment.remain.toFixed(2)]
          );
          this.$q();
        })
        .catch(() => this.$q());
    },
    preview(index) {
      const ticket = JSON.parse(JSON.stringify(this.splits[index]));

      ticket.print = false;
      ticket.content.forEach(item => (item.print = false));

      this.$p("ticket", { ticket, exit: true });
    },
    roundUp() {
      const rounded = Math.ceil(this.payment.remain);

      this.payment.gratuity = toFixed(rounded - this.payment.remain, 2);
      this.paid = "0.00";
      this.tip = "0.00";

      this.recalculatePayment();
    },
    setQuickInput(val) {
      const { anchor } = document.querySelector(".input.active").dataset;

      if (anchor === "tip") {
        this.setAnchor("paid");
        this.paid = "0.00";
        this.tip = val.toFixed(2);
        this.getQuickInput(this.payment.remain);
      } else {
        this.paid = val.toFixed(2);
      }
      this.reset = true;
    },
    getQuickInput(amount) {
      const preset = [
        1,
        2,
        3,
        4,
        5,
        10,
        15,
        20,
        25,
        30,
        35,
        40,
        45,
        50,
        60,
        70,
        80,
        100,
        120,
        140,
        150,
        200,
        300,
        350,
        400,
        450,
        500,
        600,
        700,
        800,
        900,
        1000,
        1100,
        1500,
        2000,
        3000,
        4000,
        5000
      ];
      const round = Math.ceil(isNumber(amount) ? toFixed(amount, 2) : 0);

      let array = [];

      array.push(amount.toFixed(2));
      amount === round ? array.push(round + 1) : array.push(round);

      const index = preset.findIndex(i => i > round);

      array.push(preset.slice(index, index + 6));
      this.quickInput = [].concat.apply([], array);
    },
    getQuickTip(amount) {
      const base = (Math.ceil(toFixed(amount, 2)) - amount).toFixed(2);

      let preset = [];

      preset.push(base);
      preset.push((parseFloat(base) + 1).toFixed(2));
      preset.push("1.00");
      preset.push("2.00");
      preset.push("3.00");
      preset.push("5.00");
      preset.push((amount * 0.15).toFixed(2));
      preset.push((amount * 0.2).toFixed(2));
      this.quickInput = preset;
    },
    recalculatePayment() {
      const {
        subtotal,
        tax,
        discount,
        paid,
        delivery,
        tip,
        gratuity,
        rounding
      } = this.payment;

      const total = toFixed(subtotal + tax, 2);
      const due = toFixed(total + delivery - discount, 2);
      const surcharge = toFixed(tip + gratuity, 2);
      const balance = toFixed(due + gratuity + rounding, 2);
      const remain = Math.max(0, toFixed(balance - paid, 2));

      this.payment = Object.assign({}, this.payment, {
        total,
        due,
        tip,
        discount,
        surcharge,
        balance,
        remain
      });
      this.getQuickInput(remain);
    },
    poleDisplay(line1, line2) {
      if (!this.device.poleDisplay) return;
      poleDisplay.write("\f");
      poleDisplay.write(line(line1, line2));
    },
    encrypt(plaintext, key) {
      return new Promise(next =>
        this.$socket.emit("[CRYPT] ENCRYPT", { plaintext, key }, result =>
          next(result)
        )
      );
    },
    settled() {
      this.$socket.emit("[UPDATE] INVOICE", this.order, false);
      this.exitPayment();
    },
    save() {
      if (this.isNewTicket) {
        this.setOrder(Object.assign(this.order, { payment: this.payment }));
        this.exit();
      } else {
        let order = this.payInFull ? this.order : this.splits[this.current];
        Object.assign(order, { payment: this.payment });
        this.$socket.emit("[UPDATE] INVOICE", order, false);
        this.exit();
      }
    },
    setTip() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "tiper";
      })
        .then(tip => {
          this.tip = tip.toFixed(2);
          Object.assign(this.payment, { tip });
          this.setOrder(Object.assign(this.order, { payment: this.payment }));
          this.$q();
        })
        .catch(() => this.$q());
    },
    exit() {
      this.init.reject();
    },
    exitPayment() {
      switch (this.$route.name) {
        case "Menu":
          const { done } = this.station.autoLock;
          if (this.ticket.type === "BUFFET") {
            this.resetMenu();
            this.exit();
          } else {
            if (done) {
              this.setOp(null);
              this.resetAll();
              this.$router.push({ path: "/main/lock" });
            } else {
              this.resetAll();
              this.$router.push({ path: "/main" });
            }
          }
          break;
        case "Table":
          this.resetAll();
        case "History":
        case "PickupList":
          this.exit();
          break;
        default:
          this.exit();
      }
    },
    exceptionTicketSettled() {
      const prompt = {
        title: "dialog.ticketSettled",
        msg: "dialog.ticketSettledTip",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.markAsPaid", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => {
          this.order.settled = true;
          this.$socket.emit("[UPDATE] INVOICE", this.order, false);
          this.exit();
        })
        .catch(() => this.exit());
    },
    ...mapActions(["setOp", "setOrder", "resetAll", "resetMenu"])
  }
};
</script>

<style scoped>
.window {
  width: 918px;
}

nav {
  display: flex;
  margin-left: 4px;
}

.viewer {
  display: inline-flex;
  margin-left: 10px;
}

.viewer input:checked + label {
  background: #3f51b5;
}

.viewer .tag {
  width: 35px;
  justify-content: center;
  display: flex;
  margin-right: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
  border-radius: 4px;
  background: #51aef5;
}

.viewer label {
  position: relative;
}

.viewer input:checked ~ .preview {
  animation: preview 0.5s 0.2s ease-out forwards;
}

.preview {
  visibility: hidden;
  position: absolute;
  bottom: 40px;
  left: -18px;
  width: 75px;
  height: 70px;
  background-color: #555;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  z-index: 1;
  opacity: 0;
  display: flex;
  flex-direction: column;
}

.preview:after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.preview span {
  font-size: 16px;
}

.preview i {
  font-size: 28px;
  color: #eeeeee;
  padding: 8px 2px;
}

.paymentTypes {
  display: flex;
  height: 60px;
}

.paymentTypes label {
  display: block;
  width: 97px;
  margin: 4px 4px 4px 0;
  background: #fff;
  border: 2px solid #e0e0e0;
  position: relative;
  text-align: center;
  line-height: 49px;
  border-radius: 4px;
  color: #bdbdbd;
}

.options {
  display: flex;
  flex-wrap: wrap;
}

.options label {
  display: flex;
  width: 131px;
  height: 50px;
  margin: 2px;
  justify-content: center;
  background: #fff;
  border: 2px solid #e0e0e0;
  position: relative;
  text-align: center;
  align-items: center;
  border-radius: 4px;
  color: #bdbdbd;
}

.options label:after {
  bottom: 0px !important;
}

.type input:checked + label {
  background: #66bb6a;
  color: #fafafa;
  border: 2px solid #009688;
  text-shadow: 0 2px 1px rgba(0, 0, 0, 0.5);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.type input:checked + label:before {
  position: absolute;
  content: " ";
  width: 23px;
  height: 15px;
  background: #009688;
  bottom: 0;
  right: 0;
  border-top-left-radius: 4px;
}

.type input:checked + label:after {
  position: absolute;
  content: "\f00c";
  font-family: fontAwesome;
  bottom: -17px;
  right: 3px;
}

.balanceDue {
  width: 275px;
  height: 42px;
  margin: 10px 0 4px;
  border-radius: 4px;
  border: 2px solid #607d8b;
  color: #3c3c3c;
  position: relative;
}

.balanceDue .for {
  position: absolute;
  top: -12px;
  background: #f5f5f5;
  font-weight: 700;
  left: 10px;
  padding: 0 5px;
}

.balanceDue .inner {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 5px;
}

.due {
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 36px;
}

.symbol {
  font-size: 26px;
  margin-right: 1px;
  font-weight: normal;
  color: #009688;
  text-shadow: 0 1px 1px #ddd;
}

.addition {
  display: flex;
  flex-direction: column;
  margin-left: 5px;
  text-align: center;
  color: #ff9800;
  font-size: 14px;
  text-align: center;
}

.addition .text {
  font-size: 14px;
}

.fn {
  margin-left: 4px;
}

.fn .btn {
  height: 48px;
  margin: 6px 2px;
  width: 97px;
}

article {
  display: flex;
  margin-left: 4px;
}

section.numpad {
  display: flex;
  flex-wrap: wrap;
  width: 315px;
}

section.field {
  display: flex;
  width: 386px;
}

.input {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 279px;
  height: 83px;
  border-radius: 2px;
  margin-bottom: 6px;
  color: #4c4b4b;
  box-shadow: var(--shadow);
}
.input.active {
  background: #5c6bc0;
  color: #fff;
  text-shadow: 0 1px 1px #444;
}
.input .text {
  padding: 7px 10px;
  font-size: 22px;
  display: flex;
  align-items: center;
}
.input input {
  border: none;
  background: none;
  outline: none;
  font-size: 28px;
  text-align: right;
  padding-right: 10px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-family: "Agency FB";
  font-weight: bold;
  color: #3c3c3c;
}
.input.active input {
  color: #fff;
}
.people {
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 17px;
  color: #fafafa;
  padding: 1px 8px;
  text-shadow: 0 1px 1px #333;
  background: #4caf50;
  border-radius: 4px;
  margin-left: 10px;
  box-shadow: 0 1px 1px #607d8b;
}

.input .value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  font-size: 28px;
  font-family: "Agency FB";
  font-weight: bold;
}

aside.padCtrl {
  text-align: center;
  margin-left: 5px;
}

section.quickInput {
  margin-left: 3px;
  display: flex;
  flex-wrap: wrap;
  height: 353px;
  width: 210px;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}

@keyframes preview {
  from {
    opacity: 0;
    transform: translate3d(0, 10px, 0);
  }
  to {
    opacity: 1;
    visibility: visible;
    transform: translate3d(0, 0, 0);
  }
}
</style>