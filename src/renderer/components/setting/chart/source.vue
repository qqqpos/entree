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
  created() {
    this.fetchData();
  },
  data() {
    return {
      range: {}
    };
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

        range = { from, to };

        this.$socket.emit("[CHART] SOURCE", { from, to }, result =>
          this.initialChartData(result)
        );
      } else {
        const { from, to } = range;

        this.$socket.emit("[CHART] SOURCE", { from, to }, result =>
          this.initialChartData(result)
        );
      }

      this.range = range;
    },
    initialChartData(data) {
      const types = data.map((each, i) => ({
        type: this.$t("type." + each._id),
        percent: each.count,
        sales: toFixed(each.sales, 2),
        subs: each.subs.map(sub => ({
          type:
            this.$t("type." + sub.type) +
            " " +
            this.$t("type." + sub.payment) +
            ` (${sub.percent} %)`,
          percent: sub.count
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
        baseColor: "#3F51B5",
        brightnessStep: 50,
        // innerRadius:"15%",
        legend: {
          position: "right"
        },
        titles: [
          {
            text: this.$t(
              "text.ticketTypeFromDateRange",
              moment(this.range.from).format("YYYY-MM-DD"),
              moment(this.range.to)
                .subtract(1, "d")
                .format("YYYY-MM-DD")
            )
          }
        ],
        fontFamily: "Yuanti-SC",
        listeners: [
          {
            event: "clickSlice",
            method: function(event) {
              let chart = event.chart;

              selected =
                event.dataItem.dataContext.id != undefined
                  ? event.dataItem.dataContext.id
                  : undefined;
                  
              chart.dataProvider = generateChartData();
              chart.validateData();
            }
          }
        ],
        export: {
          enabled: true,
          fileName: this.$t(
            "text.ticketTypeFromDateRange",
            moment(this.range.from).format("YY-MM-DD"),
            moment(this.range.to)
              .subtract(1, "d")
              .format("YY-MM-DD")
          ),
          menuReviver: function(item, li) {
            if (item.format === "XLSX" || item.format === "PDF")
              li.style.display = "none";
            return li;
          }
        }
      });
    }
  }
};
</script>