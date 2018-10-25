<template>
    <div class="chart" :data-hours="salesLevel">
        <div class="hour" :data-hour="hour" v-for="(data,hour,index) in hours" :key="'h'+index">
            <bar :height="data.height" :delay="index * 0.1 +'s'"></bar>
        </div>
        <transition-group name="scale">
            <time-session :time="time" :index="index" v-for="(time,index) in session" :key="index"></time-session>
        </transition-group>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import bar from "./helper/bar";
import timeSession from "./helper/session";

export default {
  props: ["data"],
  components: { bar, timeSession },
  data() {
    return {
      session: [],
      hours: {},
      max: 1,
      min: 0
    };
  },
  mounted() {
    const { rules = [] } = this.store.openingHours;
    this.session = rules[moment().format("d")].hours;
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
      handler: "calcHours",
      immediate: true
    }
  },
  methods: {
    calcHours(invoices) {
      let hours = {};
      let max = 0;

      invoices.forEach(invoice => {
        if (invoice.status === 0) return;

        const { create, time, payment, logs, settled } = invoice;
        const hour = parseInt(moment(create || time).format("H"));

        let cash = 0;
        let credit = 0;

        if (settled) {
        }

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
      });

      setTimeout(this.calcHeight, 300);
      this.hours = hours;
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
</style>


