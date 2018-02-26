<template>
  <transition name="slideDown" appear>
    <header class="dock">
      <span class="number">{{ticket.number}}</span>
      <span class="type" v-show="ticket.type" @click="changeType">{{type}}</span>
      <span class="waterMark" v-show="$route.name === 'Menu' && order.source !== 'POS'">{{order.source}}</span>
      <span class="waterMark" v-show="$route.name === 'Menu' && order.hasOwnProperty('__vip__')">VIP</span>
      <div class="reward" v-if="config.store.reward"></div>
      <div class="info">
        <div class="customer" v-if="$route.name === 'Menu'" @click="editProfile">
          <span v-show="customer.phone">{{customer.phone | phone}}</span>
          <span v-show="customer.address">{{customer.address}}</span>
          <span v-show="customer.name">{{customer.name}}</span>
        </div>
      </div>
      <div class="op" @click="openPanel" v-show="op._id">
        <i class="fa fa-user-circle"></i>
        <span>{{op.name}}</span>
      </div>
      <div class="misc">
        <div class="status" v-if="$route.name === 'Dashboard'">
          <i class="fa fa-phone-square" :class="{na:!device.callid}"></i>
          <i class="fa fa-credit-card" :class="{na:!device.terminal}"></i>
          <i class="fa fa-desktop" :class="{na:!device.poleDisplay}"></i>
          <i class="fa fa-print spooler" v-show="spooler.length > 0" @click="messageCenter(true)"></i>
          <i class="fa fa-globe" :class="{na:!device.online}"></i>
          <i class="fa fa-sitemap" :class="{na:!app.database}"></i>
        </div>
        <div class="clock" v-else>
          <span class="time">{{time | moment('hh:mm')}}</span>
          <span class="shift">{{time | moment('a')}}</span>
        </div>
      </div>
      <div :is="component" :init="componentData"></div>
    </header>
  </transition>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dialoger from "../common/dialoger";
