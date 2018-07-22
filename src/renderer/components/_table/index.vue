<template>
  <div class="main">
    <section class="layout">
      <aside class="column">
        <div class="sections column">
          <button class="section btn" v-for="(section,index) in layouts.table" @click="switchSection(index)" :key="index">{{section[language]}}</button>
        </div>
        <div class="column">
          <button class="btn" @click="openReservation" :disabled="true">
            <i class="fa fa-book"></i>
            <span class="text">{{$t('button.reservation')}}</span>
          </button>
          <button class="btn" @click="viewDineInList" :disabled="true">
            <i class="fa fa-list-alt"></i>
            <span class="text">{{$t('button.viewList')}}</span>
          </button>
        </div>
      </aside>
      <div class="view">
        <div class="table" v-for="(table,index) in viewSection" @click="tap(table)" @contextmenu="option(table,index)" :key="index" :class="getTableStatus(table.status)">
          <span :class="[table.shape]" class="icon"></span>
          <span class="name">{{table.name}}</span>
          <span class="staff" v-show="table.server">{{table.server}}</span>
        </div>
      </div>
    </section>
    <div class="ticket">
      <div class="wrap">
        <order-list layout="display" :display="true"></order-list>
        <buttons class="grid" :transfer="transfer" @switch="switchTable"></buttons>
      </div>
    </div>
    <div class="popupMask center dark" v-show="component">
      <div :is="component" :init="componentData"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import dialogModule from "../common/dialog";
import unlockModule from "../common/unlock";
import orderList from "../common/orderList";
import hibachi from "./component/hibachi";
import counter from "./component/counter";
import creator from "./component/creator";
import buttons from "./buttons";

