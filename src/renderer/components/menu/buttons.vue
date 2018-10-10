<template>
  <div class="function" v-if="isDineInTicket">
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
        <i class="fas fa-comment-dots"></i>
        <span class="text">{{$t('button.request')}}</span>
      </div>
    </div>
    <div class="bottomLeft">
      <div class="btn" @click="switchGuest" v-if="dineInOpt.seatOrder || order.type === 'HIBACHI'">
        <i class="fa fa-users"></i>
        <span class="text">{{$t('button.switch')}}</span>
      </div>
      <button class="btn" @click="openSplit" :disabled="order.hasOwnProperty('parent')" v-else>
        <i class="fa fa-columns"></i>
        <span class="text">{{$t('button.split')}}</span>
      </button>
      <div class="btn" @click="courseTime">
        <i class="fas fa-user-clock"></i>
        <span class="text">{{$t('button.timer')}}</span>
      </div>
      <div class="btn" @click="promotion">
        <i class="fa fa-tags"></i>
        <span class="text">{{$t('button.coupon')}}</span>
      </div>
      <button class="btn" @click="done(false)">
        <i class="fas fa-pause"></i>
        <span class="text">{{$t('button.hold')}}</span>
      </button>
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
    <button class="btn settle" @click="openPaymentModule" :disabled="op.cashCtrl === 'disable' || isEmptyTicket">
      <i class="fas fa-hand-holding-usd"></i>
      <span class="text">{{$t('button.payment')}}</span>
    </button>
    <div class="btn" @click="done(false)">
      <i class="fa fa-save"></i>
      <span class="text">{{$t('button.save')}}</span>
    </div>
    <button class="btn split" @click="openSplit" :disabled="order.hasOwnProperty('parent')">
      <i class="fa fa-copy"></i>
      <span class="text">{{$t('button.split')}}</span>
    </button>
    <div class="btn" @click="promotion">
      <i class="fa fa-tags"></i>
      <span class="text">{{$t('button.coupon')}}</span>
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
      <i class="fas fa-comment-dots"></i>
      <span class="text">{{$t('button.request')}}</span>
    </div>
    <div class="btn" @click="promotion">
      <i class="fa fa-tags"></i>
      <span class="text">{{$t("button.coupon")}}</span>
    </div>
    <div class="btn" @click="openTimer">
      <i class="fas fa-user-clock"></i>
      <span class="text">{{$t('button.timer')}}</span>
    </div>
    <button class="btn" @click="done(true)">
      <i class="fa fa-print"></i>
      <span class="text">{{$t('button.print')}}</span>
    </button>
    <button class="btn" @click="openPaymentModule" :disabled="op.cashCtrl === 'disable' || isEmptyTicket">
      <i class="fas fa-hand-holding-usd"></i>
      <span class="text">{{$t('button.payment')}}</span>
    </button>
    <button class="btn" @click="openSplit" :disabled="order.hasOwnProperty('parent')">
      <i class="fa fa-copy"></i>
      <span class="text">{{$t("button.split")}}</span>
    </button>
    <button class="btn" @click="done(false)">
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

import dialogModule from "../common/dialog";
import unlockModule from "../common/unlock";
import splitModule from "../split/index";
import modify from "./component/modify";
import coupon from "./component/coupon";
import course from "./component/course";
import timer from "./component/timer";
import payment from "../payment/main";

