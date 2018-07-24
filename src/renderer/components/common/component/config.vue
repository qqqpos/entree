<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <transition appear name="fadeUp">
      <div class="config" :style="offsetTop" v-show="!component">
        <div class="option">
          <label class="f1" for="tax">{{$t('text.taxFree')}}</label>
          <label class="input-toggle">
            <input type="checkbox" v-model="init.taxFree" @change="toggleTax" id="tax">
            <span></span>
          </label>
        </div>
        <div class="option">
          <label class="f1" for="delivery">{{$t('text.deliveryFree')}}</label>
          <label class="input-toggle" @change="toggleDelivery">
            <input type="checkbox" v-model="init.deliveryFree" id="delivery">
            <span></span>
          </label>
        </div>
        <div class="option">
          <label class="f1" for="gratuity">{{$t('text.gratuityFree')}}</label>
          <label class="input-toggle" @change="toggleGratuity">
            <input type="checkbox" v-model="init.gratuityFree" id="gratuity">
            <span></span>
          </label>
        </div>
        <div class="option">
          <label class="f1" for="category">{{$t('text.displayCategory')}}</label>
          <label class="input-toggle" @change="toggleViewCategory">
            <input type="checkbox" v-model="viewCategory" id="category">
            <span></span>
          </label>
        </div>
        <div class="option">
          <label class="f1" for="menu">{{$t('text.displayMenuId')}}</label>
          <label class="input-toggle" @change="toggleMenuID">
            <input type="checkbox" v-model="init.menuID" id="menu">
            <span></span>
          </label>
        </div>
        <div class="option number" v-if="config.tax.plasticPenalty">
          <label class="f1">{{$t('text.plasticBag')}}</label>
          <i class="fa fa-minus-square" @click="lessBag"></i>
          <span class="count">{{init.plasticBag}}</span>
          <i class="fa fa-plus-square" @click="moreBag"></i>
        </div>
      <div class="btns">
        <button @click="setDelivery" v-show="order.type === 'DELIVERY'">
          <i class="fas fa-shipping-fast"></i>
          {{$t('button.setDelivery')}}
        </button>
        <button @click="setGuest" v-show="gratuitySettable">
          <i class="fas fa-user-plus"></i>
          {{$t('text.setGuest')}}
        </button>
        <button @click="setGratuity" v-show="gratuitySettable">
          <i class="fas fa-hand-holding-usd"></i>
          {{$t('button.setGratuity')}}
        </button>
      </div>
    </div>
    </transition>
    <div :is="component" :init="componentData"></div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

import dialogModule from "../dialog";
import inputModule from "../../component/inputer";

