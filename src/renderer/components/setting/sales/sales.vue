<template>
  <div>
    <header class="date-picker">
        <div class="f1">
            <h3>{{$t('setting.title.salesSummary')}}</h3>
            <p>{{$t('title.summary.sales',from,to)}}</p>
        </div>
      <date-picker @update="fetchData" init="currentMonth"></date-picker>
    </header>
    <div class="summary-wrap">
      <section class="list" v-if="data.length">
        <daily v-for="(sale,index) in data" :key="index" :sales="sale"></daily>
      </section>
      <section class="empty placeholder" v-else>
        <i class="fas fa-database"></i>
        <p>Database Has No Index</p>
      </section>
      <section class="overview">
         <div class="wrap relative">
          <h3>{{$t('nav.overview')}}</h3>
          <p>
            <span class="f1">{{$t('report.days')}}</span>
            <span class="value">{{summary.days}}</span>
          </p>
          <div class="group">
            <p>
              <span class="f1">{{$t('report.itemSales')}}</span>
              <span class="value">$ {{summary.subtotal | decimal}}</span>
            </p>
            <p>
              <span class="f1">{{$t('report.salesTax')}}</span>
              <span class="value">$ {{summary.tax | decimal}}</span>
            </p>
            <p>
              <span class="f1">{{$t('report.discount')}}</span>
              <span class="value">$ {{summary.discount | decimal}}</span>
            </p>
            <p>
              <span class="f1">{{$t('report.salesTotal')}}</span>
              <span class="value">$ {{summary.total | decimal}}</span>
            </p>          
          </div>
          <div class="group">
            <p>
              <span class="f1">{{$t('report.rounding')}}</span>
              <span class="value">$ {{summary.rounding | decimal}}</span>
            </p>  
            <p>
              <span class="f1">{{$t('report.gratuity')}}</span>
              <span class="value">$ {{summary.gratuity | decimal}}</span>
            </p>
            <p>
              <span class="f1">{{$t('report.deliveryFee')}}</span>
              <span class="value">$ {{summary.delivery | decimal}}</span>
            </p>            
          </div>
          <div class="group">
            <p v-for="(data,type,index) in summary.types" :key="index" v-show="data.count > 0"> 
              <span class="f1">
                <span class="type">{{$t('type.' + type)}}</span>
                <span class="light">({{data.count}})</span>
              </span>
              <span class="value">$ {{data.sales | decimal}}</span>
            </p>
          </div>                                   
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
      data: [],
      from: "",
      to: ""
    };
  },
  created() {
    const { database = {} } = this.$store.getters.config;
    this.indexed = database.index;
  },
  methods: {
    fetchData([from, to], group = "DAILY") {
      this.from = from.format("YYYY-MM-DD");
      this.to = to.format("YYYY-MM-DD");

      this.indexed &&
        this.$socket.emit(
          "[REPORT] DAILY",
          { from: +from, to: +to, group },
          data => {
            this.data = Object.freeze(
              data.sort((a, b) => (a.time > b.time ? 1 : -1))
            );
          }
        );
    }
  },
  computed: {
    summary() {
      const days = this.data.length;
      let subtotal = 0;
      let tax = 0;
      let discount = 0;
      let rounding = 0;
      let gratuity = 0;
      let delivery = 0;
      let total = 0;

      this.data.forEach(date => {
        subtotal += date.summary.sales.subtotal;
        tax += date.summary.sales.tax;
        discount += date.summary.sales.discount;
        rounding += date.summary.sales.rounding;
        gratuity += date.summary.sales.gratuity;
        delivery += date.summary.sales.deliveryCharge;
        total += date.summary.sales.total;
      });

      let types = {};

      [
        "WALK_IN",
        "PICK_UP",
        "DELIVERY",
        "DINE_IN",
        "BAR",
        "BUFFET",
        "HIBACHI",
        "SALES"
      ].forEach(title => {
        types[title] = {
          count: 0,
          sales: 0
        };

        this.data.forEach(date => {
          types[title].count += date.summary.count[title];
          types[title].sales += date.summary.sales[title];
        });
      });

      return {
        days,
        subtotal,
        tax,
        discount,
        rounding,
        gratuity,
        delivery,
        total,
        types
      };
    }
  }
};
</script>