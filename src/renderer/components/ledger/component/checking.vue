<template>
    <div class="relative row">
        <div class="f1">
            <p>Ticket Total: $ {{ticketAmount | decimal}}</p>
            <p>Verified Amount: $ {{verifyAmount | decimal}}</p>
            <p></p>
        </div>
        <div class="f2">
            <ul>
                <li v-for="(ticket,index) in passed" :key="index" :class="{verified:ticket.status === 1}" class="row">
                    <span>#{{ticket.number}} ({{ticket.type}})</span>
                    <span> $ {{ticket.amount | decimal}}</span>
                    <span class="miss"> ( {{ticket.miss | decimal}} )</span>
                    <span>{{ticket.info}}</span>
                </li>
            </ul>
        </div>
        <p class="message"></p>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  props: ["invoices", "transactions"],
  data() {
    return {
      ticketAmount: 0,
      verifyAmount: 0,
      voidAmount: 0,
      passed: []
    };
  },
  created() {
    this.$emit("load");
    this.run();
  },
  methods: {
    run() {
      this.invoices.forEach(invoice => {
        const { discount } = invoice.payment;

        const { balance } = this.$calculatePayment(invoice, {
          selfAssign: false,
          callback: true
        });

        if (invoice.status === 1) {
          this.ticketAmount += balance;
        } else {
          this.voidAmount += balance;
        }

        const payments = this.transactions.filter(t => t.order === invoice._id);

        if (payments.length > 0 || invoice.status === 0) {
          const paid = payments
            .reduce((a, c) => a + c.actual, 0)
            .toPrecision(12)
            .toFloat();

          let record = {
            number: invoice.number,
            type: this.$t("type." + invoice.type),
            status: 1,
            info: "PASS",
            amount: balance,
            miss: 0,
            server: invoice.server,
            cashier: invoice.cashier
          };

          if (paid > 0 && paid !== balance) {
            Object.assign(record, {
              status: 0,
              info: balance > paid ? "Paid less" : "Over Paid",
              miss: Math.abs(balance - paid)
            });
          } else {
            this.verifyAmount += balance;
          }

          this.passed.push(record);
        } else {
          //no payment
          this.passed.push({
            number: invoice.number,
            type: this.$t("type." + invoice.type),
            status: 0,
            info: invoice.status === 0 ? "Ticket Voided" : "Payment Missing",
            amount: balance,
            miss: balance,
            server: invoice.server,
            cashier: null
          });
        }
      });

      this.$emit("ready");
    },
    ...mapActions(["setOrder"])
  },
  computed: {
    ...mapGetters(["tax", "config", "store", "dineInOpt"])
  }
};
</script>

<style scoped>
p.message {
  position: absolute;
  bottom: 10px;
  width: 100%;
  text-align: center;
}

ul {
  max-height: 450px;
  overflow: auto;
}

.results li span {
  flex: 1;
}

.results li:nth-child(even) {
  background: #eee;
}
.verified {
  opacity: 0.3;
}

.miss {
  color: red;
}
</style>
