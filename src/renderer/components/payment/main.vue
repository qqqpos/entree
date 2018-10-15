<template>
    <div class="popupMask center dark">
        <transition-group name="fadeIn" mode="out-in" appear>
            <div class="editor" v-show="!component" :key="0">
                <header class="relative">
                    <div>
                        <h5>{{'# ' + invoice.number}}<span class="orderType">&nbsp;&nbsp;{{$t('type.' + invoice.type)}}</span></h5>
                        <h3>{{$t('title.payment')}}</h3>
                    </div>
                    <splitor :tickets="splits" v-model="splitIndex" @preview="previewTicket" @switch="switchInvoice" :disable="payWhole"></splitor>
                    <i class="fa fa-times exit clickable" @click="safeExit"></i>
                </header>
                <div class="banner"></div>
                <div class="wrap">
                    <section class="left">
                        <payment-option @change="changePaymentType" v-model="paymentType" :external="isThirdPartyPayment" :giftcard="store.giftcard.enable" :terminal="$store.getters.station.terminal"></payment-option>
                        <number-input @input="setInput"></number-input>
                    </section>
                    <section class="right">
                        <div class="row">
                            <balance-display :payment="order.payment" :paid="paidTip"></balance-display>
                            <div class="functions">
                                <button class="btn" v-press="gratuityToTip" @click.stop="openTipComponent">{{$t('button.setTip')}}</button>
                                <button class="btn" @click="openDiscountComponent">{{$t('button.setDiscount')}}</button>
                                <button class="btn" @click="save">{{$t('button.save')}}</button>
                            </div>
                        </div>
                        <div class="row">
                            <payment-input 
                                :anchor="anchor"
                                :type="paymentType" 
                                :changeDue="changeDue" 
                                :paid="paid" 
                                :tip="tip" 
                                :creditCard.sync="creditCard" 
                                :expDate.sync="expDate" 
                                :split="splitTarget" 
                                :splitable="invoice.split" 
                                :external="externalPaymentType"
                                :source="invoice.source"
                                :customer="invoice.customer._id"
                                :giftCard="giftCard"
                                @updateSplit="setSplit" @excSplit="splitTicketDialog" 
                                @changeAnchor="setAnchor" @delete="deleteInput" 
                                @clear="clearInput" @charge="charge"
                                @updateExternalType="setExternalType"
                                @apply="setCreditCard"
                                @query="queryGiftCard"></payment-input>
                            <shortcut :value="shortcutValue" @input="setPaid"></shortcut>
                        </div>
                    </section>
                </div>
            </div>
            <div :is="component" :init="componentData" :key="1"></div>
        </transition-group>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import paymentInput from "./component/paymentInput";
import balanceDisplay from "./helper/balanceDisplay";
import paymentOption from "./helper/paymentTypes";
import numberInput from "./helper/numberInput";
import inputModule from "../component/inputer";
import dialogModule from "../common/dialog";
import unlockModule from "../common/unlock";
import shortcut from "./component/shortcut";
import creditCardModule from "./creditCard";
import capture from "../giftcard/capture";
import preview from "../common/ticket";
import splitor from "./helper/splitor";
import thirdParty from "./mark";

