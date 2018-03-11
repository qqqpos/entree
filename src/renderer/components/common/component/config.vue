<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <transition appear name="fadeUp">
      <div class="config" :style="offsetTop">
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
      <!-- <div class="option">
        <span class="f1">{{$t('text.deliveryFee')}}</span>
        <label class="external">
          <i class="fa fa-caret-right"></i>
        </label>
      </div> -->
    </div>
    </transition>

  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
export default {
  props: ["init"],
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
    ...mapActions(["setConfig"])
  },
  computed: {
    ...mapGetters(["config"])
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
</style>
