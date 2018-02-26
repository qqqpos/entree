<template>
  <div class="popupMask dark setting center" @click.self="init.reject">
    <div class="editor">
      <header>
        <div>
          <h5>{{date | moment('YYYY-MM')}}</h5>
          <h3>{{$t('nav.calendar')}}</h3>
        </div>
        <nav>
          <i class="fa fa-angle-left" @click="prev"></i>
          <i class="fa fa-angle-right" @click="next"></i>
        </nav>
      </header>
      <div class="wrap">
        <div class="title">
          <span>{{$t('calendar.mon')}}</span>
          <span>{{$t('calendar.tue')}}</span>
          <span>{{$t('calendar.wed')}}</span>
          <span>{{$t('calendar.thu')}}</span>
          <span>{{$t('calendar.fri')}}</span>
          <span>{{$t('calendar.sat')}}</span>
          <span>{{$t('calendar.sun')}}</span>
        </div>
        <div class="calendar">
          <div class="week" v-for="(week,index) in calendar" :key="index">
            <div class="day" v-for="(day,idx) in week.days" :key="idx" :class="{diff:isDiff(day),set:isPick(day)}" @click="select(day)">{{day | moment('D')}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      date: moment(),
      calendar: [],
      dates: [],
      picked: null
    };
  },
  created() {
    this.initialCalendar();

    if (moment.isMoment(this.init.picked)) this.picked = this.init.picked;
  },
  methods: {
    initialCalendar() {
      let calendar = [];

      const startDay = this.date
        .clone()
        .startOf("month")
        .startOf("isoweek");
      const endDay = this.date
        .clone()
        .endOf("month")
        .endOf("isoweek");

      let date = startDay.clone().subtract(1, "day");

      while (date.isBefore(endDay, "day")) {
        calendar.push({
          days: Array(7)
            .fill(0)
            .map(() => date.add(1, "day").clone())
        });
      }

      calendar.length === 5 &&
        calendar.push({
          days: Array(7)
            .fill(0)
            .map((n, i) =>
              date
                .clone()
                .add(1, "week")
                .startOf("isoweek")
                .add(n + i, "day")
            )
        });

      this.calendar = calendar;
      this.$forceUpdate();
    },
    prev() {
      this.date.subtract(1, "M");
      this.initialCalendar();
    },
    next() {
      this.date.add(1, "M");
      this.initialCalendar();
    },
    isDiff(day) {
      return this.date.format("M") !== day.format("M");
    },
    isPick(day) {
      return this.picked
        ? this.picked.format("YYYY-MM-DD") === day.format("YYYY-MM-DD")
        : false;
    },
    select(day) {
      if (this.init.multiple) {
        this.dates.push(day);

        if (this.dates.length === 2) {
          const [d1, d2] = this.dates;
          d1 < d2
            ? this.init.resolve({ from: d1, to: d2 })
            : this.init.resolve({ from: d2, to: d1 });
        }else{
          this.picked = day;
          this.$forceUpdate();
        }
      } else {
        this.init.resolve(day);
      }
    }
  }
};
</script>

<style scoped>
.wrap {
  width: 550px;
  padding: initial;
}

.calendar {
  display: flex;
  flex-direction: column;
}

header {
  flex-direction: row;
}

nav {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

nav i {
  padding: 10px 25px;
  cursor: pointer;
  margin: 0 5px;
}

.title,
.calendar .week {
  display: flex;
}

.title span {
  flex: 1;
  text-align: center;
  padding: 5px 0;
  background: #009688;
  color: #e8f5e9;
}

.week .day {
  flex: 1;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: #eceff1;
  position: relative;
  z-index: 1;
}

.day.diff {
  color: rgba(0, 0, 0, 0.4);
  background: #fff;
}

.day.set:before {
  content: " ";
  width: 45px;
  height: 40px;
  top: 10px;
  left: 16px;
  position: absolute;
  background: #009688;
  z-index: -1;
  border-radius: 4px;
  box-shadow: 0 1px 1px #607d8b;
}

.day.set {
  color: #fff;
}
</style>