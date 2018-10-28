<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <div>
                    <h5>{{date | moment('YYYY')}}</h5>
                    <h3>{{$t('nav.calendar')}}</h3>
                </div>
                <nav>
                    <i class="fa fa-angle-left" @click="prev" @contextmenu="prevYear"></i>
                    <h5 class="text-center">{{date | moment('MMMM')}}</h5>
                    <i class="fa fa-angle-right" @click="next" @contextmenu="nextYear"></i>
                </nav>
            </header>
            <div class="wrap">
                <div class="title">
                    <span>{{$t('date.monday')}}</span>
                    <span>{{$t('date.tuesday')}}</span>
                    <span>{{$t('date.wednesday')}}</span>
                    <span>{{$t('date.thursday')}}</span>
                    <span>{{$t('date.friday')}}</span>
                    <span>{{$t('date.saturday')}}</span>
                    <span>{{$t('date.sunday')}}</span>
                </div>
                <div class="calendar">
                    <div class="week" v-for="(week,index) in calendar" :key="index">
                        <div class="day column flex-center agency" v-for="(day,idx) in week.days" :key="idx" :class="{diff:isDiff(day),today:isToday(day)}" @click="select(day)">
                          {{day | moment('D')}}
                          <p>{{day | isHoliday}}</p>
                        </div>
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
      today: moment().subtract(4, "hours"),
      date: moment(),
      calendar: [],
      dates: []
    };
  },
  created() {
    this.initialCalendar();
    if (moment.isMoment(this.init.picked)) this.picked = this.init.picked;
  },
  filters: {
    isHoliday(date) {
      return util.isHoliday(date);
    }
  },
  methods: {
    initialCalendar() {
      console.time("performance");
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
      console.timeEnd("performance");
    },
    prev() {
      this.date.subtract(1, "M");
      this.initialCalendar();
    },
    prevYear() {
      this.date.subtract(1, "Y");
      this.initialCalendar();
    },
    next() {
      this.date.add(1, "M");
      this.initialCalendar();
    },
    nextYear() {
      this.date.add(1, "Y");
      this.initialCalendar();
    },
    isDiff(day) {
      return this.date.format("M") !== day.format("M");
    },
    isToday(day) {
      return this.today.format("YYYY-MM-DD") === day.format("YYYY-MM-DD");
    },
    select(day) {
      this.init.resolve(day.format("YYYY-MM-DD"));
    }
  }
};
</script>

<style scoped>
.wrap {
  width: 665px;
  padding: initial;
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
  padding: 5px 0;
  text-align: center;
  background: #009688;
  color: #e8f5e9;
}

.week .day {
  flex: 1;
  height: 75px;
  cursor: pointer;
  background: #eceff1;
  position: relative;
  z-index: 1;
  border: 1px solid #fff;
  font-size: 32px;
  opacity: 0.75;
  border-radius: 4px;
  text-align: center;
}

.day p {
  font-size: 12px;
  position: absolute;
  bottom: 3px;
  left: 0;
  font-family: "Yuanti-SC";
  color: #ff5722;
  line-height: 1;
  font-weight: normal;
  width: 100%;
}

.day.diff {
  opacity: 0.4;
  background: #fff;
}

.day.set {
  color: #fff;
}

.week .day.today {
  background: #009688;
  color: #fff;
}
</style>