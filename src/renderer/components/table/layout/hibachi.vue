<template>
    <div class="hibachi-grid">
        <div class="hibachi-seat" :class="[table.layout,table.orientation]" v-for="(table,index) in tables" :key="index" :data-hibachi="table._id">
          <div class="table-name fn" v-if="hibachiReady(table)" @dblclick="selectAll(table)">
            <div class="mini-btn" @click="printDialog(table)"><i class="fas fa-print light space"></i>{{$t('button.print')}}</div>
          </div>
            <div class="table-name fn" v-else-if="target === table.name && seats.length">
              <div class="mini-btn" @click="cancel"><i class="fas fa-ban light space"></i>{{$t('button.cancel')}}</div>
              <div class="mini-btn" @click="create"><i class="fas fa-utensils light space"></i>{{$t('button.create')}}</div>
            </div>
            <span class="table-name" v-else @dblclick="selectAll(table)">{{table.name}}</span>
            <span v-for="(seat,idx) in table.seats" :key="idx" :index="idx" :data-seat="seat.name" class="seat" tag="span" @click="tap($event,table,seat)" @contextmenu="resetTableDialog(table._id,seat)">
              <span class="ticket" v-show="seat.number"># {{seat.number}}</span>
              <span class="status">{{getStatus(seat)}}</span>
              {{seat.name}}
            </span>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dialogModule from "../../common/dialog";
import unlockModule from "../../common/unlock";
import tableCreate from "../../../mixins/tableCreate";

