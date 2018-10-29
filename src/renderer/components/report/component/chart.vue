<template>
    <div class="chart" :data-hours="salesLevel" ref="chart">
        <div class="hour" :data-hour="hour" v-for="(data,hour,index) in hours" :key="'h'+index">
            <bar :height="data.height" :delay="index * 0.1 +'s'" @mouseover.native="showHourStats(hour,$event)" @mouseout.native="hide"></bar>
        </div>
        <transition-group name="scale">
            <time-session :time="time" :index="index" v-for="(time,index) in session" :key="index"></time-session>
        </transition-group>
        <tooltip v-show="showTooltip" :data="tooltipData" :position="tooltipStyle"></tooltip>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

import bar from "./helper/bar";
import tooltip from "./helper/tooltip";
import timeSession from "./helper/session";

export default {
  props: ["data"],
  components: { bar, tooltip, timeSession },
  data() {
    return {
      showTooltip: false,
      tooltipStyle: {},
      tooltipData: {},
      session: [],
      hours: {},
      max: 1
    };
  },
  mounted() {
    const { rules = [] } = this.store.openingHours;
    this.session =
      rules[
        moment()
          .subtract(3, "h")
          .format("d")
      ].hours;
  },
  computed: {
    salesLevel() {
      const avg = (this.max / 5) * 1.05;
      const amounts = [avg * 5, avg * 4, avg * 3, avg * 2, avg * 1.05];

      return amounts.map(Math.round).join("\n ");
    },
    ...mapGetters(["store"])
  },
  watch: {
    data: {
      handler: "process",
      immediate: true
    }
  },
  methods: {
    process(invoices) {
      let hours = {};
      let types = {};
      let overall = 0;
      let max = 0;

      invoices.forEach(invoice => {
        if (invoice.status === 0) return;

        const { create, time, type, payment, logs, settled } = invoice;
        const hour = moment(create || time).format("HH");

        let cash = 0;
        let credit = 0;

        if (settled) {
        }

        // process type sales
        if (types[type]) {
          types[type].count++;
          types[type].amount += payment.balance;
        } else {
          types[type] = {
            count: 1,
            amount: payment.balance
          };
        }

        // process hourly sales
        if (hours.hasOwnProperty(hour)) {
          hours[hour].count++;
          hours[hour].amount += payment.balance;
        } else {
          hours[hour] = {
            count: 1,
            amount: payment.balance,
            height: "0%"
          };
        }

        max = Math.max(max, hours[hour].amount);
        overall += payment.balance;
      });

      setTimeout(this.calcHeight, 300);

      const highest = Object.entries(hours).reduce(
        (a, c) =>
          c[1].amount > a.peakAmount
            ? { rushHour: `${c[0]}:00`, peakAmount: c[1].amount }
            : a,
        { rushHour: 0, peakAmount: 0 }
      );

      this.$nextTick(() =>
        this.$bus.emit(
          "REPORT_SUMMARY",
          Object.assign(highest, { overall, types })
        )
      );

      this.hours = hours;
      this.types = types;
      this.max = max;
    },
    calcHeight() {
      const max = Math.ceil(this.max * 1.05);
      Object.keys(this.hours).forEach((hour, index) => {
        requestAnimationFrame(() => {
          this.hours[hour] = Object.assign({}, this.hours[hour], {
            height: `${Math.round((this.hours[hour].amount / max) * 100)}%`
          });
        });
      });
    },
    showHourStats(hour, e) {
      let types = {};
      let amount = 0;
      let count = 0;

      this.data
        .filter(
          i =>
            moment(i.create || i.time).format("HH") === hour && i.status !== 0
        )
        .forEach(({ type, status, payment }) => {
          count++;
          amount += payment.balance;

          if (types[type]) {
            types[type].count++;
            types[type].amount += payment.balance;
          } else {
            types[type] = {
              count: 1,
              amount: payment.balance
            };
          }
        });

      const { top: x1, left, height } = e.target.getBoundingClientRect();

      this.tooltipData = { types, amount, count };
      this.tooltipStyle = {
        bottom: height - 15 + "px",
        left: left - 117 + "px"
      };
      this.showTooltip = true;
    },
    hide() {
      this.showTooltip = false;
    }
  }
};
</script>

<style scoped>
.chart {
  height: 199px;
  width: 750px;
  max-width: calc(100% - 40px);
  margin: 0px auto;
  font-size: 0;
  border-top: 1px solid #e0e2e6;
  border-bottom: 1px solid #e0e2e6;
  background: linear-gradient(to top, #e0e2e6, #e0e2e6 1px, transparent 1px);
  background-size: 100% 50px;
  position: relative;
  text-align: center;
}

.chart:after {
  content: attr(data-hours);
  white-space: pre-wrap;
  position: absolute;
  font-size: 14px;
  line-height: 51px;
  top: -26px;
  left: -50px;
  width: 50px;
}

.hour {
  display: inline-block;
  width: calc((100% - 15px * 10) / 15);
  height: 100%;
  background: rgba(238, 238, 238, 0.75);
  margin-left: 10px;
  position: relative;
}

.hour:after {
  content: attr(data-hour) ":00";
  position: absolute;
  bottom: -2em;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: gray;
}

.hour:hover span {
  filter: brightness(0.9);
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.1), 0 -1px 1px #b1e2f9;
}

.hour:hover:after {
  color: #333;
}
</style>


