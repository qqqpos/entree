<template>
    <div>
        <section class="period">
            <nav>
                <div>
                    <input type="radio" name="period" id="week" v-model="period" value="week" @change="fetchData">
                    <label for="week">{{$t('thead.currentWeek')}}</label>
                </div>
                <div>
                    <input type="radio" name="period" id="lastWeek" v-model="period" value="lastWeek" @change="fetchData">
                    <label for="lastWeek">{{$t('thead.lastWeek')}}</label>
                </div>
                <div>
                    <input type="radio" name="period" id="month" v-model="period" value="month" @change="fetchData">
                    <label for="month">{{$t('thead.currentMonth')}}</label>
                </div>
                <div>
                    <input type="radio" name="period" id="lastMonth" v-model="period" value="lastMonth" @change="fetchData">
                    <label for="lastMonth">{{$t('thead.lastMonth')}}</label>
                </div>
            </nav>
            <div class="functions">
                <button :disabled="true">
                    <i class="fa fa-calendar-check-o"></i>
                    <span>{{$t('button.setDate')}}</span>
                </button>
                <button :disabled="logs.length ===0" @click="generateExcel">
                    <i class="fa fa-external-link"></i>
                    <span>{{$t('button.export')}}</span>
                </button>
            </div>
        </section>
        <section>
            <table>
                <thead>
                    <tr>
                        <th class="icon">{{$t('thead.status')}}</th>
                        <th class="date">{{$t('thead.date')}}</th>
                        <th>{{$t('thead.station')}}</th>
                        <th>{{$t('thead.credit')}}</th>
                        <th>{{$t('thead.creditCount')}}</th>
                        <th>{{$t('thead.debit')}}</th>
                        <th>{{$t('thead.debitCount')}}</th>
                        <th class="fn">{{$t('thead.print')}}</th>
                        <th class="fn">{{$t('thead.view')}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(log,index) in logs" :key="index">
                        <td v-if="log.status === 'CLOSE'" class="icon"><i class="fa fa-check-circle"></i></td>
                        <td v-else class="icon"><i class="fa fa-check-circle-o"></i></td>
                        <td class="date">{{log.date}}</td>
                        <td>{{log.station}}</td>
                        <td>{{log.amount.credit}}</td>
                        <td>{{log.count.credit}}</td>
                        <td>{{log.amount.debit}}</td>
                        <td>{{log.count.debit}}</td>
                        <td class="fn">
                            <i class="fa fa-print" @click="printReport(log)"></i>
                        </td>
                        <td class="fn">
                            <i class="fa fa-external-link"></i>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td class="icon"><span>{{batchCount}}</span></td>
                        <td></td>
                        <td>{{creditTotal | decimal}}</td>
                        <td>{{debitTotal | decimal}}</td>
                        <td colspan="3">Total Batch: {{batchTotal | decimal}}</td>
                    </tr>
                </tfoot>
            </table>
        </section>
        <div :is="component" :init="componentData" @refresh="fetchData"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import fileSaver from "file-saver";
export default {
  props: ["profile"],
  components: {},
  computed: {
    batchCount() {
      return this.logs.filter(log => log.status === "CLOSE").length;
    },
    creditTotal() {
      return this.logs
        .map(log => parseFloat(log.amount.credit))
        .reduce((a, b) => a + b, 0);
    },
    debitTotal() {
      return this.logs
        .map(log => parseFloat(log.amount.debit))
        .reduce((a, b) => a + b, 0);
    },
    batchTotal() {
      return this.logs
        .map(
          log => parseFloat(log.amount.debit) + parseFloat(log.amount.credit)
        )
        .reduce((a, b) => a + b, 0);
    },
    ...mapGetters(["op"])
  },
  data() {
    return {
      componentData: null,
      component: null,
      viewable: false,
      period: "week",
      from: "",
      to: "",
      logs: []
    };
  },
  created() {
    this.fetchData();
    this.viewable = this.approval(this.op.access, "report");
  },
  methods: {
    fetchData() {
      switch (this.period) {
        case "week":
          this.from = moment()
            .subtract(4, "hours")
            .startOf("week")
            .hours(4)
            .format("YYYYMMDDHHmmss");

          this.to = moment()
            .subtract(4, "hours")
            .endOf("week")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .format("YYYYMMDDHHmmss");
          break;
        case "lastWeek":
          this.from = moment()
            .subtract(4, "hours")
            .subtract(1, "weeks")
            .startOf("week")
            .hours(4)
            .format("YYYYMMDDHHmmss");
          this.to = moment()
            .subtract(4, "hours")
            .subtract(1, "weeks")
            .endOf("week")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .format("YYYYMMDDHHmmss");
          break;
        case "month":
          this.from = moment()
            .subtract(4, "hours")
            .startOf("month")
            .hours(4)
            .format("YYYYMMDDHHmmss");
          this.to = moment()
            .subtract(4, "hours")
            .endOf("month")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .format("YYYYMMDDHHmmss");
          break;
        case "lastMonth":
          this.from = moment()
            .subtract(4, "hours")
            .subtract(1, "months")
            .startOf("month")
            .hours(4)
            .format("YYYYMMDDHHmmss");
          this.to = moment()
            .subtract(4, "hours")
            .subtract(1, "months")
            .endOf("month")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .format("YYYYMMDDHHmmss");
          break;
        case "specified":
          break;
      }

      this.$socket.emit(
        "[TERM] BATCH_HISTORY",
        { from: this.from, to: this.to },
        logs => {
          this.logs = logs;
        }
      );
    },
    printReport(record) {
      Printer.printBatchReport(record);
    },
    generateExcel() {
      let excel = [
        [
          "Index",
          "Date",
          "Batch Time",
          "Station",
          "Credit",
          "Credit Count",
          "Debit",
          "Debit Count",
          "status"
        ]
      ];
      let csvRows = [];

      this.logs.slice(0).forEach((log, index) => {
        let { date, time, station, count, amount, status } = log;
        time = moment(time, "YYYYMMDDHHmmss").format("YYYY-MM-DD HH:mm:ss");

        excel.push([
          index + 1,
          date,
          time,
          station,
          amount.credit,
          count.credit,
          amount.debit,
          count.debit,
          status
        ]);
      });

      for (let i = 0; i < excel.length; i++) {
        csvRows.push(excel[i].join(","));
      }
      let from = this.logs[0].date;
      let to = this.logs[this.logs.length - 1].date;
      let csvFile = csvRows.join("\n");
      let blob = new Blob([csvFile], { type: "text/plain;charset=utf-8" });
      fileSaver.saveAs(blob, `Batch Report Summary (${from} - ${to}).csv`);
    }
  }
};
</script>

<style scoped>
.period {
  display: flex;
  background: #607d8b;
  color: aliceblue;
  align-items: center;
}

nav {
  display: flex;
  flex: 1;
}

.functions {
  padding: 0 5px;
  display: flex;
}

.functions button {
  padding: 10px 20px;
  margin: 0 5px;
  background: #fdfeff;
  border: none;
  border-radius: 4px;
  box-shadow: 0 1px 3px #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none;
  font-family: "Yuanti-SC";
}

.functions i {
  margin-right: 5px;
}

label {
  padding: 15px 5px;
  min-width: 100px;
  text-align: center;
  cursor: pointer;
  display: block;
  transition: all 0.3s ease-out;
  border-bottom: 3px solid transparent;
}

input:checked + label {
  background: #768f9a;
  border-bottom: 3px solid #ff9800;
}

table {
  table-layout: auto;
  border-spacing: 0;
  width: 100%;
}

thead {
  background: #fff;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.4);
}

thead th {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

thead,
tbody tr,
tfoot tr {
  display: table;
  table-layout: fixed;
  width: 100%;
}

tbody {
  background: #fafafa;
  height: 628px;
  overflow: auto;
  display: block;
}
tbody td {
  text-align: center;
  padding: 10px 0;
}

tbody tr {
  background: #fafafa;
}

tbody tr:nth-child(even) {
  background: #eee;
}

tfoot tr {
  height: 28px;
  background: #ffffff;
  border-top: 1px solid #f5f5f5;
}

.fa-check-circle-o {
  color: rgba(0, 0, 0, 0.4);
}

.fa-check-circle {
  color: #009688;
}

.date {
  width: 100px;
}

.icon {
  width: 65px;
  text-align: center;
}

.icon span {
  padding: 3px 0;
  min-width: 30px;
  display: inline-flex;
  justify-content: center;
  background: #ff9800;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: #fff;
  text-shadow: 0 1px 1px #555;
}

.padding {
  padding-right: 5px;
}

.hours {
  width: 250px;
  text-align: center;
}

.wage {
  position: relative;
}

.wage i {
  position: absolute;
  right: 5px;
  color: #ff9800;
}

.edit i {
  cursor: pointer;
}

.salary {
  color: #000;
  text-align: center;
  font-weight: bold;
}

.salary .text {
  padding-right: 7px;
  font-weight: initial;
  font-family: "Yuanti-SC";
  color: #333;
}

.profile {
  font-weight: bold;
  width: 100px;
  padding-right: 20px;
  text-align: center;
}
</style>