<template>
  <div class="popupMask dark center">
    <div class="editor">
      <header>
        <h5></h5>
        <h3>{{$t('title.batch')}}</h3>
      </header>
      <table class="setting">
        <thead>
          <tr>
            <th>{{$t('thead.terminal')}}</th>
            <th>{{$t('thead.count')}}</th>
            <th>{{$t('thead.total')}}</th>
            <th>{{$t('thead.tip')}}</th>
            <th>{{$t('thead.status')}}</th>
            <th>{{$t('thead.action')}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(task,index) in tasks" :key="index">
            <td>{{task.alias}}
              <span class="location">({{task.location}})</span>
            </td>
            <td>{{$t('text.records',task.count)}}</td>
            <td>{{task.total | decimal}}</td>
            <td>({{task.tip | decimal}})</td>
            <td class="status">{{status(task.status)}}</td>
            <td v-if="task.status === 5" class="action">
              <span class="print" @click="reprint(index)">{{$t('button.print')}}</span>
            </td>
            <td v-else class="action">
              <span class="batch" @click="beforeBatch(task,index)">{{$t('button.batch')}}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <footer>
        <div class="opt">
          <checkbox title="button.printDetail" v-model="detail"></checkbox>
        </div>
        <button class="btn" @click="init.resolve">{{$t('button.done')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import dialoger from "../../common/dialoger";
import checkbox from "../../setting/common/checkbox";
export default {
  props: ["init"],
  components: { dialoger, checkbox },
  data() {
    return {
      stationAlias: this.$store.getters.station.alias,
      componentData: null,
      component: null,
      detail: false,
      tasks: []
    };
  },
  created() {
    this.initialData()
      .then(this.initialTerminal)
      .then(this.finalizing);
  },
  methods: {
    status(code) {
      /* device status code
        -1 : error
        0  : occupy
        1  : initial
        2  : ready
        3  : wait
        4  : process
        5  : closed
*/
      switch (code) {
        case -1:
          return this.$t("terminal.batch.error");
        case 0:
          return this.$t("terminal.batch.inuse");
        case 1:
          return this.$t("terminal.connecting");
        case 2:
          return this.$t("terminal.batch.ready");
        case 3:
          return this.$t("terminal.batch.waiting");
        case 4:
          return this.$t("terminal.batch.processing");
        case 5:
          return this.$t("terminal.batch.closed");
      }
    },
    initialData() {
      return new Promise((resolve, reject) => {
        let tasks = {};
        this.init.transactions.forEach(trans => {
          if (trans.close) return;

          const { terminal, amount } = trans;
          const { approve, tip } = amount;

          if (tasks.hasOwnProperty(terminal)) {
            tasks[terminal].total += parseFloat(approve);
            tasks[terminal].tip += parseFloat(tip);
            tasks[terminal].count++;
          } else {
            tasks[terminal] = {
              status: 1,
              total: parseFloat(approve),
              tip: parseFloat(tip),
              count: 1,
              terminal: null
            };
          }
        });

        Object.keys(tasks).forEach(alias => {
          const config = this.init.devices.find(c => c.alias === alias);
          config && Object.assign(tasks[alias], config);
        });
        Object.keys(tasks).forEach(alias => this.tasks.push(tasks[alias]));
        resolve();
      });
    },
    initialTerminal() {
      return new Promise((resolve, reject) => {
        this.tasks.forEach(task => {
          const { ip, port, model, alias } = task;
          task.terminal = this.getParser(task.model).default();
          task.terminal
            .initial(ip, port, model, this.stationAlias, alias)
            .then(response => {
              const device = task.terminal.check(response.data);

              task.status = device.code === "000000" ? 2 : 0;
            });
        });
      });
    },
    finalizing() { },

    next() { },
    beforeBatch(device, index) {
      if (device.tip === 0) {
        const prompt = {
          title: "dialog.NoTip",
          msg: "dialog.transactionNoTip"
        }
        this.$dialog(prompt).then(() => this.startBatch(device, index)).catch(() => this.$q());
      } else {
        this.startBatch(device, index);
      }
    },
    startBatch(device, index) {
      this.batch(device).then(response => {
        const result = device.terminal.explainBatch(response.data);
        if (result.code === "000000") {
          device.status = 5;
          console.log(this.tasks[index]);
          this.print(result, index);

          this.tasks[index].report = result;
          this.$socket.emit("[TERMINAL] CLOSED", result, done =>
            this.$emit("refresh")
          );
        } else {
          device.status = -1;
        }
      });
    },
    batch(device) {
      device.status = 4;
      return device.terminal.batch();
    },
    reprint(index) {
      const { report } = this.tasks[index];
      this.print(report);
    },
    print(report, index) {
      if (this.detail) {
        console.log(this.init.transactions);
        const transactions = this.init.transaction.filter(t => !t.close)
        let detail = false;
        Printer.printBatchReport(report, detail);
      } else {
        Printer.printBatchReport(report, false);
      }

    },
    getParser(model) {
      switch (model) {
        case "SP30":
        case "S80":
        case "S300":
          return require("../../payment/parser/pax.js");
        case "NX2200":
          return require("../../payment/parser/exadigm.js");
        default:
          return require("../../payment/parser/pax.js");
      }
    }
  }
};
</script>

<style scoped>
.editor {
  width: 600px;
}

.action span {
  padding: 4px 6px;
  margin: 0 2px;
  color: #fff;
  cursor: pointer;
  border-radius: 2px;
  box-shadow: 0 1px 1px #b5afaf;
}

.action .print {
  background: #607d8b;
}

.action .batch {
  background: #ff9800;
}
.status {
  width: 200px;
}
</style>