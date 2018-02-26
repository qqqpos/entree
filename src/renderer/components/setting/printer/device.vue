<template>
  <div>
    <header class="nav">
      <div class="title">
        <h3>{{$t("title.printerList")}}</h3>
      </div>
      <nav>
        <span class="add" @click="create">{{$t('button.new')}}</span>
      </nav>
    </header>
    <external :title="printer" v-for="(printer,index) in printers" :key="index" @open="$emit('click',printer)"></external>
    <div class="pages" v-if="printers.length === 12">
      <pagination :of="list" :max="5" :contain="12" @page="setPage" class="f1"></pagination>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import Preset from "../../../preset";
import editor from "./component/creator";
import external from "../common/external";

export default {
  components: { editor, external },
  data() {
    return {
      list: Object.keys(this.$store.getters.config.printers),
      componentData: null,
      component: null,
      page: 0
    };
  },
  computed: {
    printers() {
      const min = this.page * 12;
      const max = min + 12;
      return this.list.slice(min, max);
    }
  },
  methods: {
    create() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, printers: this.printers };
        this.component = "editor";
      })
        .then(({ name, type, assign }) => {
          const printer = Preset.printer(type);

          Object.assign(this.$store.getters.config.printers, { [name]: printer });

          this.list = Object.keys(this.$store.getters.config.printers);

          this.$socket.emit("[CONFIG] UPDATE", {
            key: `printers.${name}`,
            value: printer
          });

          assign && this.$socket.emit("[MENU] ASSIGN_PRINTER", name);

          this.$q();
        })
        .catch(() => this.$q());
    },
    setPage(num) {
      this.page = num;
    }
  }
};
</script>