<template>
  <div>
    <header class="date-picker">
      <div class="f1">
          <h3>{{$t('title.items')}}</h3>
          <p>Item sales Pie Chart</p>
      </div>
      <date-picker @update="fetchData" init="currentMonth"></date-picker>
    </header>
    <div class="relative">
        <div ref="chart" style="width: 100%; height: 688px;"></div>   
          <div id="toggle" v-show="departments.length">
          <switches title="text.groupByDepartments" v-model="department" @input="toggleGroup"></switches>
        </div>
        <loader :display="isLoading"></loader>
    </div>
  </div>
</template>

<script>
import randomColor from "randomcolor";
import loader from "../../common/loader";
import switches from "../common/switches";
import datePicker from "../common/datePicker";

export default {
  components: { switches, datePicker, loader },
  data() {
    return {
      range: {},
      isLoading: false,
      department: false,
      departments: []
    };
  },
  created() {
    this.departments = this.$store.getters.departments;
    this.fetchData();
  },
  methods: {
    fetchData(range) {
      this.isLoading = true;

      if (!range) {
        const from = +moment()
          .startOf("M")
          .hours(4);
        const to = +moment()
          .endOf("M")
          .add(4, "h");

        range = { from, to };

        this.$socket.emit(
          "[CHART] ITEMS",
          { from, to },
          result =>
            this.department
              ? this.groupByDepartment(result)
              : this.groupByCategory(result)
        );
      } else {
        const [from, to] = range;

        this.$socket.emit(
          "[CHART] ITEMS",
          { from: +from, to: +to },
          result =>
            this.department
              ? this.groupByDepartment(result)
              : this.groupByCategory(result)
        );
      }

      this.range = range;
    },
    toggleGroup() {
      this.fetchData(this.range);
    },
    groupByCategory(data) {
      let grouped = {};

      data.forEach(({ category, count, total, usEN, zhCN }) => {
        if (grouped.hasOwnProperty(category)) {
          grouped[category].count += count;
          grouped[category].total += total;
          grouped[category].items.push({
            usEN,
            zhCN,
            count,
            total
          });
        } else {
          grouped[category] = {
            color: randomColor(),
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

      this.initialChartData(
        Object.values(grouped).map(g =>
          Object.assign(g, { total: toFixed(g.total, 2) })
        )
      );
    },
    groupByDepartment(data) {
      const departments = this.departments.map(dep =>
        Object.assign({}, dep, {
          count: 0,
          total: 0,
          color: randomColor(),
          category: dep.usEN
        })
      );

      data.forEach(({ category, count, total, usEN, zhCN }) => {
        departments.forEach(dep => {
          if (dep.contain.includes(category)) {
            dep.count += count;
            dep.total += total;
          }
        });
      });

      this.initialChartData(
        departments.map(g => Object.assign(g, { total: toFixed(g.total, 2) }))
      );
    },
    initialChartData(dataProvider) {
      this.isLoading = false;

      dataProvider.sort((a, b) => (a.total > b.total ? -1 : 1));

      const chart = AmCharts.makeChart(this.$refs.chart, {
        type: "pie",
        startDuration: 0,
        theme: "light",
        marginTop: "100",
        addClassNames: true,
        legend: {
          position: "bottom",
          autoMargins: false,
          align: "center"
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
        titles: [
          {
            text: this.$t(
              "text.categorySalesFromDateRange",
              moment(this.range.from).format("YYYY-MM-DD"),
              moment(this.range.to)
                .subtract(1, "d")
                .format("YYYY-MM-DD")
            )
          }
        ],
        fontFamily: "Yuanti-SC",
        startEffect: "easeOutSine",
        startDuration: 1,
        listeners: [
          {
            event: "clickSlice",
            method: function(event) {
              let chart = event.chart;
              //console.log(event.dataItem.dataContext);
              // chart.dataProvider = generateChartData();
              // chart.validateData();
            }
          }
        ],
        export: {
          enabled: true,
          fileName: this.$t(
            "text.categorySalesFromDateRange",
            moment(this.range.from).format("YY-MM-DD"),
            moment(this.range.to)
              .subtract(1, "d")
              .format("YY-MM-DD")
          )
        }
      });

      // chart.addListener("init", handleInit);

      // chart.addListener("rollOverSlice", function(e) {
      //   handleRollOver(e);
      // });

      // function handleInit() {
      //   chart.legend.addListener("rollOverItem", handleRollOver);
      // }

      // function handleRollOver(e) {
      //   var wedge = e.dataItem.wedge.node;
      //   wedge.parentNode.appendChild(wedge);
      // }
    }
  }
};
</script>

<style scoped>
#toggle {
  position: absolute;
  width: 250px;
  top: 0;
  left: 0;
  padding: 0 15px;
}
</style>