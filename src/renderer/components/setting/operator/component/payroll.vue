<template>
  <div class="payroll">
      <header @click="expand = !expand">
          <h3>{{sheet.name}}</h3>
          <h5>{{$t('type.'+sheet.role)}}</h5>
          <span class="pay" v-show="!expand">$ {{sheet.salary | decimal}}</span>
          <i class="fa fa-chevron-up" v-if="expand"></i>
          <i class="fa fa-chevron-down" v-else></i>
      </header>
      <div class="detail" v-if="expand">
          <div class="stats f1">
            <p>
              <span class="text">Time Card Count</span>
              <span class="value">{{sheet.timecard.length}}</span>
            </p>
            <p>
              <span class="text">{{$t('text.workHour')}}</span>
              <span class="value">{{sheet.hours}}</span>
            </p>
            <p>
              <span class="text">Break Time</span>
              <span class="value">{{sheet.breakTime}}</span>
            </p>
            <p>
              <span class="text">Wage</span>
              <span class="value">$ {{sheet.wage | decimal}} / Hr</span>
            </p>
            <p>
              <span class="text">Tips</span>
              <span class="value">{{sheet.tips | decimal}}</span>
            </p>
          </div>
          <div class="func f1">
            <p>
              <span class="text">{{$t('text.paid')}}</span>
              <span class="value">$ {{sheet.paid | decimal}}</span>
            </p>
            <p>
              <span class="text">{{$t('text.unpaid')}}</span>
              <span class="value">$ {{sheet.salary | decimal}}</span>
            </p>
            <div class="action">
              <button class="button" @click="$emit('view',sheet)">{{$t('button.view')}}</button>
              <button class="button" @click="$emit('print',sheet)">{{$t('button.print')}}</button>
              <button class="button" :disabled="sheet.salary === 0">{{$t('button.pay')}}</button>
            </div>
          </div>
      </div>
  </div>
</template>

<script>
export default {
  props: ["sheet"],
  data() {
    return {
      expand: false
    };
  }
};
</script>

<style scoped>
.payroll {
  margin: 5px 10px;
  padding: 15px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

header {
  display: flex;
  cursor: pointer;
  align-items: baseline;
}

h5 {
  font-weight: normal;
  margin-left: 5px;
  flex: 1;
}

header i {
  color: #666;
}

.pay {
  margin-right: 10px;
  color: #009688;
  font-family: "Agency FB";
  font-weight: bold;
}

.detail {
  display: flex;
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px solid #eee;
}

.detail p {
  display: flex;
}

.value {
  font-family: "Agency FB";
  font-weight: bold;
}

.text {
  flex: 1;
  color: rgba(0, 0, 0, 0.75);
}

.stats {
  margin-right: 15px;
}

.action {
    margin-top: 20px;
    display: flex;
}

.action button {
    padding: 10px;
    flex: 1;
    margin: 0 4px;
}
</style>


