<template>
  <div>
    <range-tab @update="fetchData" initial="currentWeek"></range-tab>
    <div class="table">
      <table class="data">
        <thead>
          <tr>
            <th class="icon">{{$t('thead.status')}}</th>
            <th>{{$t('thead.date')}}</th>
            <th>{{$t('thead.beginTime')}}</th>
            <th>{{$t('thead.endTime')}}</th>
            <th>{{$t('thead.cashDrawer')}}</th>
            <th>{{$t('thead.depositor')}}</th>
            <th>{{$t('thead.beginAmount')}}</th>
            <th>{{$t('thead.endAmount')}}</th>
            <th>{{$t('thead.records')}}</th>
            <th>{{$t('thead.detail')}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log,index) in logs" :key="index">
            <td class="icon">
              <i class="fa fa-check-circle" v-if="log.close"></i>
              <i class="fa fa-exclamation-triangle" v-else></i>
            </td>
            <td>{{log.date}}</td>
            <td>{{log.beginTime | moment("HH:mm:ss")}}</td>
            <td>{{log.endTime | moment("HH:mm:ss")}}</td>
            <td>{{log.cashDrawer}}</td>
            <td>{{log.operator}}</td>
            <td>$ {{log.begin | decimal}}</td>
            <td>{{log.end | money}}</td>
            <td>{{log.activity.length}}</td>
            <td class="more" @click="view(log)">
              <i class="fa fa-external-link"></i>
            </td>
          </tr>
        </tbody>
      </table>
      <div :is="component" :init="componentData" @refresh="fetchData"></div>
    </div>
  </div>
</template>

<script>
import viewer from "./component/viewer";
import rangeTab from "../common/rangeTab";

export default {
  components: { rangeTab, viewer },
  data() {
    return {
      componentData: null,
      component: null,
      logs: [],
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

    appSocket.emit("[CASHFLOW] HISTORY", { from, to }, logs =>
      next(vm => {
        vm.logs = logs;
      })
    );
  },
  filters: {
    money(val) {
      return isNumber(val) ? "$ " + val.toFixed(2) : "";
    }
  },
  methods: {
    fetchData(range) {
      const { from, to } = range;

      this.$socket.emit("[CASHFLOW] HISTORY", { from, to }, logs => {
        this.logs = logs;
      });
    },
    view(log) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, log };
        this.component = "viewer";
      })
        .then(() => {
          this.$q();
        })
        .catch(() => this.$q());
    }
  }
};
</script>

<style scoped>
tbody {
  height: 667px;
  overflow: auto;
  display: block;
}
</style>