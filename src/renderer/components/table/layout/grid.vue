<template>
    <div class="tables">
        <div class="table-seat" v-for="(table,index) in sectionTables" @click="tap(table)" @contextmenu="reset(table)" :key="index" :class="getTableStatus(table)">
        <span :class="[table.shape]" class="icon"></span>
        <span class="name">{{table.name}}</span>
        <span class="staff" v-show="table.server">{{table.server}}</span>
        </div>    
        <div :is="component" :init="componentData"></div>    
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import dialogModule from "../../common/dialog";
import unlockModule from "../../common/unlock";
import inputModule from "../../component/inputer";
import tableCreate from "../../../mixins/tableCreate";

export default {
  props: ["buffer", "tables", "transfer"],
  components: { inputModule, dialogModule, unlockModule },
  mixins: [tableCreate],
  data() {
    return {
      componentData: null,
      component: null,
      sectionTables: [],
      viewTables: false
    };
  },
  created() {
    this.viewTables = this.approval(this.op.view, "tables");
  },
  methods: {
    initial(tables) {
      const seats = Array(56)
        .fill()
        .map((_, index) => ({
          feature: [],
          invoice: [],
          session: null,
          server: null,
          time: null,
          status: 1,
          shape: "",
          name: "",
          seats: 1,
          zone: this.zone,
          grid: index
        }));

      (tables || []).forEach(table => {
        seats[table.grid] = table;
      });

      this.sectionTables = seats;

      // reset order list if order is settled
      this.order.settled && this.resetOrder();
    },
    getTableStatus({ status, session, invoice, server }) {
      switch (status) {
        case -2:
          return { reserved: true };
        case -1:
          return { placing: true };
        case 1:
          return { idle: true };
        case 2:
          const ticket = this.history.find(t => t.session === session);
          const togo = ticket ? ticket.togo : false;
          const ban = ticket
            ? !this.viewTables && server !== this.op.name
            : false;

          return ticket && ticket.print
            ? { placed: true, togo, ban }
            : { preparing: true, togo, ban };
        case 3:
          return { receipted: true };
        case 4:
          return { booked: true };
      }
    },
    tap(table) {
      if (!table._id || table.type === "placeholder") return;
      if (table.status !== 1) {
        if (this.transfer) {
          const alert = {
            title: "dialog.tableSwitchFailed",
            msg: "dialog.targetTableMustBeEmpty",
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.retry", fn: "resolve" }
            ]
          };

          this.$dialog(alert)
            .then(this.exitComponent)
            .catch(() => {
              this.$emit("update:transfer", false);
              this.exitComponent();
            });
          return;
        } 
         
         this.setViewTable(table);
      }

      let prompt;

      switch (table.status) {
        case -2:
          prompt = {
            type: "question",
            title: "dialog.tableBooked",
            msg: "dialog.actionProcess",
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.create", fn: "resolve" }
            ]
          };

          this.$dialog(prompt).then(this.exitComponent);
          break;
        case -1:
          this.resetOrder();
          break;
        case 1:
          this.checkBooking(table)
            .then(this.checkIfSwitch)
            .then(this.checkAccessPin)
            .then(this.countGuest.bind(null, table))
            .then(this.createTable)
            .catch(this.createTableFailed);
        case 4:
          break;
        default:
          this.table.server !== this.op.name
            ? this.$checkPermission("view", "tables")
                .then(this.viewTicket)
                .catch(() => {})
            : this.viewTicket();
      }
    },
    reset(table) {
      table._id && this.resetTableDialog(table);
    },
    resetTableDialog({ _id, name, server }) {
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
            this.$socket.emit("[TABLE] RESET", { _id });
            this.resetOrder();
            this.exitComponent();
          })
          .catch(this.exitComponent);
      }
    },
    viewTicket() {
      const { _id, invoice, session } = this.table;
      const ticket = this.history.find(
        i => i._id === invoice[0] || i.session === session
      );

      ticket ? this.setViewOrder(ticket) : this.noFoundDialog("REGULAR", _id);
    },
    checkBooking(table) {
      return new Promise((next, stop) => {
        //check this.books
        next(table);
      });
    },
    checkIfSwitch(table) {
      return new Promise((next, stop) => {
        if (this.transfer) {
          const prompt = {
            type: "question",
            title: "dialog.tableSwitch",
            msg: ["dialog.tableSwitchConfirm", this.table.name, table.name]
          };

          this.$dialog(prompt)
            .then(() => {
              this.swapTable(table);
              this.$emit("update:transfer", false);
              this.exitComponent();
            })
            .catch(() => {
              this.exitComponent();
              stop();
            });
        } else {
          this.setViewTable(table);
          next();
        }
      });
    },
    createTable({ _id, name, guest }) {
      const session = ObjectId().toString();

      let type;
      switch (this.table.type) {
        case "bar":
          type = "BAR";
          break;
        default:
          type = "DINE_IN";
          break;
      }

      this.resetOrder();
      this.setTicket({ type });
      this.setApp({ newTicket: true });
      this.setOrder({
        tableID: _id,
        table: name,
        session,
        type,
        guest
      });

      this.setViewTable(
        Object.assign(this.table, {
          server: this.op.name,
          time: Date.now(),
          status: -1,
          session
        })
      );

      this.$socket.emit("[TABLE] UPDATE", this.table);
      this.$router.push({ path: "/main/menu" });
    },
    swapTable(table) {
      const { _id, server, status, session, invoice, time, guest } = this.table;

      Object.assign(table, {
        server,
        status,
        session,
        invoice,
        time,
        guest
      });

      let order = this.history.find(i => i._id === invoice[0]);

      if (order) {
        Object.assign(order, {
          table: table.name,
          tableID: table._id
        });

        this.$socket.emit("[ORDER] UPDATE", order);
      }

      this.setViewTable(table);
      this.$nextTick(() => {
        this.$socket.emit("[TABLE] RESET", { _id });
        this.$socket.emit("[TABLE] UPDATE", table);
      });
    },

    createTableFailed(error) {},
    ...mapActions([
      "setApp",
      "setOrder",
      "resetOrder",
      "setTicket",
      "resetTable",
      "setOperator",
      "setViewOrder",
      "setViewTable",
      "setTodayOrder"
    ])
  },
  computed: {
    ...mapGetters([
      "op",
      "time",
      "table",
      "books",
      "order",
      "history",
      "customer",
      "dineInOpt"
    ])
  },
  watch: {
    tables: {
      immediate: true,
      handler: "initial"
    }
  }
};
</script>