export default {
  props: ["init"],
  components: {
    creditCardModule,
    balanceDisplay,
    paymentOption,
    dialogModule,
    paymentInput,
    unlockModule,
    inputModule,
    numberInput,
    thirdParty,
    shortcut,
    capture,
    splitor,
    preview
  },
  data() {
    return {
      invoice: {},
      order: {},
      splits: [],
      splitIndex: 0,
      splitTarget: 1,
      payWhole: true,
      paid: "0.00",
      tip: "0.00",
      paidTip: 0,
      anchor: "paid",
      creditCard: "",
      expDate: "",
      paymentType: "CASH",
      giftCard: "",
      externalPaymentType: null,
      willTicketNumberUpdate: false,
      willResetFieldValue: true,
      isThirdPartyPayment: false,
      releaseComponentLock: true,
      componentData: null,
      component: null,
      payment: {},
      defaults: {}
    };
  },
  computed: {
    isNewTicket() {
      return this.app.newTicket && this.$route.name === "Menu";
    },
    changeDue() {
      if (this.order.payment && this.order.payment.remain) {
        const tender =
          this.order.payment.remain +
          parseFloat(this.tip) -
          parseFloat(this.paid);

        return tender > 0 ? 0 : Math.abs(tender);
      } else {
        return 0;
      }
    },
    shortcutValue() {
      if (this.order && this.order.payment && this.order.payment.remain) {
        return this.order.payment.remain;
      } else if (this.invoice && this.invoice.payment.remain) {
        return this.invoice.payment.remain;
      } else {
        return 0;
      }
    },
    ...mapGetters([
      "op",
      "tax",
      "app",
      "store",
      "config",
      "ticket",
      "device",
      "station",
      "customer",
      "dineInOpt"
    ])
  },
  created() {
    this.checkPaymentMethod()
      .then(this.initialData)
      .then(this.checkComponentOccupy)
      .then(this.checkPermission)
      .then(this.checkPrevsPayment)
      .then(this.applyDefaultSetup)
      .catch(this.initialFailed);
  },
  beforeDestroy() {
    const component = "payment";
    const lock = this.invoice._id;

    this.releaseComponentLock &&
      this.$socket.emit("[COMPONENT] UNLOCK", { component, lock });
  },
  methods: {
    checkPaymentMethod() {
      //assign order
      this.invoice = this.init.hasOwnProperty("order")
        ? JSON.parse(JSON.stringify(this.init.order))
        : JSON.parse(JSON.stringify(this.$store.getters.order));

      const prompt = {
        type: "question",
        title: "dialog.splitPayment",
        msg: "dialog.splitTicketPaymentMethod",
        buttons: [
          { text: "button.payBalanceDue", fn: "reject" },
          { text: "button.splitPay", fn: "resolve" },
          { text: "button.cancel", fn: "exit" }
        ]
      };

      return new Promise(split => {
        if (this.init.hasOwnProperty("splitPay")) {
          split(this.init.splitPay);
        } else {
          this.invoice.split
            ? this.$dialog(prompt)
                .then(() => split(true))
                .catch(exit => {
                  exit ? this.init.reject() : split(false);
                })
            : split(false);
        }
      });
    },
    checkComponentOccupy() {
      return new Promise((next, stop) => {
        const time = Date.now();
        const exp = time + 1.2e5;
        const data = {
          component: "payment",
          operator: this.op.name,
          lock: this.invoice._id,
          exp,
          time
        };

        this.$socket.emit("[COMPONENT] LOCK", data, lock => {
          lock ? stop({ error: "PAYMENT_PENDING", param: exp }) : next();
        });
      });
    },
    checkPermission() {
      return new Promise((next, stop) => {
        this.op.cashCtrl === "disable"
          ? stop({ error: "PERMISSION_DENIED" })
          : next();
      });
    },
    initialData(split) {
      this.exitComponent();
      this.willTicketNumberUpdate = this.isNewTicket;

      return new Promise((next, stop) => {
        if (split) {
          //check if item remain unsplit
          const remain = this.invoice.content.filter(i => !i.split).length;

          remain === 0
            ? this.$socket.emit("[SPLIT] GET", this.invoice._id, splits => {
                if (splits.length) {
                  this.splits = splits.sort((a, b) =>
                    a.number.localeCompare(b.number)
                  );
                  this.payWhole = false;

                  const index = splits.findIndex(t => t.payment.remain !== 0);

                  if (index !== -1) {
                    this.splitIndex = index;
                    this.order = this.splits[index];
                  } else {
                    stop({ error: "ALL_SPLIT_PAID" });
                  }
                  next();
                } else {
                  // no split ticket error
                  stop({ error: "SPLIT_TICKET_NOT_FUND" });
                }
              })
            : stop({ error: "ITEM_NOT_SPLIT", param: remain });
        } else {
          this.order = this.invoice;
          next();
        }
      });
    },
    checkPrevsPayment() {
      return new Promise(next => {
        const query =
          this.payWhole && !this.order.hasOwnProperty("parent")
            ? { order: this.order._id }
            : { split: this.order._id };

        this.$socket.emit("[PAYMENT] CHECK", query, ({ paid, tip }) => {
          const { balance } = this.order.payment;
          this.paidTip = parseFloat(tip) || 0;
          this.order.payment.remain = toFixed(Math.max(0, balance - paid), 2);
          next();
        });
      });
    },
    applyDefaultSetup() {
      this.isThirdPartyPayment = this.init.hasOwnProperty("thirdPartyPayment")
        ? this.init.thirdPartyPayment
        : this.order.source !== "POS";

      if (
        this.station.terminal &&
        this.invoice.hasOwnProperty("__creditCard__")
      ) {
        //apply credit card info to payment module
      }

      const {
        defaults = {
          instantPay: false,
          paymentType: "CASH",
          autoSaveCard: false,
          allowNoPrint: false,
          percentageTip: false,
          percentageDiscount: false,
          markPrintWhenSettled: false
        }
      } = this.config;

      this.defaults = defaults;

      const defaultType = this.isThirdPartyPayment
        ? "THIRD"
        : defaults.paymentType === "CREDIT" && !this.station.terminal
          ? "CASH"
          : defaults.paymentType;

      this.externalPaymentType = this.isThirdPartyPayment
        ? this.order.source
        : null;

      this.changePaymentType(defaultType);

      // pole display
      this.poleDisplay("Balance Due:", `$ ${this.order.payment.remain}`);
    },
    switchInvoice(index) {
      if (isNumber(index)) {
        this.splitIndex = index;
        this.order = this.splits[index];
        this.changePaymentType();
      } else {
        const next = this.splits.findIndex(t => t.payment.remain !== 0);

        if (next !== -1) {
          this.tip = "0.00";
          this.splitIndex = next;
          this.order = this.splits[next];
          this.changePaymentType();
        } else {
          this.closeTicket();
        }
      }
    },
    changePaymentType(newType) {
      //apply default payment type
      newType = newType || this.defaults.paymentType || "CASH";

      this.anchor = "paid";
      this.paymentType = newType;
      this.willResetFieldValue = true;
      this.paid =
        newType === "CASH" ? "0.00" : this.order.payment.remain.toFixed(2);

      if (newType !== "THIRD") this.externalPaymentType = null;

      if (newType === "GIFT") {
        if (this.order.hasOwnProperty("__giftCard__")) {
          this.checkGiftCard(this.order.__giftCard__);
        } else {
          this.giftCard = "";

          this.swipeGiftCard()
            .then(this.checkGiftCard)
            .catch(this.exitComponent);
        }
      }
    },
    setAnchor(newAnchor) {
      this.anchor = newAnchor;
      this.willResetFieldValue = true;
    },
    setInput(string) {
      const { format, length = 16 } = document.querySelector(
        ".field.active"
      ).dataset;
      let value = this[this.anchor];

      switch (format) {
        case "decimal":
          if (parseFloat(value) > 10000) return;

          value = this.willResetFieldValue
            ? string
            : (value * 100).toFixed(0) + string;

          value = (value / 100).toFixed(2);

          break;
        case "number":
          value = this.willResetFieldValue
            ? string
            : (value + string).replace(/\D+/g, "");
          break;
      }

      this[this.anchor] = isNumber(length) ? value.slice(0, length) : value;
      this.willResetFieldValue = false;
      this.updateTip();
    },
    deleteInput() {
      const { format } = document.querySelector(".field.active").dataset;
      let value = this[this.anchor];

      switch (format) {
        case "decimal":
          this[this.anchor] = (value.slice(0, -1) / 10).toFixed(2);
          break;
        case "number":
          this[this.anchor] = value.length > 0 ? value.slice(0, -1) : value;
          break;
      }

      this.willResetFieldValue = false;
      this.updateTip();
    },
    clearInput() {
      const { format } = document.querySelector(".field.active").dataset;

      switch (format) {
        case "decimal":
          this[this.anchor] = "0.00";
          break;
        case "number":
          this[this.anchor] = "";
          break;
      }

      this.willResetFieldValue = false;
      this.updateTip();
    },
    updateTip() {
      this.anchor === "tip" &&
        Object.assign(this.order.payment, { tip: parseFloat(this.tip) });
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
    checkCashDrawer() {
      return new Promise(next => {
        const allow =
          this.station.cashDrawer.enable || this.op.cashCtrl === "staffBank";

        const paidZeroError = {
          type: "error",
          title: "dialog.paymentFailed",
          msg: "dialog.mustPayGraterThanZero",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };
        const noCashDrawerError = {
          title: "dialog.cashDrawerUnavailable",
          msg: "dialog.stationCashDrawerRequired",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };
        const cashPaymentNotAllow = {
          title: "dialog.cantExecute",
          msg: "dialog.cashPaymentNotAllow",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        if (this.paidTotal === 0) throw paidZeroError;
        if (!allow) throw noCashDrawerError;
        if (this.op.cashCtrl === "creditOnly") throw cashPaymentNotAllow;

        next();
      });
    },
    checkOverPay() {
      return new Promise(next => {
        const paidZeroError = {
          type: "error",
          title: "dialog.paymentFailed",
          msg: "dialog.mustPayGraterThanZero",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        // Paid zero dollar is not allowed
        if (parseFloat(this.paid) === 0 && parseFloat(this.tip) === 0)
          throw paidZeroError;

        // if cashier perform a payment that paid amount is greater than remain balance
        // we should consider it as a shortcut of paid + tip
        // prompt a dialog to confirm
        if (this.paid > this.order.payment.remain) {
          const extraAsTip = toFixed(this.paid - this.order.payment.remain, 2);

          const prompt = {
            title: "dialog.extraPayment",
            msg: ["dialog.setExtraAmountAsTip", extraAsTip.toFixed(2)],
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.setTip", fn: "resolve" }
            ]
          };

          this.$dialog(prompt)
            .then(() => {
              this.exitComponent();
              this.tip = extraAsTip.toFixed(2);
              this.paid = (this.paid - extraAsTip).toFixed(2);

              next();
            })
            .catch(() => {
              this.tip = "0.00";
              this.exitComponent();
            });
        } else {
          next();
        }
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
        this.component = "creditCardModule";
      });
    },
    chargeThirdParty() {
      return new Promise(charge => {
        this.externalPaymentType
          ? charge(this.externalPaymentType)
          : new Promise((resolve, reject) => {
              this.componentData = { resolve, reject, callback: true };
              this.component = "thirdParty";
            })
              .then(charge)
              .catch(this.exitComponent);
      });
    },
    checkEntryInput() {
      return new Promise(next => {
        const tip = parseFloat(this.tip);
        const number = this.creditCard.replace(/\D+/g, "");
        const date = this.expDate.replace(/\D+/g, "");

        next({
          creditCard: { number, date },
          amount: this.paid,
          tip
        });
      });
    },
    queryGiftCard(number) {
      this.swipeGiftCard(this.giftCard.replace(/\D/g, ""))
        .then(this.checkGiftCard)
        .catch(this.exitComponent);
    },
    swipeGiftCard(number) {
      return new Promise((resolve, reject) => {
        if (isObject(this.giftCard)) {
          resolve(this.giftCard);
        } else {
          this.componentData = { resolve, reject, number };
          this.component = "capture";
        }
      });
    },
    checkGiftCard(card) {
      this.exitComponent();
      return new Promise((next, stop) => {
        if (typeof card === "object") {
          this.giftCard = card;
          this.setAnchor("paid");
          this.$forceUpdate();
          next();
        } else {
          const prompt = {
            type: "error",
            title: "dialog.giftCardActivation",
            msg: ["dialog.giftCardNotActivated", card],
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          this.$dialog(prompt).then(stop);
        }
      });
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
              this.exitComponent();
              this.paid = this.giftCard.balance.toFixed(2);
              resolve();
            })
            .catch(() => {
              this.exitComponent();
              reject();
            });
        } else {
          resolve();
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
          time: Date.now(),
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
    saveTransaction(data) {
      const type =
        this.paymentType === "THIRD"
          ? this.externalPaymentType
          : this.paymentType;

      const cashDrawer =
        this.op.cashCtrl === "staffBank"
          ? this.op.name
          : this.station.cashDrawer.name;

      const { remain } = this.order.payment;
      const actual = toFixed(Math.min(this.paid, remain), 2);
      const paid = parseFloat(this.paid);
      const tip = parseFloat(this.tip);

      const _id = ObjectId().toString();
      const time = Date.now();
      const create = this.invoice.create;
      const date = this.invoice.date || today();
      const split = this.payWhole
        ? this.order.hasOwnProperty("parent")
          ? this.order._id
          : null
        : this.splits[this.splitIndex]._id;
      const order = this.invoice.hasOwnProperty("parent")
        ? this.invoice.parent
        : this.invoice._id;
      const ticket = {
        number: this.invoice.number || this.ticket.number,
        type: this.invoice.type || this.ticket.type,
        table: this.invoice.table || null
      };

      let change = 0;
      let transaction = {
        _id,
        date,
        time,
        order,
        create,
        split,
        ticket,
        paid,
        change,
        tip,
        actual,
        cashDrawer,
        cashier: this.op.name,
        station: this.station.alias,
        server: this.order.server,
        for: "Order",
        subType: null,
        credential: null,
        lfd: null
      };

      return new Promise((resolve, reject) => {
        switch (this.paymentType) {
          case "CASH":
            //bug here
            const ticketPaid = toFixed(this.paid - this.tip, 2);

            this.currentTender = change = Math.max(
              0,
              toFixed(ticketPaid - remain, 2)
            );

            Object.assign(transaction, {
              type: "CASH",
              change,
              paid
            });

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
              date,
              for: "Order",
              _id: ObjectId().toString(),
              order: {
                _id: order,
                cashier: this.op.name,
                type: this.order.type || this.ticket.type,
                number: this.order.number || this.ticket.number,
                server: this.order.server
              }
            });

            Object.assign(transaction, {
              type: "CREDIT",
              subType: data.account.type,
              terminal: this.station.terminal,
              credential: data._id,
              lfd: data.account.number
            });

            this.$socket.emit("[TERMINAL] SAVE", data, payment =>
              this.$socket.emit(
                "[TERMINAL] CONFIG",
                this.station.terminal,
                config => {
                  Printer.printCreditCard(payment, config);
                }
              )
            );

            delete this.order.__creditCard__;

            //save credit card
            if (this.defaults.autoSaveCard) {
              const { _id } = this.invoice.customer;
              const card = [this.creditCard, this.expDate, ""];
              const key = "whoisyourdaddy";
              const unique = this.creditCard
                .split("")
                .map(Number)
                .map((n, i) => n + i)
                .reduce((a, c) => a + c, 0);

              this.encrypt(card, key).then(cipher => {
                this.$socket.emit(
                  "[CUSTOMER] SAVE_CREDIT_CARD",
                  _id,
                  {
                    card: [
                      this.creditCard
                        .split("")
                        .map(
                          (num, index) =>
                            index >= 4 && index <= 11 ? "#" : num
                        )
                        .join(""),
                      this.expDate,
                      ""
                    ],
                    cipher,
                    unique,
                    lastUse: Date.now()
                  },
                  () => {}
                );
              });
            }
            break;
          case "THIRD":
            Object.assign(transaction, {
              type: "THIRD",
              subType: this.externalPaymentType || data
            });
            break;
          case "GIFT":
            Object.assign(transaction, {
              type: "GIFT",
              credential: data,
              lfd: this.giftCard.number.replace(/\D/g, "").slice(12, 16)
            });

            delete this.order.__giftCard__;
            break;
        }

        if (!this.payWhole) {
          Object.assign(transaction, { splitPayment: this.splitIndex });
        } else if (this.order.hasOwnProperty("parent")) {
          const index = this.order.number.split("-")[1];
          Object.assign(transaction, { splitPayment: index - 1 });
        }

        resolve();

        if (!this.order.logs) this.order.logs = [];

        this.order.logs.push(transaction);
        this.order.payment.paid += parseFloat(actual);
        this.$socket.emit("[TRANSACTION] SAVE", transaction);
        this.recalculatePayment();
      });
    },
    postToDatabase() {
      return new Promise(next => {
        if (this.payWhole) {
          const settled = this.order.payment.remain === 0;

          if (this.isNewTicket) {
            Object.assign(this.order, {
              customer: this.$minifyCustomer(this.customer),
              cashier: this.op.name,
              time: Date.now(),
              date: today(),
              settled
            });

            this.$socket.emit("[ORDER] SAVE", this.order, false, invoice => {
              this.willTicketNumberUpdate = false;
              this.setApp({ newTicket: false });
              this.order = invoice;
              next();
            });
          } else {
            Object.assign(this.order, {
              cashier: this.op.name,
              settled
            });

            this.$socket.emit("[ORDER] UPDATE", this.order, false, () =>
              next()
            );
          }
          //there is no new ticket under split pay mode
        } else {
          this.$socket.emit("[SPLIT] PAY", this.order, () => next());
        }
      });
    },
    tenderCash() {
      return new Promise(next => {
        const paid = this.paid.toFixed(2);
        const tip = this.tip.toFixed(2);
        const tender = this.currentTender.toFixed(2);

        this.poleDisplay(["Paid CASH", paid], ["Change Due", tender]);

        const tenderWithoutDialog = {
          title: ["dialog.cashChange", tender],
          msg:
            tip > 0
              ? [
                  "dialog.cashPaymentWithTipDetail",
                  (parseFloat(paid) + parseFloat(tip)).toFixed(2),
                  tip
                ]
              : ["dialog.cashPaymentDetail", paid],
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        const tenderWithDialog = {
          html: true,
          content: `<h1 class="tender">${this.$t(
            "dialog.confirm.cashTender"
          )}<span class="agency space"> $ ${tender}</span></h1><h5 class="normal light">${this.$t(
            "dialog.cashPaymentDetail",
            paid
          )}</h5>`,
          buttons: [
            { text: "button.noReceipt", fn: "reject" },
            { text: "button.print", fn: "resolve" }
          ]
        };

        this.defaults.allowNoPrint &&
          tenderWithDialog.buttons.unshift({
            text: "button.noPrint",
            fn: "noPrint"
          });

        if (this.currentTender > 0) {
          switch (this.store.receipt) {
            case "always":
              this.printTicket("All", next);
              break;
            case "never":
              this.$dialog(tenderWithoutDialog).then(() => {
                this.printTicket("Order", next);
                this.exitComponent();
              });
              break;
            default:
              this.$dialog(tenderWithDialog)
                .then(() => this.printTicket("All", next))
                .catch(noPrint => {
                  noPrint
                    ? this.printTicket(false, next)
                    : this.printTicket("Order", next);
                });
          }
        } else {
          this.askReceipt(tender, paid, tip).then(() => next());
        }
      });
    },
    askReceipt(tender, paid, tip) {
      return new Promise(next => {
        const prompt = tender
          ? {
              title: ["dialog.cashChange", tender],
              msg:
                tip > 0
                  ? [
                      "dialog.cashPaymentWithTipDetail",
                      (parseFloat(paid) + parseFloat(tip)).toFixed(2),
                      tip
                    ]
                  : ["dialog.cashPaymentDetail", paid],
              buttons: [
                { text: "button.noReceipt", fn: "reject" },
                { text: "button.print", fn: "resolve" }
              ]
            }
          : {
              type: "question",
              title: "dialog.confirm.printReceipt",
              msg: "dialog.tip.printReceiptConfirm",
              buttons: [
                { text: "button.noReceipt", fn: "reject" },
                { text: "button.print", fn: "resolve" }
              ]
            };

        this.defaults.allowNoPrint &&
          prompt.buttons.unshift({
            text: "button.noPrint",
            fn: "noPrint"
          });

        switch (this.store.receipt) {
          case "always":
            this.printTicket("All", next);
            break;
          case "never":
            this.printTicket("Order", next);
            break;
          default:
            this.$dialog(prompt)
              .then(() => this.printTicket("All", next))
              .catch(noPrint => {
                noPrint
                  ? this.printTicket(false, next)
                  : this.printTicket("Order", next);
              });
        }
      });
    },
    printTicket(target, next) {
      let print = false;

      switch (target) {
        case "All":
        case "Receipt":
          print = true;
          Printer.print(this.order, {
            receipt: true,
            target
          });
          break;
        case "Order":
          print = true;
          Printer.print(this.order, { target });
          break;
        default:
      }

      const markPrint = this.defaults.markPrintWhenSettled
        ? this.order.payment.remain === 0 || print
        : print;

      this.$socket.emit("[ORDER] UPDATE", this.order, markPrint);

      this.exitComponent();
      next();
    },
    checkBalance() {
      this.tip = "0.00";
      this.exitComponent();
      if (this.payWhole && !this.invoice["parent"]) {
        this.$socket.emit(
          "[PAYMENT] CHECK",
          { order: this.invoice._id },
          ({ paid, tip }) => {
            const { balance } = this.order.payment;
            const remain = Math.max(0, +(balance - paid).toFixed(2));

            this.order.settled = remain === 0;

            if (remain > 0) {
              this.changePaymentType("CASH");
              this.poleDisplay("Balance Due:", `$ ${remain.toFixed(2)}`);
            } else {
              this.poleDisplay("Thank You", "Please Come Again!");
              this.closeTicket();
            }
          }
        );
      } else {
        this.switchInvoice();
      }
    },
    openTipComponent() {
      this.$checkPermission("modify", "tip")
        .then(this.setTip)
        .catch(() => {
          //set tip failed log
        });
    },
    gratuityToTip() {
      const { gratuity } = this.order.payment;
      const prompt = {
        type: "question",
        title: "dialog.tipConfirm",
        msg: ["dialog.setGratuityAsTip", gratuity.toFixed(2)]
      };
      gratuity > 0
        ? this.$dialog(prompt)
            .then(() => {
              this.tip = gratuity.toFixed(2);
              this.order.payment.gratuity = 0;
              this.order.payment.tip = gratuity;

              this.recalculatePayment();
              this.paid = (this.payment.remain - gratuity).toFixed(2);

              this.exitComponent();
            })
            .catch(this.exitComponent)
        : this.openTipComponent();
    },
    openDiscountComponent() {
      this.$checkPermission("modify", "discount")
        .then(this.setDiscount)
        .catch(() => {});
    },
    setTip() {
      new Promise((resolve, reject) => {
        const config = {
          title: "title.setTips",
          type: this.defaults.percentageTip ? "number" : "decimal",
          percentage: this.defaults.percentageTip,
          allowPercentage: true,
          amount: "0.00"
        };

        this.componentData = Object.assign({ resolve, reject }, config);
        this.component = "inputModule";
      })
        .then(({ amount, percentage }) => {
          this.paid = "0.00";
          this.tip = percentage
            ? ((this.order.payment.subtotal * amount) / 100).toFixed(2)
            : amount.toFixed(2);

          Object.assign(this.order.payment, { tip: parseFloat(this.tip) });

          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    setDiscount() {
      new Promise((resolve, reject) => {
        const config = {
          title: "title.setDiscount",
          type: this.defaults.percentageDiscount ? "number" : "decimal",
          percentage: this.defaults.percentageDiscount,
          allowPercentage: true,
          amount: "0.00"
        };

        this.componentData = Object.assign({ resolve, reject }, config);
        this.component = "inputModule";
      })
        .then(this.checkDiscount)
        .then(this.applyDiscount)
        .catch(this.exitComponent);
    },
    checkDiscount(input) {
      const { amount, percentage } = input;

      return new Promise((apply, unapply) => {
        const ticketTotal = this.tax.beforeDiscount
          ? this.order.payment.subtotal
          : this.order.payment.total;

        const discount = percentage
          ? toFixed((amount * ticketTotal) / 100, 2)
          : amount;

        if (discount > ticketTotal) {
          const prompt = {
            type: "warning",
            title: "dialog.cantExecute",
            msg: "dialog.discountAmountNotAllow",
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.retry", fn: "resolve" }
            ]
          };

          this.$dialog(prompt)
            .then(this.setDiscount)
            .catch(() => unapply());
        } else {
          apply(Object.assign(input, { discount }));
        }
      });
    },
    applyDiscount({ amount, percentage, discount }) {
      const coupon = percentage
        ? {
            code: "Entree POS",
            alias: `${amount} % OFF`,
            discount: amount,
            stack: true,
            expire: {},
            count: 0,
            type: "discount",
            apply: "order"
          }
        : {
            code: "Entree POS",
            alias: `$ ${amount} OFF`,
            discount: amount,
            stack: true,
            expire: {},
            count: 0,
            type: "voucher",
            apply: "order"
          };

      let coupons = this.order.coupons.filter(c => c.code !== "Entree POS");

      discount > 0 && coupons.push(coupon);

      this.order.coupons = coupons;
      this.$calculatePayment(this.order);
      this.exitComponent();

      !this.payWhole && this.$socket.emit("[SPLIT] UPDATE", this.order);
    },
    save() {
      this.setOrder(this.invoice);
      this.$route.name !== "Menu" &&
        this.$socket.emit("[ORDER] UPDATE", this.invoice, false);
      this.exitPaymentModule();
    },
    setSplit(number) {
      this.splitTarget = number;
    },
    splitTicketDialog() {
      this.order.parent ? this.paySplitAmount() : this.splitTicketConfirm();
    },
    paySplitAmount() {
      const balance = this.order.payment.remain.toFixed(2);
      const split = this.splitTarget;
      const pay = toFixed(balance / split, 2);

      const prompt = {
        type: "question",
        title: "dialog.confirm.evenSplit",
        msg: ["dialog.tip.evenPaymentConfirm", balance, split, pay]
      };

      this.$dialog(prompt)
        .then(() => {
          this.paid = pay.toFixed(2);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    splitTicketConfirm() {
      const prompt = {
        type: "question",
        title: "dialog.confirm.evenSplit",
        msg: ["dialog.tip.evenSplitConfirm", this.splitTarget]
      };

      this.$dialog(prompt)
        .then(() => {
          if (this.isNewTicket) {
            Object.assign(this.order, {
              customer: this.$minifyCustomer(this.customer),
              cashier: this.op.name,
              time: Date.now(),
              date: today()
            });

            this.setOrder(this.order);
            this.setApp({ newTicket: false });
          }

          this.exitComponent();

          this.reloadPaymentModule({
            splitPay: true,
            split: this.splitTarget
          });
        })
        .catch(this.exitComponent);
    },
    setPaid(value) {
      this.paid = value.toFixed(2);
      this.willResetFieldValue = true;

      this.defaults.instantPay && this.charge();
    },
    setExternalType(newType) {
      this.externalPaymentType = newType;
    },
    setCreditCard([creditCard, expDate]) {
      this.creditCard = creditCard;
      this.expDate = expDate;
    },
    previewTicket(index) {
      const ticket = JSON.parse(JSON.stringify(this.splits[index]));

      ticket.print = false;
      ticket.content.forEach(item => (item.print = false));

      this.$open("preview", { ticket, exit: true });
    },
    recalculatePayment() {
      const {
        subtotal,
        tax,
        total,
        discount,
        delivery,
        tip,
        gratuity,
        paid
      } = this.order.payment;

      const totalCharge = total + delivery;
      const due = toFixed(Math.max(0, totalCharge - discount), 2);
      const grandTotal = toFixed((due + gratuity) * 100, 2);
      const rounding = this.$rounding(grandTotal);
      const balance = due + gratuity + rounding;
      const remain = Math.max(0, +(balance - paid).toFixed(2));

      Object.assign(this.order.payment, {
        total: toFixed(total, 2),
        due: toFixed(due, 2),
        balance: toFixed(balance, 2),
        remain: toFixed(remain, 2),
        discount,
        tip
      });
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
    initialFailed({ error, param }) {
      let prompt;
      switch (error) {
        case "ALL_SPLIT_PAID":
          prompt = {
            title: "dialog.ticketSettled",
            msg: "dialog.settleTicketConfirm",
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.markAsPaid", fn: "resolve" }
            ]
          };
          this.$dialog(prompt)
            .then(() =>
              this.$socket.emit(
                "[ORDER] UPDATE",
                Object.assign(this.invoice, { settled: true }),
                false,
                () => this.exitPaymentModule()
              )
            )
            .catch(this.exitPaymentModule);
          break;
        case "SPLIT_TICKET_NOT_FUND":
          prompt = {
            type: "error",
            title: "dialog.cantExecute",
            msg: "dialog.splitTicketNotFound",
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };
          this.$dialog(prompt).then(this.exitPaymentModule);
          break;
        case "ITEM_NOT_SPLIT":
          prompt = {
            type: "error",
            title: "dialog.cantExecute",
            msg: ["dialog.splitTicketItemRemain", param],
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };
          this.$dialog(prompt).then(this.exitPaymentModule);
          break;
        case "TICKET_PAID":
          break;
        case "PAYMENT_PENDING":
          const duration = param - Date.now();

          prompt = {
            title: "dialog.pending",
            msg: "dialog.paymentInPending",
            timeout: { duration, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          this.releaseComponentLock = false;
          this.$dialog(prompt).then(this.exitPaymentModule);
          break;
        case "PERMISSION_DENIED":
          prompt = {
            type: "warning",
            title: "dialog.accessDenied",
            msg: "dialog.accessDeniedTip",
            timeout: { duration: 10000, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          this.$dialog(prompt).then(this.exitPaymentModule);
          break;
      }
    },
    payFailed(prompt) {
      isObject(prompt)
        ? this.$dialog(prompt)
            .then(this.exitComponent)
            .catch(this.exitComponent)
        : this.exitComponent();
    },
    closeTicket() {
      const print = this.defaults.markPrintWhenSettled;

      this.$socket.emit(
        "[ORDER] UPDATE",
        Object.assign(this.invoice, { settled: true }),
        print
      );

      switch (this.$route.name) {
        case "Menu":
          if (this.invoice.type === "BUFFET") {
            //buffet mode only reset current order status
            this.resetOrder();
            this.setApp({ newTicket: true });
            this.setTicket({ type: "BUFFET" });
            this.setOrder({
              type: "BUFFET",
              number: this.ticket.number,
              create: Date.now(),
              server: this.op.name,
              customer: this.$minifyCustomer(this.customer)
            });

            this.exitPaymentModule();
          } else {
            const { done } = this.station.autoLock;
            if (done) {
              //auto lock screen after paid
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
          this.exitPaymentModule();
          break;
        default:
          this.exitPaymentModule();
      }
    },
    saveOriginalPayment() {
      this.payment = JSON.parse(JSON.stringify(this.order.payment));
    },
    safeExit() {
      const { tip, discount } = this.order.payment;

      if (tip === this.payment.tip && discount === this.payment.discount) {
        this.exitPaymentModule();
      } else {
        const prompt = {
          title: "dialog.confirm.exit",
          msg: "dialog.unsavePaymentWarning"
        };

        this.$dialog(prompt)
          .then(this.exitPaymentModule)
          .catch(this.exitComponent);
      }
    },
    reloadPaymentModule(params) {
      this.init.reject(Object.assign({ reload: true }, params));
    },
    exitPaymentModule() {
      this.init.resolve();
    },
    ...mapActions([
      "setApp",
      "setOrder",
      "resetAll",
      "setTicket",
      "resetOrder",
      "setOperator"
    ])
  },
  watch: {
    "order._id": "saveOriginalPayment"
  },
  sockets: {
    TICKET_NUMBER(number) {
      this.isNewTicket &&
        this.willTicketNumberUpdate &&
        Object.assign(this.invoice, { number });
    },
    UPDATE_ORDER(invoice) {
      if (invoice._id === this.invoice._id) this.invoice = invoice;
      if (invoice._id === this.order._id) this.order = invoice;
    }
  }
};
</script>

<style scoped>
.wrap {
  display: flex;
  padding: initial;
  padding: 4px 0px 0px 4px;
  background: url(../../assets/image/fabric.png) #f6f6f6;
}

header .exit {
  right: 0;
  padding: 16px 25px;
  color: #3c3c3c;
  position: absolute;
}

.functions {
  margin: -2px 0 0 4px;
}

.btn {
  height: 50px;
  margin: 4px 2px;
  width: 97px;
}
</style>

