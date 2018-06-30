<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="portal">
          <ul class="invoices">
            <story v-for="(invoice,index) in invoices" :invoice="invoice" :key="index" :focus="view === index"
             @menu="toggle(index)" 
             @preview="preview(invoice)"
             @copy="copy(invoice)"
             @reimburse="reimburse(invoice)"></story>
          </ul>
        </div>
        <transition name="fade">
          <div :is="module" :init="moduleData" class="preview"></div>
        </transition>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapActions } from "vuex";

import story from "./helper/story";
import ticket from "../../common/ticket";
import dialogModule from "../../common/dialog";

export default {
  components: { story, ticket, dialogModule },
  props: ["init"],
  data() {
    return {
      componentData: null,
      component: null,
      invoices: this.init.invoices || [],
      moduleData: null,
      module: null,
      view: null
    };
  },
  methods: {
    toggle(index) {
      this.view = this.view === index ? null : index;
    },
    preview(ticket) {
      new Promise((resolve, reject) => {
        this.moduleData = { resolve, reject, ticket, exit: true };
        this.module = "ticket";
      })
        .then(this.exitModule)
        .catch(this.exitModule);
    },
    copy(invoice) {
      const { newTicket } = this.$store.getters.app;
      const contentExist = this.$store.getters.order.content.length > 0;
      if (!newTicket && contentExist) {
        const prompt = {
          type: "question",
          title: "dialog.addToOrderContent",
          msg: "dialog.addToOrderContentConfirm"
        };

        this.$dialog(prompt)
          .then(() => this.addItem(invoice.content))
          .catch(this.exitComponent);
      } else {
        const prompt = contentExist
          ? {
              type: "warning",
              title: "dialog.orderContentReplace",
              msg: "dialog.existOrderContentReplace"
            }
          : {
              type: "question",
              title: "dialog.copyOrderContent",
              msg: "dialog.copyOrderContentConfirm"
            };

        this.$dialog(prompt)
          .then(() => this.copyItem(invoice.content))
          .catch(this.exitComponent);
      }
    },
    copyItem(content) {
      this.exitComponent();
      this.view = null;

      content.forEach(item => {
        Object.assign(item, {
          unique: String().random(),
          print: false,
          pending: false,
          void: false
        });
      });

      this.setOrder({ content });
    },
    addItem(content) {
      this.exitComponent();
      this.view = null;

      content.forEach(item =>
        this.$store.getters.order.content.push(
          Object.assign({}, item, {
            unique: String().random(),
            print: false,
            pending: false,
            void: false
          })
        )
      );
    },
    reimburse(invoice) {},
    exitModule() {
      this.module = null;
      this.moduleData = null;
    },
    ...mapActions(["setOrder"])
  }
};
</script>

<style scoped>
.portal {
  position: fixed;
  right: 285px;
  top: 30px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0 0 4px 4px;
  width: 340px;
  padding-bottom: 4px;
}

.preview {
  position: fixed;
  left: 37px;
  top: 0;
}
</style>


