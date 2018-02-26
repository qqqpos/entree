<template>
    <div>
        <range-tab @update="fetchData" initial="currentWeek"></range-tab>
        <div class="table">
            <table class="data">
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
                    <tr v-for="(report,index) in reports" :key="index">
                        <td class="icon">
                            <i class="fa fa-check-circle" v-if="checkStatus(report.status)"></i>
                            <i class="fa fa-check-circle-o" v-else></i>
                        </td>
                        <td class="date">{{report.date}}</td>
                        <td>{{report.station}}</td>
                        <td>{{report.amount.credit}}</td>
                        <td>{{report.count.credit}}</td>
                        <td>{{report.amount.debit}}</td>
                        <td>{{report.count.debit}}</td>
                        <td class="fn">
                            <i class="fa fa-print" @click="printReport(report)"></i>
                        </td>
                        <td class="fn">
                            <i class="fa fa-external-link"></i>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="9" class="f1">
                            <div class="summary">
                                <div class="static">
                                    <p class="date">{{dateRange}}</p>
                                    <p class="field">
                                        <span class="text">{{$t('setting.batchRecord')}}
                                            <span class="value">{{batchCount}}</span>
                                        </span>
                                        <span class="text">{{$t("text.total")}}
                                            <span class="value">{{batchTotal}}</span>
                                        </span>
                                    </p>
                                </div>
                                <div class="option">

                                </div>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
            <div :is="component" :init="componentData" @refresh="fetchData"></div>
        </div>
    </div>
</template>

<script>
import rangeTab from "../common/rangeTab";
export default {
  components: { rangeTab },
  data() {
    return {
      componentData: null,
      component: null,
      reports: [],
      from: +moment()
        .startOf("w")
        .hours(4),
      to: +moment()
        .endOf("w")
        .add(4, "h")
    };
  },
  beforeRouteEnter: (t, f, next) => {
    const from = +moment()
      .startOf("w")
      .hours(4);
    const to = +moment()
      .endOf("w")
      .add(4, "h");

    appSocket.emit("[BATCH] HISTORY", { from, to }, reports =>
      next(vm => {
        vm.reports = reports;
      })
    );
  },
  methods: {
    fetchData(range) {
      const { from, to } = range;
      this.from = from;
      this.to = to;

      this.$socket.emit("[BATCH] HISTORY", { from, to }, reports => {
        this.reports = reports;
      });
    },
    printReport(record) {
      Printer.printBatchReport(record);
    },
    checkStatus(status){
      return status.includes('SUCCESS') || status.includes('CLOSE')
    }
  },
  computed: {
    batchCount() {
      return this.reports.filter(log => this.checkStatus(log.status)).length;
    },
    batchTotal() {
      return "$ " + this.reports
        .filter(log => this.checkStatus(log.status))
        .reduce((a, c) => a + parseFloat(c.amount.credit), 0)
        .toFixed(2);
    },
    dateRange() {
      const to = moment(this.to)
        .subtract(4, "H")
        .format("YYYY-MM-DD");
      const from = moment(this.from).format("YYYY-MM-DD");
      return `${from} ~ ${to}`;
    }
  }
};
</script>

<style scoped>
tbody {
  height: 600px;
  overflow: auto;
  display: block;
}

.summary {
  flex: 1;
  margin: 4px;
  background: #3f51b5;
  color: #fff;
  padding: 0px 20px;
  border-radius: 2px;
  display: flex;
  height: 58px;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

p.date {
  font-size: 14px;
  font-family: "Agency FB";
  color: #abb2df;
  letter-spacing: 1px;
}

.field span {
  flex: 1;
  margin-right: 10px;
}

.text {
  color: #c5cae9;
}

.value {
  color: #fff;
  text-shadow: 0 1px 1px #333;
  margin-left: 5px;
}
</style>