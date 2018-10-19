<template>
  <div class="function" v-if="isDineInTicket">
    <div class="top">
      <fn icon="fa-minus-square" text="button.less" @click="less"></fn>
      <fn icon="fa-plus-square" text="button.more" @click="more"></fn>
      <fn icon="fa-comment-dots" text="button.request" @click="$emit('open', 'request')"></fn>
    </div>
    <div class="bottomLeft">
      <fn icon="fa-users" text="button.switch" v-if="dineInOpt.seatOrder || order.type === 'HIBACHI'"></fn>
      <fn class="split" icon="fa-copy" @click="openSplit" text="button.split" :disabled="order.hasOwnProperty('parent')" v-else></fn>
      <fn icon="fa-user-clock" text="button.timer" @click="$open('course')" :disabled="isEmptyTicket || order.type === 'HIBACHI'"></fn>
      <fn icon="fa-tags" text="button.coupon" @click="promotion"></fn>
      <fn icon="fa-pause" text="button.hold" @click="done(false)"></fn>
      <fn icon="fa-calculator" text="button.modify" @click="modify"></fn>
      <fn icon="fa-times" text="button.exit" @click="dineInQuit"></fn>
    </div>
    <div class="bottomRight">
      <fn :class="{long:dineInOpt.useTable}" icon="fa-print" text="button.done" @click="done(true)"></fn>
      <fn icon="fa-hand-holding-usd" text="button.payment" @click="openPaymentModule" :disabled="op.cashCtrl === 'disable' || isEmptyTicket" v-if="!dineInOpt.useTable"></fn>
      <fn icon="fa-language" text="button.language" @click="switchLanguage"></fn>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
  <div class="grid" v-else-if="layout === 'BUFFET'">
    <fn icon="fa-minus-square" text="button.less" @click="less"></fn>
    <fn icon="fa-plus-square" text="button.more" @click="more"></fn>
    <fn icon="fa-calculator" text="button.modify" @click="modify"></fn>
    <fn class="settle" icon="fa-hand-holding-usd" text="button.payment" @click="openPaymentModule" :disabled="op.cashCtrl === 'disable' || isEmptyTicket"></fn>
    <fn icon="fa-save" @click="done(false)" text="button.save" :disabled="isEmptyTicket"></fn>
    <fn class="split" icon="fa-copy" @click="openSplit" text="button.split" :disabled="isEmptyTicket || order.hasOwnProperty('parent')"></fn>
    <fn icon="fa-tags" text="button.coupon" @click="promotion"></fn>
    <fn icon="fa-times" text="button.exit" @click="quit"></fn>
    <fn icon="fa-language" text="button.language" @click="switchLanguage"></fn>
    <div :is="component" :init="componentData"></div>
  </div>
  <div class="function" v-else>
    <fn icon="fa-minus-square" text="button.less" @click="less"></fn>
    <fn icon="fa-plus-square" text="button.more" @click="more"></fn>
    <fn icon="fa-comment-dots" text="button.request" @click="$emit('open','request')"></fn>
    <fn icon="fa-tags" text="button.coupon" @click="promotion"></fn>
    <fn icon="fa-user-clock" text="button.timer" @click="$open('timer')" :disabled="isEmptyTicket || order.hasOwnProperty('parent')"></fn>
    <fn icon="fa-print" text="button.print" @click="done(true)" :disabled="isEmptyTicket"></fn>
    <fn icon="fa-hand-holding-usd" text="button.payment" @click="openPaymentModule" :disabled="op.cashCtrl === 'disable' || isEmptyTicket"></fn>
    <fn icon="fa-copy" @click="openSplit" text="button.split" :disabled="order.hasOwnProperty('parent') || isEmptyTicket"></fn>
    <fn icon="fa-save" @click="done(false)" text="button.save" :disabled="isEmptyTicket"></fn>
    <fn icon="fa-calculator" text="button.modify" @click="modify"></fn>
    <fn icon="fa-times" text="button.exit" @click="quit"></fn>
    <fn icon="fa-language" text="button.language" @click="switchLanguage"></fn>
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
import fn from "../shared/fn";

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
    course,
    fn
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
    less() {
      if (this.isEmptyTicket) return;
      const boolean =
        !document.querySelector(".item.active") &&
        (!!document.querySelector("div.request") ||
          !!this.item.choiceSet.length);

      if (this.app.newTicket || this.item.new) {
        this.lessQty(boolean);
      } else {
        this.$checkPermission("modify", "item")
          .then(() => this.lessQty(boolean))
          .catch(() =>
            this.$log(
              `Operator [${this.op.name}] unable to delete item [${
                this.item[this.language]
              }]. Reason: Permission Denied.`
            )
          );
      }
    },
    more() {
      const focus = document.querySelector(".item.active");
      const subItemCount = Array.isArray(this.item.choiceSet)
        ? this.item.choiceSet
            .filter(item => item.subItem)
            .map(item => item.qty)
            .reduce((a, b) => a + b, 0)
        : 0;

      if (!focus && this.item.hasOwnProperty("rules")) {
        const max = this.item.rules.maxSubItem || Infinity;
        const overCharge = this.item.rules.overCharge || 0;

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

      const type = "choiceSet";
      const target = !!document.querySelector(".sub.target");
      const item = {
        qty: this.choiceSet ? this.choiceSet.qty : 1,
        single: this.choiceSet ? this.choiceSet.single : 0,
        discount: 0
      };

      target
        ? this.$open("modify", { item, type })
        : this.$open("modify", { item: this.item });
    },
    openPaymentModule(params) {
      this.$promise("payment", params)
        .then(this.exitComponent)
        .catch(exitParams => {
          this.exitComponent();

          exitParams &&
            exitParams.reload &&
            this.$splitEvenly(exitParams.split).then(() =>
              this.openPaymentModule(Object.assign({}, params, exitParams))
            );
        });
    },
    promotion() {
      this.$socket.emit("[COUPON] LIST", list => {
        // filter coupons
        const coupons = list
          .filter(coupon => coupon.enable)
          .map(coupon => Object.assign({}, coupon, { redeem: false }));

        this.$open("coupon", { coupons });
      });
    },
    openSplit() {
      if (this.isEmptyTicket || this.order.hasOwnProperty("parent")) return;

      this.$open("splitModule");
    },
    async done(print) {
      if (this.isEmptyTicket) return;

      const printCount = this.app.newTicket
        ? print
          ? 1
          : 0
        : print
          ? this.order.printCount + 1
          : this.order.printCount;

      Object.assign(this.order, {
        customer: this.$minifyCustomer(this.customer),
        printCount
      });

      // handle table status update logic
      this.table &&
        this.isDineInTicket &&
        this.dineInOpt.useTable &&
        this.table.status === -1 &&
        this.updateDineInTable(2);

      this.table &&
        Array.isArray(this.table.seats) &&
        this.order.type === "HIBACHI" &&
        this.updateHibachiTable();
      // end of

      try {
        // popup save confirm
        await this.promptConfirm(print);
        await this.checkPendingItem(print);

        // close save confirm dialog
        this.exitComponent();

        await this.initialPrint(print);
        await this.saveTicket(print);

        this.exit();
      } catch (exception) {
        switch (exception) {
          case undefined:
            this.exitComponent();
            break;
          case "EXIT":
            this.exit();
            break;
          default:
            this.exceptionHandler(exception);
        }
      }
    },
    promptConfirm(print) {
      // backward compatibility for older version
      const { defaults = {} } = this.config;

      return new Promise((next, stop) => {
        if (!print && defaults.saveConfirm) {
          const prompt = {
            title: "dialog.confirm.save",
            msg: "dialog.tip.unprintItemWarning"
          };

          this.$dialog(prompt)
            .then(next)
            .catch(stop);
        } else {
          // continue if no need to popup dialog
          next();
        }
      });
    },
    checkPendingItem(print) {
      return new Promise((next, stop) => {
        const pendingItems = this.order.content.filter(item => item.pending);

        if (!this.app.newTicket && pendingItems.length > 0 && print) {
          const prompt = {
            title: "dialog.printScheduleItems",
            msg: "dialog.schedulePrintTaskOngoing",
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.processAnyway", fn: "resolve" }
            ]
          };

          this.$dialog(prompt)
            .then(() => this.removeItemsFromSpooler(pendingItems, next))
            .catch(stop);
        } else {
          next();
        }
      });
    },
    exceptionHandler(error) {
      console.error(error);

      this.$log(
        `An error occurred when save the order [#${
          this.order.number
        }.] \nError Message:\n${error}`,
        "fatal"
      );

      const prompt = {
        type: "error",
        title: "dialog.somethingWrong",
        msg: "dialog.somethingWrongTip",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.$dialog(prompt).then(this.exitComponent);
    },
    removeItemsFromSpooler(items, callback) {
      const uniques = items.map(i => i.unique);

      this.spooler.forEach(task => {
        task.order.content = task.order.content.filter(
          i => !uniques.includes(i.unique)
        );
      });

      this.order.content.forEach(item => {
        item.pending = false;
      });

      callback();
    },
    initialPrint(print) {
      return new Promise((skip, done) => {
        const todo = this.order.content.filter(item => item.todo).length > 0;

        // if operator save the ticket we should remove item params to prevent selected item print
        if (!print && todo)
          this.order.content.forEach(item => {
            delete item.todo;
          });

        switch (this.ticket.type) {
          case "TO_GO":
            this.togoTicketHandler(print, done);
            break;
          case "HIBACHI":
            todo
              ? this.todoItemHandler(print, done)
              : this.hibachiTicketHandler(print, done);
            break;
          default:
            todo ? this.todoItemHandler(print, done) : skip();
        }
      });
    },
    togoTicketHandler(print, done) {
      // get original item from archived
      const order = this.archivedOrder;
      this.emptyArchiveOrder();

      // mark current item
      const items = this.order.content.map(item =>
        Object.assign({}, item, { print, orderType: "TO_GO" })
      );

      // combine current to original item list
      order.content.push(...items);
      this.$calculatePayment(order);
      this.$socket.emit("[ORDER] UPDATE", order, false);

      // print out to go items
      print && Printer.print(order, { target: "Order" });

      // exit order state
      done("EXIT");
    },
    todoItemHandler(print, done) {
      const order = clone(this.order);
      const items = order.content.filter(item => item.todo);
      const executeString = this.app.newTicket
        ? "[ORDER] SAVE"
        : "[ORDER] UPDATE";

      this.$socket.emit(executeString, this.order, false, ({ number }) => {
        order.number = number;
        const todo = Object.assign({}, order, { content: items });

        if (this.isDineInTicket) {
          this.dineInOpt.printOnDone
            ? Printer.print(todo)
            : Printer.print(todo, { target: "Order" });
        } else if (print) {
          Printer.print(order, { target: "Receipt" });
          Printer.print(todo, { target: "Order" });
        }

        done("EXIT");
      });
    },
    hibachiTicketHandler(print, done) {
      const { newTicket } = this.app;
      const hibachiPrinters = [];
      Object.keys(this.config.printers).forEach(name => {
        this.config.printers[name].type === "hibachi" &&
          hibachiPrinters.push(name);
      });

      let items = [];

      if (print) {
        this.order.content.forEach(item => {
          if (
            Object.keys(item.printer).every(
              name => !hibachiPrinters.includes(name)
            )
          ) {
            // get non-hibachi items for print
            // shallow copy item
            items.push(clone(item));
            item.print = true;
          }
        });
      }

      const executeString = newTicket ? "[ORDER] SAVE" : "[ORDER] UPDATE";

      this.$socket.emit(executeString, this.order, false, order => {
        Object.assign(order, { content: items });

        if (!newTicket) {
          // compare difference and overWrite
          order.content = this.compare(order);
        }

        this.dineInOpt.printOnDone
          ? Printer.print(order)
          : Printer.print(order, { target: "Order" });

        done("EXIT");
      });
    },
    saveTicket(print) {
      const { printOnDone = false, useTable = true } = this.dineInOpt;

      const items = this.app.newTicket
        ? this.order.content.map(item => item)
        : this.compare(this.order);

      const executeString = this.app.newTicket
        ? "[ORDER] SAVE"
        : "[ORDER] UPDATE";

      return new Promise(done => {
        this.$socket.emit(executeString, this.order, print, order => {
          Object.assign(order, { content: items });

          if (this.isDineInTicket && print) {
            printOnDone
              ? Printer.print(order)
              : Printer.print(order, { target: "Order" });
          } else {
            print && Printer.print(order);
          }
        });

        done();
      });
    },
    updateDineInTable(status) {
      Object.assign(this.table, { invoice: [this.order._id], status });
      this.$socket.emit("[TABLE] UPDATE", this.table);
    },
    updateHibachiTable() {
      this.table.seats.forEach(seat => {
        this.order.seats.includes(seat.name) &&
          Object.assign(seat, {
            invoice: this.order._id,
            session: this.order.session,
            number: this.order.number,
            status: 2
          });
      });

      this.$socket.emit("[TABLE] UPDATE", this.table);
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
    exit() {
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
        ? this.dismissTicket()
        : this.$dialog(prompt)
            .then(this.dismissTicket)
            .catch(this.exitComponent);
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
      this.dismissTicket();
    },
    dismissTicket() {
      this.resetAll();
      this.$router.push({ path: "/main" });
      this.$log(`#${this.ticket.number} Invoice was dismissed.`);
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

      return items;
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
      const { type } = this.order;

      return (
        type === "DINE_IN" ||
        type === "HIBACHI" ||
        type === "BAR" ||
        type === "TO_GO"
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
