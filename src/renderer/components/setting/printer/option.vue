<template>
  <div>
    <header class="nav">
      <router-link tag="div" :to="{name:'Setting.printer.config',params:{printer}}" class="back">
        <i class="fa fa-chevron-left"></i>
      </router-link>
      <div class="title" v-if="obj === 'print'">
        <h3>{{$t('print.printTicket')}}</h3>
      </div>
      <div class="title" v-else>
        <h3>{{$t('print.printDouble')}}</h3>
      </div>
      <nav>
        <span @click="setAll" v-if="print.length === 0">{{$t('button.setAll')}}</span>
        <span @click="unset" v-else>{{$t('button.unset')}}</span>
      </nav>
    </header>
    <checkbox v-for="(opt,index) in opts" :key="index" v-model="print" :val="opt.value" :title="opt.label" :multiple="true" class="list"></checkbox>
  </div>
</template>

<script>
import checkbox from "../common/checkbox";

export default {
  props: ["printer", "obj"],
  components: { checkbox },
  data() {
    return {
      opts: [
        {
          label: "type.WALK_IN",
          value: "WALK_IN"
        },
        {
          label: "type.PICK_UP",
          value: "PICK_UP"
        },
        {
          label: "type.DELIVERY",
          value: "DELIVERY"
        },
        {
          label: "type.DINE_IN",
          value: "DINE_IN"
        },
        {
          label: "type.HIBACHI",
          value: "HIBACHI"
        },
        {
          label: "type.BUFFET",
          value: "BUFFET"
        },
        {
          label: "type.TO_GO",
          value: "TO_GO"
        },
        {
          label: "type.BAR",
          value: "BAR"
        },
        {
          label: "type.SALES",
          value: "SALES"
        }
      ],
      print: []
    };
  },
  created() {
    const print = this.$store.getters.config.printers[this.printer][this.obj];
    this.print = Array.isArray(print) ? print : [];
  },
  beforeDestroy() {
    Object.assign(this.$store.getters.config.printers[this.printer], {
      [this.obj]: this.print
    });

    this.$socket.emit("[CONFIG] UPDATE", {
      key: `printers.${this.printer}.${this.obj}`,
      value: this.print
    });
  },
  methods: {
    setAll() {
      this.print = [
        "WALK_IN",
        "PICK_UP",
        "DELIVERY",
        "DINE_IN",
        "HIBACHI",
        "BUFFET",
        "BAR",
        "SALES",
        "TO_GO"
      ];
    },
    unset() {
      this.print = [];
    }
  }
};
</script>