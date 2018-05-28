<template>
  <div class="invoice" :class="{ban}">
    <ul @click.self="tap" @dblclick.self="pickAll" v-if="enable" :class="[unique]" :ref="unique" :style="scroll">
      <li v-for="(item,index) in order.content" :key="index" @click.prevent.stop="pick(item)" :data-unique="item.unique" v-show="!item.split">
        <div class="main">
          <span class="qty deno" :data-deno="item.deno" v-if="item.deno">{{item.qty}}</span>
          <span class="qty" v-else>{{item.qty}}</span>
          <span class="f1">
            <span>{{item[language]}}</span>
            <span class="side">{{item.side[language]}}</span>
          </span>
          <template v-if="master">
            <i class="fa fa-clone" @click.stop="unsplit(index)" v-if="item.lock"></i>
            <i class="fa fa-square-o" @click.stop="setSplit(index)" v-else></i>
          </template>
          <template v-else>
            <span>{{item.total}}</span>
            <i class="fa fa-trash" @click.stop="del(item)"></i>
          </template>
        </div>
        <div class="sub">
          <p v-for="(sub,idx) in item.choiceSet" :key="idx">
            <span class="qty">{{item.qty}}</span>
            <span>{{sub[language]}}</span>
          </p>
        </div>
      </li>
    </ul>
    <template v-if="master">
      <div class="toggle" v-if="buffer.length === 0" @click="selectAll">
        <i class="fa fa-check-square-o"></i>
        <span>{{$t('button.selectAll')}}</span>
      </div>
      <div class="toggle" v-else @click="selectAll">
        <i class="fa fa-square-o"></i>
        <span>{{$t('button.unset')}}</span>
      </div>
    </template>
    <template v-else>
      <div class="tooltip">
        <i class="fa fa-warning"></i>
        <span>{{reason}}</span>
      </div>
      <div class="settle" @click="tap">
        <p class="total">$ {{order.payment.remain | decimal}}
          <span class="tip">( {{order.payment.tax | decimal}} )</span>
        </p>
        <i class="fa fa-bars" @click.stop="ticketConfig"></i>
      </div>
    </template>
    <div :is="component" :init="componentData" @config="applyConfig" @discount="setDiscount" @coupon="setCoupon" @resetDiscount="resetDiscount" @pick="pickGroup"></div>
  </div>
</template>

<script>
import hammer from "hammerjs";
import { mapGetters } from "vuex";
import evener from "./component/evener";
import options from "./component/options";
import splitor from "./component/splitor";
import { isArray } from "util";

