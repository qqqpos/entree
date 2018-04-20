<template>
  <div>
    <header>
      <div class="f1">
          <h3>{{$t('nav.payroll')}}</h3>
          <p>Display of {{payables.length}} Employees</p>
      </div>
      <calendar @update="fetchData"></calendar>
    </header>
    <div class="payrolls">
      <section>
        <div class="title">
          <span class="f1" @click="sort('name')">{{$t('text.name')}}<i class="fa fa-sort"></i></span>
          <span class="f3" @click="sort('role')">{{$t('text.role')}}<i class="fa fa-sort"></i></span>
          <span class="f1" @click="sort('amount')">{{$t('text.amount')}}<i class="fa fa-sort"></i></span>
        </div>
        <payroll v-for="(op,index) in payables" :key="index" :sheet="op" @view="view" @print="print"></payroll>
      </section>
      <section>
        <h3>Overview</h3>
      </section>
    </div>
    <div :is="component" :init="componentData"></div>
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
      payables: [],
      type: null
    };
  },
  methods: {
    sort(type) {
      if (type === this.type) {
        this.payables.reverse();
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
            (a, b) => (a.salary > b.salary ? 1 : -1)
          );
          break;
      }

      this.type = type;
    },
    view(payroll) {
      this.$open("viewer", { payroll });
    },
    print(payroll) {},
    fetchData(range) {
      const [from, to] = range;

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

            const unpaid = record.paid ? 0 : toFixed(wage * hours, 2);
            const paid = record.paid ? toFixed(wage * hours, 2) : 0;
            return Object.assign(record, {
              hours,
              breakTime,
              wage,
              unpaid,
              paid
            });
          });

        const salary = valid
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
        return Object.assign(op, { tips, hours, breakTime, salary, paid });
      });
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
  overflow: auto;
}

section {
  padding: 15px;
  flex: 1;
}

.title {
  padding: 0 10px;
  display: flex;
}

.title > span {
  cursor: pointer;
}

.title i {
  margin-left: 5px;
  color: rgba(0, 0, 0, 0.5);
}

.f3 {
  flex: 3;
}
</style>

