<template>
  <div class="function" v-if="layout ==='DINE_IN' || layout === 'HIBACHI'">
    <div class="top">
      <div class="btn" @click="less">
        <i class="fa fa-minus-square"></i>
        <span class="text">{{$t('button.less')}}</span>
      </div>
      <div class="btn" @click="more">
        <i class="fa fa-plus-square"></i>
        <span class="text">{{$t('button.more')}}</span>
      </div>
      <div class="btn" @click="$emit('open', 'request')">
        <i class="fa fa-commenting-o"></i>
        <span class="text">{{$t('button.request')}}</span>
      </div>
    </div>
    <div class="bottomLeft">
      <div class="btn" @click="switchGuest" v-if="dinein.seatOrder || order.type === 'HIBACHI'">
        <i class="fa fa-users"></i>
        <span class="text">{{$t('button.switch')}}</span>
      </div>
      <div class="btn" @click="openSplit" v-else>
        <i class="fa fa-columns"></i>
        <span class="text">{{$t('button.split')}}</span>
      </div>
      <div class="btn" @click="courseTime">
        <i class="fa fa-clock-o"></i>
        <span class="text">{{$t('button.timer')}}</span>
      </div>
      <div class="btn" @click="promotion">
        <i class="fa fa-tags"></i>
        <span class="text">{{$t('button.coupon')}}</span>
      </div>
      <div class="btn" @click="done(false)">
        <i class="fa fa-save"></i>
        <span class="text">{{$t('button.hold')}}</span>
      </div>
      <button class="btn" @click="modify">
        <i class="fa fa-calculator"></i>
        <span class="text">{{$t('button.modify')}}</span>
      </button>
      <div class="btn" @click="dineInQuit">
        <i class="fa fa-times"></i>
        <span class="text">{{$t('button.exit')}}</span>
      </div>
    </div>
    <div class="bottomRight">
      <button class="btn long" @click="done(true)">
        <i class="fa fa-print"></i>
        <span class="text">{{$t('button.done')}}</span>
      </button>
      <div class="btn" @click="switchLanguage">
        <i class="fa fa-language"></i>
        <span class="text">{{$t('button.language')}}</span>
      </div>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
  <div class="grid" v-else-if="layout === 'BUFFET'">
    <div class="btn" @click="less">
      <i class="fa fa-minus-square"></i>
      <span class="text">{{$t('button.less')}}</span>
    </div>
    <div class="btn" @click="more">
      <i class="fa fa-plus-square"></i>
      <span class="text">{{$t('button.more')}}</span>
    </div>
    <button class="btn" @click="modify">
      <i class="fa fa-calculator"></i>
      <span class="text">{{$t('button.modify')}}</span>
    </button>
    <button class="btn settle" @click="settle" :disabled="op.cashCtrl === 'disable' || isEmptyTicket">
      <i class="fa fa-money"></i>
      <span class="text">{{$t('button.payment')}}</span>
    </button>
    <div class="btn split" @click="openSplit">
      <i class="fa fa-columns"></i>
      <span class="text">{{$t('button.split')}}</span>
    </div>
    <div class="btn" @click="save(false)">
      <i class="fa fa-save"></i>
      <span class="text">{{$t('button.save')}}</span>
    </div>
    <div class="btn" @click="quit">
      <i class="fa fa-times"></i>
      <span class="text">{{$t('button.exit')}}</span>
    </div>
    <div class="btn" @click="switchLanguage">
      <i class="fa fa-language"></i>
      <span class="text">{{$t('button.language')}}</span>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
  <div class="function" v-else>
    <div class="btn" @click="less">
      <i class="fa fa-minus-square"></i>
      <span class="text">{{$t('button.less')}}</span>
    </div>
    <div class="btn" @click="more">
      <i class="fa fa-plus-square"></i>
      <span class="text">{{$t('button.more')}}</span>
    </div>
    <div class="btn" @click="$emit('open', 'request')">
      <i class="fa fa-commenting-o"></i>
      <span class="text">{{$t('button.request')}}</span>
    </div>
    <button class="btn" @click="settle" :disabled="op.cashCtrl === 'disable' || isEmptyTicket">
      <i class="fa fa-money"></i>
      <span class="text">{{$t('button.payment')}}</span>
    </button>
    <div class="btn" @click="openTimer">
      <i class="fa fa-clock-o"></i>
      <span class="text">{{$t('button.timer')}}</span>
    </div>
    <button class="btn" @click="done(true)">
      <i class="fa fa-print"></i>
      <span class="text">{{$t('button.print')}}</span>
    </button>
    <div class="btn" @click="promotion">
      <i class="fa fa-tags"></i>
      <span class="text">{{$t("button.coupon")}}</span>
    </div>
    <div class="btn" @click="openSplit">
      <i class="fa fa-columns"></i>
      <span class="text">{{$t("button.split")}}</span>
    </div>
    <button class="btn" @click="done(false)" :disabled="ticket.type === 'TO_GO'">
      <i class="fa fa-save"></i>
      <span class="text">{{$t("button.save")}}</span>
    </button>
    <button class="btn" @click="modify">
      <i class="fa fa-calculator"></i>
      <span class="text">{{$t("button.modify")}}</span>
    </button>
    <div class="btn" @click="quit">
      <i class="fa fa-times"></i>
      <span class="text">{{$t("button.exit")}}</span>
    </div>
    <div class="btn" @click="switchLanguage">
      <i class="fa fa-language"></i>
      <span class="text">{{$t("button.language")}}</span>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import splitor from "../split/index";
