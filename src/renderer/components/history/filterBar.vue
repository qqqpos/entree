<template>
    <header>
        <div class="logo">
            <span class="cap">E</span>
            <span class="sub">ntrée</span>
        </div>
        <section class="filters" :class="{hide:!viewable}">
            <div class="filter relative" v-for="(filter,index) in filters" :key="index" v-show="filter.amount > 0" @click="setFilter(filter.type,index,$event)" :class="{active:type === filter.type,more:showMore}">
                <div class="text">{{filter.title}}<span class="count">{{filter.count}}</span></div>
                <div class="value">$ {{filter.amount | decimal}}</div>
                <transition name="dropdown">
                    <ul v-if="filter.subTypes && showMore" class="subTypes">
                        <li v-for="(sub,subIndex) in filter.subTypes" :key="subIndex" @click.stop="setSubFilter(sub)">
                            <div class="text">{{sub.title}}<span class="count">{{sub.count}}</span></div>
                            <div class="value">$ {{sub.amount | decimal}}</div>
                        </li>
                        <template v-if="index === 0">
                          <li class="extend relative" @click.stop="toggleServers" v-show="viewAllInvoices" v-if="!target">
                            <div class="text">{{$t('filter.server')}}</div>
                            <i class="fas fa-user-tie"></i>
                            <transition name="slideFromLeft">
                              <ul v-if="showServer" class="server">
                                <li v-for="(name,index) in servers" :key="index" @click.stop="filterByServer(name)">{{name}}</li>
                              </ul>
                            </transition>
                          </li>
                          <li @click.stop="resetFilter" v-else>
                            <div class="text">{{$t('filter.allServers')}}</div>
                            <i class="fas fa-users"></i>
                          </li>
                          <li @click.stop="search">
                            <div class="text">{{$t('text.searchTicket')}}</div>
                            <i class="fas fa-search"></i>
                          </li>
                        </template>
                    </ul>
                </transition>
            </div>
        </section>
        <transition name="fadeDown" appear>
            <div class="date relative" id="calendar">
            <i class="fa fa-angle-left" @click="prev" v-show="displayBtn"></i>
            <p class="dateInfo">{{date | week}}<span class="holiday">{{date | event}}</span></p>
            <span class="text" @click="displayBtn = !displayBtn">{{date}}</span>
            <i class="fa fa-angle-right" @click="next" v-show="displayBtn"></i>
            </div>
        </transition>
    </header>
</template>

<script>
import { mapGetters } from "vuex";
import holiday from "moment-holiday";