<style scoped>
.tables {
  padding: 2px 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(8, 1fr);
  height: calc(100vh - 35px);
}

.staff {
  position: absolute;
  background: #03a9f4;
  color: #fff;
  text-shadow: 0 1px 1px #333;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5), inset 0 1px 1px #badefb;
  width: 100%;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.ticket {
  width: 285px;
}

.placed {
  box-shadow: 0 1px 3px #f25d30;
}

.placed .icon,
.preparing .icon {
  color: #f25e31;
}

.preparing .icon:after {
  content: "\f06d";
  color: #ff5722;
}

.placed .icon:after {
  content: "\f2e7";
  color: #ff5722;
}

.receipted .icon:after {
  content: "\f543";
  color: #009688;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
}

.placing .icon:after {
  content: "\F508";
  color: #ff5722;
}

.settled .icon:after {
  content: "\f1b8";
  color: #4caf50;
}

.booked .icon:after {
  content: "\f073";
  color: #009688;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
}

.togo:before {
  content: "\f290";
  font-family: "fontAwesome";
  font-weight: bold;
  position: absolute;
  left: 3px;
  top: 3px;
  color: #ff5722;
  text-shadow: 0 1px 0px rgba(0, 0, 0, 0.5);
}

.ban:before {
  content: "\f070";
  font-family: "fontAwesome";
  font-weight: bold;
  position: absolute;
  left: 3px;
  top: 3px;
  color: #ff9800;
  text-shadow: 0 1px 0px rgba(0, 0, 0, 0.5);
}
</style>