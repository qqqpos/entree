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
         <div class="wrap relative">
          <h3>{{$t('nav.overview')}}</h3>
          <p>
            <span class="f1">Days</span>
            <span class="value">{{summary.days}}</span>
          </p>
          <p>
            <span class="f1">Sales Total</span>
            <span class="value">$ {{summary.salesTotal | decimal}}</span>
          </p>
          <div class="group">
            <p>
              <span class="f1"></span>
              <span class="value"></span>
              <span class="unit"></span>
            </p>
            <p>
              <span class="f1"></span>
              <span class="value"></span>
              <span class="unit"></span>
            </p>
          </div>
          <div class="group">
            <p>
              <span class="f1"></span>
              <span class="value"></span>
            </p>
            <p>
              <span class="f1"></span>
              <span class="value"></span>
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
            this.dates = dates.sort((a, b) => (a.time > b.time ? 1 : -1));
            this.analizeData();
          }
        );
    },
    analizeData() {}
  },
  computed: {
    summary() {
      const days = this.dates.length;
      const salesTotal = this.dates.reduce(
        (a, c) => a + c.summary.sales.total,
        0
      );

      return { days, salesTotal };
    }
  }
};
</script>