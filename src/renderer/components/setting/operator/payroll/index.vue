<template>
  <div>
    <header>
      <div class="f1">
          <h3>{{$t('nav.payroll')}}</h3>
          <p>{{$t('tip.payrolls')}}</p>
      </div>
      <date-picker @update="fetchData"></date-picker>
    </header>
    <div class="payrolls">
      <section class="list">
        <div class="title">
          <span class="f1" @click="sort('name')">{{$t('text.name')}}<i class="fa fa-sort"></i></span>
          <span class="f3" @click="sort('role')">{{$t('text.role')}}<i class="fa fa-sort"></i></span>
          <span @click="sort('amount')">{{$t('text.amount')}}<i class="fa fa-sort"></i></span>
        </div>
        <payroll v-for="(op,index) in payables" :key="index" :sheet="op" @view="view" @print="print" @pay="pay"></payroll>
      </section>
      <section class="overview">
        <div class="wrap relative">
          <h3>{{$t('nav.overview')}}</h3>
          <p>
            <span class="f1">{{$t('payroll.count')}}</span>
            <span class="value">{{summary.count}}</span>
          </p>
          <div class="group">
            <p>
              <span class="f1">{{$t('payroll.overallWorkHour')}}</span>
              <span class="value">{{summary.totalHour}}</span>
              <span class="unit">{{$t('text.hour')}}</span>
            </p>
            <p>
              <span class="f1">{{$t('payroll.averageWorkHour')}}</span>
              <span class="value">{{(summary.totalHour / (summary.count || 1)).toFixed(2)}}</span>
              <span class="unit">{{$t('text.hour')}}</span>
            </p>
          </div>
          <div class="group">
            <p>
              <span class="f1">{{$t('payroll.overallTipAmount')}}</span>
              <span class="value">$ {{summary.totalTip | decimal}}</span>
            </p>
            <p>
              <span class="f1">{{$t('payroll.averageTipAmount')}}</span>
              <span class="value">$ {{(summary.totalTip / (summary.count || 1)) | decimal}}</span>
            </p>
          </div>   
          <p>
            <span class="f1">{{$t('payroll.previousPayout')}}</span>
            <span class="value">($ {{summary.paid | decimal}})</span>
          </p>   
          <p>
            <span class="f1">{{$t('payroll.currentPayout')}}</span>
            <span class="value">$ {{summary.payout | decimal}}</span>
          </p>    
          <p>
            <button class="btn" @click="printAll">{{$t('button.printAll')}}</button>
            <button class="btn" @click="payAll" :disabled="true">{{$t('button.pay')}}</button>
          </p>  
          <div class="group bot">
            <h4 class="text-center">{{$t('setting.timecard.overTimeAlert')}}</h4>
            <slider v-model="hourOverAlert" :piecewise="true" :lazy="true" :data="gaps" tooltip="hover" :dot-size="20"></slider>  
          </div>                                  
        </div>
      </section>
    </div>
    <div :is="component" :init="componentData" @reload="fetchData" @refresh="fetchData"></div>
  </div>
</template>

<script>
import dialogModule from "../../../common/dialog";
import datePicker from "../../common/datePicker";
import payroll from "../component/payroll";
import slider from "../../common/slider";
import viewer from "../component/viewer";