export default {
  props: ["init"],
  components: { inputModule, dialogModule },
  mounted() {
    const dom = document.querySelector(".order.showCategory");
    if (dom) this.viewCategory = true;

    const { top } = document.querySelector(".middle").getBoundingClientRect();

    this.offsetTop = {
      bottom: top + 26 + "px"
    };
  },
  data() {
    return {
      viewCategory: false,
      componentData: null,
      component: null,
      offsetTop: {}
    };
  },
  methods: {
    toggleTax() {
      this.$emit("trigger", {
        taxFree: this.init.taxFree
      });
    },
    toggleDelivery() {
      this.$emit("trigger", {
        deliveryFree: this.init.deliveryFree
      });
    },
    toggleGratuity() {
      this.$emit("trigger", {
        gratuityFree: this.init.gratuityFree
      });
    },
    toggleMenuID() {
      const { menuID } = this.init;
      const defaults = Object.assign({}, this.config.defaults, { menuID });

      this.setConfig({ defaults });
    },
    toggleViewCategory() {
      const dom = document.querySelector(".order");
      this.viewCategory
        ? dom.classList.add("showCategory")
        : dom.classList.remove("showCategory");
    },
    lessBag() {
      if (this.init.plasticBag === 0) return;

      this.setOrder({ plasticBag: --this.init.plasticBag });
    },
    moreBag() {
      this.setOrder({ plasticBag: ++this.init.plasticBag });
    },
    setDelivery() {
      new Promise((resolve, reject) => {
        const title = "setting.delivery.charge";
        const amount =
          this.order.deliveryFee || this.store.deliver.baseFee || 0;
        this.componentData = { resolve, reject, title, amount };
        this.component = "inputModule";
      })
        .then(({ amount }) => {
          if (amount > 0) {
            this.setOrder({ deliveryFee: parseFloat(amount) });
          } else {
            delete this.order.deliveryFee;
            this.order.payment.delivery = 0;

            this.recalculatePayment();
          }
          this.init.resolve();
        })
        .catch(this.exitComponent);
    },
    setGratuity() {
      new Promise((resolve, reject) => {
        const title = "button.setGratuity";
        const amount =
          this.order.gratuityPercentage || this.order.gratuityFee || 0;
        const percentage = true;
        const allowPercentage = true;
        this.componentData = {
          resolve,
          reject,
          title,
          amount,
          percentage,
          allowPercentage
        };
        this.component = "inputModule";
      })
        .then(({ amount, percentage }) => {
          const prompt = {
            type: "warning",
            title: "dialog.entryInvalid",
            msg: "dialog.exceedAllowLimit",
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          //invalid checking

          if (percentage && amount >= 100) {
            this.$dialog(prompt).then(this.exitComponent);
          } else if (!percentage && amount > this.order.payment.subtotal) {
            this.$dialog(prompt).then(this.exitComponent);
          } else if (amount > 0) {
            if (percentage) {
              delete this.order.gratuityFee;
              this.setOrder({ gratuityPercentage: amount });
            } else {
              delete this.order.gratuityPercentage;
              this.setOrder({ gratuityFee: amount });
            }

            this.init.resolve();
          } else {
            delete this.order.gratuityFee;
            delete this.order.gratuityPercentage;
            this.order.payment.gratuity = 0;

            this.recalculatePayment();
            this.exitComponent();
          }
        })
        .catch(this.exitComponent);
    },
    setGuest() {
      new Promise((resolve, reject) => {
        const config = {
          type: "number",
          title: "text.setGuest",
          amount: this.order.guest || 1,
          percentage: false,
          allowPercentage: false
        };

        this.componentData = Object.assign({ resolve, reject }, config);
        this.component = "inputModule";
      })
        .then(({ amount }) => {
          this.setOrder({ guest: amount });
          this.recalculatePayment();
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    recalculatePayment() {
      const payment = this.$calculatePayment(this.order, {
        selfAssign: false,
        callback: true
      });
      this.setOrder({ payment });
    },
    ...mapActions(["setConfig", "setOrder"])
  },
  computed: {
    gratuitySettable() {
      const correctType =
        this.order.type === "DINE_IN" ||
        this.order.type === "BAR" ||
        this.order.type === "HIBACHI";

      return !this.init.gratuityFree && correctType;
    },
    ...mapGetters(["config", "tax", "store", "dineInOpt", "order"])
  }
};
</script>
<style scoped>
.popupMask {
  z-index: 1;
}

.config {
  position: absolute;
  right: 0px;
  width: 281px;
  margin: 0 2px;
  z-index: 3;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  border-radius: 4px;
}

.config:before {
  content: " ";
  width: 45px;
  height: 4px;
  background: #9e9e9e;
  display: block;
  margin: 5px auto;
  border-radius: 9px;
}

.option {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 25px;
}

.option.number {
  padding: 0 0 0 25px;
}

.option.number i {
  padding: 12px 13px;
  color: #333;
  cursor: pointer;
}

.option:last-child {
  border-bottom: none;
}

.external {
  width: 40px;
  text-align: center;
  padding: 5px;
  cursor: pointer;
  background: #f5f5f5;
  border-radius: 4px;
  color: #616161;
}

.btns {
  display: flex;
  justify-content: center;
  background: #eee;
}

.btns button {
  padding: 8px 10px;
  margin: 5px;
  font-family: "Yuanti-SC";
  background: linear-gradient(#fefefe, #cfd0d3);
  border-radius: 4px;
  box-shadow: 0 1px 3px #616161;
  border: none;
  outline: none;
}

.btns button i {
  display: block;
  margin-bottom: 2px;
}
</style>
