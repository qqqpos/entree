<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <div>
                    <h5>{{ledgerDate}}</h5>
                    <h3>{{$t('title.ledger')}}</h3>
                </div>
                <tab @switch="loadComponent"></tab>
            </header>
            <div class="wrap relative">
                <keep-alive>
                    <transition name="fade" mode="out-in">
                        <component :is="component" :invoices="invoices" :transactions="transactions" @load="isLoading = true" @ready="isLoading = false"></component>
                    </transition>
                </keep-alive>
                <loader :display="isLoading"></loader>
            </div>
            <footer>
                <button class="btn" @click="init.resolve">{{$t('button.done')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import tab from "./helper/tab";
import loader from "../common/loader";
import chart from "./component/chart";
import checking from "./component/checking";
import department from "./component/department";

export default {
  props: ["init"],
  components: { tab, loader, chart, checking, department },
  data() {
    return {
      component: null,
      ledgerDate: null,
      isLoading: true,
      invoices: [],
      transactions: []
    };
  },
  created() {
    this.initialData();
  },
  methods: {
    initialData() {
      this.ledgerDate = document.querySelector("#calendar .text").innerHTML;

      const from = +moment(this.ledgerDate, "YYYY-MM-DD", true)
        .startOf("day")
        .hour(4);
      const to = +moment(this.ledgerDate, "YYYY-MM-DD", true)
        .startOf("day")
        .add(1, "days")
        .hour(4);

      this.$socket.emit(
        "[REPORT] INITIAL_DATA",
        { from, to },
        ({ invoices, transactions }) => {
          this.invoices = invoices;
          this.transactions = transactions;

          this.loadComponent("CHART");
        }
      );
    },
    loadComponent(name) {
      switch (name) {
        case "CHART":
          this.component = "chart";
          break;
        case "DEPARTMENT":
          this.component = "department";
          break;
        case "CHECKING":
          this.component = "checking";
          break;
      }
    }
  }
};
</script>

<style scoped>
.wrap {
  width: 900px;
  min-height: 450px;
  overflow-y: auto;
}
</style>

