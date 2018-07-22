<template>
  <div class="menu">
    <section class="category">
      <div v-for="(category,index) in layouts.menu" @click="categoryIndex = index" :key="index">{{category[language]}}</div>
    </section>
    <section class="items" v-if="config.display.menuID">
      <div v-for="(item,index) in page" @click="pick(item)" :class="{disable:!item._id,like:item.like}" :key="index" :data-menuID="item.menuID">{{item[language]}}</div>
      <div @click="itemPage = 0" v-if="items.length >= 34" class="pageButton">{{$t("button.firstPage")}}</div>
      <div @click="itemPage = 1" v-if="items.length >= 34" class="pageButton">{{$t("button.secondPage")}}</div>
      <div @click="itemPage = 2" v-if="items.length >= 34" class="pageButton">{{$t("button.thirdPage")}}</div>
    </section>
    <section class="items" v-else>
      <div v-for="(item,index) in page" @click="pick(item)" :class="{disable:!item._id,like:item.like}" :key="index">{{item[language]}}</div>
      <div @click="itemPage = 0" v-if="items.length >= 34" class="pageButton">{{$t("button.firstPage")}}</div>
      <div @click="itemPage = 1" v-if="items.length >= 34" class="pageButton">{{$t("button.secondPage")}}</div>
      <div @click="itemPage = 2" v-if="items.length >= 34" class="pageButton">{{$t("button.thirdPage")}}</div>
    </section>
    <section class="sides">
      <div v-for="(side,index) in sides" @click="setOperatortion(side,index)" :key="index">{{side[language]}}</div>
    </section>
    <section class="cart">
      <order-list layout="order" :seats="seats" @update="setSeat"></order-list>
      <query-bar :query="buffer" :items="queriedItems"></query-bar>
      <buttons :layout="ticket.type" @open="open"></buttons>
    </section>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import buttons from "./buttons";
import Holiday from "moment-holiday";
import modify from "./component/modify";
import request from "./component/request";
import weightItem from "./component/scale";
import queryBar from "./component/queryBar";
import orderList from "../common/orderList";
import dialogModule from "../common/dialog";
import templateItem from "./component/templateItem";
import temporaryItem from "./component/temporaryItem";

