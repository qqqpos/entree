<template>
    <div class="cashFlow">
        <div class="record">
            <span class="status">
                <i class="fa fa-check-circle green" v-if="log.close"></i>
                <i class="fa fa-exclamation-triangle yellow" v-else></i>
            </span>
            <span class="date">{{log.date}}</span>
            <span class="time">{{log.beginTime | moment("HH:mm:ss")}}</span>
            <span class="time">{{log.endTime | moment("HH:mm:ss")}}</span>
            <span class="text">{{log.cashDrawer}}</span>
            <span class="text">{{log.operator}}</span>
            <span class="amount">$ {{log.begin | decimal}}</span>
            <span class="amount">{{log.end | money}}</span>
            <span class="count">{{log.activity.length}}</span>
            <span class="more" @click="toggleDetail"><i class="fa fa-angle-double-down"></i></span>
        </div>
        <table v-if="view">
            <tr>
                <th>{{$t('thead.type')}}</th>
                <th>{{$t('thead.time')}}</th>
                <th>{{$t('thead.orderType')}}</th>
                <th>{{$t('thead.ticket')}}</th>
                <th>{{$t('thead.inflow')}}</th>
                <th>{{$t('thead.outflow')}}</th>
                <th>{{$t('thead.change')}}</th>
                <th>{{$t('thead.operator')}}</th>
            </tr>
            <tr v-for="(record,index) in records" :key="index" class="log">
                <td>{{$t('flow.'+record.type)}}</td>
                <td>{{record.time | moment("HH:mm:ss")}}</td>
                <td>{{record.ticket && $t('type.'+record.ticket.type)}}</td>
                <td @click="viewTicket(record.order)">{{record.ticket && "#"+record.ticket.number}}</td>
                <td :class="{zero:record.inflow ===0,inflow:record.inflow>0}" class="amount">{{record.inflow.toFixed(2)}}</td>
                <td :class="{zero:record.outflow ===0,outflow:record.outflow>0}" class="amount">{{record.outflow.toFixed(2)}}</td>
                <td :class="{zero:record.inflow - record.outflow === 0}">{{(record.inflow - record.outflow).toFixed(2)}}</td>
                <td>{{record.operator}}</td>
            </tr>
            <tr>
                <td colspan="4" class="option">
                    <checkbox v-model="option" :val="type" :label="'flow.'+type" v-for="(type,index) in types" :key="index" :multiple="true"></checkbox>
                </td>
                <td class="inflow">{{summary.inflow | decimal}}</td>
                <td :class="{zero:summary.outflow ===0,outflow:summary.outflow>0}">{{summary.outflow | decimal}}</td>
                <td>{{summary.total | decimal}}</td>
                <td></td>
            </tr>
        </table>
    </div>
</template>

<script>
import checkbox from "../../common/checkbox";
export default {
  props: ["log"],
  components: { checkbox },
  data() {
    return {
      view: false,
      types: [],
      option: []
    };
  },
  methods: {
    toggleDetail() {
      this.view = !this.view;

      if (this.view) {
        let types = new Set();
        this.log.activity.forEach(record => {
          types.add(record.type);
        });

        this.types = Array.from(types);
        this.option = this.types.slice(0);
      }
    },
    viewTicket(id) {
      if (!id) return;
      console.log("trigger")
      this.$socket.emit("[VIEW] INVOICE", id, ticket => {
        this.$emit("view",ticket)
      });
    }
  },
  filters:{
    money(val){
      return isNumber(val) ? '$ ' + val.toFixed(2) : ''
    }
  },
  computed: {
    records() {
      let option = this.option;
      return this.log.activity.filter(log => this.option.includes(log.type));
    },
    summary() {
      let inflow = this.records
        .map(log => log.inflow)
        .reduce((a, b) => a + b, 0);
      let outflow = this.records
        .map(log => log.outflow)
        .reduce((a, b) => a + b, 0);

      return { inflow, outflow, total: inflow - outflow };
    }
  }
};
</script>

<style scoped>
.green {
  color: var(--green);
}

.yellow {
  color: var(--yellow);
}
.date {
  width: 120px;
  text-align: center;
}
.status {
  width: 50px;
  text-align: center;
}
.time {
  width: 90px;
  text-align: center;
}

.text {
  width: 90px;
  text-align: center;
}

.amount {
  width: 120px;
  text-align: center;
}

.more {
  cursor: pointer;
  flex: 1;
  text-align: center;
}
.text {
  width: 90px;
  text-align: center;
}
.count {
  width: 80px;
  text-align: center;
}

.record {
  display: flex;
  flex: 1;
  height: 40px;
  align-items: center;
}

.cashFlow {
  display: flex;
  flex: 1;
  flex-direction: column;
}
table {
  width: 100%;
  text-align: center;
  background: #fff;
}

tr {
  background: #eceff1;
}

th {
  background: #607d8b;
  color: #fff;
  font-weight: normal;
}
.zero {
  opacity: 0.1;
}
.inflow {
  color: green;
}
.inflow:before {
  content: "+ ";
}
.outflow {
  color: #ff5722;
}
.outflow:before {
  content: "- ";
}
.log:hover {
  background: #cfd8dc;
}
td.option {
  text-indent: 2em;
  text-align: left;
}
</style>

