<template>
    <div class="viewer">
        <table>
            <tr>
                <th>{{$t('thead.status')}}</th>
                <th>{{$t('thead.ticket')}}</th>
                <th>{{$t('thead.type')}}</th>
                <th>{{$t('thead.placeTime')}}</th>
                <th>{{$t('thead.cashier')}}</th>
                <th class="note">{{$t('thead.note')}}</th>
                <th>{{$t('thead.note')}}</th>
                <th>{{$t('thead.view')}}</th>
            </tr>
            <tr v-for="(invoice,index) in invoices" :key="index" :class="{void:invoice.status === 0}">
                <td>
                    <i :class="status(invoice.status)"></i>
                </td>
                <td>{{invoice.number}}</td>
                <td>{{$t('type.'+invoice.type)}}</td>
                <td>{{invoice.time | moment('MM-DD HH:mm')}}</td>
                <td>{{invoice.cashier}}</td>
                <td v-if="invoice.status === 0">
                    <span>{{$t('reason.'+invoice.void.note)}}</span>
                    <span>({{invoice.void.by}})</span>
                </td>
                <td v-else></td>
                <td>$ {{invoice.payment.due | decimal}}</td>
                <td @click="view(invoice)" class="icon">
                    <i class="fa fa-file-text-o"></i>
                </td>
            </tr>
        </table>
        <transition name="fadeUp">
            <div class="popupMask center dark" @click.self="component = null" v-if="component">
                <div :is="component" :init="componentData"></div>
            </div>
        </transition>
    </div>
</template>

<script>
import ticket from "../common/ticket";
export default {
  components: { ticket },
  created() {
    const { phone } = this.customer;
    const page = this.page;
    this.$socket.emit("[HISTORY] CUSTOMER_ORDERS", { phone, page }, data => {
      this.invoices = data;
    });
  },
  data() {
    return {
      customer: this.$store.getters.customer,
      componentData: null,
      component: null,
      invoices: [],
      page: 0
    };
  },
  methods: {
    status(code) {
      switch (code) {
        case 0:
          return "fa fa-times-circle-o red";
        case 1:
          return "fa fa-check-circle-o green";
        default:
          return "fa fa-question-circle-o";
      }
    },
    view(ticket) {
      this.$p("ticket", { ticket });
    }
  }
};
</script>

<style scoped>
.viewer {
  height: 500px;
  min-width: 800px;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th {
  padding: 7px 5px;
  text-align: center;
}

tr:not(:first-child) {
  background: #fff;
}

tr:nth-child(odd) {
  background: #f5f5f5;
  border-bottom: 1px solid #f1f1f1;
}

td {
  padding: 10px 5px;
  text-align: center;
}

.icon {
  cursor: pointer;
}

th.note {
  min-width: 200px;
}

tr.void {
  background: #fbe9e7;
  color: #ff5722;
}

i.green {
  color: var(--green);
}

i.red {
  color: var(--red);
}
</style>