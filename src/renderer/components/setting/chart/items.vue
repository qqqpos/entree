<template>
    <div>
        <range-tab @update="fetchData" initial="currentMonth"></range-tab>
        <div ref="chart" style="width: 100%; height: 697px;"></div>
    </div>
</template>

<script>
import rangeTab from "../common/rangeTab";
import switches from "../common/switches";
import randomColor from "randomcolor";

export default {
  components: { rangeTab, switches },
  data() {
    return {
      range: {},
      department: false
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

        range = { from, to };

        this.$socket.emit("[CHART] ITEMS", { from, to }, result =>
          this.group(result)
        );
      } else {
        const { from, to } = range;

        this.$socket.emit("[CHART] ITEMS", { from, to }, result =>
          this.group(result)
        );
      }

      this.range = range;
    },
    group(data) {
      let grouped = {};

      if (this.department) {
      } else {
        data.forEach(({ category, count, total, usEN, zhCN }) => {
          if (grouped.hasOwnProperty(category)) {
            grouped[category].count += count;
            grouped[category].total += count;
            grouped[category].items.push({
              usEN,
              zhCN,
              count,
              total
            });
          } else {
            grouped[category] = {
              color: randomColor({
                luminosity: "monochrome",
                hue: "random"
              }),
              category,
              count,
              total,
              items: [
                {
                  usEN,
                  zhCN,
                  count,
                  total
                }
              ]
            };
          }
        });
      }

      this.initialChartData(
        Object.values(grouped).map(g =>
          Object.assign(g, { total: toFixed(g.total, 2) })
        )
      );
    },
    initialChartData(dataProvider) {
      const chart = AmCharts.makeChart(this.$refs.chart, {
        type: "pie",
        startDuration: 0,
        theme: "light",
        addClassNames: true,
        legend: {
          position: "right",
          marginRight: 100,
          autoMargins: false
        },
        innerRadius: "30%",
        defs: {
          filter: [
            {
              id: "shadow",
              width: "200%",
              height: "200%",
              feOffset: {
                result: "offOut",
                in: "SourceAlpha",
                dx: 0,
                dy: 0
              },
              feGaussianBlur: {
                result: "blurOut",
                in: "offOut",
                stdDeviation: 5
              },
              feBlend: {
                in: "SourceGraphic",
                in2: "blurOut",
                mode: "normal"
              }
            }
          ]
        },
        dataProvider,
        valueField: "total",
        titleField: "category",
        colorField: "color",
        labelColorField: "color",
        export: {
          enabled: true
        }
      });

      chart.addListener("init", handleInit);

      chart.addListener("rollOverSlice", function(e) {
        handleRollOver(e);
      });

      function handleInit() {
        chart.legend.addListener("rollOverItem", handleRollOver);
      }

      function handleRollOver(e) {
        var wedge = e.dataItem.wedge.node;
        wedge.parentNode.appendChild(wedge);
      }
    }
  }
};
</script>