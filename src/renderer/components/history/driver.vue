<template>
    <div class="popupMask dark center" @click.self="init.resolve">
        <div class="editor">
            <header>
                <div>
                    <h3>{{$t('title.setDriver')}}</h3>
                    <h5>{{$t('tip.foundRecords',0)}}</h5>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <ul class="tickets">
                    <li v-for="(invoice,index) in init.invoices" :key="index">
                        <span>{{invoice.number}}</span>
                        <div>
                            <span>{{invoice.customer.address}}</span>
                            <p>
                                <span>{{invoice.customer.distance}}</span>
                                <span>{{invoice.customer.duration}}</span>
                            </p>
                        </div>
                        <span>$ {{invoice.payment.balance | decimal}}</span>
                    </li>
                </ul>
                <ul class="swipe">
                    <li v-for="(gap,index) in gaps" :key="index">{{gap}}</li>
                </ul>
                <ul class="actions">
                    <li>set driver</li>
                    <li>print summary</li>
                    <li>settlement</li>
                    <li>reset list</li>
                </ul>
                <ul class="filters">
                    <li>All Invoices</li>
                    <li>Driver 1</li>
                    <li>Driver 2</li>
                    <li>Driver 3</li>
                    <li>Driver 4</li>
                    <li>Driver 5</li>
                </ul>
            </div>
            <!-- <footer>
                <button class="btn">{{$t('button.confirm')}}</button>
            </footer> -->
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import dialogModule from "../common/dialog";

export default {
  props: ["init"],
  components: { dialogModule },
  data() {
    return {
      gaps: [],
      filters: []
    };
  },
  created() {
    this.initialGaps();
    this.initialFilters();
  },
  methods: {
    initialGaps() {
      const invoices = this.init.invoices;
      const length = invoices.length;

      if (length < 1) {
        this.gaps = [];
      } else if (length < 10) {
        const first = invoices[0].number;
        const last = invoices.last().number;
        this.gaps = [first, last];
      } else {
        const first = invoices[0].number;
        const last = invoices.last().number;
        const gap = Math.ceil(length / 10);

        this.gaps = [first];

        for (let i = 0; i < gap; i++) {
          invoice[i] && this.gaps.push(invoice[i].number);
        }

        this.gaps.push(last);
      }
    },
    initialFilters() {}
  },
  computed: {}
};
</script>

<style scoped>
.wrap {
  padding: initial;
  width: 850px;
  display: grid;
  grid-template-columns: 1fr 50px 250px 150px;
}
</style>



