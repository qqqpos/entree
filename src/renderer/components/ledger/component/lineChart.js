import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Line,
  mixins: [reactiveProp],
  mounted() {
    this.renderChart(this.chartData, {
      responsive: true,
      maintainAspectRatio: false,
      height:250,
      width:450,
      legend: {
        display: false
      },
      tooltips: {
        yAlign: 'bottom'
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          },
          gridLines: {
            display: true,
            color: '#f3f3f3'
          }
        }],
        xAxes: [{
          gridLines: {
            display: true,
            color: '#f3f3f3'
          }
        }]
      },
      elements: {
        line:
          {
            tension: 0.1
          },
        point: {
          radius: 1
        }
      }
    });
  }
}