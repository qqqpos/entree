<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.operator.payroll'}">{{$t('nav.filter')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.operator.payroll.sheet'}" :class="{disable:!payrolls}">{{$t('nav.view')}}</router-link>
        </ul>
        <transition name="slide" mode="out-in">
            <router-view class="tab-content" @generate="getReport" :payrolls="payrolls" :config="config"></router-view>
        </transition>
    </div>
</template>

<script>
export default {
  data() {
    return {
      payrolls: null,
      config: null
    };
  },
  methods: {
    getReport(config) {
      this.config = config;

      config.from = +config.from;
      config.to = +config.to
        .clone()
        .add(1, "days")
        .hours(3)
        .minutes(59)
        .seconds(59);

      this.$socket.emit("[EMPLOYEE] PAYROLLS", config, payrolls => {
        this.payrolls = payrolls.map(payroll => {
          const baseWage = payroll.wage || 0;
          const count = payroll.timecard.length;
          const valid = payroll.timecard.filter(t => t.valid).length;
          const validSession = payroll.timecard
            .filter(
              t =>
                t.valid &&
                isNumber(t.clockIn) &&
                isNumber(t.clockOut) &&
                t.clockOut > t.clockIn
            )
            .map(record => {
              const hours = toFixed(
                moment.duration(record.clockOut - record.clockIn).asHours(),
                2
              );
              const wage = isNumber(record.wage)
                ? record.wage
                : payroll.wage || 0;
              const salary = toFixed(hours * wage, 2);
              const tip = isNumber(record.tip) ? parseFloat(record.tip) : 0;
              return Object.assign({}, record, { hours, wage, salary, tip });
            });

          const totalTime = payroll.timecard
            .filter(t => t.clockOut > t.clockIn)
            .reduce((a, c) => a + (c.clockOut - c.clockIn), 0);

          const validTime = validSession.reduce((a, c) => a + c.hours, 0);
          const salary = validSession.reduce((a, c) => a + c.salary, 0);
          const tipTotal = validSession.reduce((a, c) => a + c.tip, 0);

          Object.assign(payroll, {
            count,
            valid,
            validSession,
            totalTime,
            validTime,
            salary,
            tipTotal
          });

          return payroll;
        });

        this.payrolls = payrolls;
        this.$router.push({ name: "Setting.operator.payroll.sheet" });
      });
    }
  }
};
</script>