<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="window">
      <header class="title">
        <span>{{$t("title.modify")}}</span>
        <span class="name">{{item[language]}}</span>
        <span class="price">${{total}}</span>
      </header>
      <section class="display">
        <div class="column target" @click="setPointer('single',$event)" ref="price">
          <h5>{{$t("text.single")}}</h5>
          <div>
            <span>$</span>
            <span class="value">{{item.single | decimal}}</span>
          </div>
        </div>
        <div class="column" @click="setPointer('qty',$event)" ref="qty">
          <h5>{{$t("text.qty")}}</h5>
          <div>
            <span class="value">{{item.qty}}</span>
          </div>
        </div>
        <div class="column discount" @click="setPointer('discount',$event)" ref="discount">
          <div class="unit">
            <input type="radio" name="unit" v-model="unit" id="cash" :value="true" @click="switchUnit">
            <label for="cash">$</label>
            <span>/</span>
            <input type="radio" name="unit" v-model="unit" id="pct" :value="false" @click="switchUnit">
            <label for="pct">%</label>
          </div>
          <h5>{{$t("text.discount")}}</h5>
          <div>
            <span v-show="unit">$</span>
            <span class="value">{{discount}}</span>
            <span v-show="!unit">%</span>
          </div>
        </div>
      </section>
      <div class="inner">
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
          <div @click="input('00')" class="numKey">00</div>
        </section>
        <aside class="padCtrl">
          <div @click="del">&#8592;</div>
          <div @click="clear">C</div>
          <div @click="confirm">&#8626;</div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  props: ["init"],
  data() {
    return {
      target: "single",
      item: null,
      reset: true,
      unit: false,
      discount: "0"
    };
  },
  created() {
    this.initial();
  },
  mounted() {
    !this.approval(this.op.modify, "price") && this.banPrice();
    !this.approval(this.op.modify, "discount") && this.banModify();
  },
  methods: {
    initial() {
      this.item = JSON.parse(JSON.stringify(this.init.item));
      if (this.item.split) {
        this.init.reject();
        return;
      }
      if (this.init.marketPrice) {
        this.item = Object.assign({}, this.item, {
          single: 0,
          qty: 1,
          price: [0],
          choiceSet: [],
          mark: [[], []],
          sort: 0,
          unique: String().random(4),
          print: false,
          pending: false,
          void: false,
          total: "0.00",
          side: ""
        });
      }
    },
    banPrice() {
      let dom = document.querySelector(".column.target");
      dom && dom.classList.remove("target");
      this.$refs.price.classList.add("ban");
      this.$refs.qty.classList.add("target");
      this.target = "qty";
    },
    banModify() {
      this.$refs.discount.classList.add("ban");
    },
    input(num) {
      switch (this.target) {
        case "single":
          if (this.item.single > 100) return;
          if (this.reset) {
            this.item.single = (parseFloat(num) / 100).toFixed(2);
          } else {
            let single = Math.round(parseFloat(this.item.single) * 100);
            single = (single ? single + num : num) / 100;
            this.item.single = single.toFixed(2);
          }
          break;
        case "qty":
          if ((this.reset && num === "0") || num === "00") return;
          this.reset
            ? (this.item.qty = num)
            : this.item.qty + num < 1000 &&
            (this.item.qty = String(this.item.qty) + num);
          break;
        case "discount":
          if (this.reset) {
            this.discount = this.unit ? "0.0" + num : num;
          } else {
            if (this.unit) {
              let discount = Math.round(parseFloat(this.discount) * 100);
              this.discount = ((discount + num) / 100).toFixed(2);
            } else {
              this.discount = Number(String(this.discount) + num);
            }
          }
          break;
      }
      this.reset = false;
    },
    setPointer(target, e) {
      document.querySelector(".column.target").classList.remove("target");
      e.currentTarget.classList.add("target");
      this.target = target;
      this.reset = true;
    },
    del() {
      switch (this.target) {
        case "single":
          let single = this.item.single.slice(0, -1) / 10;
          this.item.single = single.toFixed(2);
          break;
        case "qty":
          this.item.qty = ~~String(this.item.qty).slice(0, -1);
          break;
        case "discount":
          this.discount = (this.discount.slice(0, -1) / 10).toFixed(2);
          break;
      }
      this.item.total = (this.item.single * this.item.qty).toFixed(2);
    },
    clear() {
      switch (this.target) {
        case "single":
          this.item.single = "0.00";
          break;
        case "qty":
          this.item.qty = 1;
          break;
        case "discount":
          this.discount = this.unit ? "0.00" : "0";
          break;
      }
      this.reset = true;
    },
    switchUnit() {
      this.unit = !this.unit;
      this.discount = this.unit ? "0.00" : "0";
    },
    confirm() {
      this.init.type === "choiceSet"
        ? this.adjustChoiceSetItem()
        : this.adjustMenuItem();
    },
    adjustChoiceSetItem() {
      const single = toFixed(this.item.single, 2);
      this.setPriceForChoiceSet({
        single,
        total: (single * this.item.qty).toFixed(2),
        qty: ~~this.item.qty
      });
      this.init.resolve();
    },
    adjustMenuItem() {
      const single = toFixed(this.item.single,2);
      let discount = this.unit
        ? this.discount
        : single * this.item.qty * (this.discount / 100);
      let item = Object.assign({}, this.item, {
        single,
        price: [single],
        qty: ~~this.item.qty,
        total: (single * this.item.qty).toFixed(2)
      });

      const zhCN = this.unit ? "$ " + this.discount.toFixed(2) + " OFF": this.discount + " % " + this.$t('text.discount');
      const usEN = this.unit ? "$ " + this.discount.toFixed(2) + " OFF" : this.discount + " % Discount";

      discount > 0 &&
        item.choiceSet.push({
          qty: 1,
          zhCN,
          usEN,
          single: -discount,
          price: -discount
        });
      this.init.marketPrice
        ? (this.addToOrder(item), this.setSides(this.fillOption(item.option)))
        : this.alterItem(item);

      // this.$socket.emit("[SYS] RECORD", {
      //   type: "User",
      //   event: "modifyItem",
      //   status: 1,
      //   data: this.item,
      //   backup: this.init.item
      // });

      this.init.resolve();
    },
    fillOption(side) {
      let length = side.length;
      let array = side.slice();
      for (let i = length; i < 11; i++) {
        array.push({ zhCN: "", usEN: "", disable: true });
      }
      return array;
    },
    ...mapActions([
      "setSides",
      "alterItem",
      "addToOrder",
      "setPriceForChoiceSet"
    ])
  },
  computed: {
    total() {
      let single = parseFloat(this.item.single);
      let qty = parseFloat(this.item.qty);
      let discount = this.unit
        ? this.discount
        : single * qty * (this.discount / 100);
      return (single * qty - discount).toFixed(2);
    },
    ...mapGetters(["op", "app", "language"])
  }
};
</script>

