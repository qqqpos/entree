<template>
  <div>
    <range-tab @update="fetchData" initial="currentWeek"></range-tab>
    <line-chart :chart-data="collection"></line-chart>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>{{$t('thead.date')}}</th>
          <th></th>
          <th>{{$t('report.salesTotal')}}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(report,index) in reports" :key="index">
          <td>{{report.title}}</td>
          <td>{{report.date}}</td>
          <td>{{report.week}}</td>
          <td class="amount">$ {{report.value | decimal}}</td>
          <td>{{report.note}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import rangeTab from "../common/rangeTab";
import lineChart from "./component/lineChart";

export default {
  components: { lineChart, rangeTab },
  data() {
    return {
      collection: null,
      reports: []
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    initialChartData(result) {
      const { labels, data } = result;
      this.collection = {
        labels,
        datasets: [
          {
            backgroundColor: "rgba(255, 99, 132, 0.1)",
            borderColor: "rgb(255, 99, 132)",
            data,
            fill: "start",
            label: this.$t("text.sales"),
            cubicInterpolationMode: "monotone",
            borderWidth: 2,
            borderDash: [3, 3],
            pointHoverRadius: 10,
            pointStyle: "circle"
          }
        ]
      };
      this.analyzeData(result);
    },
    fetchData(range) {
      if(!range){
        const from = +moment().startOf("w").hours(4);
        const to = +moment().endOf("w").add(4, "h");

        this.$socket.emit("[CHART] RANGE", { from, to }, result =>this.initialChartData(result));
      }
      else if(range.select === 'monthly'){
        const {from,to} = range;
        
        this.$socket.emit("[CHART] MONTHLY", { from, to }, result =>this.initialChartData(result));
      }else{
        const {from,to} = range;

        this.$socket.emit("[CHART] RANGE", { from, to }, result =>this.initialChartData(result));
      }
    },
    analyzeData(result) {
      const { labels, data } = result;

      if (data.length === 0) {
        this.reports = [];
        return;
      }

      const highestSales = Math.max(...data);
      const hIndex = data.findIndex(sales => sales === highestSales);
      const highestSalesDate = labels[hIndex];

      const lowestSales = Math.min(...data);
      const lIndex = data.findIndex(sales => sales === lowestSales);
      const lowestSalesDate = labels[lIndex];

      const average = data.reduce((a, b) => a + b, 0) / data.length;
      const aboveAverage = data.filter(sales => sales >= average).length;
      const belowAverage = data.filter(sales => sales < average).length;

      this.reports = [
        {
          title: this.$t("report.highestSales"),
          date: highestSalesDate,
          week: moment(highestSalesDate, "YYYY-MM-DD").format("ddd"),
          value: highestSales,
          note: ""
        },
        {
          title: this.$t("report.lowestSales"),
          date: lowestSalesDate,
          week: moment(lowestSalesDate, "YYYY-MM-DD").format("ddd"),
          value: lowestSales,
          note: ""
        },
        {
          title: this.$t("report.salesTotal"),
          date: "",
          week: "",
          value: data.reduce((a, b) => a + b, 0),
          note: ""
        },
        {
          title: this.$t("report.averageSales"),
          date: "",
          week: "",
          value: average,
          note: this.$t("report.averageDetail", aboveAverage, belowAverage)
        }
      ];
    }
  }
};
</script>

<style scoped>
thead th {
  background: #607d8b;
  color: #fff;
  padding: 2px 0;
  text-shadow: 0 1px 1px #333;
  font-weight: normal;
}

td {
  text-align: center;
  padding: 10px 0;
}
</style>