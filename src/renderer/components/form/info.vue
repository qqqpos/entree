<template>
  <div class="outer">
    <section>
      <phone v-model="customer.phone" @focus="setFocus"></phone>
      <extension v-model="customer.extension" @focus="setFocus"></extension>
      <name v-model="customer.name" @focus="setFocus"></name>
    </section>
    <section>
      <street v-model="customer.address" :direction="customer.direction" :distance="customer.distance" :duration="customer.duration" @focus="setFocus" @query="$emit('query')"></street>
      <city v-model="customer.city" @focus="setFocus"></city>
    </section>
    <section>
      <note v-model="customer.note" @focus="setFocus"></note>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import phone from "./component/phone";
import street from "./component/street";
import extension from "./component/extension";
import name from "./component/name";
import city from "./component/city";
import note from "./component/note";

export default {
  components: { phone, street, extension, name, city, note },
  computed: {
    ...mapGetters(["customer"])
  },
  mounted() {
    this.customer.phone.length === 10
      ? this.setFocus("address")
      : this.setFocus("phone");
  },
  methods: {
    setFocus(target) {
      this.$emit("focus", target);

      const dom = document.querySelector(".wrap.active");
      dom && dom.classList.remove("active");

      document.querySelector(`#${target}`).classList.add("active");
    }
  }
};
</script>

<style scoped>
.outer {
  padding: 5px 10px;
  background: #fafafa;
}

section {
  display: flex;
}
</style>