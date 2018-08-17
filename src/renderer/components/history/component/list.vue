<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <div class="f1">
                    <h3>{{$t('title.orderList')}}</h3>
                    <h5>{{$t('tip.foundRecords',tickets.length)}}</h5>
                </div>
                <button class="remove" @click="reset" v-show="queue.length >0">{{$t('button.reset')}}</button>
            </header>
            <div class="wrap">
              <table class="text-center">
                  <thead>
                      <tr class="banner">
                          <th class="icon"></th>
                          <th>{{$t('thead.ticket')}}</th>
                          <th>{{$t('thead.type')}}</th>
                          <th>{{$t('thead.time')}}</th>
                          <th>Duration</th>
                          <th>{{$t('thead.server')}}</th>
                          <th class="actions">{{$t('thead.action')}}</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="(ticket,index) in tickets" :key="index" @click="addQueue(ticket._id)" :class="{active:inQueue(ticket._id)}">
                          <td class="icon">
                            <i class="fas fa-check-circle check"></i>
                            <i class="far fa-check-circle uncheck"></i>
                          </td>
                          <td>#{{ticket.number}}</td>
                          <td>{{$t('type.'+ticket.type)}}</td>
                          <td>{{ticket.time | moment("HH:mm:ss")}}</td>
                          <td>{{ticket.time | fromNow}}</td>
                          <td>
                            <div>{{ticket.server}}</div>
                            <div class="extra-info">{{ticket.lastEdit | fromNow}}</div>
                          </td>
                          <td class="actions">
                            <span class="action yellow" @click.stop="$open('ticket',{ticket})">{{$t('button.view')}}</span>
                            <span class="action gray" :class="{disable:queue.length < 2}" @click.stop="combineDialog(ticket)">{{$t('button.combine')}}</span>
                            <span class="action yellow" :class="{disable:queue.length > 0}" @click.stop="pay(ticket)">{{$t('button.pay')}}</span>
                          </td>
                      </tr>
                  </tbody>
              </table>
            </div>
            <paginator :of="invoices" @page="setPage" :contain="10" :max="12"></paginator>
        </div>
        <div class="popupMask dark center" v-if="component" @click.self="exitComponent">
          <div :is="component" :init="componentData" class="component"></div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import ticket from "../../common/ticket";
import dialogModule from "../../common/dialog";
import paginator from "../../common/paginator";

export default {
  props: ["init"],
  components: { ticket, dialogModule, paginator },
  data() {
    return {
      componentData: null,
      component: null,
      viewTables: false,
      invoices: [],
      queue: [],
      page: 0
    };
  },
  created() {
    this.initialData();
  },
  methods: {
    initialData() {
      this.viewInvoices = this.approval(this.op.view, "invoices");
      this.invoices = this.viewInvoices
        ? this.history.filter(t => !t.settled && t.status === 1)
        : this.history.filter(
            t => !t.settled && t.status === 1 && t.server === this.op.name
          );
    },
    reset() {
      this.queue = [];
    },
    setPage(n) {
      this.page = n;
    },
    pay(ticket) {
      this.init.resolve();
      this.$bus.emit("pay", ticket);
    },
    addQueue(id) {
      const index = this.queue.findIndex(_id => _id === id);
      index === -1 ? this.queue.push(id) : this.queue.splice(index, 1);
    },
    inQueue(id) {
      return this.queue.includes(id);
    },
    combineDialog(parent) {
      const queues = this.queue.filter(_id => _id !== parent._id);
      const splits = this.history.filter(t => queues.includes(t._id));

      const prompt = {
        type: "question",
        title: "dialog.combineTickets",
        msg: [
          "dialog.combineTicketsConfirm",
          splits.map(i => `#${i.number}`),
          parent.number
        ],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.combine", fn: "resolve", load: true }
        ]
      };

      this.$dialog(prompt)
        .then(() =>
          this.$socket.emit("[ORDER] COMBINE", { splits, parent }, () => {
            this.queue = [];
            this.exitComponent();
            this.$nextTick(this.initialData);
          })
        )
        .catch(this.exitComponent);
    }
  },
  computed: {
    tickets() {
      const min = this.page * 12;
      const max = min + 12;

      return this.invoices.slice(min, max);
    },
    ...mapGetters(["op", "history", "tables", "layouts", "language"])
  }
};
</script>

<style scoped>
.wrap {
  padding: initial;
  height: 519px;
}
table {
  width: 950px;
}
.extra-info {
  font-size: 0.65em;
  opacity: 0.75;
}
tbody tr {
  background: #fafafa;
  height: 41px;
}

tbody tr:nth-child(even) {
  background: #eeeeee;
}

th.table {
  width: 78px;
}

.actions {
  width: 250px;
}
.action {
  display: inline-block;
  padding: 10px 10px;
  margin: 1px;
  border-radius: 2px;
  cursor: pointer;
}

td.icon {
  width: 20px;
  padding-left: 13px;
}

.action.gray {
  opacity: 0.35;
  pointer-events: none;
}

.disable {
  opacity: 0.35 !important;
  pointer-events: none !important;
}

.check,
.active .uncheck {
  display: none;
}

.active .check {
  display: initial;
}

.active .gray {
  pointer-events: initial;
  opacity: 1;
}
</style>