export default {
  props: ["tables", "transfer"],
  components: { dialogModule, unlockModule },
  mixins: [tableCreate],
  data() {
    return {
      componentData: null,
      component: null,
      target: null,
      seats: []
    };
  },
  methods: {
    hibachiReady(table) {
      if (this.target === table.name && this.seats.length !== 0) return false;
      let tickets = new Set();
      let print = false;

      table.seats.forEach(seat => seat.invoice && tickets.add(seat.invoice));

      Array.from(tickets).forEach(id => {
        const order = this.history.find(ticket => ticket._id === id) || {};
        print = print || !order.print;
      });

      return print;
    },
    tap(e, hibachi, seat) {
      if (!this.table || this.table._id === hibachi._id) {
        seat.status === 1
          ? this.selectSeat(e, hibachi.name, seat.name)
          : this.viewTicket(hibachi, seat);
        this.setViewTable(hibachi);
      } else {
        this.seats = [];
        this.resetStyle();
        this.setViewTable(hibachi);
        this.tap(e, hibachi, seat);
      }
    },
    viewTicket(table, seat) {
      const _id = seat.invoice;
      const invoice = this.history.find(t => t._id === _id);

      invoice
        ? this.viewHibachi(invoice, seat.name)
        : this.noFoundDialog("HIBACHI", table._id, seat.session);
    },
    viewHibachi(invoice, seat) {
      //const { _id, tableID, seats } = invoice;
      this.setViewOrder(invoice);
      invoice && this.$bus.emit("SET_HIBACHI_SEAT", seat);
    },
    selectAll(hibachi) {
      this.seats = [];
      this.target = hibachi.name;
      this.setViewTable(hibachi);

      hibachi.seats.forEach(seat => {
        if (seat.status === 1) {
          this.seats.push(seat.name);
          document
            .querySelector(
              `[data-hibachi="${hibachi._id}"] [data-seat="${seat.name}"]`
            )
            .classList.add("active");
        }
      });

      this.seats.sort((a, b) => (a > b ? 1 : -1));
    },
    selectSeat(e, target, seat) {
      if (this.target === null) this.target = target;

      if (this.target !== target) {
        this.resetStyle();
        this.target = target;
        this.seats = [seat];
        e.target.classList.add("active");
      } else {
        const index = this.seats.findIndex(number => number === seat);
        if (index === -1) {
          this.seats.push(seat);
          e.target.classList.add("active");
        } else {
          this.seats.splice(index, 1);
          e.target.classList.remove("active");
        }
      }

      this.resetOrder();
    },
    resetStyle() {
      document
        .querySelectorAll(".active")
        .forEach(dom => dom.classList.remove("active"));
    },
    printDialog(table) {
      const prompt = {
        type: "question",
        title: "dialog.printHibachi",
        msg: ["dialog.printHibachiConfirm", table.name],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.print", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => {
          this.printHibachi(table);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    printHibachi(table) {
      const ids = new Set();
      const items = [];
      let tickets = [];

      table.seats.forEach(seat => seat.invoice && ids.add(seat.invoice));

      Array.from(ids).forEach(id => {
        const ticket = this.history.find(ticket => ticket._id === id);

        if (ticket) {
          ticket.content
            .filter(item => !item.print)
            .forEach(item => items.push(item));

          Printer.print(ticket, false, "Order");
          tickets.push(ticket);
        }
      });

      const order = {
        server: this.op.name,
        date: today(),
        time: Date.now(),
        table: table.name,
        layout: table.orientation,
        payment: {},
        content: items
      };

      const print = (array, printer) => {
        let next = [];
        let current = [];
        array.filter(item => {
          const index = current.findIndex(i => i.seat === item.seat);
          index === -1
            ? current.push(item)
            : Object.keys(item.printer).includes(printer) && next.push(item);
        });

        current.length && Printer.printHibachi(printer, order, current);
        next.length && print(next, printer);
      };

      Object.entries(this.config.printers)
        .filter(printer => printer[1].type === "hibachi")
        .map(printer => printer[0])
        .forEach(printer => print(items.filter(i => !i.print), printer));

      // mark all tickets printed
      tickets.forEach(ticket =>
        this.$socket.emit("[ORDER] UPDATE", ticket, true)
      );
    },
    cancel() {
      this.target = null;
      this.seats = [];
      this.resetStyle();
    },
    create() {
      this.checkAccessPin()
        .then(this.createTable)
        .catch(this.exitComponent);
    },
    createTable() {
      this.resetOrder();
      this.exitComponent();

      const session = ObjectId().toString();
      const _id = this.order._id;
      const server = this.op.name;
      const time = Date.now();

      this.setTicket({ type: "HIBACHI" });

      Object.assign(this.order, {
        table: this.table.name,
        tableID: this.table._id,
        guest: this.seats.length,
        seats: this.seats,
        type: "HIBACHI",
        session,
        server
      });

      this.table.seats.forEach(seat => {
        this.seats.includes(seat.name) &&
          Object.assign(seat, {
            invoice: _id,
            status: -1,
            session,
            server,
            time
          });
      });

      this.$socket.emit("[TABLE] UPDATE", this.table);
      this.$router.push({ path: "/main/menu" });
    },
    resetTableDialog(_id, { name, server, session }) {
      const { role } = this.op;

      const prompt = {
        title: "dialog.forceClearTable",
        msg: server
          ? ["dialog.forceClearTableConfirm", server, name]
          : "dialog.resetTableConfirm",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.clear", fn: "resolve" }
        ]
      };

      if (role === "Manager" || role === "Owner" || role === "Developer") {
        this.$dialog(prompt)
          .then(() => {
            this.$socket.emit("[HIBACHI] RESET", { _id, session });
            this.resetOrder();
            this.exitComponent();
          })
          .catch(this.exitComponent);
      }
    },
    getStatus({ invoice }) {
      if (!invoice) return "";

      const order = this.history.find(t => t._id === invoice);

      if (order) {
        return order.print ? "Cooked" : "Placed";
      } else {
        return "Missing";
      }
    },
    ...mapActions([
      "setApp",
      "setTicket",
      "resetOrder",
      "setOperator",
      "setViewTable",
      "setViewOrder"
    ])
  },
  computed: {
    ...mapGetters(["op", "config", "table", "order", "history", "dineInOpt"])
  },
  watch: {
    tables: "cancel"
  }
};
</script>

<style scoped>
.hibachi-grid {
  width: 637px;
  height: 700px;
  display: grid;
  grid-gap: 15px 5px;
  margin-top: -30px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  justify-self: center;
  align-self: center;
}

.hibachi-seat {
  margin: 5px 10px;
  background: #b0bec5;
  display: grid;
  grid-gap: 4px;
  padding: 4px;
}

.fn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: inherit;
  font-weight: inherit;
}

.fn div {
  margin: 7px 0;
}

.active {
  background: #607d8b;
  color: #fff;
}

.status {
  bottom: 8px;
  position: absolute;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: #fff;
  background: #455a64;
  padding: 0px 8px;
  border-radius: 3px;
  font-size: 15px;
  font-weight: lighter;
}

.ticket {
  position: absolute;
  left: 4px;
  top: 2px;
  font-family: "Agency FB";
  font-weight: bold;
  color: #607d8b;
}
</style>