import unlock from "../common/unlock";
import timer from "./component/timer";
import payment from "../payment/index";
import modify from "./component/modify";
import coupon from "./component/coupon";
import course from "./component/course";
import dialoger from "../common/dialoger";

export default {
  props: ["layout"],
  components: {
    dialoger,
    unlock,
    modify,
    payment,
    coupon,
    timer,
    splitor,
    course
  },
  data() {
    return {
      isDisplayGuests: false,
      componentData: null,
      component: null
    };
  },
  created() {
    this.$bus.on("FOOD_TOGO", this.createTogo);
  },
  beforeDestroy() {
    this.$bus.off("FOOD_TOGO", this.createTogo);
  },
  methods: {
    callComponent(name) {
      this.$emit("open", name);
    },
    less() {
      if (this.isEmptyTicket) return;
      let boolean =
        !document.querySelector(".item.active") &&
        (!!document.querySelector("div.request") ||
          !!this.item.choiceSet.length);

      if (this.app.newTicket || this.item.new) {
        this.lessQty(boolean);
      } else {
        this.$checkPermission("modify", "item")
          .then(() => this.lessQty(boolean))
          .catch(() =>
            this.$log({
              eventID: 1210,
              type: "failure",
              note: `Operator unable to delete exist item due to permission deny.`
            })
          );
      }
    },
    more() {
      let focus = document.querySelector(".item.active");
      let subItemCount = Array.isArray(this.item.choiceSet)
        ? this.item.choiceSet
          .filter(item => item.subItem)
          .map(item => item.qty)
          .reduce((a, b) => a + b, 0)
        : 0;

      if (!focus && this.item.hasOwnProperty("rules")) {
        let max = this.item.rules.maxSubItem || Infinity;
        let overCharge = this.item.rules.overCharge || 0;
        if (subItemCount >= max && overCharge === 0) {
          this.$dialog({
            title: "dialog.unableAdd",
            msg: ["dialog.maxSubItem", this.item[this.language], max],
            timeout: { duration: 5000, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => this.$q());
          return true;
        }
      }
      this.moreQty();
    },
    modify() {
      if (this.isEmptyTicket) return;
      let target = !!document.querySelector(".sub.target");
      target
        ? this.$p("modify", {
          item: {
            qty: this.choiceSet ? this.choiceSet.qty : 1,
            single: this.choiceSet ? this.choiceSet.single : 0,
            discount: 0
          },
          type: "choiceSet"
        })
        : this.$p("modify", { item: this.item });
    },
    courseTime() {
      if (this.isEmptyTicket) return;
      this.$p("course");
    },
    settle() {
      this.ticket.type === "TO_GO"
        ? this.$p("payment", { order: this.combineTogoItems() })
        : this.$p("payment");
    },
    request() {
      this.$emit("open", "request");
    },
    promotion() {
      this.$socket.emit("[COUPON] LIST", coupons => {
        this.$p("coupon", {
          coupons: coupons.map(coupon => {
            Object.assign(coupon, { redeem: false, enable: true });
            return coupon;
          })
        });
      });
    },
    openTimer() {
      if (this.isEmptyTicket) return;
      this.$open("timer");
    },
    openSplit() {
      if (this.isEmptyTicket) return;
      this.$open("splitor");
    },
    switchGuest() {
      this.callComponent("guest");
    },
    done(print) {
      if (this.isEmptyTicket) return;

      this.initialPrint(print)
        .then(this.save.bind(null, print))
        .then(this.exit)
        .catch(this.placeFailed);
    },
    placeFailed(error) {
      this.$log({
        eventID: 9005,
        type: "bug",
        data: this.order._id,
        note: `An error occurred when save the order. \n\nError Message:\n${error}`
      });

      const prompt = {
        type: "error",
        title: "dialog.somethingWrong",
        msg: "dialog.somethingWrongTip",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.$dialog(prompt).then(() => this.$q());
    },
    combineTogoItems() {
      //combine togo list to origin dineIn placed items
      let archiveOrder = this.archivedOrder;

      this.order.content.forEach(item => {
        item.diffs = "new";
        archiveOrder.content.push(item);
      });
      //recalculate price
      let { subtotal, tax } = this.order.payment;
      let total = toFixed(subtotal + tax, 2);

      archiveOrder.payment.subtotal += subtotal;
      archiveOrder.payment.tax += tax;
      archiveOrder.payment.total += total;
      archiveOrder.payment.due += total;
      archiveOrder.payment.balance += total;
      archiveOrder.payment.remain += total;
      return archiveOrder;
    },
    initialPrint(print) {
      return new Promise(resolve => {
        if (this.ticket.type === "TO_GO" && this.order.content.length > 0) {
          //save togo items
          let order = this.combineTogoItems();
          this.$socket.emit("[UPDATE] INVOICE", order, print);
          resolve();
        } else {
          resolve();
        }
      });
    },
    save(print) {
      return new Promise((resolve, reject) => {
        let order = this.combineOrderInfo();

        if (this.app.newTicket) {
          let todo = !!document.querySelector(".item.todo");
          if (todo) {
            let items = [];
            order.content.forEach(item => {
              if (item.pending) {
                items.push(clone(item));
                item.print = true;
              }
            });

            if (this.ticket.type !== "DINE_IN") {
              this.$socket.emit("[SAVE] INVOICE", order, false, content => {
                Printer.setTarget("Order").print(
                  Object.assign(order, {
                    delay: +new Date(),
                    content: items
                  })
                );
              });
            } else {
              const { printOnDone } = this.dinein;

              if (this.dinein.table) {
                Object.assign(this.currentTable, { invoice: [order._id] });
                this.$socket.emit("[TABLE] SETUP", this.currentTable);
              }

              this.$socket.emit("[SAVE] INVOICE", order, false, content => {
                if (print) {
                  const ticket = Object.assign({}, order, {
                    delay: +new Date(),
                    content: items
                  });

                  printOnDone
                    ? Printer.setTarget("All").print(ticket)
                    : Printer.setTarget("Order").print(ticket);
                }
              });
            }
          } else if (this.ticket.type !== "DINE_IN") {
            this.$socket.emit("[SAVE] INVOICE", order, print, content => {
              print && Printer.setTarget("All").print(content);
            });
          } else {
            let { printOnDone } = this.dinein;
            if (this.dinein.table) {
              Object.assign(this.currentTable, { invoice: [order._id] });
              this.$socket.emit("[TABLE] SETUP", this.currentTable);
            }

            this.$socket.emit("[SAVE] INVOICE", order, print, content => {
              if (print) {
                printOnDone
                  ? Printer.setTarget("All").print(content)
                  : Printer.setTarget("Order").print(content);
              }
            });
          }
        } else {
          if (this.ticket.type !== "TO_GO") {
            if (print) {
              let diffs = this.analyzeDiffs(order);

              if (this.order.type !== "DINE_IN") {
                Printer.setTarget("All").print(diffs);
              } else {
                this.dinein.printOnDone
                  ? Printer.setTarget("All").print(diffs)
                  : Printer.setTarget("Order").print(diffs);
              }
            }
            this.$socket.emit("[UPDATE] INVOICE", order, print);
          } else {
            Printer.setTarget("Order").print(this.order);
          }
        }
        resolve(false);
      });
    },
    exit(quit) {
      const { done } = this.station.autoLock;
      const { lockOnDone, table } = this.dinein;

      if (this.order.type === "DINE_IN" && table) {
        if (lockOnDone || done) {
          this.setOp(null);
          this.$router.push({ path: "/main/lock" });
        } else {
          this.setOrder(this.order);
          this.$router.push({ name: "Table" });
        }
      } else {
        if (done) {
          this.setOp(null);
          this.$router.push({ path: "/main/lock" });
        } else {
          this.$router.push({ path: "/main" });
        }
      }
      this.resetAll();
    },
    quit() {
      const prompt = {
        title: "dialog.exitConfirm",
        msg: "dialog.exitConfirmTip"
      };

      this.isEmptyTicket
        ? this.abandon()
        : this.$dialog(prompt)
          .then(this.abandon)
          .catch(() => this.$q());
    },
    combineOrderInfo(extra) {
      let customer = Object.assign({}, this.customer);
      let order = Object.assign({}, this.order);
      if (this.app.newTicket) {
        delete customer.favorite;
        Object.assign(order, {
          customer,
          type: this.ticket.type,
          number: this.ticket.number,
          modify: 0,
          status: 1,
          time: +new Date(),
          date: today()
        });
      } else {
        Object.assign(order, {
          customer,
          lastEdit: +new Date(),
          editor: this.op.name,
          modify: isNumber(this.order.modify) ? this.order.modify + 1 : 1
        });
      }
      return Object.assign({}, order, extra);
    },
    analyzeDiffs(current) {
      //current = JSON.parse(JSON.stringify(current));
      current = clone(current);
      current.print = true;

      let items = [];
      let compare = current.content;
      //push unprinted item

      this.diffs.forEach(prev => {
        if (!prev.print) {
          prev.diffs = "new";
          items.push(prev);
          return;
        }

        const index = compare.findIndex(item => item.unique === prev.unique);

        if (index !== -1) {
          const now = compare[index];

          //compare quantity
          if (now.qty < prev.qty) {
            compare[index].diffs = "less";
            compare[index].print = false;
          } else if (now.qty > prev.qty) {
            compare[index].diffs = "more";
            compare[index].print = false;
          } else {
            //compare unchanged item find out if choiceSet is different
            const nowSet = now.choiceSet.map(s => s.unique);
            const prevSet = prev.choiceSet.map(s => s.unique);

            let sameSet = nowSet.reduce(
              (a, b) => a && prevSet.includes(b),
              true
            );

            if (sameSet) {
              compare[index].diffs = "unchanged";
            } else {
              compare[index].print = false;
              compare[index].diffs = "inserted";
              //filter insert choiceSet
              compare[index].choiceSet = now.choiceSet.filter(
                set => prevSet.indexOf(set.unique) < 0
              );
              //combine printer setting
              let printer = new Set();
              compare[index].choiceSet.forEach(set => {
                if (set.hasOwnProperty("print")) {
                  set.print = [];
                  set.print.forEach(name => printer.add(name));
                }
              });

              //apply to item printer setting
              if (Array.from(printer) > 0) {
                compare[index].printer = {};
                printer.forEach(name => {
                  compare[index].printer[name] = {
                    replace: false
                  };
                });
              }
            }
          }
          compare[index].origin = prev.qty;
          items.push(compare[index]);
        } else {
          prev.diffs = "removed";
          prev.print = false;
          items.push(prev);
        }
      });

      items.push(
        ...current.content.filter(item => item.new).map(item => {
          item.diffs = "new";
          return item;
        })
      );

      return Object.assign(current, { content: items });
    },
    createTogo() {
      this.archiveOrder(this.order);
      Object.assign(this.ticket, { type: "TO_GO" });
      this.setOrder({ type: "TO_GO", content: [] });
    },
    dineInQuit() {
      const prompt = {
        title: "dialog.exitConfirm",
        msg: "dialog.exitConfirmTip"
      };

      this.isEmptyTicket
        ? this.resetTableExit()
        : this.$dialog(prompt)
          .then(this.resetTableExit)
          .catch(() => this.$q());
    },
    resetTableExit() {
      if (this.currentTable) {
        const { _id } = this.currentTable;
        this.app.newTicket && this.$socket.emit("[TABLE] RESET", { _id });
      }
      this.abandon();
    },
    abandon() {
      this.$log({
        eventID: 4001,
        data: this.order._id,
        note: `#${this.ticket.number} Invoice was abandoned.`
      });

      this.resetAll();
      this.$router.push({ path: "/main" });
    },
    switchLanguage() {
      const language = this.app.language === "usEN" ? "zhCN" : "usEN";
      this.$setLanguage(language);
      this.setApp({ language });
      moment.locale(language === "usEN" ? "en" : "zh-cn");
      this.$forceUpdate();
    },
    ...mapActions([
      "setOp",
      "setApp",
      "lessQty",
      "moreQty",
      "resetAll",
      "setOrder",
      "setTableInfo",
      "archiveOrder"
    ])
  },
  computed: {
    ...mapGetters([
      "op",
      "app",
      "item",
      "diffs",
      "order",
      "store",
      "dinein",
      "ticket",
      "station",
      "customer",
      "language",
      "archivedOrder",
      "isEmptyTicket",
      "currentTable",
      "choiceSet"
    ])
  }
};
</script>

<style scoped>
.bottomLeft {
  display: inline-block;
  width: 184px;
}

.bottomRight {
  display: inline-block;
  width: 90px;
  vertical-align: top;
}

.long {
  height: 129px;
}

.guests {
  display: inline-flex;
}

.grid {
  display: grid;
  grid-template-columns: auto auto auto;
  grid-template-rows: auto auto auto;
  padding: 3px 0 0 3px;
}

.btn.settle {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 4;
  width: 185px;
  height: 129px;
}

.btn.split {
  grid-column-start: 3;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 4;
  height: 129px;
}
</style>
