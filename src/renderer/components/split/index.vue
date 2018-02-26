<template>
  <div class="popupMask dark center">
    <div class="editor">
      <header>
        <h5>{{$t('title.create')}}</h5>
        <h3>{{$t('title.split')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <div class="view" ref="scroll">
          <div class="scroll" :style="scroll">
            <ticket v-for="(order,index) in splits" :key="index" :index="index" :data="order" @acquire="transfer" :master="false" @destroy="destroy"></ticket>
          </div>
        </div>
        <div class="option" @click="create" v-if="!done">
          <div>
            <i class="fa fa-3x fa-plus"></i>
          </div>
        </div>
        <div class="option" v-else>
          <div @click="create">
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
          <div class="switches">
            <label class="input-toggle">
              <input type="checkbox" v-model="swipeMode" :disabled="true">
              <span></span>
            </label>
            <label class="label indent">{{$t("text.swipeMode")}}</label>
          </div>
        </div>
        <button class="btn" @click="init.reject">{{$t('button.back')}}</button>
        <button class="btn" @click="confirm" :disabled="!done">{{$t('button.confirm')}}</button>
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
      return { transform: `translate3d(${this.offset}px,0,0)` };
    },
    ...mapGetters(["app", "ticket"])
  },
  data() {
    return {
      order: JSON.parse(JSON.stringify(this.$store.getters.order)),
      swipeMode: false,
      hammer: null,
      done: false,
      splits: [],
      offset: 0
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
      this.$socket.emit("[SPLIT] GET", this.order.children, splits => {
        const orders = splits.filter(order => order);
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
    create() {
      const _id = ObjectId();
      const order = clone(this.order);

      let content = [];
      let payment = {
        subtotal: 0,
        tax: 0,
        total: 0,
        due: 0,
        balance: 0,
        paid: 0,
        gratuity: 0,
        tip: 0,
        discount: 0,
        delivery: 0,
        surcharge: 0,
        remain: 0,
        log: []
      };

      this.$children.map(vm => content.push(...vm.buffer));
      const split = Object.assign({}, order, { _id, content, payment });
      this.splits.push(split);
      this.$bus.emit("remove");

      content.length && content[0].__split__ && this.$bus.emit("release");
    },
    transfer({ unique, index }) {
      let buffer = [];
      this.$children.map(vm =>
        vm.buffer.forEach(item => buffer.push(clone(item)))
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
      const dom = this.$refs.scroll;
      this.hammer = new Hammer(dom);
      this.hammer.get("swipe").set({ direction: Hammer.DIRECTION_HORIZONTAL });
      this.hammer.on("swipeleft swiperight", e => {
        switch (e.type) {
          case "swipeleft":
            this.checkBoundary(-1);
            break;
          case "swiperight":
            this.checkBoundary(+1);
            break;
        }
      });
    },
    checkBoundary(direction) {
      this.$nextTick(() => {
        const parent = document.querySelector(".view").getBoundingClientRect();
        const child = document.querySelector(".scroll").getBoundingClientRect();
        const leftDiff = child.left - parent.left;
        const rightDiff = child.right - parent.right;
        const actualWidth = this.calWidth();
        const fixedWidth = 260;

        let offset = this.offset + 260 * direction;
        offset = offset === -260 ? -98 : offset;
        offset = offset === 162 ? 0 : offset;
        this.offset = offset;
      });
    },
    calWidth() {
      let width = 0;
      const doms = document.querySelectorAll(".view .invoice");

      for (let dom of doms) {
        width += dom.getBoundingClientRect().width;
      }
      return width;
    },
    setDone(boolean) {
      this.done = boolean;
    },
    destroy({ _id, index }) {
      //const orders = this.$children.filter((vm, index) => index !== 0).map(vm => vm.order).filter((order, index) => order._id !== _id);
      return;
    },
    confirm() {
      const parent = this.order._id;
      const splits = this.$children
        .map(vm => vm.order)
        .filter((order, index) => index !== 0 && order.content.length !== 0);

      if (this.app.newTicket && this.$route.name === "Menu") {
        const { number, type } = this.ticket;

        this.order.number = number;
        this.order.type = type;
      }

      let tip = 0;
      let tax = 0;
      let subtotal = 0;
      let delivery = 0;
      let total = 0;
      let discount = 0;
      let balance = 0;
      let due = 0;
      let remain = 0;

      if (splits.length > 1) {
        splits.forEach((order, index) => {
          order.parent = parent;
          order.number = `${this.order.number}-${index + 1}`;

          tip += order.payment.tip;
          tax += order.payment.tax;
          subtotal += order.payment.subtotal;
          delivery += order.payment.delivery;
          total += order.payment.total;
          due += order.payment.due;
          discount += order.payment.discount;
          balance += order.payment.balance;
          remain += order.payment.remain;
        });

        this.$socket.emit("[SPLIT] SAVE", { splits, parent });

        this.order.payment.tip = toFixed(tip, 2);
        this.order.payment.tax = toFixed(tax, 2);
        this.order.payment.subtotal = toFixed(subtotal, 2);
        this.order.payment.total = toFixed(total, 2);
        this.order.payment.discount = toFixed(discount, 2);
        this.order.payment.delivery = toFixed(delivery, 2);
        this.order.payment.due = toFixed(due, 2);
        this.order.payment.balance = toFixed(balance, 2);
        this.order.payment.remain = toFixed(remain, 2);
        this.order.content.forEach(item => (item.split = true));
        this.order.children = splits.map(i => i._id);
        this.order.split = true;

        this.setOrder(this.order);
        this.$socket.emit("[UPDATE] INVOICE", this.order);
        this.init.resolve();
      } else {
        this.$socket.emit("[SPLIT] SAVE", { splits: [], parent });

        const { payment } = splits.find(order => order.content !== 0);

        payment.discount = 0;
        payment.paid = 0;

        Object.assign(this.order, { payment });

        this.order.content.forEach(item => (item.split = false));
        this.order.split = false;
        this.order.children = [];
        this.order.coupons = [];
        
        this.setOrder(this.order);
        this.$socket.emit("[UPDATE] INVOICE", this.order);
        this.init.resolve();
      }
    },
    ...mapActions(["setOrder"])
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
  transition: transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
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
</style>