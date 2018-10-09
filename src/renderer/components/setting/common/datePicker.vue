<template>
    <div class="row relative" v-outer-click="closeDialog">
        <div class="button" @click="toggleCalendar">
            <i class="far fa-calendar-alt"></i>
            <span class="text">{{$t('date.'+range)}}</span>
            <i class="fa fa-sort"></i>
        </div>
        <div class="dialog" v-show="calendarVisible">
            <div class="calendar">
                <header>
                    <i class="fa fa-chevron-left mini-btn" @click="prev"></i>
                    <h3>{{date | moment('MMMM YYYY')}}</h3>
                    <i class="fa fa-chevron-right mini-btn" @click="next"></i>
                </header>
                <div class="wrap">
                    <div class="title row">
                      <span>{{$t('date.monday')}}</span>
                      <span>{{$t('date.tuesday')}}</span>
                      <span>{{$t('date.wednesday')}}</span>
                      <span>{{$t('date.thursday')}}</span>
                      <span>{{$t('date.friday')}}</span>
                      <span>{{$t('date.saturday')}}</span>
                      <span>{{$t('date.sunday')}}</span>
                    </div>
                    <div class="dates">
                        <div class="week row" v-for="(week,index) in calendar" :key="index">
                            <div class="day" v-for="(day,idx) in week.days" :key="idx" :class="{diff:isDiff(day),between:isBetween(day)}" @click="select(day)">{{day | moment('D')}}</div>
                        </div>
                    </div>
                </div> 
            </div>
            <div class="selection">
                <div class="preset" v-for="(preset,index) in presets" :key="index">
                  <input type="radio" name="preset" v-model="range" :value="preset.value" :id="preset.value" @click="setRange(preset.value)">
                  <label :for="preset.value">{{preset.label}}</label>
                </div>
                <button class="btn" @click="apply">{{$t('button.view')}}</button>
            </div>
        </div>
        <template v-if="groupable">
          <div class="button" @click="toggleGroup"></div>
        </template>
    </div>
</template>

<script>
export default {
  props: ["init", "groupable"],
  data() {
    return {
      range: "today",
      temp: "today",
      calendarVisible: false,
      groupVisible: false,
      date: moment(),
      calendar: [],
      dates: [moment().startOf("day"), moment().endOf("day")],
      groups: ["daily", "weekly", "monthly", "quarterly"].map(text => ({
        label: this.$t("date." + text),
        value: text
      })),
      presets: [
        "today",
        "currentWeek",
        "lastWeek",
        "currentMonth",
        "lastMonth"
      ].map(text => ({
        label: this.$t("date." + text),
        value: text
      }))
    };
  },
  created() {
    this.range = this.init || "today";
    this.setRange(this.range);
    this.initialCalendar();
  },
  mounted() {
    this.apply();
  },
  methods: {
    toggleCalendar() {
      this.calendarVisible
        ? this.closeCalendar()
        : (this.calendarVisible = true);
    },
    toggleGroup() {
      this.groupVisible ? this.closeGroup() : (this.groupVisible = true);
    },
    closeCalendar() {
      this.calendarVisible = false;
      this.range = this.temp;
      this.setRange(this.temp);
    },
    closeGroup() {
      this.groupVisible = false;
    },
    closeDialog() {
      this.closeCalendar();
      this.closeGroup();
    },
    apply() {
      switch (this.range) {
        case "today":
          this.$emit("update", [
            moment()
              .subtract(4, "hours")
              .startOf("day")
              .hours(4),
            moment()
              .subtract(4, "hours")
              .endOf("day")
              .add(4, "h")
          ]);
          break;
        case "currentWeek":
          this.$emit("update", [
            moment()
              .startOf("week")
              .hours(4),
            moment()
              .endOf("week")
              .add(4, "h")
          ]);
          break;
        case "lastWeek":
          this.$emit("update", [
            moment()
              .subtract(1, "w")
              .startOf("week")
              .hours(4),
            moment()
              .subtract(1, "w")
              .endOf("week")
              .add(4, "h")
          ]);
          break;
        case "currentMonth":
          this.$emit("update", [
            moment()
              .startOf("month")
              .hours(4),
            moment()
              .endOf("month")
              .add(4, "h")
          ]);
          break;
        case "lastMonth":
          this.$emit("update", [
            moment()
              .subtract(1, "M")
              .startOf("month")
              .hours(4),
            moment()
              .subtract(1, "M")
              .endOf("month")
              .add(4, "h")
          ]);
          break;
        case "custom":
          if (this.dates.length === 2) {
            this.$emit("update", [
              this.dates[0].add(4, "h"),
              this.dates[1].endOf("day").add(4, "h")
            ]);
          } else {
            const from = this.dates[0];
            const to = from
              .clone()
              .endOf("day")
              .add(4, "h");

            this.$emit("update", [from, to]);
          }
          break;
        default:
      }

      this.calendarVisible = false;
      this.temp = this.range;
    },
    prev() {
      this.date.subtract(1, "M");
      this.initialCalendar();
    },
    next() {
      this.date.add(1, "M");
      this.initialCalendar();
    },
    setRange(value) {
      // reset calendar display first
      // then highlights selected days
      switch (value) {
        case "today":
          this.date = moment();
          this.initialCalendar();

          this.dates = [moment().startOf("day"), moment().endOf("day")];
          break;
        case "currentWeek":
          this.date = moment();
          this.initialCalendar();

          this.dates = [moment().startOf("week"), moment().endOf("week")];
          break;
        case "lastWeek":
          this.date = moment();
          this.initialCalendar();

          this.dates = [
            moment()
              .subtract(1, "w")
              .startOf("week"),
            moment()
              .subtract(1, "w")
              .endOf("week")
          ];
          break;
        case "currentMonth":
          this.date = moment();
          this.initialCalendar();

          this.dates = [moment().startOf("month"), moment().endOf("month")];
          break;
        case "lastMonth":
          // update calendar month
          this.date = moment().subtract(1, "month");
          this.initialCalendar();

          this.dates = [
            moment()
              .subtract(1, "M")
              .startOf("month"),
            moment()
              .subtract(1, "M")
              .endOf("month")
          ];
          break;
      }
    },
    initialCalendar() {
      let calendar = [];

      const startDay = this.date
        .clone()
        .startOf("month")
        .startOf("isoWeek");
      const endDay = this.date
        .clone()
        .endOf("month")
        .endOf("isoWeek");

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
                .startOf("isoWeek")
                .add(n + i, "day")
            )
        });

      this.calendar = calendar;
      this.$forceUpdate();
    },
    isDiff(day) {
      return this.date.format("M") !== day.format("M");
    },
    isBetween(day) {
      if (this.dates.length === 1) {
        const start = this.dates[0];
        const end = this.dates[0].clone().endOf("day");
        return day.isBetween(start, end, null, "[]");
      }

      const [from, to] = this.dates;
      return day.isBetween(from, to, null, "[]");
    },
    select(day) {
      switch (this.dates.length) {
        case 0:
          this.dates.push(day);
          break;
        case 1:
          day.isBefore(this.dates[0])
            ? this.dates.unshift(day)
            : this.dates.push(day);
          break;
        case 2:
          this.dates = [];
          this.dates.push(day);
          break;
      }
      this.range = "custom";
    }
  }
};
</script>

