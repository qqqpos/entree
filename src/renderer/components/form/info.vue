<template>
  <div class="outer">
    <section class="row">
      <phone v-model="customer.phone" @focus="setFocus"></phone>
      <input-field text="text.uberCode" icon="fas fa-clipboard-check" field="code" v-model="customer.code" @focus="setFocus" v-if="order.source === 'Uber Eats'"></input-field>
      <input-field text="text.extension" icon="fa fa-fax" field="extension" v-model="customer.extension" @focus="setFocus" v-else></input-field>
      <input-field text="text.name" icon="far fa-id-badge" field="name" v-model="customer.name" @focus="setFocus"></input-field>
    </section>
    <section class="row">
      <street v-model="customer.address" :direction="customer.direction" :distance="customer.distance" :duration="customer.duration" :profile="customer.profiles ? customer.profiles.length : 0" @focus="setFocus" @query="$emit('query')"></street>
      <city v-model="customer.city" @focus="setFocus"></city>
    </section>
    <section class="row" v-if="store.enhanceProfile">
      <input-field text="text.email" icon="fas fa-at" field="email" v-model="customer.email" @focus="setFocus"></input-field>
      <input-field text="text.dob" icon="fas fa-birthday-cake" field="dob" placeholder="MM/DD" v-model="customer.dob" @focus="setFocus"></input-field>
    </section>
    <section class="row">
      <input-field text="text.note" icon="far fa-comment-alt" field="note" v-model="customer.note" @focus="setFocus"></input-field>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import phone from "./helper/phone";
import city from "./helper/city";
import street from "./helper/street";
import inputField from "./helper/inputField";

export default {
  components: { phone, street, city, inputField },
  computed: {
    ...mapGetters(["store", "order", "customer"])
  },
  mounted() {
    if (this.order.source === "Uber Eats") {
      this.setFocus("code");
    } else {
      this.customer.phone.length === 10
        ? this.setFocus("address")
        : this.setFocus("phone");
    }
  },
  methods: {
    setFocus(target) {
      this.$emit("focus", target);

      const dom = document.querySelector(".wrap.active");
      dom && dom.classList.remove("active");

      this.$nextTick(() => {
        document.querySelector(`#${target} input`).focus();
        document.querySelector(`#${target}`).classList.add("active");
      });
    }
  }
};
</script>

<style scoped>
.outer {
  padding: 5px 10px;
  background: #fafafa;
}
</style>