export default {
  props: ["target", "reset", "data", "date", "on"],
  data() {
    return {
      filters: [],
      viewable: false,
      viewAllInvoices: false,
      displayBtn: false,
      showMore: false,
      showServer: false,
      type: "ALL_INVOICES",
      servers: []
    };
  },
  computed: {
    ...mapGetters(["op"])
  },
  created() {
    this.viewable = this.approval(this.op.view, "summary");
    this.viewAllInvoices = this.approval(this.op.view, "invoices");

    this.initialData();
  },
  mounted() {
    const dom = document.querySelector(".filters .filter");
    dom && dom.classList.add("active");
  },
  filters: {
    week(date) {
      return moment(date, "YYYY-MM-DD").format("dddd");
    },
    event(date) {
      return holiday(moment(date, "YYYY-MM-DD")).isHoliday() || "";
    }
  },
  methods: {
    setFilter(type, index, e) {
      this.$emit("filter", type);
      if (!this.reset) {
        // if needed to reset don't drop down menu
        if (type !== this.type) {
          this.showMore = false;
          this.type = type;
        } else if (Array.isArray(this.filters[index].subTypes)) {
          this.showMore = !this.showMore;
        } else {
          this.showMore = false;
          this.type = type;
        }
      } else {
        this.type = type;
      }
    },
    resetFilter() {
      this.showMore = false;
      this.type = "ALL_INVOICES";
      this.$emit("reset");
    },
    setSubFilter({ type }) {
      this.$emit("filter", type);
      this.showMore = false;
    },
    filterByServer(name) {
      this.$emit("filter", "SERVER", name);
      this.showMore = false;
    },
    search() {
      this.showMore = false;
      this.$emit("search");
    },
    initialData() {
      const servers = new Set();
      const invoices =
        this.viewAllInvoices && !this.on
          ? this.data
          : this.on
            ? this.data.filter(t => t.server === this.on)
            : this.data.filter(t => t.server === this.op.name);

      const sort = [
        "ALL_INVOICES",
        "WALK_IN",
        "PICK_UP",
        "DELIVERY",
        "DINE_IN",
        "BUFFET",
        "UNSETTLED"
      ];

      let filters = {
        ALL_INVOICES: {
          type: "ALL_INVOICES",
          count: 0,
          amount: 0,
          title: this.$t("type.ALL_INVOICES")
        },
        UNSETTLED: {
          type: "UNSETTLED",
          count: 0,
          amount: 0,
          title: this.$t("type.UNSETTLED")
        }
      };

      let subTypes = {};

      invoices.forEach(({ type, modify, status, settled, payment, server }) => {
        servers.add(server);
        const { balance } = payment;
        if (status === 1) {
          //if not void
          filters["ALL_INVOICES"].count++;
          filters["ALL_INVOICES"].amount += balance;

          if (filters[type]) {
            filters[type].count++;
            filters[type].amount += balance;
          } else {
            filters[type] = {
              type,
              count: 1,
              amount: balance,
              title: this.$t("type." + type)
            };
          }

          if (!settled) {
            filters["UNSETTLED"].count++;
            filters["UNSETTLED"].amount += balance;
          } else {
            if (subTypes.hasOwnProperty("SETTLED")) {
              subTypes["SETTLED"].count++;
              subTypes["SETTLED"].amount += balance;
            } else {
              subTypes["SETTLED"] = {
                type: "SETTLED",
                count: 1,
                amount: balance
              };
            }
          }

          if (payment.discount > 0) {
            if (subTypes.hasOwnProperty("DISCOUNT_INVOICE")) {
              subTypes["DISCOUNT_INVOICE"].count++;
              subTypes["DISCOUNT_INVOICE"].amount += balance;
            } else {
              subTypes["DISCOUNT_INVOICE"] = {
                type: "DISCOUNTED",
                count: 1,
                amount: balance
              };
            }
          }

          if (modify > 0) {
            if (subTypes.hasOwnProperty("EDIT_INVOICE")) {
              subTypes["EDIT_INVOICE"].count++;
              subTypes["EDIT_INVOICE"].amount += balance;
            } else {
              subTypes["EDIT_INVOICE"] = {
                type: "EDITED",
                count: 1,
                amount: balance
              };
            }
          }
        } else {
          if (subTypes.hasOwnProperty("VOID_INVOICE")) {
            subTypes["VOID_INVOICE"].count++;
            subTypes["VOID_INVOICE"].amount += balance;
          } else {
            subTypes["VOID_INVOICE"] = {
              type: "VOIDED",
              count: 1,
              amount: balance
            };
          }
        }
      });

      if (filters.hasOwnProperty("BAR")) {
        Array.isArray(filters["DINE_IN"].subTypes)
          ? filters["DINE_IN"].subTypes.push(filters["BAR"])
          : (filters["DINE_IN"].subTypes = [filters["BAR"]]);
      }

      if (filters.hasOwnProperty("HIBACHI")) {
        Array.isArray(filters["DINE_IN"].subTypes)
          ? filters["DINE_IN"].subTypes.push(filters["HIBACHI"])
          : (filters["DINE_IN"].subTypes = [filters["HIBACHI"]]);
      }

      if (subTypes.hasOwnProperty("SETTLED")) {
        filters["UNSETTLED"].subTypes = [
          Object.assign(subTypes["SETTLED"], {
            title: this.$t("type.SETTLED")
          })
        ];
      }

      this.filters = Object.keys(filters)
        .filter(type => sort.includes(type))
        .sort((a, b) => (sort.indexOf(a) > sort.indexOf(b) ? 1 : -1))
        .map(type =>
          Object.assign({}, filters[type], {
            title: this.$t("type." + type)
          })
        );

      const otherTypes = Object.keys(subTypes).filter(type =>
        ["VOID_INVOICE", "EDIT_INVOICE", "DISCOUNT_INVOICE"].includes(type)
      );

      this.filters[0].subTypes = [];

      otherTypes.forEach(type =>
        this.filters[0].subTypes.push(
          Object.assign(subTypes[type], {
            title: this.$t("type." + type)
          })
        )
      );

      this.servers = Array.from(servers);
    },
    prev() {
      const date = moment(this.date, "YYYY-MM-DD")
        .subtract(1, "d")
        .format("YYYY-MM-DD");
      this.$bus.emit("CALENDAR", date);
    },
    next() {
      const date = moment(this.date, "YYYY-MM-DD")
        .add(1, "d")
        .format("YYYY-MM-DD");
      this.$bus.emit("CALENDAR", date);
    },
    toggleServers() {
      this.showServer = !this.showServer;
    }
  },
  watch: {
    data: "initialData",
    on: "initialData"
  }
};
</script>

