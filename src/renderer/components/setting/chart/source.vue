<template>
  <div>
    <range-tab @update="fetchData" initial="currentMonth"></range-tab>
    <div ref="chart" style="width: 100%; height: 697px;"></div>
  </div>
</template>

<script>
import rangeTab from "../common/rangeTab";

export default {
  components: { rangeTab },
  data() {
    return {
      option: {}
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

        this.$socket.emit("[CHART] SOURCE", { from, to }, result =>
          this.initialChartData(result)
        );
      } else {
        const { from, to } = range;

        this.$socket.emit("[CHART] SOURCE", { from, to }, result =>
          this.initialChartData(result)
        );
      }
    },
    initialChartData(data) {
      const allCounts = data.reduce((a, c) => a + c.count, 0);

      let types = data.map((each, i) => ({
        type: this.$t("type." + each._id),
        percent: each.count,
        sales: toFixed(each.sales, 2),
        subs: each.subs.map(sub => ({
          type: this.$t("type." + sub.type) + " (%)",
          percent: sub.percent
        }))
      }));

      let chart;
      let selected;

      function generateChartData() {
        let chartData = [];
        for (let i = 0; i < types.length; i++) {
          if (i == selected) {
            for (let x = 0; x < types[i].subs.length; x++) {
              chartData.push({
                type: types[i].subs[x].type,
                percent: types[i].subs[x].percent,
                color: types[i].color,
                pulled: true
              });
            }
          } else {
            chartData.push({
              type: types[i].type,
              percent: types[i].percent,
              color: types[i].color,
              id: i
            });
          }
        }
        return chartData;
      }

      AmCharts.makeChart(this.$refs.chart, {
        type: "pie",

        dataProvider: generateChartData(),
        labelText: "[[title]]: [[value]]",
        balloonText: "[[title]]: [[value]]",
        titleField: "type",
        valueField: "percent",
        outlineColor: "#FFFFFF",
        outlineAlpha: 0.8,
        outlineThickness: 2,
        colorField: "color",
        pulledField: "pulled",
        baseColor:"#3F51B5",
        brightnessStep:50,
        titles: [
          {
            text: "Click a slice to see the details"
          }
        ],
        fontFamily:"Yuanti-SC",
        listeners: [
          {
            event: "clickSlice",
            method: function(event) {
              let chart = event.chart;
              if (event.dataItem.dataContext.id != undefined) {
                selected = event.dataItem.dataContext.id;
              } else {
                selected = undefined;
              }
              chart.dataProvider = generateChartData();
              chart.validateData();
            }
          }
        ],
        export: {
          enabled: true
        }
      });
    }
  }
};
</script>

<style scoped>

</style>