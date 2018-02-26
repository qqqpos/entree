<template>
  <div>
    <range-tab @update="fetchData" initial="currentMonth"></range-tab>
    <pie :chart-data="collection"></pie>
  </div>
</template>

<script>
import pie from "./component/pie";
import rangeTab from "../common/rangeTab";

export default {
  components: { pie, rangeTab },
  data() {
    return {
      collection: [],
      base: "count"
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData(range) {
      if (!range) {
        const from = +moment().startOf("M").hours(4);
        const to = +moment().endOf("M").add(4, "h");

        this.$socket.emit("[CHART] SOURCE", { from, to }, result => this.initialChartData(result) );
      } else {
        const { from,to } = range;

        this.$socket.emit("[CHART] SOURCE", { from, to }, result =>this.initialChartData(result));
      }
    },
    initialChartData(result) {
      const { labels, counts, sales } = result;
      this.collection = {
        labels: labels.map(t => this.$t("type." + t)),
        datasets: [
          {
            data: this.base === "count" ? counts : sales,
            backgroundColor: ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56"]
          }
        ]
      };
    }
  }
};
</script>