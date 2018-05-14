<template>
  <div>
    <header>
      <div class="f1">
          <h3>{{$t('nav.payroll')}}</h3>
          <p>Payroll summary</p>
      </div>
      <calendar @update="fetchData"></calendar>
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
        <div class="wrap">
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
        </div>
      </section>
    </div>
    <div :is="component" :init="componentData" @reload="fetchData"></div>
  </div>
</template>

<script>
import dialoger from "../../../common/dialoger";
import calendar from "../component/calendar";
import payroll from "../component/payroll";
import viewer from "../component/viewer";

export default {
  components: { calendar, payroll, viewer, dialoger },
  data() {
    return {
      config: this.$store.getters.store.timecard,
      componentData: null,
      component: null,
      reversed: false,
      payables: [],
      range: [],
      type: null
    };
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
      const totalTip = payables.reduce((a, c) => a + c.tips, 0);
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
          this.$q();
          Printer.printTimecardReport([payroll]);
        })
        .catch(() => this.$q());
    },
    printAll() {
      const prompt = {
        title: "dialog.printConfirm",
        msg: "dialog.printAllTimecardRecords"
      };

      this.$dialog(prompt)
        .then(() => {
          this.$q();
          Printer.printTimecardReport(this.payables);
        })
        .catch(() => this.$q());
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
          this.$q();
        })
        .catch(() => this.$q());
    },
    fetchData(range) {
      range = range || this.range;
      const [from, to] = (this.range = range);

      this.$socket.emit(
        "[EMPLOYEE] PAYROLLS",
        {
          from: +from,
          to: +to
        },
        payrolls => this.analyze(payrolls)
      );
    },
    analyze(payrolls) {
      this.payables = payrolls.filter(op => op.timecard.length > 0).map(op => {
        const valid = op.timecard
          .filter(t => t.clockOut && t.clockOut > t.clockIn)
          .map(record => {
            const duration = toFixed(
              moment.duration(record.clockOut - record.clockIn).asHours(),
              2
            );
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
          .reduce((a, c) => a + c.tip, 0)
          .toPrecision(12)
          .toFloat();
        return Object.assign(op, { tips, hours, breakTime, paid, unpaid });
      });

      // this.type &&
      //   this.$nextTick(() => {
      //     const type = this.type;
      //     this.type = null;
      //     this.sort(type);
      //   });
    }
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
  padding: 15px;
  flex: 2;
  height: 652px;
  overflow: auto;
}

section.overview {
  flex: 1;
}

.overview .wrap {
  position: fixed;
  background: #fff;
  width: 276px;
  height: 100%;
  padding: 0px 15px;
  box-shadow: -2px 0 6px -5px;
}

.overview h3 {
  padding: 15px 5px 5px;
}

.overview p {
  padding: 5px 10px;
  display: flex;
}

p > button{
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