export default {
  components: {
    unlockModule,
    dialogModule,
    orderList,
    counter,
    buttons,
    creator,
    hibachi
  },
  computed: {
    viewSection() {
      const { zone } = this.layouts.table[this.view];
      const tables = this.tables[zone];

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
      "dineInOpt",
      "tables",
      "history",
      "layouts",
      "language",
      "customer",
      "table"
    ])
  },
  data() {
    return {
      componentData: null,
      component: null,
      transfer: false,
      buffer: [],
      view: 0
    };
  },
  methods: {
    switchSection(index) {
      this.view = index;
    },
    switchTable(data) {
      if (typeof data === "boolean") {
        this.transfer = false;
        this.buffer = [];
      } else {
        this.transfer = true;
        this.buffer.push(data);
      }
    },
    getTableStatus(status) {
      switch (status) {
        case -2:
          return { reserved: true };
        case -1:
          return { placing: true };
        case 1:
          return { idle: true };
        case 2:
          return { placed: true };
        case 3:
          return { receipted: true };
        case 4:
          return { settled: true };
      }
    },
    tap(table) {
      if (!table.hasOwnProperty("_id")) return;
      this.setViewTable(table);

      let prompt;

      switch (table.status) {
        case -2:
          prompt = {
            type: "question",
            title: "dialog.tableReserved",
            msg: "dialog.actionProcess",
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.create", fn: "resolve" }
            ]
          };

          this.$dialog(prmopt)
            .then(() =>
              this.checkReservation(table)
                .then(this.checkIfSwitch)
                .then(this.checkAccessPin)
                .then(this.countGuest.bind(null, table))
                .then(this.checkTableType)
                .then(this.createTable)
                .catch(this.createTableFailed)
            )
            .catch(this.exitComponent);
          break;
        case -1:
          this.resetOrder();
          break;
        case 1:
          this.checkReservation(table)
            .then(this.checkIfSwitch)
            .then(this.checkAccessPin)
            .then(this.countGuest.bind(null, table))
            .then(this.checkTableType)
            .then(this.createTable)
            .catch(this.createTableFailed);
          break;
        case 4:
          prompt = {
            title: "dialog.tableReset",
            msg: ["dialog.tableStatusClearConfirm", this.viewTable.name],
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.clear", fn: "resolve" }
            ]
          };

          this.$dialog(prompt)
            .then(() => {
              this.resetOrder();
              this.$socket.emit("[TABLE] RESET", {
                _id: this.viewTable._id
              });
              this.exitComponent();
            })
            .catch(this.exitComponent);
          break;
        default:
          this.checkPermission(table)
            .then(this.viewTicket)
            .catch(this.exceptionHandler);
      }
    },
    checkPermission(table) {
      return new Promise((next, stop) => {
        table.server === this.op.name
          ? next(table)
          : this.$checkPermission("view", "tables")
              .then(() => next(table))
              .catch(() => stop("UNABLE_VIEW_OTHER_TABLE"));
      });
    },
    checkTableType(table) {
      return new Promise((next, stop) => {
        switch (table.type) {
          case "hibachi":
            this.selectHibachiTable(table)
              .then(({ seats, table }) => {
                this.resetOrder();

                const session = ObjectId().toString();
                const layout = seats[0].direction;
                seats.forEach(seat =>
                  Object.assign(seat, {
                    session,
                    server: this.op.name,
                    time: Date.now()
                  })
                );

                this.setTicket({ type: "HIBACHI" });
                this.setApp({ newTicket: true });
                this.setOrder({
                  seats,
                  layout,
                  table,
                  session,
                  guest: seats.length,
                  type: "HIBACHI",
                  server: this.op.name
                });

                this.$router.push({ path: "/main/menu" });
                stop();
              })
              .catch(() => stop());
            break;
          case "bar":
            const session = ObjectId().toString();

            this.resetOrder();
            this.setTicket({ type: "BAR" });
            this.setApp({ newTicket: true });
            this.setOrder({
              table: table.name,
              tableID: table._id,
              session,
              guest: table.guest || 1,
              type: "BAR",
              server: this.op.name
            });

            this.setViewTable(
              Object.assign(table, {
                status: 2,
                session,
                server: this.op.name,
                time: Date.now()
              })
            );

            this.$socket.emit("[TABLE] SETUP", this.viewTable);
            this.$router.push({ path: "/main/menu" });
            stop();
            break;
          default:
            next(table);
        }
      });
    },
    checkReservation(table) {
      return new Promise((next, stop) => {
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
          new Promise((resolve, reject) => {
            this.componentData = { resolve, reject };
            this.component = "unlockModule";
          })
            .then(operator => {
              if (operator._id === this.op._id) {
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
                  .then(() => {
                    this.switchOperator(operator);
                    next();
                  })
                  .catch(() => stop("PASSWORD_MISMATCH"));
              }
            })
            .catch(() => stop("PASSWORD_REQUIRED"));
        } else {
          next();
        }
      });
    },
    switchOperator(op) {
      this.exitComponent();
      const language = op.language || "usEN";
      moment.locale(language === "usEN" ? "en" : "zh-cn");
      this.$setLanguage(language);
      this.setApp({ language, newTicket: true });
      this.setOperator(op);
    },
    countGuest(table) {
      return new Promise((next, stop) => {
        this.dineInOpt.guestCount
          ? new Promise((resolve, reject) => {
              this.componentData = { resolve, reject };
              this.component = "counter";
            })
              .then(guest => next(Object.assign(table, { guest })))
              .catch(() => stop())
          : next(Object.assign(table, { guest: 1 }));
      });
    },
    viewTicket(table) {
      !table.hasOwnProperty("invoice") && Object.assign(table, { invoice: [] });

      const invoice = this.history.find(
        i => i._id === table.invoice[0] || i.session === table.session
      );
      const prompt = {
        title: "dialog.ticketNotFound",
        msg: "dialog.actionProcess",
        buttons: [
          { text: "button.resetTable", fn: "reject" },
          { text: "button.sync", fn: "resolve" }
        ]
      };

      invoice
        ? this.setViewOrder(invoice)
        : this.$dialog(prompt)
            .then(() => {
              this.$socket.emit("[SYNC] ORDER_LIST");
              this.exitComponent();
            })
            .catch(() => {
              this.$socket.emit("[TABLE] RESET", { _id: table._id });
              this.exitComponent();
            });
    },
    swapTable(tables) {
      let [t1, t2] = tables;
      const {
        server,
        status,
        session,
        invoice,
        time,
        guest,
        type = "regular"
      } = t1;

      Object.assign(t2, {
        server,
        status,
        session,
        invoice,
        time,
        guest
      });

      Object.assign(t1, {
        server: "",
        status: 1,
        session: "",
        invoice: [],
        time: null,
        guest: 0
      });

      this.$socket.emit("[TABLE] UPDATE", { table: t1, assign: false });

      let order = this.history.find(i => i._id === invoice[0]);

      if (order) {
        let orderType;
        switch (t2.type) {
          case "bar":
            orderType = "BAR";
            break;
          case "hibachi":
            orderType = "HIBACHI";
            break;
          default:
            orderType = "DINE_IN";
        }
        Object.assign(order, {
          type: orderType,
          table: t2.name,
          tableID: t2._id
        });

        this.$socket.emit("[ORDER] UPDATE", order);
      }

      this.$socket.emit("[TABLE] UPDATE", { table: t2, assign: true });
    },
    selectHibachiTable(table) {
      return new Promise((resolve, reject) => {
        this.$socket.emit("[HIBACHI] SEATS", table.contain, data => {
          const seats = this.initialHibachiTable(table.contain, data);
          this.componentData = { resolve, reject, table, seats };
          this.component = "hibachi";
        });
      });
    },
    initialHibachiTable(table, data) {
      let layout = [];

      data.forEach((group, index) => {
        let seats = Array(11)
          .fill()
          .map((seat, index) => ({
            group: "",
            grid: index,
            name: "",
            session: ""
          }));
        group.forEach(table => Object.assign(seats[table.grid], table));
        seats[10].name = table[index] || "";
        layout.push(seats);
      });

      return layout;
    },
    selectBarTab() {
      return new Promise((resolve, reject) => {
        resolve();
        // this.componentData = { resolve, reject };
        // this.component = "barTab";
      });
    },
    createTable(table) {
      const { name, _id, guest } = table;
      const session = ObjectId().toString();

      this.resetOrder();
      this.setTicket({ type: "DINE_IN" });
      this.setApp({ newTicket: true });
      this.setOrder({
        guest,
        session,
        table: name,
        tableID: _id,
        type: "DINE_IN"
      });

      this.setViewTable(
        Object.assign(table, {
          status: -1,
          session,
          server: this.op.name,
          time: Date.now()
        })
      );

      this.$socket.emit("[TABLE] SETUP", this.viewTable);
      this.$router.push({ path: "/main/menu" });
    },
    createTableFailed(reason) {
      this.exitComponent();
      let prompt = null;
      switch (reason) {
        case "PASSWORD_REQUIRED":
          prompt = {
            title: "dialog.unableAccess",
            msg: "dialog.permissionDeniedContactManager",
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };
          break;
        case "PASSWORD_MISMATCH":
          prompt = {
            title: "dialog.unableAccess",
            msg: "dialog.accessPinNotMatch",
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };
          break;
        case "TABLE_RESERVED":
          prompt = {
            title: "dialog.unableAccess",
            msg: "dialog.tableReserved",
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };
          break;
      }
      prompt && this.$dialog(prompt).then(this.exitComponent);
    },
    option(table, index) {
      table._id && !table.temporary
        ? this.resetTableDialog(table)
        : table.temporary
          ? this.collapseTable(table, index)
          : this.temporaryTable(table, index);
    },
    resetTableDialog(table, index) {
      const { server, name, _id } = table;
      const { role } = this.op;

      let prompt = {
        title: "dialog.forceClearTable",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.clear", fn: "resolve" }
        ]
      };

      prompt.msg = !server
        ? "dialog.resetTableConfirm"
        : ["dialog.forceClearTableConfirm", server, name];

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
    collapseTable(table, index) {
      const prompt = {
        type: "question",
        title: "dialog.removeTemporaryTable",
        msg: "dialog.removeTemporaryTableConfirm"
      };

      this.$dialog(prompt)
        .then(this.exitComponent)
        .catch(this.exitComponent);
    },
    temporaryTable(table, index) {
      return;
      const prompt = {
        type: "question",
        title: "dialog.temporaryTable",
        msg: "dialog.createTemporaryTable"
      };

      this.$dialog(prompt)
        .then(() => this.setTableName(table, index))
        .catch(this.exitComponent);
    },
    setTableName(table, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "creator";
      }).then(name => {
        this.exitComponent();
        Object.assign(table, {
          _id: String().random(),
          temporary: true,
          grid: index,
          status: 1,
          name
        });
        this.$socket.emit("[TABLE] CREATE", table);
      });
    },
    exceptionHandler(error) {
      switch (error) {
        case "UNABLE_VIEW_OTHER_TABLE":
          console.log("trigger");
          break;
      }
    },
    openReservation() {},
    viewDineInList() {},
    ...mapActions([
      "setOperator",
      "setApp",
      "setOrder",
      "resetOrder",
      "setTicket",
      "resetTable",
      "setViewOrder",
      "setViewTable"
    ])
  }
};
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: row;
  height: 771px;
  width: 1024px;
  padding-top: 63px;
  background: url(../../assets/image/floor.png) #ebeff1;
}

.layout {
  width: 740px;
  display: flex;
}

.column {
  display: flex;
  flex-direction: column;
}

aside {
  padding: 5px;
  height: 733px;
}

.sections {
  text-align: center;
  flex: 1;
}

.grid {
  padding: 3px 3px 0;
}

.view {
  padding: 3px 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  height: 737px;
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

.placed .icon {
  color: #f25e31;
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

.reserved .icon:after {
  content: "\f073";
  color: #009688;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
}
</style>