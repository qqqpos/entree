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
import inputModule from "../../component/inputer";
import dialogModule from "../../common/dialog";
import unlockModule from "../../common/unlock";

export default {
  props: ["buffer", "tables", "transfer"],
  components: { inputModule, dialogModule, unlockModule },
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
            .then(() => this.exitComponent())
            .catch(() => {
              this.$emit("update:transfer", false);
              this.exitComponent();
            });
          return;
        } else {
          this.setViewTable(table);
        }
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
      const prompt = {
        title: "dialog.ticketNotFound",
        msg: "dialog.actionProcess",
        buttons: [
          { text: "button.resetTable", fn: "reject" },
          { text: "button.sync", fn: "resolve", load: true }
        ]
      };
      const { _id, invoice, session } = this.table;
      const ticket = this.history.find(
        i => i._id === invoice[0] || i.session === session
      );

      ticket
        ? this.setViewOrder(ticket)
        : this.$dialog(prompt)
            .then(() => {
              this.$socket.emit("[ORDER] SYNC", orders => {
                this.setTodayOrder(orders);
                this.exitComponent();
              });
            })
            .catch(() => {
              this.$socket.emit("[TABLE] RESET", { _id });
              this.exitComponent();
            });
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
          this.swapTable(table);
          this.$emit("update:transfer", false);
          stop();
        } else {
          this.setViewTable(table);
          next();
        }
      });
    },
    checkAccessPin() {
      return new Promise((next, stop) => {
        if (this.dineInOpt.passwordRequire) {
          // password required to create new table
          new Promise((resolve, reject) => {
            this.componentData = { resolve, reject };
            this.component = "unlockModule";
          })
            .then(operator => {
              if (operator._id === this.op._id) {
                // move next if same person
                next();
              } else {
                const prompt = {
                  type: "question",
                  title: "dialog.switchOperator",
                  msg: [
                    "dialog.switchCurrentOperator",
                    this.op.name,
                    operator.name
                  ]
                };

                this.$dialog(prompt)
                  .then(() => this.switchOperator(operator, next))
                  .catch(() => {
                    this.exitComponent();
                    stop();
                  });
              }
            })
            .catch(this.pinIncorrectDialog);
        } else {
          next();
        }
      });
    },
    pinIncorrectDialog(exit) {
      const prompt = {
        title: "dialog.accessDenied",
        msg: "dialog.accessPinNotMatch",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      exit
        ? this.exitComponent()
        : this.$dialog(prompt).then(this.exitComponent);
    },
    switchOperator(operator, next) {
      this.exitComponent();
      const language = operator.language || "usEN";
      moment.locale(language === "usEN" ? "en" : "zh-cn");

      this.$setLanguage(language);
      this.setApp({ language, newTicket: true });
      this.setOperator(operator);
      next();
    },
    countGuest(table) {
      const defaultGuest = parseInt(table.seat) || 1;

      return new Promise((next, stop) => {
        this.dineInOpt.guestCount
          ? new Promise((resolve, reject) => {
              const config = {
                title: "text.setGuest",
                subtitle: table.name,
                type: "number",
                percentage: false,
                allowPercentage: false,
                amount: defaultGuest
              };
              this.componentData = Object.assign({ resolve, reject }, config);
              this.component = "inputModule";
            })
              .then(({ amount }) =>
                next(Object.assign(table, { guest: amount || 1 }))
              )
              .catch(() => {
                stop();
                this.exitComponent();
              })
          : next(Object.assign(table, { guest: defaultGuest }));
      });
    },
    createTable({ _id, name, guest }) {
      const session = ObjectId().toString();

      this.resetOrder();
      this.setTicket({ type: "DINE_IN" });
      this.setApp({ newTicekt: true });
      this.setOrder({
        type: "DINE_IN",
        tableID: _id,
        table: name,
        session,
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
    viewList() {},
    unableViewTicketDialog() {
      const prompt = {
        title: "dialog.permissionDenied",
        msg: "dialog.unableViewOtherTable",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.$dialog(prompt).then(this.exitComponent);
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