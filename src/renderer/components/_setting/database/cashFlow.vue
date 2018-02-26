<template>
    <div>
        <section class="period">
            <div class="wrap">
                <div>
                    <input type="radio" name="period" id="week" v-model="period" value="week" @change="fetchData">
                    <label for="week">{{$t('thead.currentWeek')}}</label>
                </div>
                <div>
                    <input type="radio" name="period" id="lastWeek" v-model="period" value="lastWeek" @change="fetchData">
                    <label for="lastWeek">{{$t('thead.lastWeek')}}</label>
                </div>
                <div>
                    <input type="radio" name="period" id="month" v-model="period" value="month" @change="fetchData">
                    <label for="month">{{$t('thead.currentMonth')}}</label>
                </div>
                <div>
                    <input type="radio" name="period" id="lastMonth" v-model="period" value="lastMonth" @change="fetchData">
                    <label for="lastMonth">{{$t('thead.lastMonth')}}</label>
                </div>
            </div>
            <div class="fn">
                <button :disabled="true">
                    <i class="fa fa-calendar-check-o"></i>Calendar</button>
                <button :disabled="true" @click="generateExcel">
                    <i class="fa fa-external-link"></i>Export</button>
            </div>
        </section>
        <section class="dataList">
            <ul>
                <li class="header">
                    <span class="status">{{$t('thead.status')}}</span>
                    <span class="date">{{$t('thead.date')}}</span>
                    <span class="time">{{$t('thead.beginTime')}}</span>
                    <span class="time">{{$t('thead.endTime')}}</span>
                    <span class="text">{{$t('thead.cashDrawer')}}</span>
                    <span class="text">{{$t('thead.depositor')}}</span>
                    <span class="amount">{{$t('thead.beginAmount')}}</span>
                    <span class="amount">{{$t('thead.endAmount')}}</span>
                    <span class="count">{{$t('thead.records')}}</span>
                    <span class="text">{{$t('thead.detail')}}</span>
                </li>
                <li class="lists" v-for="(log,index) in logs" :key="index">
                    <record :log="log" @view="viewInvoice"></record>
                </li>
            </ul>
        </section>
        <transition name="fadeUp">
            <div class="popupMask center dark" @click.self="component = null" v-if="component">
                <div :is="component" :init="componentData" @refresh="fetchData"></div>
            </div>
        </transition>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import fileSaver from "file-saver";
import ticket from "../../common/ticket";
import record from "./component/cashFlowList";
export default {
  props: ["profile"],
  components: { record, ticket },
  computed: {
    ...mapGetters(["op"])
  },
  data() {
    return {
      componentData: null,
      component: null,
      approval: false,
      period: "week",
      from: "",
      to: "",
      logs: []
    };
  },
  created() {
    this.fetchData();
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
            .add("1", "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .milliseconds(0);
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
            .add("1", "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .milliseconds(0);
          break;
        case "month":
          this.from = +moment()
            .subtract(4, "hours")
            .startOf("month")
            .hours(4);
          this.to = +moment()
            .subtract(4, "hours")
            .endOf("month")
            .add("1", "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .milliseconds(0);
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
            .add("1", "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .milliseconds(0);
          break;
        case "any":
          break;
      }
      this.$socket.emit(
        "[CASHFLOW] QUERY",
        { from: this.from, to: this.to },
        logs => {
          this.logs = logs;
        }
      );
    },
    viewInvoice(ticket) {
      this.$p("ticket", { ticket, exit: true });
    },
    generateExcel() {
      let excel = [
        [
          "Index",
          "Date",
          "Clock In",
          "Clock Out",
          "Work Hours",
          "Wage",
          "Salary",
          "Editor",
          "Edit Time"
        ]
      ];
      let csvRows = [];
      let defaultWage = isNumber(this.profile.wage)
        ? parseFloat(this.profile.wage)
        : 0;
      this.logs
        .slice(0)
        .reverse()
        .forEach((log, index) => {
          let { date, clockIn, clockOut, wage } = log;
          let timeIn = moment(clockIn).format("HH:mm:ss");
          let timeOut = clockOut ? moment(clockOut).format("HH:mm:ss") : "";
          let workHour = isNumber(clockOut)
            ? toFixed((clockOut - clockIn) / 3600000, 2)
            : "N/A";
          wage = isNumber(wage) ? toFixed(wage, 2).toFixed(2) : defaultWage;
          let salary = workHour * (wage || defaultWage);
          let editor = log.editor || "";
          let editTime = log.edit
            ? moment(log.edit).format("YYYY-MM-DD HH:mm:ss")
            : "";
          excel.push([
            index + 1,
            date,
            timeIn,
            timeOut,
            workHour,
            wage,
            salary,
            editor,
            editTime
          ]);
        });

      for (let i = 0; i < excel.length; i++) {
        csvRows.push(excel[i].join(","));
      }
      let from = moment(this.logs[0].clockIn).format("MMMDD");
      let to = moment(this.logs[this.logs.length - 1].clockIn).format("MMMDD");
      let csvFile = csvRows.join("\n");
      let blob = new Blob([csvFile], { type: "text/plain;charset=utf-8" });
      fileSaver.saveAs(
        blob,
        `${this.profile.name} payroll (${from} - ${to}).csv`
      );
    }
  }
};
</script>


<style scoped>
section.period {
  display: flex;
}

.period .wrap {
  display: flex;
}

.fn {
  flex: 1;
  background: #2196f3;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.fn button {
  padding: 10px 20px;
  margin: 0 5px;
  background: #e1f5fe;
  border: none;
  border-radius: 4px;
  box-shadow: 0 1px 1px #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none;
}

.fn i {
  margin-right: 5px;
}

.period label {
  padding: 20px;
  display: block;
  border-bottom: 2px solid transparent;
  background: #2196f3;
  color: #bbdefb;
  transition: all 0.3s ease;
}

input:checked + label {
  background: #42a5f5;
  color: #fff;
  text-shadow: 0 1px 1px #0d47a1;
  border-bottom: 2px solid #ffb74d;
}

.activities {
  display: block;
}

li.header {
  display: flex;
  text-align: center;
  background: #607d8b;
  color: #fff;
  padding: 10px 0;
}

li.lists {
  display: flex;
}

.status {
  width: 50px;
  text-align: center;
}

.date {
  width: 120px;
  text-align: center;
}

.time {
  width: 90px;
  text-align: center;
}

.text {
  width: 100px;
  text-align: center;
}

.amount {
  width: 110px;
}
.count {
  width: 80px;
  text-align: center;
}
li.lists:nth-child(odd) {
  background: #f5f5f5;
}
</style>