<template>
    <div class="table">
        <table class="data">
            <thead>
                <tr>
                    <th>{{$t('thead.name')}}</th>
                    <th>{{$t('text.role')}}</th>
                    <th>{{$t('thead.count')}}</th>
                    <th>{{$t('text.validRecord')}}</th>
                    <th>{{$t('thead.baseWage')}}</th>
                    <th class="time">{{$t('thead.totalWorkTime')}}</th>
                    <th>{{$t('thead.validWorkTime')}}</th>
                    <th>{{$t('thead.salary')}}</th>
                    <th>{{$t('thead.tip')}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(payroll,index) in payrolls" :key="index">
                    <td>{{payroll.name}}</td>
                    <td>{{$t('type.'+payroll.role)}}</td>
                    <td>{{payroll.count}}</td>
                    <td>{{payroll.valid}}</td>
                    <td>$ {{payroll.wage | decimal}}</td>
                    <td class="time">{{format(payroll.totalTime)}}</td>
                    <td>{{payroll.validTime | decimal}}</td>
                    <td>$ {{payroll.salary | decimal}}</td>
                    <td>{{payroll.tipTotal | decimal}}</td>
                </tr>
            </tbody>
        <tfoot>
        <tr>
          <td colspan="9" class="f1">
            <div class="summary">
              <div class="static">
                <p class="date"></p>
                <p class="compensation">
                  <span class="text">{{$t('text.validRecord')}}
                    <span class="value">{{summary.valid}}</span>
                  </span>
                  <span class="text">{{$t("text.payout")}}
                    <span class="value">$ {{summary.payout.toFixed(2)}}</span>
                  </span>
                  <span class="text">{{$t("text.tip")}}
                    <span class="value">$ {{summary.tip.toFixed(2)}}</span>
                  </span>
                </p>
              </div>
            </div>
          </td>
        </tr>
      </tfoot>
        </table>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
export default {
  props: ["payrolls"],
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  created() {
    console.log(this.payrolls);
  },
  computed: {
    summary() {
      const valid = this.payrolls.filter(p => p.count > 0).length;
      const payout = this.payrolls.reduce((a, c) => a + c.salary, 0);
      const tip = this.payrolls.reduce((a, c) => a + c.tipTotal, 0);

      return { valid, payout, tip };
    }
  },
  methods: {
    format(time) {
      const duration = moment.duration(time);

      return this.$t(
        "text.hhmm",
        Math.floor(duration.asHours()),
        duration.minutes(),
        duration.seconds()
      );
    }
  }
};
</script>

<style scoped>
.time {
  width: 185px;
}

tbody {
  height: 595px;
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
</style>