export default {
  components: { dialogModule, datePicker, payroll, viewer, slider },
  data() {
    return {
      config: this.$store.getters.store.timecard,
      gaps: [3, 5, 7, 9, 10, 11, 12, 13, 14, 15],
      hourOverAlert: 10,
      componentData: null,
      component: null,
      reversed: false,
      payrolls: [],
      payables: [],
      range: [],
      type: null
    };
  },
  created() {
    const hourOverAlert = localStorage.getItem("hourOverAlert") || 10;
    this.hourOverAlert = parseInt(hourOverAlert);
  },
  beforeDestroy() {
    localStorage.setItem("hourOverAlert", this.hourOverAlert);
  },
  computed: {
    summary() {
      const payables = this.payables.filter(e => e.timecard.length > 0);
      const count = payables.length;
      const payout = payables.reduce((a, c) => a + c.unpaid, 0);
      const totalHour = payables
        .reduce((a, c) => a + c.hours, 0)
        .toPrecision(12)
        .toFloat();
      const totalTip = payables.reduce((a, c) => a + (c.tips || 0), 0);
      const paid = payables.reduce((a, c) => a + c.paid, 0);

      return {
        count,
        payout,
        paid,
        totalHour,
        totalTip
      };
    }
  },
  methods: {
    sort(type) {
      if (type === this.type) {
        this.payables.reverse();
        this.reversed = true;
        return;
      }

      switch (type) {
        case "name":
          this.payables = this.payables.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          break;
        case "role":
          const sort = [
            "Owner",
            "Manager",
            "Cashier",
            "Waitstaff",
            "Bartender",
            "Worker"
          ];
          this.payables = this.payables.sort(
            (a, b) => (sort.indexOf(a.role) > sort.indexOf(b.role) ? 1 : -1)
          );
          break;
        case "amount":
          this.payables = this.payables.sort(
            (a, b) => (a.unpaid > b.unpaid ? 1 : -1)
          );
          break;
      }

      this.type = type;
      this.reversed = false;
    },
    view(payroll) {
      this.$open("viewer", { payroll });
    },
    print(payroll) {
      const prompt = {
        title: "dialog.printConfirm",
        msg: ["dialog.printTimecardRecord", payroll.name]
      };

      this.$dialog(prompt)
        .then(() => {
          this.exitComponent();
          Printer.printTimecardReport([payroll]);
        })
        .catch(this.exitComponent);
    },
    printAll() {
      const prompt = {
        title: "dialog.printConfirm",
        msg: "dialog.printAllTimecardRecords"
      };

      this.$dialog(prompt)
        .then(() => {
          this.exitComponent();
          Printer.printTimecardReport(this.payables);
        })
        .catch(this.exitComponent);
    },
    payAll() {},
    pay(payroll) {
      const prompt = {
        title: "dialog.releasePayroll",
        msg: [
          "dialog.payrollPaymentConfirm",
          payroll.unpaid.toFixed(2),
          payroll.name
        ],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.pay", fn: "resolve" }
        ]
      };
      const timecards = payroll.timecard.map(t => t._id);
      this.$dialog(prompt)
        .then(() => {
          this.$socket.emit("[TIMECARD] SETTLED", timecards, () =>
            this.fetchData()
          );
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    fetchData(range) {
      range = range || this.range;
      const [from, to] = range;

      this.$socket.emit(
        "[OPERATOR] PAYROLLS",
        {
          from: +from,
          to: +to
        },
        payrolls => {
          this.payrolls = payrolls;
          this.analyze();
        }
      );
    },
    analyze() {
      this.payables = this.payrolls
        .filter(op => op.timecard.length > 0)
        .map(op => {
          const valid = op.timecard
            .filter(t => t.clockOut && t.clockOut > t.clockIn)
            .map(record => {
              const duration = toFixed(
                moment.duration(record.clockOut - record.clockIn).asHours(),
                2
              );

              const overAlert = duration > this.hourOverAlert ? 1 : 0;

              const breakTime = record.break
                .filter(time => time.end > time.start)
                .reduce(
                  (a, c) =>
                    a + toFixed(moment.duration(c.end - c.start).asHours(), 2),
                  0
                );
              const hours = this.config.excludeBreak
                ? toFixed(duration - breakTime, 2)
                : duration;
              const wage = isNumber(record.wage)
                ? parseFloat(record.wage)
                : isNumber(op.wage) ? parseFloat(op.wage) : 0;

              const unpaid = record.settled ? 0 : toFixed(wage * hours, 2);
              const paid = record.settled ? toFixed(wage * hours, 2) : 0;
              return Object.assign(record, {
                overAlert,
                hours,
                breakTime,
                wage,
                unpaid,
                paid
              });
            });

          const unpaid = valid
            .reduce((a, c) => a + c.unpaid, 0)
            .toPrecision(12)
            .toFloat();
          const paid = valid
            .reduce((a, c) => a + c.paid, 0)
            .toPrecision(12)
            .toFloat();
          const hours = valid
            .reduce((a, c) => a + c.hours, 0)
            .toPrecision(12)
            .toFloat();
          const breakTime = valid
            .reduce((a, c) => a + c.breakTime, 0)
            .toPrecision(12)
            .toFloat();
          const tips = valid
            .reduce((a, c) => a + (c.tip || 0), 0)
            .toPrecision(12)
            .toFloat();
          const overAlert = valid.reduce((a, c) => a + c.overAlert, 0);
          return Object.assign({}, op, {
            tips,
            hours,
            breakTime,
            paid,
            unpaid,
            overAlert
          });
        });

      // this.type &&
      //   this.$nextTick(() => {
      //     const type = this.type;
      //     this.type = null;
      //     this.sort(type);
      //   });
    }
  },
  watch: {
    hourOverAlert: "analyze"
  }
};
</script>


<style scoped>
header {
  display: flex;
  align-items: flex-end;
  padding: 8px 15px;
  background: #fcfcfc;
  border-bottom: 1px solid #eee;
}

.payrolls {
  display: flex;
  height: 682px;
  overflow: hidden;
}
section.list {
  flex: 1;
  padding: 15px;
  height: 652px;
  overflow: auto;
}

section.overview {
  width: 306px;
}

.overview .wrap {
  position: fixed;
  background: #fff;
  width: 276px;
  padding: 0px 15px;
  box-shadow: -2px 0 6px -5px;
  height: calc(100vh - 86px);
}

.overview h3 {
  padding: 15px 5px 5px;
}

.overview p {
  padding: 5px 10px;
  display: flex;
}

p > button {
  margin: auto;
}

.title {
  padding: 0 50px 0 25px;
  display: flex;
}

.title > span {
  cursor: pointer;
}

.title i {
  margin-left: 5px;
  color: rgba(0, 0, 0, 0.5);
}

.group {
  margin: 10px 0;
  background: #eceff1;
  border-radius: 6px;
}

.group h4 {
  padding: 6px 0 2px;
}

.group.bot {
  position: absolute;
  bottom: 0px;
  width: 276px;
}

.value {
  font-family: "Agency FB";
  font-weight: bold;
  color: #4b5086;
}

.unit {
  margin-left: 3px;
  color: #a6aac3;
}
</style>

