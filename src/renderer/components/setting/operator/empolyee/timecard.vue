<template>
  <div class="table">
    <table class="data">
      <thead>
        <tr>
          <th class="icon">{{$t('thead.verify')}}</th>
          <th class="date">{{$t('thead.date')}}</th>
          <th>{{$t('thead.start')}}</th>
          <th>{{$t('thead.end')}}</th>
          <th class="hours">{{$t('thead.workHour')}}</th>
          <th>{{$t('thead.breakTime')}}</th>
          <th>{{$t('text.tip')}}</th>
          <th>{{$t('thead.wage')}}</th>
          <th>{{$t('thead.salary')}}</th>
          <th class="padding">{{$t('thead.edit')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(log,index) in logs" :key="index">
          <td v-if="log.valid" class="icon">
            <i class="fa fa-check-circle"></i>
          </td>
          <td v-else class="icon">
            <i class="fa fa-check-circle-o"></i>
          </td>
          <td class="date">{{log.date}}</td>
          <td>{{log.clockIn | moment('HH:mm:ss')}}</td>
          <td>{{log.clockOut | moment('HH:mm:ss')}}</td>
          <td class="hours">{{calculate(log.clockIn,log.clockOut)}}</td>
          <td class="break">{{log.break && log.break.length}}</td>
          <td>{{log.tip | decimal}}</td>
          <td v-if="log.valid" :title="log.note" class="wage decimal">$ {{log.wage | decimal}}
            <i class="fa fa-exclamation-circle" v-if="log.note"></i>
          </td>
          <td v-else class="invalid decimal">$ {{(operator.wage || 0) | decimal}}</td>
          <td class="decimal">$ {{salary(log)}}</td>
          <td v-if="editable && !log.lock" class="edit" @click="edit(log)">
            <i class="fa fa-pencil-square"></i>
          </td>
          <td v-else>
            <i class="fa fa-lock" @click="unlock(log)"></i>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="9" class="f1">
            <div class="summary">
              <div class="static">
                <p class="date">{{dateRange}}</p>
                <p class="compensation">
                  <span class="text">{{$t('text.validRecord')}}
                    <span class="value">{{validSession}}</span>
                  </span>
                  <span class="text">{{$t("text.workHour")}}
                    <span class="value">{{totalHours}}</span>
                  </span>
                  <span class="text">{{$t("text.workSalary")}}
                    <span class="value">$ {{totalSalary.toFixed(2)}}</span>
                  </span>
                </p>
              </div>
              <div class="option">
                <button class="btn" @click="validAll" :disabled="validSession === this.logs.length">{{$t('button.allValid')}}</button>
                <dropdown label="filter.period" :options="ranges" filter="period" :reverse="true"></dropdown>
              </div>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
    <div :is="component" :init="componentData" @refresh="fetchData"></div>
  </div>
</template>

<script>
import calendar from "../../common/calendar";
import editor from "../component/timecardEditor";
import dialoger from "../../../common/dialoger";
import dropdown from "../../../history/component/dropdown";

export default {
  props: ["operator"],
  components: { editor, dropdown, dialoger, calendar },
  computed: {
    validSession() {
      return this.logs.filter(log => log.valid).length;
    },
    totalHours() {
      const total = this.logs
        .filter(log => log.valid)
        .map(log => log.clockOut - log.clockIn)
        .reduce((a, b) => a + b, 0);
      return this.calculate(0, total);
    },
    totalSalary() {
      return this.logs
        .filter(log => log.valid)
        .map(log => this.salary(log).toFloat())
        .reduce((a, b) => a + b, 0);
    },
    dateRange() {
      if (this.logs.length === 0) {
        const to = moment(this.to).format("YYYY-MM-DD");
        const from = moment(this.from).format("YYYY-MM-DD");
        return `${from} ~ ${to}`;
      } else {
        const to = this.logs[0].date;
        const from = this.logs.last().date;
        return `${from} ~ ${to}`;
      }
    }
  },
  data() {
    return {
      op: this.$store.getters.op,
      componentData: null,
      component: null,
      editable: false,
      period: "week",
      from: "",
      to: "",
      logs: [],
      ranges: [
        {
          text: this.$t("thead.currentWeek"),
          value: "week"
        },
        {
          text: this.$t("thead.lastWeek"),
          value: "lastWeek"
        },
        {
          text: this.$t("thead.currentMonth"),
          value: "month"
        },
        {
          text: this.$t("thead.lastMonth"),
          value: "lastMonth"
        },
        {
          text: this.$t("report.setDate"),
          value: "specified"
        }
      ]
    };
  },
  created() {
    this.fetchData();
    this.$bus.on("filter", this.setFilter);
    this.editable = this.approval(this.op.permission, "timecard");
  },
  beforeDestroy() {
    this.$bus.off("filter", this.setFilter);
  },
  methods: {
    fetchData() {
      switch (this.period) {
        case "week":
          this.from = +moment()
            .subtract(4, "hours")
            .startOf("week")
            .hours(4);
          this.to = +moment()
            .subtract(4, "hours")
            .endOf("week")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
        case "lastWeek":
          this.from = +moment()
            .subtract(4, "hours")
            .subtract(1, "weeks")
            .startOf("week")
            .hours(4);
          this.to = +moment()
            .subtract(4, "hours")
            .subtract(1, "weeks")
            .endOf("week")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
        case "month":
          this.from = +moment()
            .subtract(4, "hours")
            .startOf("month")
            .hours(4);
          this.to = +moment()
            .subtract(4, "hours")
            .endOf("month")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
        case "lastMonth":
          this.from = +moment()
            .subtract(4, "hours")
            .subtract(1, "months")
            .startOf("month")
            .hours(4);
          this.to = +moment()
            .subtract(4, "hours")
            .subtract(1, "months")
            .endOf("month")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
        case "specified":
          this.from = +this.from
            .clone()
            .hours(4)
            .minutes(0)
            .seconds(0);
          this.to = +this.to
            .clone()
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
      }
      this.$socket.emit(
        "[TIMECARD] RECORDS",
        { _id: this.operator._id, from: this.from, to: this.to },
        logs => {
          this.logs = logs;
        }
      );
    },
    calculate(clockIn, clockOut) {
      clockOut = isNumber(clockOut) ? clockOut : +new Date();
      const duration = clockOut - clockIn;

      if (duration === 0) return this.$t("text.hhmmss", "00", "00", "00");

      if (isNumber(duration)) {
        const hh = ("00" + Math.floor((duration % 8.64e7) / 3.6e6)).slice(-2);
        const mm = ("00" + Math.floor((duration % 3.6e6) / 6e4)).slice(-2);
        const ss = ("00" + Math.floor((duration % 6e4) / 1e3)).slice(-2);

        return this.$t("text.hhmmss", hh, mm, ss);
      }
    },
    salary({ clockIn, clockOut, wage }) {
      if (!clockOut) return "0.00";

      const hour = toFixed((clockOut - clockIn) / 3.6e6, 2);

      return ((wage || this.operator.wage || 0) * hour).toFixed(2);
    },
    setFilter(opt) {
      this.period = opt.value || "week";
      this.period === "specified" ? this.openCalendar() : this.fetchData();
    },
    openCalendar() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, multiple: true };
        this.component = "calendar";
      })
        .then(({ from, to }) => {
          this.from = from;
          this.to = to;
          this.fetchData();
          this.$q();
        })
        .catch(() => this.$q());
    },
    edit(log) {
      this.$p("editor", { operator: this.operator, log });
    },
    unlock(log) {
      if (this.op.role !== "Developer") return;
      log.lock = false;
    },
    validAll() {
      const prompt = {
        title: "dialog.noDefaultWage",
        msg: ["dialog.timecardNoWage", this.operator.name],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.processAnyway", fn: "resolve" }
        ]
      };

      isNumber(this.operator.wage)
        ? this.execute()
        : this.$dialog(prompt)
          .then(this.execute)
          .catch(() => this.$q());
    },
    execute() {
      this.$q();
      this.logs.forEach(log => {
        Object.assign(log, {
          valid: true,
          wage: this.operator.wage || 0
        });
        this.$socket.emit("[TIMECARD] UPDATE", log);
      });
    }
  }
};
</script>

<style scoped>
.hours {
  width: 160px;
}

tbody {
  height: 600px;
  overflow: auto;
  display: block;
}

tfoot tr {
  height: 66px;
  display: flex !important;
  align-items: center;
}

.summary {
  flex: 1;
  margin: 5px;
  background: #3f51b5;
  color: #fff;
  padding: 0px 20px;
  border-radius: 2px;
  display: flex;
  height: 58px;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

p.date {
  font-size: 14px;
  font-family: "Agency FB";
  color: #abb2df;
  letter-spacing: 1px;
}

.compensation span {
  flex: 1;
  margin-right: 10px;
}

p.value {
  display: flex;
}

.static {
  flex: 4;
}

.option {
  flex: 2;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  color: #333;
}

.btn {
  height: 40px;
  min-width: 120px;
  margin-bottom: initial;
}

.text {
  color: #c5cae9;
}

.value {
  color: #fff;
  text-shadow: 0 1px 1px #333;
  margin-left: 5px;
}

.edit {
  color: rgba(0, 0, 0, 0.65);
  cursor: pointer;
}
</style>