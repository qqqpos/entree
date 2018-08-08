<template>
    <div>
      <header class="date-picker">
        <div class="f1">
            <h3>{{$t('setting.title.cashFlow')}}</h3>
            <p>{{$t('tip.cashflowList')}}</p>
        </div>
      <date-picker @update="fetchData" init="currentMonth"></date-picker>
    </header>
    <div class="summary-wrap">
      <section class="list">

      </section>
      <section class="overview">

      </section>
      </div>
    </div>
</template>

<script>
import datePicker from "../common/datePicker";

export default {
  components: { datePicker },
  data() {
    return {
      componentData: null,
      component: null,
      ledgers: []
    };
  },
  methods: {
    fetchData() {}
  }
};
</script>