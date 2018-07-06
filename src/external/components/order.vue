<template>
  <div class="wrap">
      <ul class="order" ref="list">
          <list-item v-for="(item,index) in order.content" :key="index" :item="item"></list-item>
      </ul>
      <div class="payment">
        <p><span class="text">Subtotal : </span><span class="value">{{(order.payment && order.payment.subtotal) | decimal}}</span></p>
        <p><span class="text">Tax : </span><span class="value">{{(order.payment && order.payment.tax) | decimal}}</span></p>
        <p class="due"><span class="text">Amount Due : </span><span class="value">{{(order.payment && order.payment.balance) | decimal}}</span></p>
      </div>
  </div>
</template>

<script>
import listItem from "../helper/listItem";
export default {
  components: { listItem },
  props: ["order"],
  data() {
    return {};
  },
  filters: {
    decimal(value) {
      return /^-?[\d.]+(?:e-?\d+)?$/.test(value)
        ? parseFloat(value).toFixed(2)
        : value;
    }
  },
  watch: {
    "order.content"() {
      this.$nextTick(() => {
        this.$refs.list.scrollTop = this.$refs.list.scrollHeight;
      });
    }
  }
};
</script>

<style scoped>
.wrap {
  position: fixed;
  z-index: 10;
  right: 25px;
  top: 20px;
  padding: 14px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}
ul.order {
  width: 325px;
  height: 585px;
  overflow: hidden;
}

.payment {
  box-shadow: 0 1px 1px #333;
  background: rgba(255, 255, 255, 0.75);
  padding: 10px 10px 10px 15px;
  border-radius: 4px;
  margin-top: 15px;
}

.payment p {
  display: flex;
}

.payment .text {
  flex: 1;
}

.due {
  font-weight: bold;
  font-size: 22px;
  border-top: 1px dashed #ddd;
  padding-top: 10px;
  margin-top: 10px;
  color: #212121;
}
</style>


