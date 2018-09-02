<template>
    <div>
      <header class="date-picker">
        <div class="f1">
            <h3>{{$t('setting.title.cashflow')}}</h3>
            <p>{{$t('title.summary.cashflow',from,to)}}</p>
        </div>
      <date-picker @update="fetchData" init="currentMonth"></date-picker>
    </header>
    <div class="summary-wrap">
      <section class="list">

      </section>
      <section class="overview">

      </section>
      </div>
    </div>
</template>

<script>
import datePicker from "../common/datePicker";

export default {
  components: { datePicker },
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

      this.$socket.emit("[CASHFLOW] HISTORY", { from, to }, records => {
        this.records = records;
      });
    }
  }
};
</script>