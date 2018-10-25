<template>
    <div class="popupMask dark center" @click.self="init.resolve">
        <div class="report">
            <header class="flex-center column">
                <h3>Report Center</h3>
                <h5>Sales Report for {{date}}</h5>
            </header>
            <div class="wrap">
              <hour-chart :data="invoices.length ? invoices : history"></hour-chart>
              <report-option></report-option>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import hourChart from "./component/chart";
import reportOption from "./component/menu";

export default {
  props: ["init"],
  components: { hourChart, reportOption },
  data() {
    return {
      date: today(),
      invoices: []
    };
  },
  computed: {
    title() {
      return Array.isArray(date)
        ? `Sales Report From ${this.date[0]} to ${this.date[1]}`
        : `Sales Report For ${this.date}`;
    },
    ...mapGetters(["history"])
  },
  methods: {}
};
</script>

<style scoped>
.report {
  width: 850px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  text-align: center;
  background: #f1f3f5;
}

header {
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 15px 0 10px;
  border-radius: 4px 4px 0 0;
}

h5 {
  font-weight: normal;
  color: #757575;
}

.wrap{
  padding: 40px 0 20px;
}
</style>