<template>
    <div class="chart" ref="chart" style="width: 100%; height: 450px;"></div>
</template>

<script>
export default {
  props: ["invoices"],
  created() {
    this.initializeData();
  },
  mounted() {
    this.generateChart();
  },
  data() {
    return {
      dataProvider: []
    };
  },
  methods: {
    initializeData() {
      let hours = {};

      this.invoices.forEach(invoice => {
        if (invoice.status === 1) {
          const hour = new Date(invoice.create || invoice.time).getHours();
          const { due } = invoice.payment;

          if (hours.hasOwnProperty(hour)) {
            hours[hour].value += due;
            hours[hour].count++;
          } else {
            hours[hour] = {
              count: 1,
              value: due
            };
          }
        }
      });

      this.dataProvider = [];

      Object.keys(hours).forEach(hour =>
        this.dataProvider.push({
          time: `${("0" + hour).slice(-2)}:00`,
          count: hours[hour].count,
          amount: hours[hour].value.toFixed(2)
        })
      );
    },
    generateChart() {
      AmCharts.makeChart(this.$refs.chart, {
        path:
          process.env.NODE_ENV === "development"
            ? "dist/electron/amcharts/"
            : undefined,
        type: "serial",
        addClassNames: true,
        autoMargins: true,
        valueAxes: [
          {
            id: "amountAxis",
            axisAlpha: 0,
            gridAlpha: 0,
            position: "left",
            title: "Sales"
          },
          {
            id: "countAxis",
            axisAlpha: 0,
            gridAlpha: 0,
            position: "right",
            title: "Ticket Counts"
          }
        ],
        graphs: [
          {
            alphaField: "alpha",
            balloonText:
              "<span style='font-size:12px;'>[[title]] at [[category]]<br><span style='font-size:18px;'>[[value]]</span></span>",
            dashLengthField: "dashLength",
            fillAlphas: 0.7,
            legendPeriodValueText: "Sales Total: [[value]]",
            legendValueText: "[[value]]",
            title: "Sales total",
            type: "column",
            valueField: "amount",
            valueAxis: "amountAxis"
          },
          {
            bullet: "square",
            balloonText:
              "<span style='font-size:12px;'>[[title]] at [[category]]<br><span style='font-size:18px;'>[[value]]</span></span>",
            bulletBorderAlpha: 1,
            bulletBorderThickness: 1,
            dashLengthField: "dashLength",
            legendValueText: "[[value]] tickets",
            title: "Ticket count",
            fillAlphas: 0,
            valueField: "count",
            valueAxis: "countAxis"
          }
        ],
        chartCursor: {
          categoryBalloonDateFormat: "DD",
          cursorAlpha: 0.1,
          cursorColor: "#000000",
          fullWidth: true,
          valueBalloonsEnabled: false,
          zoomable: false
        },
        categoryField: "time",
        fontFamily: "Yuanti-SC",
        startEffect: "easeOutSine",
        startDuration: 1,
        export: {
          enabled: true,
          fileName: this.setDate + " Hourly Sales"
        },
        dataProvider: this.dataProvider
      });
      
      this.$emit("ready");
    }
  }
};
</script>

<style scoped>
</style>

