<template>
  <div>
    <header class="nav">
      <router-link tag="div" :to="{name:'Setting.printer.config',params:{printer}}" class="back">
        <i class="fa fa-chevron-left"></i>
      </router-link>
      <div class="title">
        <h3>{{$t('title.receiptTitle')}}</h3>
      </div>
      <nav>
        <span @click="reset">{{$t('button.default')}}</span>
      </nav>
    </header>
    <text-input v-model="title.WALK_IN" title="type.WALK_IN"></text-input>
    <text-input v-model="title.PICK_UP" title="type.PICK_UP"></text-input>
    <text-input v-model="title.DELIVERY" title="type.DELIVERY"></text-input>
    <text-input v-model="title.DINE_IN" title="type.DINE_IN"></text-input>
    <text-input v-model="title.BUFFET" title="type.BUFFET"></text-input>
    <text-input v-model="title.HIBACHI" title="type.HIBACHI"></text-input>
    <text-input v-model="title.BAR" title="type.BAR"></text-input>
    <text-input v-model="title.SALES" title="type.SALES"></text-input>
    <text-input v-model="title.TO_GO" title="type.TO_GO"></text-input>
    <text-input v-model="title.PRE_PAYMENT" title="type.PRE_PAYMENT"></text-input>
    <text-input v-model="title.RECEIPT" title="type.RECEIPT"></text-input>
  </div>
</template>

<script>
import textInput from "../common/textInput";

export default {
  props: ["printer"],
  components: { textInput },
  data() {
    return {
      opts: {
        PICK_UP: "PICK UP",
        WALK_IN: "WALK IN",
        DELIVERY: "DELIVERY",
        PRE_PAYMENT: "PRE PAYMENT",
        RECEIPT: "RECEIPT",
        DINE_IN: "DINE IN",
        HIBACHI: "HIBACHI",
        BUFFET: "BUFFET",
        SALES: "SALES",
        TO_GO: "TO GO",
        BAR: "BAR"
      },
      title: {}
    };
  },
  created() {
    const printer = this.$store.getters.config.printers[this.printer];

    printer.hasOwnProperty("title")
      ? Object.assign(this.title, printer.title)
      : Object.assign(this.title, this.opts);
  },
  beforeDestroy() {
    Object.assign(this.$store.getters.config.printers[this.printer], {
      title: this.title
    });

    this.$socket.emit("[CONFIG] UPDATE", {
      key: `printers.${this.printer}.title`,
      value: this.title
    });
  },
  methods: {
    reset() {
      this.title = Object.assign({}, this.opts);
    }
  }
};
</script>

<style scoped>
.checkbox.list {
  border-bottom: 1px solid #eee;
  margin: 0;
  height: 40px;
  padding-left: 30px;
}
</style>