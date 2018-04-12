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
        <div class="option">
          <label class="f1" for="seat">{{$t('setting.seatOrder')}}</label>
          <label class="input-toggle" @change="toggleSeatOrder">
            <input type="checkbox" v-model="init.seatOrder" :disabled="true" id="seat">
            <span></span>
          </label>
        </div>
      <div class="btns">
        <button @click="setDelivery" :disabled="order.type !== 'DELIVERY'">{{$t('button.setDelivery')}}</button>
        <button @click="setGratuity" :disabled="(order.type !== 'DINE_IN' || order.type !== 'BAR' || order.type !== 'HIBACHI')">{{$t('button.setGratuity')}}</button>
      </div>
    </div>
    </transition>
    <div :is="component" :init="componentData"></div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import inputer from "../../component/inputer";
export default {
  props: ["init"],
  components: { inputer },
  mounted() {
    const dom = document.querySelector(".order.showCategory");
    if (dom) this.viewCategory = true;

    const { top, height } = document
      .querySelector(".middle")
      .getBoundingClientRect();

    this.offsetTop = {
      bottom: top + 26 + "px"
    };
  },
  data() {
    return {
      componentData: null,
      component: null,
      viewCategory: false,
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
      const display = Object.assign({}, this.config.display, {
        menuID: this.init.menuID
      });
      this.setConfig({ display });
    },
    toggleViewCategory() {
      const dom = document.querySelector(".order");
      this.viewCategory
        ? dom.classList.add("showCategory")
        : dom.classList.remove("showCategory");
    },
    toggleSeatOrder() {
      this.init.seatOrder = false;
    },
    setDelivery() {
      new Promise((resolve, reject) => {
        const title = "setting.delivery.charge";
        const amount = this.store.deliver.baseFee;
        this.componentData = { resolve, reject, title, amount };
        this.component = "inputer";
      })
        .then(_amount => {
          this.setOrder({ $delivery: _amount });
          this.$q();
        })
        .catch(del => {
          if (del) delete this.order.$delivery;

          this.$q();
        });
    },
    setGratuity() {
      new Promise((resolve, reject) => {
        const title = "setting.delivery.charge";
        const amount = this.store.deliver.baseFee;
        this.componentData = { resolve, reject, title, amount };
        this.component = "inputer";
      })
        .then(_amount => {
          this.setOrder({ $gratuity: _amount });
          this.$q();
        })
        .catch(del => {
          if (del) delete this.order.$gratuity;

          this.$q();
        });
    },
    ...mapActions(["setConfig", "setOrder"])
  },
  computed: {
    ...mapGetters(["config", "store", "order"])
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
  padding: 5px 10px;
  justify-content: center;
  background: #eee;
}

.btns button {
  padding: 15px 10px;
  margin: 0 5px;
  background: linear-gradient(#fefefe, #cfd0d3);
  border-radius: 4px;
  box-shadow: 0 1px 3px #616161;
  border: none;
  outline: none;
}
</style>
