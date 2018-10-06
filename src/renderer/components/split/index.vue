<template>
  <div class="popupMask dark center">
    <div class="editor">
      <header>
        <div class="f1">
          <h5>{{$t(order.split ? 'title.edit' : 'title.create')}}</h5>
          <h3>{{$t('title.split')}}</h3>
        </div>
        <button class="remove" v-show="order.split" @click="rollback">{{$t('button.restore')}}</button>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <div class="view">
          <div class="scroll" :style="scroll" ref="tickets">
            <ticket v-for="(order,index) in splits" :key="index" :index="index" :data="order" @acquire="transfer" @delete="remove" :master="false" @destroy="destroy"></ticket>
          </div>
        </div>
        <div class="option" @click="createSplit" v-if="!done">
          <div>
            <i class="fa fa-3x fa-plus"></i>
          </div>
        </div>
        <div class="option" v-else>
          <div @click="createSplit">
            <i class="fa fa-3x fa fa-plus"></i>
          </div>
          <div @click="restore">
            <i class="fa fa-3x fa fa-minus"></i>
          </div>
        </div>
        <ticket :data="order" :master="true" @acquire="restore" @done="setDone"></ticket>
      </div>
      <footer>
        <div class="opt">
          <div class="swipe" ref="pan">{{$t('text.swipeArea')}}</div>
        </div>
        <button class="btn" @click="init.reject">{{$t('button.exit')}}</button>
        <button class="btn" @click="call('printTicket',true)" :disabled="!done || $route.name === 'Menu'">{{$t('button.printAll')}}</button>
        <button class="btn" @click="call('confirmSplit',false)" :disabled="!done">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import ticket from "./ticket";
import Hammer from "hammerjs";

