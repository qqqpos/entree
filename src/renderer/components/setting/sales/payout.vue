<template>
    <div>
      <header class="date-picker">
        <div class="f1">
            <h3>{{$t('setting.title.payoutRecord')}}</h3>
            <p>{{$t('title.summary.payout',from,to)}}</p>
        </div>
      <date-picker @update="fetchData" init="currentWeek"></date-picker>
    </header>
    <div class="summary-wrap">
      <section class="list">
        <payout v-for="(record,index) in records" :key="index" :record="record"></payout>
      </section>
      <section class="overview">

      </section>
      </div>
    </div>
</template>

<script>
import payout from "./helper/payout";
import datePicker from "../common/datePicker";

export default {
  components: { payout, datePicker },
  data() {
    return {
      componentData: null,
      component: null,
      records: [],
      from: "",
      to: ""
    };
  },
  methods: {
    fetchData([from, to], group = "DAILY") {
      this.from = from.format("YYYY-MM-DD");
      this.to = to.format("YYYY-MM-DD");

      this.$socket.emit("[PAYOUT] LIST", { from: +from, to: +to }, records => {
        console.log(records);
        this.records = records;
      });
    }
  }
};
</script>