<style scoped>
.window {
  width: 425px;
  transform: translateY(-41px);
}

.title {
  display: flex;
  align-content: center;
}

.name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 5px;
}

.inner {
  display: flex;
  padding: 0 2px 0 2px;
}

.display {
  height: 90px;
  padding: 2px;
  display: flex;
}

.price {
  color: #fff;
  float: right;
  background: #0069bd;
  padding: 0 5px;
  border-radius: 4px;
  box-shadow: 0 1px 1px #005294;
  font-family: "Agency FB";
  font-weight: bold;
}

section.numpad {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  flex: 3;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding-left: 2px;
}

section.numpad div:last-child {
  width: 205px;
}

.column {
  flex: 1;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  margin: 4px 3px;
  border-radius: 2px;
  color: #666;
  font-weight: lighter;
  transition: all 0.3s ease;
}

.column.target {
  color: #fff;
  background: #5c6bc0;
  text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
  font-weight: bold;
  flex: 2;
}

.column h5 {
  padding: 10px 5px 15px;
  font-size: 1.35em;
  font-weight: lighter;
}

.column > div {
  text-align: right;
  padding-right: 5px;
  font-size: 1.25em;
  font-family: "Agency FB";
}

.target .value {
  position: relative;
}

.target .value:after {
  height: 2px;
  width: 100%;
  background: #fff;
  content: " ";
  position: absolute;
  left: 0;
  bottom: -3px;
  animation: flash 1.5s ease infinite;
}

.unit {
  display: none;
  text-shadow: none;
}

.unit span {
  color: #7f90ea;
  text-shadow: none;
}

.target .unit {
  display: block;
}

.unit input {
  display: none;
}

.column div.unit {
  position: absolute;
  right: -5px;
  top: 13px;
  font-size: 16px !important;
  font-weight: lighter;
}

.discount {
  position: relative;
}

.ban {
  pointer-events: none;
  opacity: 0.8;
}

.unit label {
  color: #b6beea;
  padding: 5px 10px;
  font-weight: bold;
}

input:checked + label {
  color: #fff;
}

@keyframes flash {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