<style scoped>
header {
  margin-top: 30px;
  display: flex;
  height: 63px;
  grid-area: header;
  background-image: linear-gradient(170deg, rgb(81, 103, 140) 0%, #234c75 100%);
}

.logo {
  width: 55px;
  line-height: 60px;
  background: skyblue;
  border-radius: 4px;
  box-shadow: 0px 2px 10px #163b4e;
  display: flex;
  justify-content: center;
  align-items: baseline;
  margin: 7px 20px;
  font-family: "Agency FB";
  color: #fafafa;
}

span.cap {
  font-size: 24px;
  font-weight: bold;
  margin-right: 2px;
  text-shadow: 2px 1px 0px #607d8b;
}

span.sub {
  font-weight: normal;
  text-shadow: 1px 0px 1px rgba(0, 0, 0, 0.75);
}

.filters {
  flex: 1;
  display: flex;
  align-items: center;
}

.filter {
  padding: 0 5px;
  height: 62px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  justify-content: center;
  text-align: center;
  color: #fafafa;
  min-width: 100px;
  transition: background 0.22s linear;
}

.filter:first-child {
  min-width: 109px;
}

.filter.active {
  background: #fff;
  font-weight: bold;
  border-bottom: 2px solid #ff9800;
  color: #263238;
  z-index: 2;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.filters.hide .value {
  visibility: hidden;
}

.count {
  font-family: "Agency FB";
}

.count:before {
  content: "∙";
  margin: 0 5px;
}

.value {
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 28px;
  white-space: nowrap;
}

ul.subTypes {
  display: none;
  position: absolute;
  top: 62px;
  left: 0;
  background: #fff;
  width: 100%;
  box-shadow: 0 5px 9px -1px rgba(0, 0, 0, 0.5);
}

.active.more ul.subTypes {
  display: block;
}

.subTypes li {
  padding: 5px 0;
  height: 53px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.subTypes li:nth-child(odd) {
  background: #f5f5f5;
}

.date {
  min-width: 225px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  text-shadow: 1px 1px 1px rgb(25, 25, 25);
}

.date .text {
  font-size: 46px;
  font-style: italic;
  font-family: "Agency FB";
  color: #fff;
  font-weight: bold;
  min-width: 200px;
  padding-right: 10px;
  line-height: 1;
  padding-top: 16px;
}

.date i {
  position: absolute;
  color: #fff;
  top: 0;
}

.dateInfo {
  position: absolute;
  top: 2px;
  right: 0px;
  white-space: pre;
  text-align: left;
  width: 88%;
  display: flex;
}

.holiday {
  font-weight: lighter;
  margin-right: 10px;
  font-weight: lighter;
  flex: 1;
  text-align: right;
}

i.fa-angle-left {
  left: -5px;
  padding: 30px 60px 17px 13px;
}

i.fa-angle-right {
  right: -5px;
  padding: 30px 8px 17px 60px;
}

li.extend:after {
  content: "\f0da";
  font-family: FontAwesome;
  position: absolute;
  right: 10px;
  opacity: 0.5;
}

ul.server {
  position: absolute;
  top: 0;
  left: 119px;
  background: #fff;
  width: auto;
  max-height: 315px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}

.server li {
  width: 130px;
  background: #fff;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
}
</style>

