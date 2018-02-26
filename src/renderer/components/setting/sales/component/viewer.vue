<template>
    <div class="popupMask dark center setting" @click.self="init.resolve">
        <div class="editor">
            <header>
                <h5>{{$t('nav.cashFlow')}}</h5>
                <h3>{{$t('title.paymentHistory')}}</h3>
            </header>
            <table class="event">
                <thead>
                    <tr>
                        <th>{{$t('thead.time')}}</th>
                        <th>{{$t('thead.type')}}</th>
                        <th>{{$t('thead.inflow')}}</th>
                        <th>{{$t('thead.outflow')}}</th>
                        <th>{{$t('thead.change')}}</th>
                        <th>{{$t('thead.amount')}}</th>
                        <th>{{$t('thead.operator')}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(log,index) in logs">
                        <td>{{log.time | moment('HH:mm:ss')}}</td>
                        <td>{{$t('flow.'+log.type)}}</td>
                        <td :class="{zero:log.inflow===0,in:log.inflow>0}">{{log.inflow | decimal}}</td>
                        <td :class="{zero:log.outflow===0,out:log.outflow >0}">{{log.outflow | decimal}}</td>
                        <td :class="{zero:log.inflow - log.outflow ===0}">{{(log.inflow - log.outflow) | decimal}}</td>
                        <td>{{log.amount | decimal}}</td>
                        <td>{{log.operator}}</td>
                    </tr>
                </tbody>
            </table>
            <footer>
                <div class="f1">
                    <pagination :of="init.log.activity" @page="setPage" :contain="15" :max="6"></pagination>
                </div>
                <button class="btn" @click="print">{{$t('button.print')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import pagination from "../../../common/pagination";

export default {
  props: ["init"],
  components: { pagination },
  computed: {
    logs() {
      const min = this.page * 15;
      const max = min + 15;
      return this.init.log.activity.slice(min, max);
    }
  },
  data() {
    return {
      activity: [],
      page: 0
    };
  },
  created() {
    let amount = 0;
    this.init.log.activity.forEach(log => {
      amount += log.inflow - log.outflow;
      Object.assign(log, { amount });
    });
  },
  methods: {
    setPage(num) {
      this.page = num;
    },
    print(){
        Printer.printCashOutReport(this.init.log,false)
    }
  }
};
</script>

<style scoped>
.editor {
  width: 600px;
}

.zero {
  color: lightgray;
}

.in:before {
  content: "+ ";
}

.out {
  color: #f44336;
}

.out:before {
  content: "- ";
}
</style>