<template>
  <div>
    <range-tab @update="fetchData" initial="currentMonth"></range-tab>
    <!-- <chart :options="option"></chart> -->
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
    initialChartData({ labels, counts, sales }) {
      const data = labels.map((label, index) => ({
        name: this.$t("type." + label),
        value: counts[index]
      }));

      this.option = {
        backgroundColor: "#f3f3f3",
        color:["#852422","#55302F","#AC2F2B","#C33631","#D76662","#c23531"],
        title: {
          text: "Customized Pie",
          left: "center",
          top: 20,
          textStyle: {
            color: "#3c3c3c"
          }
        },

        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },

        visualMap: {
          show: false,
          min: 1,
          max: 100,
          inRange: {
            colorLightness: [0, 1]
          }
        },
        series: [
          {
            name: this.$t("thead.orderType"),
            type: "pie",
            radius: "55%",
            center: ["50%", "50%"],
            data: data.sort((a, b) => a.value - b.value),
            roseType: "radius",
            label: {
              normal: {
                textStyle: {
                  color: "#3c3c3c"
                }
              }
            },
            labelLine: {
              normal: {
                lineStyle: {
                  color: "#E0E0E0"
                },
                smooth: 0.2,
                length: 10,
                length2: 20
              }
            },
            itemStyle: {
              normal: {
                shadowBlur: 200,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            },
            animationType: "scale",
            animationEasing: "elasticOut",
            animationDelay: idx => Math.random() * 200
          }
        ]
      };
    }
  }
};
</script>

<style scoped>
.echarts {
  width: 100%;
  height: 697px;
}
</style>