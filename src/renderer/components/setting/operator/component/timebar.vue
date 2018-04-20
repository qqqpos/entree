<template>
  <div>
      <div class="progress">
        <transition-group @before-enter="beforeEnter" @enter="enter">
          <span class="shift" :data-left="getStart(record)" :data-width="getWidth(record)" :data-clock-in="format(record.clockIn)" :data-clock-out="format(record.clockOut)" v-for="(record,index) in records" :key="index">
            <span class="break"></span>
          </span>
        </transition-group>
      </div>
  </div>
</template>

<script>
import Velocity from "velocity-animate";

export default {
  props: ["date", "shift", "id"],
  data() {
    return {
      now: Date.now(),
      from: +new Date(this.date + " " + this.shift.from),
      to: +new Date(this.date + " " + this.shift.to),
      max: Infinity,
      records: []
    };
  },
  created() {
    this.max = toFixed(this.to - this.from, 2);
  },
  computed: {
    gap() {
      return toFixed(386 / ((this.to - this.from) / 6e4), 2);
    }
  },
  methods: {
    format(time) {
      return isNumber(time) ? moment(time).format("HH:mm") : "";
    },
    getRecords(date) {
      this.from = +new Date(this.date + " " + this.shift.from);
      this.to = +new Date(this.date + " " + this.shift.to);
      this.now = Date.now();

      const _id = this.id;
      const from = this.from;
      const to = +moment(this.date, "YYYY-MM-DD")
        .endOf("days")
        .add(4, "h");

      this.$socket.emit("[TIMECARD] RECORDS", { _id, from, to }, records => {
        this.records = records.filter(
          record => (record.clockOut || this.now) - record.clockIn > 60000
        );
      });
    },
    beforeEnter(el) {
      const { left, width } = el.dataset;
      el.style.left = left + "px";
      el.style.width = "0px";
    },
    enter(el, done) {
      const { width } = el.dataset;
      Velocity(
        el,
        { width: width + "px" },
        { duration: 300 },
        { complete: done }
      );
    },

    getStart({ clockIn }) {
      clockIn = clockIn >= this.from ? clockIn : this.from;

      const start = (clockIn - this.from) / 6e4;
      return toFixed(start * this.gap, 2);
    },
    getWidth({ clockIn, clockOut }) {
      clockOut = isNumber(clockOut)
        ? clockOut > this.to ? this.to : clockOut
        : this.now < this.to ? this.now : this.to;

      const timepass = (clockOut - clockIn) / 6e4;
      return toFixed(timepass * this.gap, 2);
    },
    duration({ clockIn, clockOut }) {
      clockIn = clockIn >= this.from ? clockIn : this.from;
      clockOut = isNumber(clockOut)
        ? clockOut > this.to ? this.to : clockOut
        : this.now < this.to ? this.now : this.to;

      const timepass = (clockOut - clockIn) / 6e4;
      const start = (clockIn - this.from) / 6e4;

      const width = toFixed(timepass * this.gap, 2);
      const left = toFixed(start * this.gap, 2);

      return {
        width: width + "px",
        left: left + "px"
      };
    }
  },
  watch: {
    date: {
      handler: "getRecords",
      immediate: true
    }
  }
};
</script>

<style scoped>
.progress {
  width: 100%;
  height: 15px;
  border-radius: 6px;
  background: #e0e0e0;
  position: relative;
}

.shift {
  position: absolute;
  max-width: 386px;
  background: #81d4fa;
  box-shadow: 0 2px 3px rgba(140, 173, 189, 0.46);
  border-radius: 6px;
  height: 15px;
}

.shift:hover {
  filter: brightness(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}
.progress .shift:before,
.progress .shift:after {
  position: absolute;
  visibility: hidden;
  background: rgba(38, 50, 56, 0.86);
  color: #fff;
  border-radius: 4px;
  line-height: 12px;
  font-size: 12px;
  width: 34px;
  text-align: center;
}
.progress .shift:before {
  content: attr(data-clock-in);
  left: -13px;
  bottom: 16px;
}

.shift:after {
  content: attr(data-clock-out);
  right: -17px;
  top: 16px;
}

.shift:hover:before,
.shift:hover:after {
  visibility: visible;
}

.break {
  position: absolute;
  height: 15px;
  background: #607d8b;
}
</style>