export default {
  props: ["layout"],
  components: {
    unlockModule,
    dialogModule,
    splitModule,
    modify,
    payment,
    coupon,
    timer,
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
            this.$log(`Delete item is prohibit to operator [${this.op.name}]`)
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
          const prompt = {
            title: "dialog.unableAdd",
            msg: ["dialog.maxSubItem", this.item[this.language], max],
            timeout: { duration: 5000, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          this.$dialog(prompt).then(this.exitComponent);
          return true;
        }
      }

      this.moreQty(!!document.querySelector("div.request"));
    },
    modify() {
      if (this.isEmptyTicket) return;
      let target = !!document.querySelector(".sub.target");
      target
        ? this.$open("modify", {
            item: {
              qty: this.choiceSet ? this.choiceSet.qty : 1,
              single: this.choiceSet ? this.choiceSet.single : 0,
              discount: 0
            },
            type: "choiceSet"
          })
        : this.$open("modify", { item: this.item });
    },
    courseTime() {
      if (this.isEmptyTicket) return;
      this.$open("course");
    },
    openPaymentModule(params) {
      new Promise((resolve, reject) => {
        this.componentData = Object.assign({}, { resolve, reject }, params);
        this.component = "payment";
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
    promotion() {
      this.$socket.emit("[COUPON] LIST", coupons => {
        this.$open("coupon", {
          coupons: coupons
            .filter(coupon => coupon.enable)
            .map(coupon => Object.assign({}, coupon, { redeem: false }))
        });
      });
    },
    openTimer() {
      if (this.isEmptyTicket || this.order.hasOwnProperty("parent")) return;
      this.$open("timer");
    },
    openSplit() {
      if (this.isEmptyTicket || this.order.hasOwnProperty("parent")) return;
      this.$open("splitModule");
    },
    switchGuest() {
      this.callComponent("guest");
    },
    done(print) {
      if (this.isEmptyTicket) return;

      this.promptConfirm(print)
        .then(this.checkPendingItem)
        .then(this.initialPrint)
        .then(this.save.bind(null, print))
        .then(this.exit)
        .catch(this.placeFailed);
    },
    saveConfirmDialog() {
      return new Promise((next, stop) => {
        const prompt = {
          title: "dialog.saveConfirm",
          msg: "dialog.unprintItemWarning"
        };

        this.$dialog(prompt)
          .then(next)
          .catch(stop);
      });
    },
    promptConfirm(print) {
      const { defaults = {} } = this.config;

      return new Promise((next, stop) => {
        if (defaults.saveConfirm && !print) {
          const prompt = {
            title: "dialog.saveConfirm",
            msg: "dialog.unprintItemWarning"
          };

          this.$dialog(prompt)
            .then(() => {
              this.exitComponent();
              next(print);
            })
            .catch(() => {
              this.exitComponent();
              stop();
            });
        } else {
          next(print);
        }
      });
    },
    placeFailed(error) {
      error && console.error(error);
      if (error) {
        this.$log(
          `An error occurred when save the order #${
            this.order.number
          }. \nError Message:\n${error}`,
          "fatal"
        );

        const prompt = {
          type: "error",
          title: "dialog.somethingWrong",
          msg: "dialog.somethingWrongTip",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        this.$dialog(prompt).then(this.exitComponent);
      }
    },
    checkPendingItem(print) {
      return new Promise((next, stop) => {
        const pendingItems = this.order.content.filter(item => item.pending);

        if (!this.app.newTicket && print && pendingItems.length > 0) {
          const prompt = {
            title: "dialog.printScheduleItems",
            msg: "dialog.schedulePrintTaskOngoing",
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.processAnyway", fn: "resolve" }
            ]
          };

          this.$dialog(prompt)
            .then(() => {
              this.removeItemsFromSpooler(pendingItems);
              next(print);
            })
            .catch(() => {
              this.exitComponent();
              stop();
            });
        } else {
          next(print);
        }
      });
    },
    removeItemsFromSpooler(items) {
      const uniques = items.map(i => i.unique);

      this.spooler.forEach(task => {
        task.order.content = task.order.content.filter(
          i => !uniques.includes(i.unique)
        );
      });

      this.order.content.forEach(item =>
        Object.assign(item, { pending: false })
      );
    },
    initialPrint(print) {
      return new Promise(next => {
        if (this.ticket.type === "TO_GO") {
          let order = this.archivedOrder;
          this.emptyArchiveOrder();

          let items = this.order.content.map(item =>
            Object.assign({}, item, { print, orderType: "TO_GO" })
          );
          order.content.push(...items);

          this.$calculatePayment(order);
          this.$socket.emit("[ORDER] UPDATE", order, false);

          next();
        } else {
          next();
        }
      });
    },
    save(print) {
      return new Promise((resolve, reject) => {
        const { printOnDone = false, useTable = true } = this.dineInOpt;
        const printCount = this.app.newTicket
          ? print
            ? 1
            : 0
          : print
            ? this.order.printCount + 1
            : this.order.printCount;

        // update table status

        if (
          useTable &&
          this.table &&
          this.isDineInTicket &&
          this.table.status === -1
        ) {
          Object.assign(this.table, {
            invoice: [this.order._id],
            status: 2
          });

          this.$socket.emit("[TABLE] UPDATE", this.table);
        }

        if (
          this.table &&
          this.order.type === "HIBACHI" &&
          Array.isArray(this.table.seats)
        ) {
          this.table.seats.forEach(seat => {
            this.order.seats.includes(seat.name) &&
              Object.assign(seat, {
                invoice: this.order._id,
                session: this.order.session,
                number: this.order.number,
                status: 2
              });
          });

          // update hibachi table seats
          this.$socket.emit("[TABLE] UPDATE", this.table);

          // set print status to false
          // hibachi order must send at once

          print = false;
        }

        let order = this.combineOrderInfo({ printCount });
        let todo = !!document.querySelector(".item.todo");

        if (todo && !print) {
          todo = false;
        }

        if (this.app.newTicket) {
          const items =
            todo && print
              ? this.todoPrintHandler(order)
              : print
                ? order.content.map(item => {
                    const _item = clone(item);
                    Object.assign(item, { print: true });
                    return _item;
                  })
                : [];

          if (this.isDineInTicket) {
            this.$socket.emit("[ORDER] SAVE", order, false, ({ number }) => {
              if (items.length === 0) return;

              const ticket = Object.assign({}, order, {
                number,
                content: items
              });

              printOnDone
                ? Printer.print(ticket)
                : Printer.print(ticket, { target: "Order" });
            });
          } else {
            this.$socket.emit(
              "[ORDER] SAVE",
              order,
              print,
              ticket =>
                print &&
                Printer.print(Object.assign(ticket, { content: items }))
            );
          }
        } else {
          if (this.ticket.type !== "TO_GO") {
            if (print) {
              const diffs = this.compare(order);

              if (this.order.type !== "DINE_IN" && this.order.type !== "BAR") {
                Printer.print(diffs);
              } else {
                printOnDone
                  ? Printer.print(diffs)
                  : Printer.print(diffs, { target: "Order" });
              }
            }
            this.$socket.emit("[ORDER] UPDATE", order, print);
          } else {
            print && Printer.print(this.order, { target: "Order" });
          }
        }

        resolve(false);
      });
    },
    todoPrintHandler(order) {
      let items = [];

      order.content.forEach(item => {
        if (item.todo) {
          items.push(clone(item));
          item.print = true;
        }
      });

      return items;
    },
    exit(quit) {
      const { done } = this.station.autoLock;
      const { lockOnDone, useTable } = this.dineInOpt;

      this.setApp({ newTicket: true });

      if (this.isDineInTicket && useTable) {
        if ((lockOnDone || done) && this.order.type !== "HIBACHI") {
          // make exception for hibachi type ticket
          // since hibachi requires multiple order entry
          // for whole hibachi table
          this.resetAll();
          this.$router.push({ path: "/main/lock" });
        } else {
          const ticket = this.order.hasOwnProperty("parent")
            ? this.history.find(t => t._id === this.order.parent) || this.order
            : this.order;

          this.resetOrder(true);
          this.setViewOrder(ticket);

          this.table
            ? this.$router.push({
                name: "Table",
                params: { zone: this.table.zone }
              })
            : this.$router.push({ name: "Table" });
        }
      } else {
        // if it is not dine in ticket
        // either lock station or return to main screen
        done
          ? this.$router.push({ path: "/main/lock" })
          : this.$router.push({ path: "/main" });

        this.resetAll();
      }
    },
    quit() {
      const prompt = {
        title: "dialog.confirm.exit",
        msg: "dialog.tip.unsavedOrderWarning"
      };

      this.isEmptyTicket
        ? this.abandon()
        : this.$dialog(prompt)
            .then(this.abandon)
            .catch(this.exitComponent);
    },
    combineOrderInfo(extra) {
      const customer = this.$minifyCustomer(this.customer);
      let order = Object.assign({}, this.order);

      if (this.app.newTicket) {
        delete customer.favorite;
        Object.assign(order, {
          time: Date.now(),
          date: today(),
          customer
        });
      } else {
        Object.assign(order, {
          lastEdit: Date.now(),
          editor: this.op.name,
          customer
        });
      }
      return Object.assign({}, order, extra);
    },
    createTogo() {
      this.archiveOrder(this.order);
      Object.assign(this.ticket, { type: "TO_GO" });
      this.setOrder({
        type: "TO_GO",
        print: false,
        content: [],
        togo: true
      });
      this.setSides(Array(11).fill({ usEN: "", zhCN: "", disable: true }));
    },
    dineInQuit() {
      const prompt = {
        title: "dialog.confirm.exit",
        msg: "dialog.tip.unsavedOrderWarning"
      };

      this.isEmptyTicket
        ? this.resetTableExit()
        : this.$dialog(prompt)
            .then(this.resetTableExit)
            .catch(this.exitComponent);
    },
    resetTableExit() {
      if (this.table) {
        const { _id, status, seats } = this.table;

        if (this.app.newTicket || status === -1) {
          this.$socket.emit("[TABLE] RESET", { _id });
        }

        if (this.app.newTicket && Array.isArray(seats)) {
          this.$socket.emit("[HIBACHI] RESET", {
            _id,
            session: this.order.session
          });
        }
      }
      this.abandon();
    },
    abandon() {
      this.resetAll();
      this.$router.push({ path: "/main" });
      this.$log(`#${this.ticket.number} Invoice was abandoned.`);
    },
    switchLanguage() {
      const language = this.app.language === "usEN" ? "zhCN" : "usEN";
      this.$setLanguage(language);
      this.setApp({ language });
      moment.locale(language === "usEN" ? "en" : "zh-cn");
      this.$forceUpdate();
    },
    compare(current) {
      if (!this.instance) {
        //return if no need to compare
        return current;
      }

      const oldContent = this.instance.content;
      current = JSON.parse(JSON.stringify(current));
      current.print = true;

      let items = [];

      current.content.forEach(item => {
        if (!item.print) {
          //skip unprint item
          item.diffs = "NEW";
          items.push(item);
          return;
        }

        let oldItem = oldContent.find(i => i.unique === item.unique);

        if (oldItem) {
          //item still exist therefore we need to figure it out what changes

          if (item.qty !== oldItem.qty) {
            //mark old item as removed
            //suggested by most of users
            items.push(
              Object.assign(oldItem, {
                diffs: "REMOVED",
                print: false,
                void: true
              })
            );

            //item qty changes
            Object.assign(item, {
              originQty: oldItem.qty,
              diffs: "DIFFERENT",
              print: false
            });
          } else {
            //compare item's subitem
            const newSet = item.choiceSet
              .filter(s => !s.type && !s.divider)
              .map(s => s.unique);
            const oldSet = oldItem.choiceSet
              .filter(s => !s.type && !s.divider)
              .map(s => s.unique);

            const isSameSubitem = newSet.reduce(
              (a, b) => a && oldSet.includes(b),
              true
            );

            if (newSet.length === oldSet.length && isSameSubitem) {
              item.diffs = "UNCHANGED";
            } else {
              //mark old item as removed
              oldItem.diffs = "REMOVED";
              oldItem.print = false;
              items.push(oldItem);

              //push current item
              item.diffs = "DIFFERENT";
              item.print = false;
              items.push(item);

              //deep copy item
              item = JSON.parse(JSON.stringify(item));
              item.diffs = "MODIFIED";
              item.print = false;

              let printer = new Set();

              item.choiceSet = item.choiceSet.filter(
                set => !oldSet.includes(set.unique)
              );
              item.choiceSet.forEach(subitem => {
                subitem.hasOwnProperty("print") &&
                  subitem.print.forEach(name => printer.add(name));
              });

              if (Array.from(printer).length > 0) {
                //reset item printer setting
                item.printer = {};
                printer.forEach(name => {
                  item.printer[name] = { replace: false };
                });
              }
            }
          }

          items.push(item);
        } else if (!item.print) {
          //this item is new
          item.diffs = "NEW";
          item.print = false;

          items.push(item);
        }
      });

      const itemsUniques = items.map(item => item.unique);
      let removedItems = [];
      oldContent.forEach(item => {
        !itemsUniques.includes(item.unique) &&
          removedItems.push(
            Object.assign(item, {
              diffs: "REMOVED",
              print: false,
              void: true
            })
          );
      });

      removedItems.length > 0 && items.unshift(...removedItems);

      return Object.assign(current, { content: items });
    },
    ...mapActions([
      "setApp",
      "lessQty",
      "moreQty",
      "setSides",
      "resetAll",
      "setOrder",
      "resetOrder",
      "setViewOrder",
      "setTableInfo",
      "archiveOrder",
      "emptyArchiveOrder"
    ])
  },
  computed: {
    isDineInTicket() {
      return (
        this.order.type === "DINE_IN" ||
        this.order.type === "HIBACHI" ||
        this.order.type === "BAR" ||
        this.order.type === "TO_GO"
      );
    },
    ...mapGetters([
      "op",
      "app",
      "tax",
      "item",
      "store",
      "order",
      "table",
      "config",
      "ticket",
      "history",
      "station",
      "spooler",
      "customer",
      "language",
      "instance",
      "choiceSet",
      "dineInOpt",
      "archivedOrder",
      "isEmptyTicket"
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
  grid-row-end: 3;
}
</style>
