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
        <daily v-for="(date,index) in dates" :key="index" :sales="date"></daily>
      </section>
      <section class="overview">

      </section>
    </div>
  </div>
</template>

<script>
import daily from "./helper/daily";
import loader from "../../common/loader";
import datePicker from "../common/datePicker";

export default {
  components: { daily, loader, datePicker },
  data() {
    return {
      componentData: null,
      component: null,
      indexed: false,
      dates: []
    };
  },
  created() {
    this.indexed = this.$store.getters.config.database.index;
  },
  methods: {
    fetchData([from, to], group = "DAILY") {
      this.indexed &&
        this.$socket.emit(
          "[REPORT] DAILY",
          { from: +from, to: +to, group },
          dates => {
            this.dates = dates.sort((a, b) => a.time > b.time);
          }
        );
    }
  }
};
</script>