export default {
  props: ["data", "master", "index"],
  components: { splitor, evener, options },
  computed: {
    scroll() {
      return { transform: `translate3d(0,${this.offset}px,0)` };
    },
    enable() {
      return this.master
        ? this.order.content.filter(i => !i.split).length !== 0 ||
            !!this.component
        : true;
    },
    ...mapGetters(["tax", "dinein", "store"])
  },
  data() {
    return {
      order: this.data,
      language: this.$store.getters.language,
      unique: String().random(4),
      componentData: null,
      component: null,
      hammer: null,
      reason: "",
      ban: false,
      buffer: [],
      offset: 0,
      lastDelta: 0
    };
  },
  created() {
    if (this.master) {
      this.$bus.on("remove", this.hide);
      this.$bus.on("restore", this.restore);
      this.$bus.on("splitOut", this.splitList);

      this.order.content.forEach(item => (item.lock = false));
    } else {
      this.$bus.on("remove", this.remove);
      this.$bus.on("transfer", this.transfer);
      this.$bus.on("collect", this.recycle);
      this.$bus.on("destroy", this.recycle);
      this.$bus.on("__THREAD__CLOSE", this.handleThreadResult);

      if (this.order.settled) {
        this.ban = true;
        this.reason = this.$t("dialog.ticketClosed");
      } else if (this.order.payment.log.length) {
        this.ban = true;
        this.reason = this.$t("dialog.paymentFound");
      }
    }
  },
  mounted() {
    this.$calculatePayment(this.order, { selfAssign: true });
    //register scroll event
    const dom = this.$refs[this.unique];
    if (dom) {
      this.hammer = new Hammer(dom);
      this.hammer.get("swipe").set({ direction: Hammer.DIRECTION_VERTICAL });
      this.hammer.get("pan").set({ direction: Hammer.DIRECTION_VERTICAL });
      this.hammer.on("panstart panend panup pandown", e => {
        switch (e.type) {
          case "panstart":
            dom.classList.remove("reverse");
            dom.classList.add("block");
            break;
          case "panend":
            setTimeout(() => {
              dom.classList.add("reverse");
              const parent = document
                .querySelector(".invoice")
                .getBoundingClientRect();
              const { height, top, bottom } = dom.getBoundingClientRect();
              const topDiff = top - parent.top;
              const botDiff = bottom - parent.bottom;

              const actual = this.calHeight();
              if (actual < 450) {
                this.offset = 0;
                this.lastDelta = 0;
              } else if (topDiff > 0) {
                this.offset = 0;
                this.lastDelta = 0;
              } else if (botDiff > 0) {
                this.lastDelta = topDiff;
              } else {
                this.offset = -actual + 450;
                this.lastDelta = this.offset;
              }
            });

            setTimeout(() => {
              dom.classList.remove("block");
            }, 150);
            break;
          case "panup":
          case "pandown":
            this.offset = this.lastDelta + e.deltaY;
            break;
          case "swipeup":
            this.order.content.length === 0 &&
              this.$emit("destroy", { _id: this.order._id, index: this.index });
            break;
        }

        return false;
      });
    }
  },
  beforeDestroy() {
    if (this.master) {
      this.$bus.off("remove", this.hide);
      this.$bus.off("restore", this.restore);
      this.$bus.off("splitOut", this.splitList);
    } else {
      this.$bus.off("remove", this.remove);
      this.$bus.off("transfer", this.transfer);
      this.$bus.off("collect", this.recycle);
      this.$bus.off("destroy", this.recycle);
      this.$bus.off("__THREAD__CLOSE", this.handleThreadResult);
    }
  },
  methods: {
    pick(item) {
      if (this.master) {
        item = Object.assign(Object.create(Object.getPrototypeOf(item)), item, {
          parent: item.unique
        });
      }

      const index = this.buffer.findIndex(i => i.unique === item.unique);
      index !== -1 ? this.buffer.splice(index, 1) : this.buffer.push(item);
    },
    pickAll() {
      if (!this.master) {
        this.buffer = [];
        this.order.content.forEach(item => this.buffer.push(item));
      }
    },
    pickGroup(items) {
      if (this.master) {
        this.buffer = [];
        items.forEach(item => this.buffer.push(item));
      }
    },
    hide(item) {
      this.buffer.forEach(({ unique }) => {
        const index = this.order.content.findIndex(i => i.unique === unique);
        if (index !== -1) this.order.content[index].split = true;
      });
      this.order.content.splice();
      this.buffer = [];

      this.$nextTick(() => {
        const remain = this.order.content.filter(i => !i.split).length;
        const done = remain === 0 && !this.component;
        this.$emit("done", done);
      });
    },
    remove() {
      const uniques = this.buffer.map(i => i.unique);
      this.order.content = this.order.content.filter(
        i => !uniques.includes(i.unique)
      );
      this.buffer = [];
    },
    recycle(items) {
      this.order.content = this.order.content.filter(
        i => !items.includes(i.parent)
      );
      this.buffer = [];
    },
    restore(items) {
      let collector = [];
      this.order.content.forEach(item => {
        if (items.includes(item.unique)) {
          item.lock && collector.push(item.unique);
          item.split = false;
          item.lock = false;
        }
      });
      this.buffer = [];
      this.order.content.splice();
      this.$bus.emit("remove");

      collector.length && this.$bus.emit("collect", collector);
    },
    transfer({ unique, items }) {
      if (this.unique === unique) {
        this.order.content.push(...items.filter(item => !item.lock));

        const evenSplit = items.filter(item => item.lock);
        evenSplit.length > 0 && this.popDialogFor(evenSplit);

        items[0] && items[0].__split__ && this.$bus.emit("release");
      }
      items.length &&
        this.$nextTick(() => {
          const height = this.calHeight();
          if (height - 450 > 0) {
            this.$refs[this.unique].classList.add("reverse");
            this.offset = 450 - height;
          }
        });

      this.$bus.emit("remove");
    },
    popDialogFor(items) {
      const qty = Math.max(2, ...items.map(i => i.qty));

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, qty };
        this.component = "evener";
      })
        .then(qty => {
          let _items = [];

          items.forEach(item => {
            item.__split__ = true;
            item.lock = false;
            item.deno = qty;

            if (item.qty === qty) {
              item.qty = 1;
              item.total = item.single.toFixed(2);
            } else {
              item.single = toFixed(item.single / qty, 2);
              item.total = (item.single * item.qty).toFixed(2);
            }

            item.choiceSet.forEach(set => {
              set.single = toFixed(set.single / qty, 2);
              set.price = toFixed(set.single * set.qty, 2);
            });
          });

          for (let i = 0; i < qty; i++) {
            _items.push([...JSON.parse(JSON.stringify(items))]);
          }

          _items.forEach((group, g) => {
            group.forEach((item, i) => {
              _items[g][i].unique = Math.random()
                .toString(36)
                .substr(2, 5);
            });
          });

          _items.splice(0, 1)[0].forEach(item => this.order.content.push(item));

          this.$bus.emit("splitOut", _items);

          this.exitComponent();
        })
        .catch(() => {
          this.$bus.emit(
            "restore",
            items.filter(i => i.parent).map(i => i.parent)
          );
          this.exitComponent();
        });
    },
    splitList(items) {
      new Promise(resolve => {
        this.componentData = { resolve, items };
        this.component = "splitor";
      }).then(() => {
        const target = items.map(i => i.parent);

        this.order.content.forEach(item => {
          if (target.includes(item.unique)) item.split = true;
        });
        this.buffer = [];
        this.exitComponent();
      });
    },
    ticketConfig() {
      const taxFree = this.order.taxFree || false;
      const deliveryFree = this.order.deliveryFree || false;
      const gratuityFree = this.order.gratuityFree || false;
      const isDiscount = this.order.payment.discount > 0;
      const { type } = this.order;

      !this.component
        ? this.$open("options", {
            taxFree,
            deliveryFree,
            gratuityFree,
            type,
            isDiscount
          })
        : this.exitComponent();
    },
    applyConfig(params) {
      Object.assign(this.order, params);
      this.$calculatePayment(this.order, { selfAssign: true });
    },
    setDiscount() {
      this.$bus.emit("__THREAD__OPEN", {
        threadID: this.unique,
        component: "discount",
        args: {
          payment: this.order.payment
        }
      });
    },
    resetDiscount() {
      this.order.coupons = [];
      this.$calculatePayment(this.order, { selfAssign: true });
    },
    setCoupon() {
      this.$bus.emit("__THREAD__OPEN", {
        threadID: this.unique,
        component: "coupon",
        args: {
          order: this.order
        }
      });
    },
    handleThreadResult({ result, component, threadID }) {
      if (threadID !== this.unique) return;

      switch (component) {
        case "discount":
          const { discount, coupon } = result;

          let coupons = this.order.coupons.filter(
            coupon => coupon.code !== "UnitedPOS Inc"
          );
          discount > 0 && coupons.push(coupon);

          this.order.coupons = coupons;
          this.componentData.isDiscount = discount > 0;
          break;
        case "coupon":
          const refs = result
            .filter(coupon => coupon.type === "giveaway")
            .map(coupon => coupon.reference)
            .reduce((a, b) => a.concat(b), []);

          refs.forEach(item => {
            Object.assign(item, {
              unique: Math.random()
                .toString(36)
                .substr(2, 5),
              print: false,
              pending: false,
              void: false,
              qty: 1,
              choiceSet: [],
              single: parseFloat(item.price[0]),
              total: item.price[0].toFixed(2)
            });
            this.order.content.push(item);
          });

          this.order.coupons = result;
          break;
        case "dialog":
          if (result) {
            this.$emit("delete", this.buffer);
            this.remove();
          }
          break;
      }
      this.$calculatePayment(this.order,{ selfAssign: true });

      if (this.componentData)
        this.componentData.isDiscount = this.order.payment.discount > 0;
    },
    tap() {
      this.buffer = [];
      this.$emit("acquire", { index: this.index, unique: this.unique });
      this.order.content.forEach(item => Object.assign(item, { lock: false }));
    },
    selectAll() {
      this.order.content.filter(i => !i.split).forEach(item => this.pick(item));
    },
    calHeight() {
      const doms = document.querySelectorAll(`ul.${this.unique} li`);
      let height = 0;

      for (let dom of doms) {
        height += dom.getBoundingClientRect().height;
      }

      return height;
    },
    setSplit(index) {
      this.buffer.forEach(item => Object.assign(item, { lock: true }));
      const uniques = this.buffer.map(item => item.unique);
      this.order.content.forEach(item => {
        uniques.includes(item.unique) && Object.assign(item, { lock: true });
      });
      this.order.content.splice();
    },
    unsplit(index) {
      const item = this.order.content[index];
      item.lock = false;
      this.order.content.splice(index, 1, item);

      const target = this.buffer.find(i => i.unique === item.unique);
      target.lock = item.lock;
    },
    del(item) {
      const prompt = {
        title: "dialog.splitItemRemove",
        msg: ["dialog.splitItemRemoveConfirm", this.buffer.length]
      };

      this.$bus.emit("__THREAD__OPEN", {
        threadID: this.unique,
        component: "dialog",
        args: prompt
      });
    }
  },
  watch: {
    buffer(items) {
      const uniques = items.map(i => i.unique);
      const picked = document.querySelectorAll(`ul.${this.unique} li.picked`);
      for (let dom of picked) {
        dom.classList.remove("picked");
      }

      uniques.forEach(unique => {
        const dom = document.querySelector(`[data-unique="${unique}"]`);
        dom && dom.classList.add("picked");
      });
    },
    "order": "$calculatePayment"
  }
};
</script>

