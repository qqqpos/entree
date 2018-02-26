<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5></h5>
        <h3>{{$t('title.orderList')}}</h3>
      </header>
      <table class="event">
        <thead>
          <tr>
            <th>#</th>
            <th>{{$t('thead.table')}}</th>
            <th>{{$t('thead.server')}}</th>
            <th>{{$t('thead.placeTime')}}</th>
            <th>{{$t('thead.lapse')}}</th>
            <th>{{$t('thead.total')}}</th>
            <th>{{$t('thead.todo')}}</th>
            <th class="action">{{$t('thead.action')}}</th>
            <th>{{$t('thead.view')}}</th>
          </tr>
        </thead>
        <tbody v-if="!combineMode">
          <tr v-for="(invoice,index) in invoices" :key="index">
            <td>{{invoice.number}}</td>
            <td>{{invoice.table}}</td>
            <td>{{invoice.server}}</td>
            <td>{{invoice.time | moment('HH:mm')}}</td>
            <td>{{invoice.time | fromNow}}</td>
            <td>$ {{invoice.payment.due | decimal}}</td>
            <td>{{todo(invoice.content)}} / {{invoice.content.length}}</td>
            <td class="action">
              <span class="paid" @click="settle(invoice)">{{$t('button.payment')}}</span>
            </td>
            <td>
              <i class="fa fa-file-text-o" @click="view(invoice)"></i>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="(invoice,index) in invoices" :key="index">
            <td>{{invoice.number}}</td>
            <td>{{invoice.table}}</td>
            <td>{{invoice.server}}</td>
            <td>{{invoice.time | moment('HH:mm')}}</td>
            <td>{{invoice.time | fromNow}}</td>
            <td>$ {{invoice.payment.due | decimal}}</td>
            <td>{{todo(invoice.content)}} / {{invoice.content.length}}</td>
            <td class="action">
              <span class="combine" @click="addToCombine(invoice.number)" v-show="!queued(invoice.number)">{{$t('button.select')}}</span>
              <span class="cancel" @click="addToCombine(invoice.number)" v-show="queued(invoice.number)">{{$t('button.cancel')}}</span>
              <span class="join" v-if="queued(invoice.number)" @click="join(invoice.number)">{{$t('button.combine')}}</span>
            </td>
            <td>
              <i class="fa fa-file-text-o" @click="view(invoice)"></i>
            </td>
          </tr>
        </tbody>
      </table>
      <footer>
        <button class="btn" @click="init.resolve">{{$t('button.done')}}</button>
      </footer>
    </div>
    <div class="popupMask center dark" v-show="component">
      <div :is="component" :init="componentData"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ticket from "../common/ticket";
import payment from "../payment/index";
import dialoger from "../common/dialoger";
export default {
  props: ["init"],
  components: { ticket, payment, dialoger },
  data() {
    return {
      invoices: [],
      componentData: null,
      component: null,
      combineMode: false,
      combineOrders: []
    };
  },
  computed: {
    ...mapGetters(["op", "history"])
  },
  created() {
    let viewAllInvoices = this.approval(this.op.view, "invoices");

    this.init.combineMode && (this.combineMode = true);

    this.invoices = viewAllInvoices
      ? this.history
          .filter(
            invoice =>
              invoice.type === "DINE_IN" &&
              invoice.status === 1 &&
              !invoice.settled
          )
          .sort((a, b) => a.time > b.time)
      : this.history
          .filter(
            invoice =>
              invoice.type === "DINE_IN" &&
              invoice.server === this.op.name &&
              invoice.status === 1 &&
              !invoice.settled
          )
          .sort((a, b) => a.time > b.time);
  },
  methods: {
    view(ticket) {
      this.$p("ticket", { ticket, exit: true });
    },
    todo(content) {
      return content
        .filter(item => item.print)
        .map(item => item.qty)
        .reduce((a, b) => a + b, 0);
    },
    settle(order) {
      this.$p("payment", { order });
    },
    queued(number) {
      return this.combineOrders.includes(number);
    },
    addToCombine(number) {
      let index = this.combineOrders.indexOf(number);
      index === -1
        ? this.combineOrders.push(number)
        : this.combineOrders.splice(index, 1);
    },
    join(number) {
      if (this.combineOrders.length < 2) return;

      let queue = this.combineOrders.slice(0);
      let index = queue.indexOf(number);
      queue.splice(index, 1);

      this.$dialog({
        type: "question",
        title: "dialog.combineTickets",
        msg: [
          "dialog.combineTicketsConfirm",
          queue.map(i => "#" + i).join(","),
          number
        ]
      })
        .then(() => {
          try {
            let master = this.history.find(
              invoice => invoice.number === number
            );
            let slaves = [];

            queue.forEach(num => {
              let ticket = this.history.find(invoice => invoice.number === num);
              ticket.content.forEach(item => {
                master.content.push(item);
              });
              //combine payment
              master.payment.subtotal += ticket.payment.subtotal;
              master.payment.tax += ticket.payment.tax;
              master.payment.total += ticket.payment.total;
              master.payment.due += ticket.payment.due;
              master.payment.balance += ticket.payment.balance;
              master.payment.paid += ticket.payment.paid;
              master.payment.change += ticket.payment.change;

              //should we ignore surcharge?
              master.payment.gratuity += ticket.payment.gratuity;
              master.payment.tip += ticket.payment.tip;
              master.payment.surcharge += ticket.payment.surcharge;

              master.payment.discount += ticket.payment.discount;
              master.payment.remain += ticket.payment.remain;

              slaves.push(ticket);
            });
            this.$socket.emit("[COMBINE] TABLE_INVOICE", {
              master,
              slaves,
              op: this.op.name
            });
          } catch (e) {
            console.log(e);
          }
          this.combineOrders = [];
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    }
  },
  watch: {
    history(invoices) {
      this.invoices = invoices
        .filter(
          invoice =>
            invoice.type === "DINE_IN" &&
            invoice.status === 1 &&
            !invoice.settled
        )
        .sort((a, b) => a.time > b.time);
    }
  }
};
</script>

<style scoped>
table{
  width: 825px;
}
.action {
  width: 200px;
}
.action span {
  padding: 5px 15px;
  color: #fff;
  border-radius: 4px;
  text-shadow: 0 1px 1px #333;
  cursor: pointer;
}
.paid {
  background: #2196f3;
}

.combine {
  background: #009688;
}
.cancel {
  background: #ff9800;
}
.join {
  background: #2196f3;
}
</style>