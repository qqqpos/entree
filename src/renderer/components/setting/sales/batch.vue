<template>
    <div>
      <header class="date-picker">
        <div class="f1">
            <h3>{{$t('setting.title.batch')}}</h3>
            <p>{{$t('tip.batchSummary')}}</p>
        </div>
      <date-picker @update="fetchData" init="currentMonth"></date-picker>
    </header>
    <div class="summary-wrap">
      <section class="list">
        <record v-for="(record,index) in records" :key="index" :batch="record"></record>
      </section>
      <section class="overview">
         <div class="wrap relative">
          <h3>{{$t('nav.overview')}}</h3>
          <p>
            <span class="f1">Batch Count</span>
            <span class="value">{{summary.count}}</span>
          </p>
          <p>
            <span class="f1">Batch Total</span>
            <span class="value">$ {{summary.total | decimal}}</span>
          </p>
          <div class="group">
            <p>
              <span class="f1">Transaction Count</span>
              <span class="value">{{summary.transactionCount}}</span>
            </p>
            <p>
              <span class="f1">Transaction Per Day</span>
              <span class="value">{{summary.transactionPerDay}}</span>
            </p>
          </div>
          <div class="group">
            <p>
              <span class="f1">Average Charge</span>
              <span class="value">$ {{summary.transactionAverage | decimal}}</span>
            </p>
          </div>   
          <p>
            <span class="f1"></span>
            <span class="value"></span>
          </p>   
          <p>
            <span class="f1"></span>
            <span class="value"></span>
          </p>                                   
        </div>
      </section>
      </div>
    </div>
</template>

<script>
import record from "./helper/record";
import datePicker from "../common/datePicker";

export default {
  components: { record, datePicker },
  data() {
    return {
      componentData: null,
      component: null,
      records: []
    };
  },
  methods: {
    fetchData([from, to], group = "DAILY") {
      this.$socket.emit(
        "[BATCH] HISTORY",
        { from: +from, to: +to, group },
        records => {
          this.records = records;
          this.analizeData();
        }
      );
    },
    analizeData() {}
  },
  computed: {
    summary() {
      const count = this.records.length;
      const total = this.records.reduce(
        (a, c) => a + parseFloat(c.amount.credit),
        0
      );
      const transactionCount = this.records.reduce(
        (a, c) => a + parseInt(c.count.credit),
        0
      );

      const transactionPerDay = Math.ceil(transactionCount / count) || 0;
      const transactionAverage = toFixed(total / transactionCount, 2) || 0;

      return {
        count,
        total,
        transactionCount,
        transactionPerDay,
        transactionAverage
      };
    }
  }
};
</script>