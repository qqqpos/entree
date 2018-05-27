<template>
  <div>
    <header class="chart">
      <div class="f1">
          <h3>{{$t('title.hourlySaleSummary')}}</h3>
          <p>Hourly sales Summary</p>
      </div>
      <date-picker @update="fetchData" init="today"></date-picker>
    </header>
    <div class="relative">
        <div class="chart relative" ref="chart" style="width: 100%; height: 450px;"></div>        
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
      isLoading: false
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData(range) {
      if (!range) {
        const from = +moment(today(), "YYYY-MM-DD", true)
          .startOf("day")
          .hour(4);
        const to = +moment(today(), "YYYY-MM-DD", true)
          .startOf("day")
          .add(1, "days")
          .hour(4);

        this.$socket.emit("[CHART] HOURLY", { from, to }, invoices =>
          this.process(invoices)
        );
      } else {
        const [from, to] = range;

        this.$socket.emit(
          "[CHART] HOURLY",
          { from: +from, to: +to },
          invoices => this.process(invoices)
        );
      }

      this.isLoading = true;
    },
    process(invoices) {
      let hours = {};

      invoices.forEach(invoice => {
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
      });

      let chart = [];

      Object.keys(hours).forEach(hour =>
        chart.push({
          time: `${("0" + hour).slice(-2)}:00`,
          count: hours[hour].count,
          amount: hours[hour].value.toFixed(2)
        })
      );

      this.draw(chart);
    },
    draw(dataProvider) {
      this.isLoading = false;

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
        dataProvider
      });
    }
  }
};
</script>