export default {
  props: ["init"],
  components: { ticket },
  computed: {
    scroll() {
      return { transform: `translate3d(${this.horizontal}px,0,0)` };
    },
    ...mapGetters([
      "app",
      "tax",
      "table",
      "store",
      "ticket",
      "customer",
      "dineInOpt"
    ])
  },
  data() {
    return {
      order: JSON.parse(JSON.stringify(this.$store.getters.order)),
      hammer: null,
      done: false,
      splits: [],
      horizontal: 0,
      lastHorizontalDelta: 0
    };
  },
  created() {
    this.order.split && this.getSplitOrder();
  },
  mounted() {
    this.registerSwipeEvent();
  },
  methods: {
    getSplitOrder() {
      this.$socket.emit("[SPLIT] GET", this.order._id, splits => {
        const orders = splits.sort((a, b) => a.number.localeCompare(b.number));
        if (orders.length) {
          this.splits = orders;
          this.done = this.order.content.every(item => item.split);
        } else {
          this.order.content = this.order.content.map(item =>
            Object.assign(item, { split: false })
          );
          this.done = false;
        }
      });
    },
    createSplit() {
      const _id = ObjectId().toString();
      const order = JSON.parse(JSON.stringify(this.order));

      let content = [];
      let payment = {
        subtotal: 0,
        tax: 0,
        plasticTax: 0,
        total: 0,
        due: 0,
        balance: 0,
        paid: 0,
        gratuity: 0,
        tip: 0,
        discount: 0,
        delivery: 0,
        rounding: 0,
        surcharge: 0,
        remain: 0
      };

      this.$children.map(vm => content.push(...vm.buffer));
      const split = Object.assign({}, order, {
        _id,
        content,
        payment,
        logs: []
      });

      if (content.some(item => item.lock)) {
        split.content = [];
        this.splits.push(split);

        this.$nextTick(() => {
          let target = Array.from(this.$refs.tickets.children).last();
          this.transfer({ unique: target.dataset.unique });
        });
      } else {
        this.splits.push(split);
        this.$bus.emit("remove");
        content.length && content[0].__split__ && this.$bus.emit("release");
      }
    },
    transfer({ unique }) {
      let buffer = [];
      this.$children.map(vm =>
        vm.buffer.forEach(item => buffer.push(JSON.parse(JSON.stringify(item))))
      );
      this.$bus.emit("transfer", {
        unique,
        items: buffer
      });
    },
    restore() {
      let buffer = [];
      this.$children.map(vm => vm.buffer.forEach(item => buffer.push(item)));

      const items = buffer.filter(item => item.parent).map(item => item.parent);
      this.$bus.emit("restore", items);

      if (items.length) this.done = false;

      const __split__ = buffer.some(item => item.__split__);
      __split__ && this.$bus.emit("destroy", items);
    },
    registerSwipeEvent() {
      const pan = new Hammer(this.$refs.pan);
      pan.get("pan").set({ direction: Hammer.DIRECTION_HORIZONTAL });
      pan.on("panleft panright panend", e => {
        if (this.$children.length === 1) return;

        switch (e.type) {
          case "panleft":
          case "panright":
            this.horizontal = this.lastHorizontalDelta + e.deltaX * 1.5;
            break;
          case "panend":
            //this.checkCoolide(e.additionalEvent);
            this.lastHorizontalDelta = this.horizontal;
        }
      });
    },
    checkCoolide(direction) {
      const doms =
        direction === "panleft"
          ? Array.from(this.$refs.tickets.children)
          : Array.from(this.$refs.tickets.children).reverse();

      const target = document.querySelector(`div.view`);
      const overlay = doms.find(dom => util.isCollide(target, dom));

      if (overlay) {
        const {
          left: parentLeft,
          right: parentRight
        } = target.getBoundingClientRect();
        const {
          left: overlayLeft,
          right: overlayRight
        } = overlay.getBoundingClientRect();

        const diffs =
          direction === "panleft"
            ? overlayLeft - parentLeft - 5
            : overlayRight - parentRight + 5;

        util.ease({
          start: this.horizontal,
          end: this.horizontal - diffs,
          progress: value => {
            this.horizontal = value;
          },
          done: () => {
            this.lastHorizontalDelta = this.horizontal;
          }
        });
      }
    },
    setDone(boolean) {
      this.done = boolean;
    },
    destroy({ _id, index }) {
      //const orders = this.$children.filter((vm, index) => index !== 0).map(vm => vm.order).filter((order, index) => order._id !== _id);
      return;
    },
    remove(items) {
      items.forEach(({ unique, parent, __split__ = false }) => {
        if (__split__) {
          const index = this.order.content.findIndex(
            item => item.unique === parent
          );
          const target = this.order.content[index];

          if (target.qty > 1) {
            target.total = (--target.qty * target.single).toFixed(2);
          } else {
            this.order.content = this.order.content.filter(
              item => item.unique !== parent
            );
          }
        } else {
          this.order.content = this.order.content.filter(
            item => item.unique !== unique
          );
        }
      });
    },
    rollback() {
      this.$socket.emit("[SPLIT] SAVE", { splits: [], parent: this.order._id });
      this.order.coupons = [];
      this.order.children = [];
      this.order.split = false;
      this.order.payment.discount = 0;
      this.$calculatePayment(this.order);
      this.order.content.forEach(item => Object.assign(item, { split: false }));

      this.setOrder(this.order);
      this.$socket.emit("[ORDER] UPDATE", this.order);
      this.init.resolve();
    },
    call(fn, print) {
      if (this.app.newTicket && this.$route.name === "Menu") {
        this.$socket.emit("[ORDER] SAVE", this.order, print, order => {
          Object.assign(this.order, order);
          this.setApp({ newTicket: false });

          if (this.dineInOpt.useTable && this.order.session) {
            this.$socket.emit(
              "[TABLE] UPDATE",
              Object.assign(this.table, {
                invoice: [this.order._id],
                status: 2
              })
            );
          }

          this[fn](print);
        });
      } else {
        this[fn](print);
      }
    },
    printTicket(print) {
      const { number, time } = this.order;

      this.$children
        .filter(
          (instance, index) =>
            index !== 0 && instance.order.content.length !== 0
        )
        .map(instance => instance.order)
        .forEach((ticket, index) =>
          Printer.print(
            Object.assign(ticket, { time, number: `${number}-${index + 1}` }),
            { target: "Receipt", receipt: true }
          )
        );

      this.done && this.confirmSplit(print);
    },
    confirmSplit(print) {
      if (document.getElementsByClassName("evener").length > 0) return;
      if (document.getElementsByClassName("split-item-list").length > 0) return;

      const parent = this.order._id;
      const splits = this.$children
        .map(vm => {
          if (print) {
            vm.order.content.forEach(item =>
              Object.assign(item, { print: true })
            );
            vm.order.print = true;
          }

          return vm.order;
        })
        .filter((order, index) => index !== 0 && order.content.length !== 0);

      let payments = {};

      if (splits.length > 1) {
        splits.forEach((order, index) => {
          order.parent = parent;
          order.time = order.time || this.order.time || Date.now();
          order.number = `${this.order.number}-${index + 1}`;

          const { payment } = order;

          Object.keys(payment).forEach(key => {
            if (payments[key]) {
              payments[key] += payment[key];
            } else {
              payments[key] = payment[key];
            }
          });
        });

        payments.rounding = this.$rounding(
          toFixed((payments.due + payments.gratuity) * 100, 2)
        );
        payments.balance = toFixed(
          payments.due + payments.gratuity + payments.rounding,
          2
        );
        payments.remain = toFixed(payments.balance - payments.paid, 2);

        Object.keys(payments).forEach(key => {
          this.order.payment[key] = toFixed(payments[key], 2);
        });

        this.$socket.emit("[SPLIT] SAVE", { splits, parent });

        this.order.content.forEach(item =>
          Object.assign(item, { split: true })
        );
        this.order.children = splits.map(i => i._id);
        this.order.split = true;

        if (print) this.order.print = true;

        Object.assign(this.order.payment, payments);

        this.setOrder(this.order);
        this.$socket.emit("[ORDER] UPDATE", this.order);
        this.init.resolve();
      } else {
        this.rollback();
      }
    },
    ...mapActions(["setApp", "setOrder"])
  }
};
</script>

<style scoped>
.editor {
  width: 1000px;
}

.wrap {
  display: flex;
  min-height: 500px;
  padding: initial;
  background: url(../../assets/image/slid.jpg) #fcfcfc;
}

.view {
  flex: 1;
  display: flex;
  flex-direction: row-reverse;
  width: 618px;
  overflow: hidden;
  position: relative;
}

.view .scroll {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  /* transition: transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94); */
}

.option {
  display: flex;
  flex-direction: column;
}

.option div {
  display: flex;
  width: 110px;
  flex: 1;
  justify-content: center;
  align-items: center;
  color: #757575;
  border: 2px dashed #eee;
  margin: 4px;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.switches {
  display: flex;
}

.switches .label {
  margin-left: 5px;
}

.swipe {
  width: 100%;
  height: 50px;
  border: 2px dashed #e0e0e0;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  transition: background 0.3s ease-out;
  font-family: "Microsoft YaHei";
  text-transform: uppercase;
  font-size: 2em;
  color: #cacaca;
}

.swipe:active {
  background: #fff;
}
</style>