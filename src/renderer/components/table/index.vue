<template>
    <div class="table-outer">
        <div class="table-layout">
            <aside class="column">
                <div class="table-section">
                    <button class="btn relative" v-for="(zone,index) in layouts.table" :key="index" @click="setSection(index)">{{zone[language]}}<span class="notify blue">{{countSeats(index)}}</span></button>
                </div>
                <div class="column">
                    <button class="btn" @click="$open('bookModule')">
                        <i class="far fa-calendar-check"></i>
                        <span class="text">{{$t('button.booking')}}</span>
                    </button>
                    <!-- <button class="btn" @click="viewList">
                        <i class="fas fa-list-ol"></i>
                        <span class="text">{{$t('button.viewList')}}</span>
                    </button> -->
                </div>
            </aside>
            <div class="tables">
                <div class="table" v-for="(table,index) in tableSection" @click="tap(table)" @contextmenu="reset(table)" :key="index" :class="getTableStatus(table)">
                <span :class="[table.shape]" class="icon"></span>
                <span class="name">{{table.name}}</span>
                <span class="staff" v-show="table.server">{{table.server}}</span>
                </div>                
            </div>
        </div>
        <div class="ticket">
            <div class="wrap">
                <order-list layout="display" :display="true"></order-list>
                <buttons class="buttons" :transfer="transfer" @switch="switchTable"></buttons>
            </div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import inputModule from "../component/inputer";
import dialogModule from "../common/dialog";
import unlockModule from "../common/unlock";
import orderList from "../common/orderList";
import bookModule from "../book/index";
import buttons from "./buttons";

export default {
  components: {
    dialogModule,
    unlockModule,
    inputModule,
    bookModule,
    orderList,
    buttons
  },
  data() {
    return {
      componentData: null,
      component: null,
      transfer: false,
      buffer: [],
      section: 0
    };
  },
  methods: {
    setSection(index) {
      this.section = index;
    },
    getTableStatus({ status, session }) {
      switch (status) {
        case -2:
          return { reserved: true };
        case -1:
          return { placing: true };
        case 1:
          return { idle: true };
        case 2:
          const invoice = this.history.find(t => t.session === session);
          return invoice && invoice.print
            ? { placed: true }
            : { preparing: true };
        case 3:
          return { receipted: true };
        case 4:
          return { booked: true };
      }
    },
    countSeats(section) {
      const { zone } = this.layouts.table[section];
      const tables = this.tables[zone];

      return tables.filter(table => table._id && table.status === 1).length;
    },
    tap(table) {
      if (!table._id) return;
      this.setViewTable(table);

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

          this.$dialog(prompt).then();
          break;
        case -1:
          this.resetOrder();
          break;
        case 1:
          this.checkBooking(table)
            .then(this.checkIfSwitch)
            .then(this.checkAccessPin)
            .then(this.countGuest.bind(null, table))
            .then(this.checkTableType)
            .then(this.createTable)
            .catch(this.createTableFailed);
        case 4:
          break;
        default:
          this.$checkPermission("view", "tables")
            .then(this.viewTicket)
            .catch(this.unableViewTicketDialog);
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
                this.viewTicket();
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
          this.buffer.push(table);
          this.swapTable(this.buffer);
          this.buffer = [];
          this.transfer = false;
          stop();
        } else {
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
                  .catch(() => stop("PASSWORD_REQUIRED"));
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
      const defaultGuest = parseInt(table.seats) || 1;

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
    checkTableType(table) {
      return new Promise((next, stop) => {
        switch (table.type) {
          case "hibachi":
            break;
          case "bar":
            break;
          default:
            next(table);
        }
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
    swapTable([table1, table2]) {
      const { server, status, session, invoice, time, guest } = table1;

      Object.assign(table2, {
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
          table: table2.name,
          tableID: table2._id
        });

        this.$socket.emit("[ORDER] UPDATE", order);
      }

      this.setViewTable(table2);
      this.$socket.emit("[TABLE] RESET", { _id: table1._id });
      this.$socket.emit("[TABLE] UPDATE", table2);
    },
    viewList() {},
    switchTable(data) {
      if (typeof data === "boolean") {
        this.transfer = false;
        this.buffer = [];
      } else {
        this.transfer = true;
        this.buffer.push(data);
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
    unableViewTicketDialog() {
      const prompt = {
        title: "dialog.insufficientPermission",
        msg: "dialog.permission",
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
    tableSection() {
      const section = this.layouts.table[this.section] || {};
      const { zone = "Entree" } = section;
      const tables = this.tables[zone] || [];

      let seats = Array(56)
        .fill()
        .map(() => ({
          feature: [],
          invoice: [],
          name: "",
          server: null,
          session: null,
          shape: "",
          status: 0,
          time: 0,
          grid: 0,
          status: 0,
          zone
        }));

      tables.forEach(table => {
        seats[table.grid] = table;
      });
      return seats;
    },
    ...mapGetters([
      "op",
      "table",
      "dineInOpt",
      "tables",
      "history",
      "layouts",
      "language",
      "customer"
    ])
  }
};
</script>

<style scoped>
.table-outer {
  display: flex;
  flex-direction: row;
  height: 771px;
  width: 1024px;
  padding-top: 63px;
  background: url(../../assets/image/floor.png) #ebeff1;
}

.table-layout {
  display: flex;
}

aside {
  padding: 5px;
  height: 733px;
}

.column {
  display: flex;
  flex-direction: column;
}

.buttons {
  padding: 3px 3px 0;
}

.table-section {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
}

.tables {
  padding: 2px 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  height: 737px;
  flex: 1;
}

.table {
  height: 81px;
  width: 83px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
  border-radius: 6px;
  border-top: 1px solid #f3f3f3;
  background: linear-gradient(
    135deg,
    rgb(245, 247, 250) 0%,
    rgb(195, 207, 226) 110%
  );
  margin: 4px;
  text-shadow: 0 1px 1px #fff;
  box-shadow: 0 1px 3px #607d8b;
}

.icon {
  font-size: 4em;
  width: 64px;
  height: 64px;
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

.icon:after {
  text-shadow: 0 1px 0px rgba(0, 0, 0, 0.5);
  font-family: fontAwesome;
  font-size: 16px;
  font-weight: 900;
  position: absolute;
  top: 3px;
  right: 3px;
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
</style>