<style scoped>
.button {
  padding: 10px;
}

.button .text {
  display: inline-block;
  min-width: 120px;
}

.fa-sort {
  color: rgba(0, 0, 0, 0.5);
}

.dialog {
  position: absolute;
  display: flex;
  top: 45px;
  right: 0;
  width: 680px;
  height: 350px;
  background: #fff;
  border-radius: 0 0 4px 4px;
  padding: 5px;
  z-index: 10;
  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.25);
}

.calendar {
  flex: 1;
  padding-right: 5px;
  border-width: 0 1px 0 0;
  border-style: solid;
  border-image: linear-gradient(
      to bottom,
      rgba(224, 224, 224, 0),
      #9e9e9e,
      rgba(224, 224, 224, 0)
    )
    1 100%;
}

.calendar header {
  display: flex;
  justify-content: center;
  height: 50px;
  align-items: center;
  color: rgba(0, 0, 0, 0.75);
}

.calendar header i {
  padding: 10px 20px;
  cursor: pointer;
}

.calendar h3 {
  margin: 0 10px;
  width: 150px;
  text-align: center;
}

.selection {
  padding-left: 5px;
  width: 250px;
  text-align: center;
}

.preset label {
  padding: 17px;
  margin-bottom: 5px;
  font-weight: bold;
  color: rgba(55, 71, 79, 0.4);
  cursor: pointer;
  display: block;
}

input:checked + label {
  color: #37474f;
}

.preset label:hover {
  background: #f3f3f3;
  border-radius: 4px;
}

.dates {
  border: 1px solid #eee;
  border-top: none;
  border-radius: 0 0 4px 4px;
  overflow: hidden;
}

.title {
  border-bottom: 1px solid #00897b;
  border-radius: 4px 4px 0 0;
  overflow: hidden;
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
  height: 43px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: #eceff1;
  position: relative;
  z-index: 1;
  border: 1px solid #fff;
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 30px;
  opacity: 0.75;
}

.day.diff {
  color: rgba(0, 0, 0, 0.4);
  background: #FAFAFA;
}

.day.between {
  color: #b71c1c;
  background: #fff3e0;
}

button.btn {
  width: 247px;
}
</style>