import { ipcRenderer } from "electron";
import messenger from "./messenger";
import profiles from "./profiles";
import switcher from "./switcher";
import caller from "./caller";
import panel from "./panel";
import disc from "./disc";
export default {
  components: { caller, switcher, dialoger, panel, disc, messenger, profiles },
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  computed: {
    type() {
      let type = this.order.type
        ? "type." + this.order.type
        : "type." + this.ticket.type;

      return this.ticket.type === "DINE_IN"
        ? this.$t(type, this.app.language) +
            (this.order.table
              ? " - " +
                this.order.table +
                (this.order.guest > 0 ? " - " + this.order.guest : "")
              : "")
        : this.$t(type, this.app.language);
    },
    ...mapGetters([
      "op",
      "app",
      "time",
      "ring",
      "order",
      "config",
      "ticket",
      "device",
      "history",
      "station",
      "spooler",
      "customer",
      "language",
      "currentTable"
    ])
  },
  watch: {
    ring(caller) {
      caller
        ? this.$socket.emit("[PHONE] RING", caller, customer => {
            this.newPhoneCall(customer);
            this.$p("caller", { customer });
          })
        : this.$q();
    },
    time(tick) {
      this.app.autoLock &&
        this.$route.name !== "Lock" &&
        this.sessionTimeout(tick);
      this.spooler.length > 0 &&
        tick > this.spooler[0].delay &&
        this.printFromSpooler(0);
    }
  },
  methods: {
    openPanel() {
      this.$route.name === "Dashboard" && this.$p("panel");
    },
    messageCenter(view) {
      this.$route.name === "Dashboard" && this.$p("messenger", { view });
    },
    changeType() {
      this.$route.name === "Menu" && this.$p("switcher");
    },
    sessionTimeout(current) {
      const { enable, timeout } = this.station.autoLock;

      if (!enable) return;

      const lapse = Math.round((current - this.app.lastActivity) / 1000);

      if (lapse >= timeout) {
        const prompt = {
          title: "dialog.autoLock",
          msg: ["dialog.autoLockTip", timeout],
          timeout: { fn: "resolve", duration: 10000 },
          buttons: [{ text: "button.extend", fn: "reject" }]
        };

        this.setApp({ autoLock: false });
        this.$dialog(prompt)
          .then(() => {
            this.$q();
            this.doubleCheck();
            this.resetAll();
            this.$router.push({ path: "/main/lock" });
          })
          .catch(() => {
            this.$q();
            this.setApp({ lastActivity: +new Date(), autoLock: true });
          });
      }
    },
    doubleCheck() {
      if (this.$route.name === "Menu" && this.order.type === "DINE_IN") {
        const { _id } = this.currentTable;
        this.app.newTicket && this.$socket.emit("[TABLE] RESET", { _id });
      }

      if (this.order.pending) {
        Object.assign(this.order, { pending: false });
        this.$socket.emit("[UPDATE] INVOICE", this.order);
      }
    },
    printFromSpooler(i) {
      let _id = this.spooler[i]._id;
      let items = [];
      this.spooler[i].content.forEach(item => {
        items.push(item.unique);
      });
      Printer.setTarget("Order").print(this.spooler[0]);
      this.removeSpooler(i);
      let index = this.history.findIndex(order => order._id === _id);
      let order = Object.assign({}, this.history[index]);
      items.forEach(unique => {
        for (let i = 0; i < order.content.length; i++) {
          if (order.content[i].unique === unique) {
            order.content[i].print = true;
            order.content[i].pending = false;
            break;
          }
        }
      });

      this.$socket.emit("[UPDATE] INVOICE", order);
    },
    editProfile() {
      this.$route.name === "Menu" &&
        this.$socket.emit("[CUSTOMER] PROFILE", this.customer._id, customer =>
          this.$p("profiles", { customer })
        );

      //this.$router.push({ name: "Information" });
    },
    ...mapActions([
      "setApp",
      "resetAll",
      "setTicket",
      "syncTables",
      "updateTable",
      "insertOrder",
      "updateOrder",
      "newPhoneCall",
      "removeSpooler",
      "setTodayOrder",
      "setTemplates",
      "updateRequestCategory",
      "updateRequestAction",
      "updateRequestItem",
      "removeRequestItem",
      "updateMenuCategory",
      "replaceMenu",
      "updateMenuItem",
      "removeMenuItem",
      "updateTableSection",
      "replaceTable",
      "setTemporaryTable",
      "newReservation",
      "updateReservation",
      "resetCurrentTable",
      "setReservation",
      "setLastSync"
    ])
  },
  sockets: {
    connect() {
      this.component === "disc" && this.$q();
      this.setApp({ database: true });

      this.station &&
        this.$socket.emit("[STATION] RECONNECTED", {
          alias: this.station.alias,
          mac: this.station.mac,
          operator: this.op.name
        });

      this.$socket.emit("[SYNC] ORDER_LIST");
      this.$socket.emit("[SYNC] TABLE_LIST");
      this.$socket.emit("[INQUIRY] TICKET_NUMBER", number =>
        this.setTicket({ number })
      );
    },
    TICKET_NUMBER(number) {
      this.app.mode !== "edit" && this.setTicket({ number });
    },
    UPDATE_CONFIG(update) {
      const { target, data } = update;
      Object.assign(this.config, { [target]: data });
    },
    UPDATE_STATION(data) {
      Object.assign(this.station, data);
      Printer.initial(CLODOP, this.config, data);
    },
    UPDATE_TABLE_STATUS(data) {
      console.log(data);
      this.updateTable(data);
    },
    INSERT_ORDER(data) {
      data.refresh = this.$route.name !== "Menu";
      this.insertOrder(data);
    },
    UPDATE_ORDER(data) {
      console.log(data);
      data.refresh = this.$route.name !== "Menu";
      this.updateOrder(data);
    },
    SYNC_ORDERS(data) {
      this.setTodayOrder(data);
    },
    SYNC_TABLES(data) {
      this.syncTables(data);
    },
    MENU_CATEGORY_UPDATE(data) {
      this.updateMenuCategory(data);
    },
    REQUEST_CATEGORY_UPDATE(data) {
      this.updateRequestCategory(data);
    },
    REQUEST_ACTION_UPDATE(data) {
      this.updateRequestAction(data);
    },
    REQUEST_ITEM_UPDATE(data) {
      this.updateRequestItem(data);
    },
    MENU_ITEM_UPDATE(data) {
      const { action, item, sequence } = data;
      switch (action) {
        case "update":
          this.updateMenuItem({ item, sequence });
          break;
        case "remove":
          this.removeMenuItem(sequence);
          break;
      }
    },
    REQUEST_ITEM_REMOVE(data) {
      this.removeRequestItem(data);
    },
    REPLACE_MENU(data) {
      this.replaceMenu(data);
    },
    UPDATE_TABLE_SECTION(data) {
      this.updateTableSection(data);
    },
    REPLACE_TABLE(data) {
      this.replaceTable(data);
    },
    TEMPORARY_TABLE(data) {
      this.setTemporaryTable(data);
    },
    NEW_RESERVATION(data) {
      this.newReservation(data);
    },
    UPDATE_RESERVATION(data) {
      this.updateReservation(data);
    },
    SYNC_RESERVATIONS(data) {
      this.setReservation(data);
    },
    REPLACE_TEMPLATE(data) {
      this.setTemplates(data);
    },
    SHUTDOWN() {
      ipcRenderer.send("Shutdown");
    },
    disconnect() {
      this.setApp({ database: false });
      this.$p("disc");
    }
  }
};
</script>