export default {
  components: {
    dialogModule,
    templateItem,
    temporaryItem,
    modify,
    request,
    buttons,
    queryBar,
    orderList,
    weightItem
  },
  computed: {
    page() {
      if (this.items.length > 33) {
        const min = this.itemPage * 30;
        const max = min + 30;

        return this.items.slice(min, max);
      }
      return this.items;
    },
    ...mapGetters([
      "op",
      "app",
      "tax",
      "menu",
      "item",
      "order",
      "sides",
      "layouts",
      "device",
      "config",
      "ticket",
      "dinein",
      "station",
      "language",
      "customer",
      "favorites",
      "table",
      "archivedOrder"
    ])
  },
  data() {
    return {
      menuInstance: null,
      componentData: null,
      categoryIndex: 0,
      component: null,
      queriedItems: [],
      buffer: "",
      itemPage: 0,
      items: [],
      seats: [],
      seat: 0
    };
  },
  created() {
    this.initialData();

    if (this.archivedOrder) {
      const { session, table, tableID } = this.order;
      //this.setApp({ newTicket: false });
      this.createOrderInstance(this.archivedOrder);
      this.setOrder({ ...this.archivedOrder, session, table, tableID });
      this.emptyArchiveOrder();
    }

    this.$socket.emit(
      "[ORDER] QUERY_TICKET_NUMBER",
      number => this.app.newTicket && this.setTicket({ number })
    );

    this.resetPointer();
    window.addEventListener("keydown", this.entry, false);
    this.$electron.ipcRenderer.send("External::stage", "order");
  },
  mounted() {
    toggleClass(".category div", "active");
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.entry, false);
  },
  methods: {
    initialData() {
      console.time("performance");
      this.getItems(this.layouts.menu[0].contain);
      this.setSides(this.fillOption([]));

      if (this.order.hasOwnProperty("seats")) {
        this.seats = this.order.seats.map(seat => seat.name);
        this.seat = this.seats[0];
      }

      if (this.app.newTicket) {
        !this.order.hasOwnProperty("source") &&
          Object.assign(this.order, { source: "POS" });

        const plasticBag =
          this.order.type !== "DINE_IN" &&
          this.order.type !== "BAR" &&
          this.order.type !== "HIBACHI"
            ? 1
            : 0;

        this.setOrder({
          _id: ObjectId().toString(),
          server: this.op.name,
          station: this.station.alias,
          type: this.ticket.type,
          number: this.ticket.number,
          date: today(),
          create: Date.now(),
          customer: this.customer,
          plasticBag,
          taxFree:
            typeof this.tax.defaultTaxFree === "boolean"
              ? this.tax.defaultTaxFree
              : false
        });
      } else {
        const order = JSON.parse(JSON.stringify(this.order));
        this.createOrderInstance(order);
        this.setOrder(order);
      }

      console.timeEnd("performance");
    },
    entry(e) {
      const disable = document.querySelector("div.popupMask");
      if (disable) return;

      switch (e.key) {
        case "Escape":
          this.buffer = "";
          this.queriedItems = [];
          break;
        case "Enter":
          this.buffer &&
            this.$socket.emit("[QUERY] ITEM", this.buffer, items => {
              if (items.length === 1) {
                this.pick(items[0]);
                this.buffer = "";
                this.queriedItems = [];
              } else {
                this.queriedItems = items;
              }
            });
          break;
        case "Backspace":
        case "Delete":
          this.buffer = this.buffer.slice(0, -1);
          break;
        case "+":
          if (this.buffer) return;
          this.moreQty();
          break;
        case "-":
          if (this.buffer) return;
          this.lessQty();
          break;
        default:
          if (this.queriedItems.length > 1) {
            if (isNumber(e.key) && this.queriedItems[e.key - 1]) {
              this.pick(this.queriedItems[e.key - 1]);
              this.queriedItems = [];
              this.buffer = "";
            }
          } else {
            if (/[a-z0-9]/i.test(e.key) && e.key.length === 1)
              this.buffer += e.key;
          }
      }
    },
    getItems(contain) {
      console.time("Flatten");
      let menu = [];
      contain.forEach(category => {
        let items = this.menu[category].map(item => {
          if (this.favorites.includes(item._id)) {
            item = clone(item);
            item.like = true;
          }

          return item;
        });

        let align = 6 - items.length % 3;
        if (align === 6) align = 3;

        Array(align)
          .fill()
          .forEach(() => items.push({ zhCN: "", usEN: "" }));

        menu.push(...items);
      });

      while (33 - menu.length % 33 !== 33) {
        const fill = 33 - menu.length % 33;

        Array(fill)
          .fill()
          .forEach(() => menu.push({ zhCN: "", usEN: "" }));
      }
      this.items = menu;
      console.timeEnd("Flatten");
    },
    fillOption(side) {
      const length = side.length;
      let array = side.slice();

      Array(11 - length)
        .fill()
        .forEach(() => array.push({ usEN: "", zhCN: "", disable: true }));

      return array;
    },
    poleDisplay(top, bot) {
      if (this.device.poleDisplay) {
        poleDisplay.write("\f");
        poleDisplay.write(line(top, bot));
      }
    },
    setCategory(index = this.categoryIndex) {
      toggleClass(".category .active", "active");
      document
        .querySelectorAll("section.category div")
        [index].classList.add("active");

      this.itemPage = 0;
      this.categoryIndex = index;
      this.getItems(this.layouts.menu[index].contain);
    },
    pick(item) {
      item = JSON.parse(JSON.stringify(item));
      !this.app.newTicket && Object.assign(item, { new: true });

      this.checkItemAvailable(item)
        .then(this.checkAllergy)
        .then(this.conditionalPrice)
        .then(this.checkOption)
        .then(this.checkItemType)
        .then(this.addToOrder)
        .catch(this.specialItemHandler.bind(null, item));
    },
    checkItemAvailable(item) {
      return new Promise((next, stop) => {
        if (item.disable) {
          stop("unavailable");
        } else if (item.restrict) {
          const { from, to, days, types, holiday = true } = item.restrict;
          const day = moment().format("d");

          if (!types.includes(this.order.type)) {
            stop("typeRestricted");
          } else if (!days.includes(day)) {
            stop("dayRestricted");
          } else if (holiday && !Holiday().isHoliday()) {
            stop("holidayRestricted");
          } else {
            const time = moment(this.order.create);
            const _from = moment(
              new Date(moment().format("YYYY-MM-DD ") + from)
            );
            const _to = moment(new Date(moment().format("YYYY-MM-DD ") + to));
            time.isBetween(_from, _to) ? next(item) : stop("timeRestricted");
          }
        } else {
          next(item);
        }
      });
    },
    checkAllergy(item) {
      return new Promise((next, stop) => {
        if (
          this.customer.hasOwnProperty("allergy") &&
          item.hasOwnProperty("allergy")
        ) {
          const allergies = this.customer.allergy.filter(allergy =>
            item.allergy.includes(allergy)
          );
          if (allergies.length > 0) {
            const allergen = allergies
              .map(text => this.$t("allergy." + text))
              .join(", ");

            const prompt = {
              type: "warning",
              title: "dialog.allergyAlert",
              msg: ["dialog.foodAllergyFrom", allergen],
              buttons: [
                { text: "button.cancel", fn: "reject" },
                { text: "button.processAnyway", fn: "resolve" }
              ]
            };

            this.$dialog(prompt)
              .then(() => {
                next(item);
                this.exitComponent();
              })
              .catch(() => stop("foodAllergy"));
          } else {
            next(item);
          }
        } else {
          next(item);
        }
      });
    },
    checkOption(item) {
      return new Promise(next => {
        // assign seats to items
        this.seats.length > 0 && Object.assign(item, { seat: this.seat });

        item.option && this.setSides(this.fillOption(item.option));

        // initial item params
        Object.assign(item, { choiceSet: [], side: {}, sideIndex: 0 });

        if (item.manual) {
          // item is manual select side option skip
          item.sideIndex = null;
          next(item);
        } else {
          const { option } = item;

          if (option && option.length) {
            const {
              zhCN = "",
              usEN = "",
              ignore = false,
              sub = false,
              replace = false
            } = option[0];

            if (replace) {
              Object.assign(item, { zhCN, usEN });
              next(item);
            } else {
              if (!ignore) {
                if (sub) {
                  const choiceSet = [
                    {
                      zhCN,
                      usEN,
                      qty: 1,
                      single: 0,
                      price: 0,
                      unique: String().random()
                    }
                  ];

                  item = Object.assign(item, { choiceSet });
                } else {
                  Object.assign(item, {
                    side: { zhCN: `[${zhCN}]`, usEN: `[${usEN}]` }
                  });
                }
              }
              next(item);
            }
          } else {
            next(item);
          }
        }
      });
    },
    checkItemType(item) {
      return new Promise((next, stop) => {
        const { option, manual = false } = item;

        if (item.temporary) stop("openFood");
        if (item.marketPrice) stop("marketPrice");
        if (item.weightItem && item.weightItem.enable) stop("weightFood");

        if (!manual && option[0]) {
          option[0].template ? stop("template") : next(item);
        }

        if (Array.isArray(item.preset) && item.preset.length) {
          item.choiceSet = item.preset.map(set => ({
            qty: set.qty,
            zhCN: set.zhCN,
            usEN: set.usEN,
            single: set.price,
            price: set.price
          }));
        }

        try {
          this.poleDisplay(item.usEN, `$ ${item.price[0].toFixed(2)}`);
        } catch (e) {
          console.log(e);
        }

        next(item);
      });
    },
    conditionalPrice(item) {
      return new Promise((next, stop) => {
        const type = this.order.type || this.ticket.type;

        if (item.hasOwnProperty("prices")) {
          if (this.order.source !== "POS" && item.prices.THIRD) {
            Object.assign(item, { price: item.prices.THIRD.split(",") });
          } else if (item.prices.hasOwnProperty(type)) {
            Object.assign(item, { price: item.prices[type].split(",") });
          }
        }

        next(item);
      });
    },
    specialItemHandler(item, type, index) {
      index = index || 0;
      let name;

      switch (type) {
        case "openFood":
          this.$open("temporaryItem", { item });
          break;
        case "marketPrice":
          this.$open("modify", { item, marketPrice: true });
          break;
        case "weightFood":
          this.$open("weightItem", { item });
          break;
        case "template":
          item ? this.addToOrder(item) : (item = this.item);
          this.$open("templateItem", { side: item.option[index], item, index });
          break;
        case "dayRestricted":
        case "timeRestricted":
        case "typeRestricted":
        case "holidayRestricted":
          name =
            item[this.language].length > 15
              ? item[this.language].slice(0, 15) + "..."
              : item[this.language];

          const prompt = {
            title: ["dialog.itemRestricted", name],
            msg:
              type === "dayRestricted"
                ? ["dialog.itemNotAvailable", moment().format("dddd")]
                : type === "timeRestricted"
                  ? [
                      "dialog.itemNotAvailableNow",
                      item.restrict.from,
                      item.restrict.to
                    ]
                  : type === "holidayRestricted"
                    ? "dialog.holidayOnly"
                    : [
                        "dialog.itemNotAvailable",
                        this.$t("type." + this.order.type)
                      ],
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          this.$dialog(prompt).then(this.exitComponent);
          break;
        default:
          this.exitComponent();
      }
    },
    setOperatortion(side, index) {
      const { skip, ignore } = side;

      side.template && this.specialItemHandler(null, "template", index);

      (!skip || !ignore) &&
        this.alterItemOption({
          side,
          index,
          function: !!side.template
        });
    },
    setSeat(seat) {
      this.seat = seat;
    },
    open(component) {
      switch (component) {
        case "request":
          this.component = this.component === "request" ? null : "request";
          break;
      }
    },
    ...mapActions([
      "setApp",
      "lessQty",
      "moreQty",
      "setOrder",
      "setSides",
      "setTicket",
      "addToOrder",
      "resetPointer",
      "setChoiceSet",
      "archiveOrder",
      "alertChoiceSet",
      "alterItemOption",
      "emptyArchiveOrder",
      "createOrderInstance"
    ])
  },
  watch: {
    categoryIndex(index) {
      this.setCategory(index);
    }
  }
};
</script>