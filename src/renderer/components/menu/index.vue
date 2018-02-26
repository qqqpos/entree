<template>
  <div class="menu">
    <section class="category">
      <div v-for="(category,index) in menu" @click="categoryIndex = index" :key="index">{{category[language]}}</div>
    </section>
    <section class="items" v-if="config.display.menuID" :class="{sub:openSubGroup}">
      <div v-for="(item,index) in page" @click="pick(item)" :class="{disable:!item.clickable,like:item.like}" :key="index" :data-menuID="item.menuID">{{item[language]}}</div>
      <div @click="itemPage = 0" v-if="items.length >= 34" class="pageButton">{{$t("button.firstPage")}}</div>
      <div @click="itemPage = 1" v-if="items.length >= 34" class="pageButton">{{$t("button.secondPage")}}</div>
      <div @click="itemPage = 2" v-if="items.length >= 34" class="pageButton">{{$t("button.thirdPage")}}</div>
    </section>
    <section class="items" v-else :class="{sub:openSubGroup}">
      <div v-for="(item,index) in page" @click="pick(item)" :class="{disable:!item.clickable,like:item.like}" :key="index">{{item[language]}}</div>
      <div @click="itemPage = 0" v-if="items.length >= 34" class="pageButton">{{$t("button.firstPage")}}</div>
      <div @click="itemPage = 1" v-if="items.length >= 34" class="pageButton">{{$t("button.secondPage")}}</div>
      <div @click="itemPage = 2" v-if="items.length >= 34" class="pageButton">{{$t("button.thirdPage")}}</div>
    </section>
    <section class="sides">
      <div v-for="(side,index) in sides" @click="setOption(side,index)" :key="index">{{side[language]}}</div>
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
import modify from "./component/modify";
import request from "./component/request";
import dialoger from "../common/dialoger";
import queryBar from "./component/queryBar";
import orderList from "../common/orderList";
import weightItem from "./component/weightScale";
import templateItem from "./component/templateItem";
import temporaryItem from "./component/temporaryItem";

