<template>
    <div class="popupMask dark" @click.self="init.resolve">
        <div class="tasks">
            <task v-for="(job,index) in spooler" :key="index" :job="job" :time="time" :language="language" :index="index" @remove="remove" @print="print" @edit="edit"></task>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import dialogModule from "../common/dialog";
import task from "./task";

export default {
  props: ["init"],
  components: { dialogModule, task },
  computed: {
    ...mapGetters(["time", "spooler", "history", "language"])
  },
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  methods: {
    edit(i) {},
    remove(i) {
      const prompt = {
        type: "question",
        title: "dialog.removeSpooler",
        msg: "dialog.removeSpoolerConfirm"
      };

      this.$dialog(prompt)
        .then(() => {
          this.setItemStatus(i, {
            pending: false,
            print: false
          });
          this.removeSpooler(i);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    setItemStatus(i, status) {
      const { order } = this.spooler[i];

      const pendingItems = order.content.map(i => i.unique);
      const invoice = this.history.find(t => t._id === order._id);

      if (invoice) {
        invoice.content.forEach(item => {
          pendingItems.includes(item.unique) && Object.assign(item, status);
        });

        this.$socket.emit("[ORDER] UPDATE", invoice);
      }
    },
    print(i) {
      const time = this.spooler[i].schedule;
      const schedule = moment(time).format("hh:mm");
      const toNow = moment(time).toNow(true);
      const prompt = {
        type: "question",
        title: "dialog.printConfirm",
        msg: ["dialog.printSpoolerTip", schedule, toNow],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.print", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => this.printFromSpooler(i))
        .catch(this.exitComponent);
    },
    printFromSpooler(i) {
      this.exitComponent();

      const { order, target } = this.spooler[i];

      Printer.setTarget(target).print(order);
      this.setItemStatus(i, {
        pending: false,
        print: true
      });
      this.removeSpooler(i);
    },
    ...mapActions(["removeSpooler"])
  }
};
</script>

<style scoped>
.tasks {
  width: 270px;
  height: 100%;
  background: rgba(255, 255, 255, 0.45);
  float: right;
}
</style>