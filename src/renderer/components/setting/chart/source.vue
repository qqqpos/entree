<template>
  <div>
    <header class="date-picker">
      <div class="f1">
          <h3>{{$t('title.ticketType')}}</h3>
          <p>Ticket Type Pie Chart Summary</p>
      </div>
      <date-picker @update="fetchData" init="today"></date-picker>
    </header>
    <div class="relative">
        <div ref="chart" style="width: 100%; height: 688px;"></div>   
        <loader :display="isLoading"></loader>
    </div>
  </div>
</template>

<script>
import loader from "../../common/loader";
import datePicker from "../common/datePicker";

export default {
  components: { datePicker, loader },
  data() {
    return {
      isLoading: false,
      range: {}
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData(range) {
      this.isLoading = true;

      if (!range) {
        const from = +moment(today(), "YYYY-MM-DD", true)
          .startOf("day")
          .hour(4);
        const to = +moment(today(), "YYYY-MM-DD", true)
          .startOf("day")
          .add(1, "days")
          .hour(4);

        this.$socket.emit("[CHART] SOURCE", { from, to }, result =>
          this.process(result)
        );
      } else {
        const [from, to] = range;

        this.$socket.emit("[CHART] SOURCE", { from: +from, to: +to }, result =>
          this.process(result)
        );
      }
    },
    process(data) {
      this.isLoading = false;

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