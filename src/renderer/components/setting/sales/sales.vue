<template>
  <div>
    <header class="date-picker">
        <div class="f1">
            <h3>{{$t('setting.title.salesSummary')}}</h3>
            <p>Daily Sales Summary</p>
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
import loader from "../../common/loader";
import datePicker from "../common/datePicker";

export default {
  components: { loader, datePicker },
  data() {
    return {
      componentData: null,
      component: null,
      ledgers: []
    };
  },
  methods: {
    fetchData([from, to]) {
      this.$socket.emit(
        "[REPORT] INITIAL_DATA",
        {
          from: +from,
          to: +to
        },
        payrolls => {
          this.payrolls = payrolls;
          this.analyze();
        }
      );
    }
  }
};
</script>