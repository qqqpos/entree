<template>
  <div>
    <header class="date-picker">
        <div class="f1">
            <h3>{{$t('setting.title.salesSummary')}}</h3>
            <p>{{$t('title.summary.sales')}}</p>
        </div>
      <date-picker @update="fetchData" init="currentMonth"></date-picker>
    </header>
    <div class="summary-wrap">
      <section class="list" v-if="dates.length">
        <daily v-for="(date,index) in dates" :key="index" :sales="date"></daily>
      </section>
      <section class="empty" v-else>
        Database Has No Index 
      </section>
      <section class="overview">
         <div class="wrap relative">
          <h3>{{$t('nav.overview')}}</h3>
          <p>
            <span class="f1">Days</span>
            <span class="value">{{summary.days}}</span>
          </p>
          <div class="group">
            <p>
              <span class="f1">Item Sales</span>
              <span class="value">$ {{summary.subtotal | decimal}}</span>
            </p>
            <p>
              <span class="f1">Sales Tax</span>
              <span class="value">$ {{summary.tax | decimal}}</span>
            </p>
            <p>
              <span class="f1">Discount</span>
              <span class="value">$ {{summary.discount | decimal}}</span>
            </p>
            <p>
              <span class="f1">Sales Total</span>
              <span class="value">$ {{summary.total | decimal}}</span>
            </p>          
          </div>
          <div class="group">
            <p>
              <span class="f1">Rounding</span>
              <span class="value">$ {{summary.rounding | decimal}}</span>
            </p>  
            <p>
              <span class="f1">Gratuity</span>
              <span class="value">$ {{summary.gratuity | decimal}}</span>
            </p>
          </div>
          <div class="group">
            <p>
              <span class="f1"></span>
              <span class="value"></span>
            </p>
            <p>
              <span class="f1"></span>
              <span class="value"></span>
            </p>
          </div>   
          <p>
            <span class="f1"></span>
            <span class="value"></span>
          </p>   
          <p>
            <span class="f1"></span>
            <span class="value"></span>
          </p>                                   
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import daily from "./helper/daily";
import loader from "../../common/loader";
import datePicker from "../common/datePicker";

export default {
  components: { daily, loader, datePicker },
  data() {
    return {
      componentData: null,
      component: null,
      indexed: false,
      dates: []
    };
  },
  created() {
    const { database = {} } = this.$store.getters.config;
    this.indexed = database.index;
  },
  methods: {
    fetchData([from, to], group = "DAILY") {
      this.indexed &&
        this.$socket.emit(
          "[REPORT] DAILY",
          { from: +from, to: +to, group },
          dates => {
            this.dates = Object.freeze(
              dates.sort((a, b) => (a.time > b.time ? 1 : -1))
            );
            this.analizeData();
          }
        );
    },
    analizeData() {}
  },
  computed: {
    summary() {
      const days = this.dates.length;
      let subtotal = 0;
      let tax = 0;
      let discount = 0;
      let rounding = 0;
      let gratuity = 0;
      let total = 0;

      this.dates.forEach(date => {
        subtotal += date.summary.sales.subtotal;
        tax += date.summary.sales.tax;
        discount += date.summary.sales.discount;
        rounding += date.summary.sales.rounding;
        gratuity += date.summary.sales.gratuity;
        total += date.summary.sales.total;
      });

      return { days, subtotal, tax, discount, rounding, gratuity, total };
    }
  }
};
</script>