export default {
  components: {
    modify,
    request,
    buttons,
    dialoger,
    queryBar,
    orderList,
    weightItem,
    templateItem,
    temporaryItem
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
      "device",
      "config",
      "order",
      "ticket",
      "sides",
      "dinein",
      "submenu",
      "station",
      "language",
      "customer",
      "favorites",
      "currentTable"
    ])
  },
  data() {
    return {
      menuInstance: null,
      componentData: null,
      openSubGroup: false,
      categoryIndex: 0,
      component: null,
      saveItems: null,
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

    this.$socket.emit("[INQUIRY] TICKET_NUMBER", number => {
      ``;
      if (this.app.newTicket) {
        this.setTicket({ number });
        this.$log({
          eventID: 4000,
          data: this.order._id,
          note: `Initial create #${number} invoice for ${this.ticket.type
            .replace("_", " ")
            .toCapitalCase()}.`
        });
      } else {
        this.$log({
          eventID: 4005,
          data: this.order._id,
          note: `Edit #${this.order.number} invoice.`
        });
      }
    });
    this.resetPointer();
    window.addEventListener("keydown", this.entry, false);
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
      this.menuInstance = clone(this.menu);
      this.flatten(this.menuInstance[0].item);
      this.setSides(this.fillOption([]));

      if (this.order.hasOwnProperty("seats")) {
        this.seats = this.order.seats.map(seat => seat.name);
        this.seat = this.seats[0];
      }

      if (this.app.newTicket) {
        !this.order.hasOwnProperty("source") &&
          Object.assign(this.order, { source: "POS" });

        this.setOrder({
          _id: ObjectId(),
          server: this.op.name,
          station: this.station.alias,
          type: this.ticket.type,
          number: this.ticket.number,
          date: today(),
          customer: this.customer,
          taxFree:
            typeof this.tax.defaultTaxFree === "boolean"
              ? this.tax.defaultTaxFree
              : false
        });
      } else {
        const order = JSON.parse(JSON.stringify(this.order));
        this.saveForDiffs(order.content);
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
    flatten(items) {
      console.time("Flatten");
      items = [].concat.apply([], items);

      const { favorite } = this.config.display;

      if (favorite) {
        const food = this.favorites;
        if (food.length)
          items = items.map(item => {
            if (food.includes(item._id)) {
              item = clone(item);
              item.like = true;
            }
            return item;
          });
      }

      items.forEach(item => {
        if (item.disable) item.clickable = false;
      });

      this.items = items;
      console.timeEnd("Flatten");
    },
    fillOption(side) {
      const length = side.length;
      let array = side.slice();

      Array(11 - length)
        .fill()
        .forEach(() => {
          array.push({
            usEN: "",
            zhCN: "",
            clickable: false,
            disable: true
          });
        });

      return array;
    },
    poleDisplay(top, bot) {
      if (this.device.poleDisplay) {
        poleDisplay.write("\f");
        poleDisplay.write(line(top, bot));
      }
    },
    setCategory(index = this.categoryIndex) {
      this.openSubGroup = false;
      toggleClass(".category .active", "active");
      document
        .querySelectorAll("section.category div")
        [index].classList.add("active");

      this.itemPage = 0;
      this.saveItems = null;
      this.categoryIndex = index;
      this.flatten(this.menuInstance[index].item);
    },
    pick(item) {
      item = JSON.parse(JSON.stringify(item));
      !this.app.newTicket && Object.assign(item, { new: true });

      this.checkItemAvailable(item)
        .then(this.checkOption)
        .then(this.checkItemType)
        .then(this.addToOrder)
        .catch(this.specialItemHandler.bind(null, item));
    },
    checkItemAvailable(item) {
      return new Promise((next, stop) => {
        if (item.hasOwnProperty("clickable") && !item.clickable) {
          stop("unavailable");
        } else {
          next(item);
        }
      });
    },
    checkOption(item) {
      return new Promise((next, stop) => {
        this.seats.length > 0 && Object.assign(item, { seat: this.seat });

        item.option && this.setSides(this.fillOption(item.option));
        Object.assign(item, { side: {} });

        if (item.manual) {
          next(item);
        } else {
          const { option } = item;

          if (option && option.length) {
            const { zhCN = "", usEN = "", ignore } = option[0];
            const replace = option[0].hasOwnProperty("replace")
              ? option[0].replace
              : option[0].overWrite;

            if (replace) {
              Object.assign(item, { zhCN, usEN });
              next(item);
            } else {
              !ignore &&
                Object.assign(item, {
                  side: { zhCN: `[${zhCN}]`, usEN: `[${usEN}]` }
                });
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
        const { option, manual = false, subItem = false } = item;

        if (item.temporary) stop("openFood");
        if (item.marketPrice) stop("marketPrice");
        if (item.weightItem && item.weightItem.enable) stop("weightFood");

        if (subItem) {
          this.addSubMenuItem(item);
          stop();
        }

        if (!manual && option[0]) {
          option[0].template && this.config.display.autoTemplate
            ? stop("template")
            : next(item);
          if (option[0].subMenu) stop("subMenu");
        }

        if (item.preset) {
          item.choiceSet = item.preset.map(set => ({
            qty: set.qty,
            zhCN: set.zhCN,
            usEN: set.usEN,
            single: set.price,
            price: set.price
          }));
        }

        next(item);
      });
    },
    specialItemHandler(item, type, index) {
      index = index || 0;

      switch (type) {
        case "openFood":
          this.$p("temporaryItem", { item });
          break;
        case "marketPrice":
          this.$p("modify", { item, marketPrice: true });
          break;
        case "weightFood":
          this.$p("weightItem", { item });
          break;
        case "subMenu":
          item ? this.addToOrder(item) : (item = this.item);
          const { subMenu, maxSubItem, overCharge } = item.option[index];
          Object.assign(this.item, { rules: { maxSubItem, overCharge } });
          this.getSubMenuItem(subMenu);
          break;
        case "template":
          item ? this.addToOrder(item) : (item = this.item);
          this.$p("templateItem", { side: item.option[index], index });
          break;
        default:
      }
    },
    setOption(side, index) {
      const { skip, ignore } = side;

      side.subMenu && this.specialItemHandler(null, "subMenu", index);
      side.template && this.specialItemHandler(null, "template", index);

      (!skip || !ignore) &&
        this.alterItemOption({
          side,
          index,
          function: !!side.subMenu || !!side.template
        });
    },
    getSubMenuItem(groups) {
      if (this.openSubGroup) {
        this.setCategory();
        return;
      }

      const lastIndex = groups.length - 1;
      let items = [];

      groups.forEach((name, index) => {
        let subItems = JSON.parse(JSON.stringify(this.submenu[name] || []));
        let align = 6 - subItems.length % 3;
        align === 6 && (align = 3);

        index !== lastIndex &&
          Array(align)
            .fill()
            .forEach(_ =>
              subItems.push({
                zhCN: "",
                usEN: "",
                clickable: false,
                group: null
              })
            );
        items.push(...subItems);
      });

      length < 33 &&
        Array(33 - items.length)
          .fill()
          .forEach(() =>
            items.push({ zhCN: "", usEN: "", clickable: false, group: null })
          );

      this.items = items;
      this.openSubGroup = true;
    },
    addSubMenuItem(item) {
      const { zhCN, usEN, print, price, subItem, _id } = item;

      let content = {
        qty: 1,
        zhCN,
        usEN,
        print,
        single: price,
        subItem,
        price: price.toFixed(2),
        key: _id.slice(-4)
      };

      const itemCount = Array.isArray(this.item.choiceSet)
        ? this.item.choiceSet
            .filter(i => i.subItem)
            .map(i => i.qty)
            .reduce((a, b) => a + b, 0)
        : 0;

      if (subItem && this.item.hasOwnProperty("rules")) {
        const maxAllow = this.item.rules.maxSubItem * this.item.qty || Infinity;
        const overCharge = this.item.rules.overCharge || 0;

        if (itemCount >= maxAllow && overCharge === 0) {
          const prompt = {
            title: "dialog.unableAdd",
            msg: ["dialog.maxSubItem", this.item[this.language], maxAllow],
            timeout: { duration: 5000, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          this.$dialog(prompt).then(() => this.$q());
          return;
        } else if (overCharge > 0) {
          content.single += overCharge;
          content.price = content.single.toFixed(2);
        }

        let dom = document.querySelector(".sub.target");
        dom ? this.alertChoiceSet(content) : this.setChoiceSet(content);
      }

      let printer = {};
      print.forEach(device => (printer[device] = {}));
      Object.assign(this.item.printer, printer);
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
      "setOrder",
      "setTicket",
      "setSides",
      "lessQty",
      "moreQty",
      "addToOrder",
      "resetPointer",
      "setChoiceSet",
      "saveForDiffs",
      "alertChoiceSet",
      "alterItemOption"
    ])
  },
  watch: {
    categoryIndex(index) {
      this.setCategory(index);
    }
  }
};
</script>