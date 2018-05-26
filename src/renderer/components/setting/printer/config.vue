<template>
  <div>
    <header class="nav">
      <router-link tag="div" :to="{name:'Setting.printer'}" class="back">
        <i class="fa fa-chevron-left"></i>
      </router-link>
      <div class="title">
        <h5 v-if="config.type">{{$t('print.type.'+config.type)}}</h5>
        <h3>{{printer}}</h3>
      </div>
      <nav>
        <span @click="removePrinter" class="remove">{{$t('button.remove')}}</span>
      </nav>
    </header>
    <template v-if="config.type === 'label'">
      <external title="print.printTicket" @open="$router.push({name:'Setting.printer.option',params:{printer,obj:'print'}})"></external>
    </template>
    <template v-else>
      <external title="print.printTicket" @open="$router.push({name:'Setting.printer.option',params:{printer,obj:'print'}})"></external>
      <external title="print.printDouble" @open="$router.push({name:'Setting.printer.option',params:{printer,obj:'reprint'}})"></external>
      <external title="print.title" @open="$router.push({name:'Setting.printer.title',params:{printer}})"></external>
      <external title="print.footer" @open="openFooterEditor"></external>
      <toggle title="print.buzzer" v-model="config.control.buzzer" @update="updateBuzzer"></toggle>
      <toggle title="print.category" v-model="config.control.categorize" @update="updateCategorize"></toggle>
      <toggle title="print.priority" v-model="config.control.prioritize" @update="updatePrioritize"></toggle>
      <options title="print.mode" tooltip="tip.printMode" v-model="config.control.mode" :opts="modeOpts" @update="updateMode"></options>
    </template>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import toggle from "../common/toggle";
import options from "../common/options";
import external from "../common/external";
import dialoger from "../../common/dialoger";
import editor from "./component/footerEditor";

export default {
  props: ["printer"],
  components: { editor, toggle, options, external, dialoger },
  data() {
    return {
      config: null,
      componentData: null,
      component: null,
      removed: false,
      modeOpts: [
        {
          label: "print.normal",
          tooltip: "tip.mode.normal",
          value: "normal"
        },
        {
          label: "print.difference",
          tooltip: "tip.mode.difference",
          value: "difference"
        },
        {
          label: "print.new",
          tooltip: "tip.mode.new",
          value: "new"
        },
        {
          label: "print.todo",
          tooltip: "tip.mode.todo",
          value: "todo"
        }
      ]
    };
  },
  created() {
    const config = this.$store.getters.config.printers[this.printer];
    this.config = JSON.parse(JSON.stringify(config));
  },
  beforeDestroy() {
    if (!this.removed) {
      Object.assign(
        this.$store.getters.config.printers[this.printer],
        this.config
      );

      Printer.initial(
        CLODOP,
        this.$store.getters.config,
        this.$store.getters.station
      );
    }
  },
  methods: {
    update(data) {
      this.$socket.emit("[CONFIG] UPDATE", data);
    },
    updateMode(value) {
      this.update({
        key: `printers.${this.printer}.control.mode`,
        value
      });
    },
    updateBuzzer(value) {
      this.update({
        key: `printers.${this.printer}.control.buzzer`,
        value
      });
    },
    updateCategorize(value) {
      this.update({
        key: `printers.${this.printer}.control.categorize`,
        value
      });
    },
    updatePrioritize(value) {
      this.update({
        key: `printers.${this.printer}.control.prioritize`,
        value
      });
    },
    openFooterEditor() {
      new Promise((resolve, reject) => {
        const { footer } = this.config.control;
        this.componentData = { resolve, reject, footer };
        this.component = "editor";
      })
        .then(_footer => {
          this.config.control.footer = _footer;

          this.update({
            key: `printers.${this.printer}.control.footer`,
            value: _footer
          });
          this.$q();
        })
        .catch(() => this.$q());
    },
    removePrinter() {
      const content = {
        type: "question",
        title: "dialog.removePrinter",
        msg: "dialog.removePrinterConfirm",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.remove", fn: "resolve" }
        ]
      };

      this.$dialog(content)
        .then(() => {
          this.$q();
          this.removed = true;
          this.$socket.emit("[PRINTER] REMOVE", this.printer);
          delete this.$store.getters.config.printers[this.printer];

          Printer.initial(
            CLODOP,
            this.$store.getters.config,
            this.$store.getters.station
          );

          this.$router.push({ name: "Setting.printer" });
        })
        .catch(() => this.$q());
    }
  }
};
</script>