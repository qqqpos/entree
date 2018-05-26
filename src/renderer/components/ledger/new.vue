<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <div>
                    <h5>{{ledgerDate}}</h5>
                    <h3>{{$t('title.ledger')}}</h3>
                </div>
                <tab v-model="page" @switch="loadPage"></tab>
            </header>
            <div class="wrap relative">
                <keep-alive>
                    <transition name="fade" mode="out-in">
                        <component :is="page" :invoices="invoices" :transactions="transactions" @ready="loaded"></component>
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

export default {
  props: ["init"],
  components: { tab, loader, chart },
  data() {
    return {
      ledgerDate: null,
      isLoading: true,
      page: null,
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

          this.loadPage("CHART");
        }
      );
    },
    loadPage(name) {
      switch (name) {
        case "CHART":
          this.page = "chart";
          break;
        case "DEPARTMENT":
          break;
        case "FILTER":
          break;
      }
    },
    loaded() {
      this.isLoading = false;
    }
  }
};
</script>

<style scoped>
.wrap {
  width: 900px;
  min-height: 450px;
  overflow: hidden;
}
</style>

