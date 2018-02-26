<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="config" :style="offsetTop">
      <div class="option">
        <span class="f1">{{$t('text.taxFree')}}</span>
        <label class="input-toggle">
          <input type="checkbox" v-model="init.taxFree" @change="toggleTax">
          <span></span>
        </label>
      </div>
      <div class="option">
        <span class="f1">{{$t('text.deliveryFree')}}</span>
        <label class="input-toggle" @change="toggleDelivery">
          <input type="checkbox" v-model="init.deliveryFree">
          <span></span>
        </label>
      </div>
      <div class="option">
        <span class="f1">{{$t('text.gratuityFree')}}</span>
        <label class="input-toggle" @change="toggleGratuity">
          <input type="checkbox" v-model="init.gratuityFree">
          <span></span>
        </label>
      </div>
      <div class="option">
        <span class="f1">{{$t('text.displayCategory')}}</span>
        <label class="input-toggle" @change="toggleViewCategory">
          <input type="checkbox" v-model="viewCategory">
          <span></span>
        </label>
      </div>
      <div class="option">
        <span class="f1">{{$t('text.displayMenuId')}}</span>
        <label class="input-toggle" @change="toggleMenuID">
          <input type="checkbox" v-model="init.menuID">
          <span></span>
        </label>
      </div>
      <div class="option">
        <span class="f1">{{$t('setting.seatOrder')}}</span>
        <label class="input-toggle" @change="toggleSeatOrder">
          <input type="checkbox" v-model="init.seatOrder" :disabled="true">
          <span></span>
        </label>
      </div>
      <div class="option">
        <span class="f1">{{$t('text.deliveryFee')}}</span>
        <label class="external">
          <i class="fa fa-caret-right"></i>
        </label>
      </div>
    </div>
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
  width: 285px;
  z-index: 3;
  background: #fff;
}

.option {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
  border-left: 3px solid #00bcd4;
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
