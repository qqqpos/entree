<template>
  <div>
    <header class="date-picker">
      <div class="f1">
          <h3>{{$t('setting.title.dailySales')}}</h3>
          <p>Period Sales Summary</p>
      </div>
      <date-picker @update="fetchData" init="currentMonth"></date-picker>
    </header>
    <div class="chart" ref="chart" style="width: 100%; height: 450px;"></div>
  </div>
</template>

<script>
import datePicker from "../common/datePicker";

export default {
  components: { datePicker },
  data() {
    return {
      reports: []
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData(range) {
      if (!range) {
        const from = +moment()
          .startOf("M")
          .hours(4);
        const to = +moment()
          .endOf("M")
          .add(4, "h");

        this.$socket.emit("[CHART] RANGE", { from, to }, result =>
          this.drawChart(result)
        );
      } else {
        const [from, to] = range;

        this.$socket.emit("[CHART] RANGE", { from: +from, to: +to }, result =>
          this.drawChart(result)
        );
      }
    },
    drawChart(dataProvider) {
      const average = parseInt(
        dataProvider.reduce((a, c) => a + c.value, 0) / dataProvider.length
      );
      const chart = AmCharts.makeChart(this.$refs.chart, {
        path:
          process.env.NODE_ENV === "development"
            ? "dist/electron/amcharts/"
            : undefined,
        type: "serial",
        marginRight: 80,
        autoMarginOffset: 20,
        marginTop: 7,
        dataDateFormat: "YYYY-MM-DD",
        fontFamily: "Yuanti-SC",
        mouseWheelZoomEnabled: true,
        startEffect: "elastic",
        startDuration: 0.5,
        mouseWheelZoomEnabled: true,
        valueAxes: [
          {
            logarithmic: true,
            dashLength: 1,
            axisAlpha: 0.1,
            position: "left",
            guides: [
              {
                dashLength: 5,
                inside: true,
                label:
                  this.$t("report.averageSales") + ` $ ${average.toFixed(2)}`,
                lineAlpha: 1,
                fontSize: "18",
                value: average,
                lineColor: "#FF5722"
              }
            ],
            position: "left"
          }
        ],
        graphs: [
          {
            id: "g1",
            balloonText: "[[value]]",
            bullet: "round",
            bulletBorderAlpha: 1,
            bulletColor: "#FFFFFF",
            hideBulletsCount: 50,
            bulletSize: 5,
            title: "red line",
            valueField: "value",
            lineThickness: 1,
            lineColor: "#20acd4",
            fillAlphas: 0.5,
            fillColors: ["#cbeaf7", "#fff"],
            type: "smoothedLine",
            useLineColorForBulletBorder: true,
            dashLength: 5,
            balloon: {
              drop: true,
              shadowAlpha: 0,
              borderThickness: 1
            }
          }
        ],
        chartScrollbar: {
          autoGridCount: true,
          graph: "g1",
          scrollbarHeight: 40
        },
        chartCursor: {
          limitToGraph: "g1"
        },
        categoryField: "date",
        categoryAxis: {
          parseDates: true,
          axisColor: "#DADADA",
          dashLength: 1,
          minorGridEnabled: true
        },
        export: {
          enabled: true,
          pageOrigin: false,
          fileName: "Daily Sales Report",
          menuReviver: function(item, li) {
            if (item.format === "XLSX" || item.format === "PDF")
              li.style.display = "none";
            return li;
          }
        },
        dataProvider
      });

      //this.analyzeData({ labels, data });
    }

    // analyzeData({ labels, data }) {
    //   if (data.length === 0) {
    //     this.reports = [];
    //     return;
    //   }

    //   const highestSales = Math.max(...data);
    //   const hIndex = data.findIndex(sales => sales === highestSales);
    //   const highestSalesDate = labels[hIndex];

    //   const lowestSales = Math.min(...data);
    //   const lIndex = data.findIndex(sales => sales === lowestSales);
    //   const lowestSalesDate = labels[lIndex];

    //   const average = data.reduce((a, b) => a + b, 0) / data.length;
    //   const aboveAverage = data.filter(sales => sales >= average).length;
    //   const belowAverage = data.filter(sales => sales < average).length;

    //   this.reports = [
    //     {
    //       title: this.$t("report.highestSales"),
    //       date: highestSalesDate,
    //       week: moment(highestSalesDate, "YYYY-MM-DD").format("ddd"),
    //       value: highestSales,
    //       note: ""
    //     },
    //     {
    //       title: this.$t("report.lowestSales"),
    //       date: lowestSalesDate,
    //       week: moment(lowestSalesDate, "YYYY-MM-DD").format("ddd"),
    //       value: lowestSales,
    //       note: ""
    //     },
    //     {
    //       title: this.$t("report.salesTotal"),
    //       date: "",
    //       week: "",
    //       value: data.reduce((a, b) => a + b, 0),
    //       note: ""
    //     },
    //     {
    //       title: this.$t("report.averageSales"),
    //       date: "",
    //       week: "",
    //       value: average,
    //       note: this.$t("report.averageDetail", aboveAverage, belowAverage)
    //     }
    //   ];
    // }
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