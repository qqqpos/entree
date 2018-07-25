<template>
    <div class="radar" ref="radar" style="width: 100%; height: 450px;"></div>
</template>

<script>
export default {
  props: ["invoices", "transactions"],
  created() {
    this.process();
  },
  mounted() {
    this.draw();
  },
  data() {
    return {
      dataProvider: []
    };
  },
  methods: {
    process() {
      let types = {
        WALK_IN: {
          text: this.$t("type.WALK_IN"),
          count: 0,
          value: 0
        },
        PICK_UP: {
          text: this.$t("type.PICK_UP"),
          count: 0,
          value: 0
        },
        DELIVERY: {
          text: this.$t("type.DELIVERY"),
          count: 0,
          value: 0
        },
        DINE_IN: {
          text: this.$t("type.DINE_IN"),
          count: 0,
          value: 0
        }
      };

      this.invoices.forEach(invoice => {
        if (invoice.status === 1) {
          const { type, payment } = invoice;
          const { balance } = payment;

          if (types[type]) {
            types[type].value += balance;
            types[type].count++;
          } else {
            types[type] = {
              text: this.$t("type." + type),
              count: 1,
              value: balance
            };
          }
        }
      });

      Object.keys(types).forEach(type =>
        this.dataProvider.push({
          type: types[type].text,
          count: types[type].count,
          amount: types[type].value.toFixed(2)
        })
      );
    },
    draw() {
      AmCharts.makeChart(this.$refs.radar, {
        type: "radar",
        dataProvider: this.dataProvider,
        valueAxes: [
          {
            axisTitleOffset: 20,
            minimum: 0,
            axisAlpha: 0.15
          }
        ],
        startDuration: 2,
        fontFamily: "Yuanti-SC",
        graphs: [
          {
            balloonText: "[[type]]  $[[value]]",
            bullet: "round",
            lineThickness: 2,
            valueField: "amount"
          }
        ],
        categoryField: "type",
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


