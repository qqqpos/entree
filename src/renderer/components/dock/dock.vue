<template>
  <div>
    <transition name="slideDown" appear>
        <header class="dock">
          <div class="ticket-number text">{{ticket.number}}</div>
          <div class="ticket-type" @click="changeType">{{orderType}}</div>
          <div class="trademark">
            <span v-show="isTrademarkVisible">{{order.source}}</span>
            <!-- <span class="waterMark" v-show="$route.name === 'Menu' && order.hasOwnProperty('__vip__')">VIP</span> -->
          </div>
          <div class="center-wrap text" @click="editProfile">
            <div class="customer" v-show="isMenuPage">
              <span v-show="customer.phone">{{customer.phone | phone}}</span>
              <span v-show="customer.address">{{customer.address}}</span>
            </div>
          </div>
          <div class="profile" v-show="isMenuPage" @click="openPortal">
            <i class="fa fa-address-book"></i>
            <span v-if="customer.name" class="text">{{customer.name}}</span>
            <span v-else>{{$t('text.viewProfile')}}</span>
          </div>
          <div class="operator text" @click="initialPanel">
            <i class="fas fa-user-tie"></i>
            <span>{{op.name}}</span>
          </div>
          <div class="misc">
            <div class="status" v-if="$route.name === 'Dashboard'">
              <i class="fa fa-phone-square" :class="{off:!device.callid}"></i>
              <i class="fa fa-credit-card" :class="{off:!device.terminal}"></i>
              <i class="fa fa-desktop" :class="{off:!device.poleDisplay}"></i>
              <i class="fa fa-globe" :class="{off:!device.online}"></i>
              <i class="fa fa-sitemap" :class="{off:!app.database}"></i>
            </div>
            <div class="clock" v-else>
              <span class="time text">{{time | moment('hh:mm')}}</span>
              <span class="shift">{{time | moment('A')}}</span>
            </div>
          </div>
        </header>
    </transition>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import offlineModule from "./component/offline";
import portalModule from "./component/portal";
import callerModule from "./component/caller";
import dialogModule from "../common/dialog";
import profiles from "./profiles";
import switcher from "./switcher";

