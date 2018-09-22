<template>
    <div class="row">
        <ul>
            <li>&nbsp;</li>
            <li>{{$t('text.count')}}</li>
            <li>{{$t('text.tip')}}</li>
            <li>{{$t('text.tax')}}</li>
            <li>{{$t('text.subtotal')}}</li>
            <li>{{$t('text.total')}}</li>
            <li>{{$t('type.other')}}</li>
        </ul>
        <ul v-for="(data,category,index) in summary" :key="index">
            <li>{{$t('type.'+category)}}</li>
            <li>{{data.count}}</li>
            <li>{{data.tip | decimal}}</li>
            <li>{{data.tax | decimal}}</li>
            <li>{{data.subtotal | decimal}}</li>
            <li><b>{{data.total | decimal}}</b></li>
            <li>
                <p class="row" v-show="data.plasticTax > 0"><span class="tag">{{$t('report.plasticTax')}}</span><span>{{data.plasticTax | decimal}}</span></p>             
                <p class="row" v-show="data.rounding > 0"><span class="tag">{{$t('text.rounding')}}</span><span>{{data.rounding | decimal}}</span></p>
                <p class="row" v-show="data.gratuity > 0"><span class="tag">{{$t('text.gratuity')}}</span><span>{{data.gratuity | decimal}}</span></p>
                <p class="row" v-show="data.delivery > 0"><span class="tag">{{$t('text.delivery')}}</span><span>{{data.delivery | decimal}}</span></p>
                <p class="row" v-show="data.discount > 0"><span class="tag">{{$t('text.discount')}}</span><span>{{data.discount | decimal}}</span></p>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
  props: ["transactions", "invoices"],
  data() {
    return {
      summary: {}
    };
  },
  created() {
    this.initialData()
      .then(this.processData)
      .catch(this.failed);
  },
  methods: {
    initialData() {
      const sort = [
        "WALK_IN",
        "PICK_UP",
        "DELIVERY",
        "DINE_IN",
        "BAR",
        "HIBACHI",
        "BUFFET",
        "SALES"
      ];
      return new Promise(next => {
        let summary = {};
        const types = new Set();
        this.invoices.forEach(i => types.add(i.type));
        Array.from(types)
          .sort((a, b) => (sort.indexOf(a) > sort.indexOf(b) ? 1 : -1))
          .forEach(type => {
            summary[type] = {
              count: 0,
              tip: 0,
              tax: 0,
              subtotal: 0,
              rounding: 0,
              discount: 0,
              plasticTax: 0,
              delivery: 0,
              gratuity: 0,
              total: 0
            };
          });

        next(summary);
      });
    },
    processData(summary) {
      this.invoices.forEach(invoice => {
        if (invoice.status !== 1) return;

        const { type, payment } = invoice;

        summary[type].count++;
        summary[type].tip += payment.tip;
        summary[type].tax += payment.tax;
        summary[type].subtotal += payment.subtotal;
        summary[type].total += parseFloat(
          (payment.tax + payment.subtotal - payment.discount).toFixed(2)
        );
        summary[type].rounding += payment.rounding;
        summary[type].discount += payment.discount;
        summary[type].plasticTax += payment.plasticTax;
        summary[type].gratuity += payment.gratuity;
      });
      this.summary = summary;
    }
  }
};
</script>

<style scoped>
div.row {
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}

ul {
  flex: 1;
  text-align: center;
}

ul:first-child,
li:first-child {
  font-weight: bold;
  color: rgba(0, 0, 0, 0.75);
}

li:first-child {
  border-bottom: 1px solid #eee;
}

ul:last-child {
  border-right: none;
}

li {
  padding: 7px 0;
}

li:nth-child(even) {
  background: #f5f5f5;
}

li:last-child {
  border-bottom: none;
}

p.row{
  align-items: center;
}

.tag {
    width: 75px;
    font-size: 14px;
    color: rgba(0,0,0,0.75);
}
</style>