<style scoped>
.invoice {
  position: relative;
  height: 490px;
  overflow: hidden;
  margin: 5px;
  background: url(../../assets/image/outer.jpg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

ul {
  width: 250px;
  height: 200%;
  background: #fafafa;
}

li {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 30px;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 5px 5px 5px 0;
}

li.picked {
  background: #9e9e9e;
  text-shadow: 0 1px 1px #333;
}

.toggle {
  flex-direction: row;
  align-items: center;
  background: #90a4ae;
  bottom: 0;
  position: absolute;
  width: 240px;
  border: none;
  cursor: pointer;
  color: #fcfcfc;
  display: flex;
  height: 39px;
  padding: 0 5px;
  justify-content: center;
}

.toggle i {
  margin-right: 5px;
}

.settle {
  flex-direction: row;
  align-items: center;
  padding: 0 0 0 15px;
  position: absolute;
  width: 235px;
  height: 40px;
  bottom: 0;
  border-top: 1px solid #eceff1;
  background: #f5f5f5;
  display: flex;
}

.settle p {
  flex: 1;
}

.settle i {
  cursor: pointer;
  padding: 11px 15px 11px 35px;
}

.total {
  font-weight: bold;
  font-family: "Agency FB";
  color: #009688;
}

.tip {
  font-weight: lighter;
  margin-left: 5px;
  font-size: 0.8em;
  color: rgba(0, 0, 0, 0.5);
}

.invoice.ban {
  pointer-events: none;
}

.invoice.ban:after {
  content: " ";
  background: rgba(0, 0, 0, 0.3);
  width: 250px;
  height: 450px;
  position: absolute;
  top: 0;
  z-index: 0;
}

.invoice.ban .tooltip {
  display: flex;
}

.tooltip {
  top: 43%;
  position: absolute;
  width: 250px;
  flex-direction: row;
  align-items: center;
  color: #fafafa;
  background: #f44336;
  text-shadow: 0 1px 1px #333;
  display: none;
  z-index: 1;
  border: none;
  justify-content: center;
  padding: 5px 0;
}

.main {
  position: relative;
  display: flex;
}

.main > i {
  display: none;
  position: absolute;
  right: -5px;
  top: -5px;
  padding: 5px 15px;
  background: #9e9e9e;
  cursor: pointer;
}

.picked .main i {
  display: initial;
}

.main .deno.qty {
  text-align: left;
  position: relative;
  text-indent: 4px;
}

.deno.qty:after {
  content: attr(data-deno);
  position: absolute;
  top: 8px;
  right: 1px;
}

.deno.qty:before {
  content: "/";
  position: absolute;
  right: 8px;
  top: 3px;
}

.main .qty {
  display: inline-block;
  min-width: 25px;
  text-align: center;
}

.side {
  color: rgba(0, 0, 0, 0.5);
  margin-left: 2px;
}

.sub {
  color: #ff9800;
  font-size: 0.8em;
  text-indent: 2em;
}

.sub .qty:after {
  content: " x ";
}

li.picked .main,
li.picked .main .side,
li.picked .sub {
  color: #fff;
}

.reverse {
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.block:after {
  content: " ";
  background: transparent;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  z-index: 2;
  display: block;
  position: absolute;
}
</style>