<template>
  <div>
    <range-tab @update="fetchData" initial="currentQuarter"></range-tab>
    <div class="chart" ref="chart" style="width: 100%; height: 450px;"></div>
    <!-- <table>
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
    </table> -->
  </div>
</template>

<script>
import rangeTab from "../common/rangeTab";

export default {
  components: { rangeTab },
  data() {
    return {
      option: {},
      reports: []
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData(range) {
      if (!range) {
        const from = +moment()
          .startOf("quarter")
          .hours(4);
        const to = +moment()
          .endOf("quarter")
          .add(4, "h");

        this.$socket.emit("[CHART] RANGE", { from, to }, result =>
          this.initialChartData(result)
        );
      } else {
        const { from, to } = range;

        this.$socket.emit("[CHART] RANGE", { from, to }, result =>
          this.initialChartData(result)
        );
      }
    },
    initialChartData(dataProvider) {
      const chart = AmCharts.makeChart(this.$refs.chart, {
        //path: "dist/electron/amcharts/",
        type: "serial",
        marginRight: 40,
        marginLeft: 40,
        autoMarginOffset: 20,
        mouseWheelZoomEnabled: true,
        dataDateFormat: "YYYY-MM-DD",
        fontFamily: "Yuanti-SC",
        valueAxes: [
          {
            id: "v1",
            axisAlpha: 0,
            position: "left",
            ignoreAxisWidth: true
          }
        ],
        balloon: {
          borderThickness: 1,
          shadowAlpha: 0
        },
        startEffect: "elastic",
        startDuration: 0.5,
        graphs: [
          {
            id: "g1",
            balloon: {
              drop: true,
              adjustBorderColor: false,
              color: "#ffffff"
            },
            bullet: "round",
            bulletBorderAlpha: 1,
            bulletColor: "#FFFFFF",
            bulletSize: 4,
            hideBulletsCount: 50,
            lineThickness: 2,
            title: "red line",
            useLineColorForBulletBorder: true,
            valueField: "value",
            balloonText: "<span style='font-size:18px;'>[[value]]</span>"
          }
        ],
        chartScrollbar: {
          graph: "g1",
          oppositeAxis: false,
          offset: 30,
          scrollbarHeight: 80,
          backgroundAlpha: 0,
          selectedBackgroundAlpha: 0.1,
          selectedBackgroundColor: "#888888",
          graphFillAlpha: 0,
          graphLineAlpha: 0.5,
          selectedGraphFillAlpha: 0,
          selectedGraphLineAlpha: 1,
          autoGridCount: true,
          color: "#AAAAAA"
        },
        chartCursor: {
          pan: true,
          valueLineEnabled: true,
          valueLineBalloonEnabled: true,
          cursorAlpha: 1,
          cursorColor: "#258cbb",
          limitToGraph: "g1",
          valueLineAlpha: 0.2,
          valueZoomable: true
        },
        valueScrollbar: {
          oppositeAxis: false,
          offset: 50,
          scrollbarHeight: 10
        },
        categoryField: "date",
        categoryAxis: {
          parseDates: true,
          dashLength: 1,
          minorGridEnabled: true
        },
        export: {
          enabled: true
        },
        dataProvider
      });
      //this.analyzeData({ labels, data });
    },

    analyzeData({ labels, data }) {
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
.chart {
  background: #fff;
}

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