export default {
  components: {
    offlineModule,
    callerModule,
    portalModule,
    dialogModule,
    switcher,
    profiles
  },
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  computed: {
    isMenuPage() {
      return this.$route.name === "Menu";
    },
    isTrademarkVisible() {
      return this.isMenuPage && this.order.source !== "POS";
    },
    orderType() {
      if (this.isMenuPage) {
        let type = "type." + this.order.type;

        return this.order.type === "DINE_IN" || this.order.type === "BAR"
          ? this.$t(type, this.app.language) +
              (this.order.table
                ? " - " +
                  this.order.table +
                  (this.order.guest > 0 ? " - " + this.order.guest : "")
                : "")
          : this.$t(type, this.app.language);
      } else {
        return this.$t("type." + this.ticket.type, this.app.language);
      }
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
            this.$open("callerModule", { customer });
          })
        : this.exitComponent();
    },
    time(tick) {
      this.app.autoLock &&
        this.$route.name !== "Lock" &&
        this.sessionTimeout(tick);
      this.spooler.length > 0 &&
        tick > this.spooler[0].schedule &&
        this.printFromSpooler(0);
    }
  },
  methods: {
    initialPanel() {
      if (this.$route.name === "Dashboard") {
        switch (this.op.cashCtrl) {
          case "enable":
            this.station.cashDrawer.enable
              ? this.checkCashIn(this.station.cashDrawer.name).then(deposit =>
                  this.openPanel({ cashCtrl: true, staffBank: false, deposit })
                )
              : this.openPanel({
                  cashCtrl: false,
                  staffBank: false,
                  deposit: false
                });

            break;
          case "staffBank":
            this.checkCashIn(this.op.name).then(deposit =>
              this.openPanel({ cashCtrl: true, staffBank: true, deposit })
            );
            break;
          case "disable":
            this.openPanel({ cashCtrl: false });
        }
      }
    },
    checkCashIn(cashDrawer) {
      return new Promise(resolve => {
        this.$socket.emit(
          "[CASHFLOW] CHECK",
          { date: today(), cashDrawer, close: false },
          ({ name, deposit }) => resolve(deposit)
        );
      });
    },
    openPanel(args) {
      this.$bus.emit("__THREAD__OPEN", { component: "dockMenu", args });
    },
    changeType() {
      this.$route.name === "Menu" && this.$open("switcher");
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
            this.exitComponent();
            this.doubleCheck();
            this.resetAll();
            this.$router.push({ path: "/main/lock" });
          })
          .catch(() => {
            this.exitComponent();
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
        this.$socket.emit("[INVOICE] UPDATE", this.order);
      }
    },
    printFromSpooler(i) {
      const { target = "All" } = this.spooler[i];
      const { _id } = this.spooler[i].order;

      let items = [];

      this.spooler[i].order.content.forEach(({ unique }) => items.push(unique));
      Printer.setTarget(target).print(this.spooler[0].order);
      this.removeSpooler(i);

      let index = this.history.findIndex(order => order._id === _id);

      if (index !== -1) {
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

        this.$socket.emit("[INVOICE] UPDATE", order);
      }
    },
    editProfile() {
      if (this.$route.name !== "Menu") return;

      this.$socket.emit("[CUSTOMER] PROFILE", this.customer._id, customer => {
        customer
          ? this.$open("profiles", { customer })
          : this.$open("profiles", { customer: this.customer });
      });
    },
    openPortal() {
      if (this.$route.name !== "Menu") return;
      this.customer._id
        ? this.$socket.emit("[CUSTOMER] HISTORY", this.customer._id, invoices =>
            this.$open("portalModule", { invoices })
          )
        : this.$open("portalModule", { invoices: [] });
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
      "setCurrentTable",
      "setReservation",
      "setLastSync"
    ])
  },
  sockets: {
    connect() {
      this.component === "offlineModule" && this.exitComponent();
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
      this.app.newTicket && this.setTicket({ number });
    },
    UPDATE_CONFIG({ target, data }) {
      Object.assign(this.config, { [target]: data });
    },
    UPDATE_STATION(data) {
      Object.assign(this.station, data);
      Printer.initial(CLODOP, this.config, data);
    },
    UPDATE_TABLE_STATUS(data) {
      this.updateTable(data);
      data.assign && this.setCurrentTable(data.table);
    },
    INSERT_ORDER(data) {
      data.refresh = this.$route.name !== "Menu";
      this.insertOrder(data);
    },
    UPDATE_ORDER(data) {
      if (data.order.date === today()) {
        data.refresh = this.$route.name !== "Menu";
        this.updateOrder(data);
      }
    },
    MENU_ITEM_UPDATE({ action, item, sequence }) {
      switch (action) {
        case "update":
          this.updateMenuItem({ item, sequence });
          break;
        case "remove":
          this.removeMenuItem(sequence);
          break;
      }
    },
    SHUTDOWN() {
      this.$electron.ipcRenderer.send("Shutdown");
    },
    disconnect() {
      this.setApp({ database: false });
      this.$open("offlineModule");
    },
    SYNC_ORDERS: "setTodayOrder",
    SYNC_TABLES: "syncTables",
    SYNC_RESERVATIONS: "setReservation",
    MENU_CATEGORY_UPDATE: "updateMenuCategory",
    REQUEST_CATEGORY_UPDATE: "updateRequestCategory",
    REQUEST_ACTION_UPDATE: "updateRequestAction",
    REQUEST_ITEM_UPDATE: "updateRequestItem",
    REQUEST_ITEM_REMOVE: "removeRequestItem",
    REPLACE_MENU: "replaceMenu",
    UPDATE_TABLE_SECTION: "updateTableSection",
    REPLACE_TABLE: "replaceTable",
    TEMPORARY_TABLE: "setTemporaryTable",
    NEW_RESERVATION: "newReservation",
    UPDATE_RESERVATION: "updateReservation",
    REPLACE_TEMPLATE: "setTemplates"
  }
};
</script>