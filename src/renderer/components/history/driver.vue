<template>
    <div class="popupMask dark center">
        <div class="editor">
            <header>
                <div class="f1">
                    <h3>{{$t('title.setDriver')}}</h3>
                </div>
                <i class="fa fa-times close clickable" @click="init.resolve"></i>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <ul class="drivers">
                    <li @click="setFilter('ALL')" data-filter="ALL">{{$t('type.allInvoice')}}<span class="count">({{invoices.length}})</span></li>
                    <li @click="setFilter('UNASSIGNED')" data-filter="UNASSIGNED">{{$t('type.unassigned')}}<span class="count">({{unassignedCount}})</span></li>
                    <li @click="setFilter(driver.name)" :data-filter="driver.name" v-for="(driver,index) in drivers" :key="index">{{driver.name}}<span class="count">({{driver.count}})</span></li>
                    <li @click="addDriver" v-show="drivers.length < 10">{{$t('button.addDriver')}}</li>
                </ul>
                <div class="tickets relative">
                    <v-touch tag="ul" :style="scroll" @panup="move" @pandown="move" @panstart="panStart" @panend="panEnd">
                        <li v-for="(invoice,index) in filteredInvoices" :key="index" @click="toggle(invoice)">
                            <checkbox v-model="invoice.select" class="noWidth"></checkbox>
                            <span class="number"># {{invoice.number}}</span>
                            <div class="info">
                                <span>{{invoice.address}}</span>
                                <p>
                                    <span>{{invoice.distance}}</span>
                                    <span>{{invoice.duration}}</span>
                                    <span>{{invoice.time}}</span>
                                </p>
                            </div>
                            <span class="number">$ {{invoice.total| decimal}}</span>
                            <span class="driver">{{invoice.driver}}</span>
                        </li>
                    </v-touch>
                    <div class="footer">
                        <span @click="setTarget('SELECTED')">{{$t('select.selected',selectedCount)}}</span>
                        <span @click="setTarget('ALL')">{{$t('select.all')}}</span>
                        <span @click="setTarget('REVERSE')">{{$t('select.reverse')}}</span>
                        <span @click="setTarget('ASSIGNED')">{{$t('select.assigned')}}</span>
                        <span @click="setTarget('UNASSIGNED')">{{$t('select.unassigned')}}</span>
                        <span class="number f1">$ {{totalDue | decimal}}</span>
                    </div>
                </div>
                <ul class="report" v-if="selectedCount === 0">
                    <li>

                    </li>
                </ul>
                <ul class="assign" v-else>
                    <li v-for="(driver,index) in drivers" :key="index" @click="assign(driver.name)" class="mini-btn">Assign To {{driver.name}}</li>
                    <li @click="assign(null)" class="mini-btn"><i class="fas fa-user-times space light"></i>Deassign</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import dialogModule from "../common/dialog";
import checkbox from "../setting/common/checkbox";

export default {
  props: ["init"],
  components: { checkbox, dialogModule },
  data() {
    return {
      componentData: null,
      component: null,
      invoices: [],
      selected: [],
      filter: "ALL",
      lastDelta: 0,
      offset: 0
    };
  },
  created() {
    this.initialData();
  },
  methods: {
    initialData() {
      this.invoices = this.init.invoices.map(invoice => ({
        _id: invoice._id,
        select: false,
        number: invoice.number,
        time: moment(invoice.time).format("HH:mm"),
        driver: invoice.driver,
        address: invoice.customer.address,
        name: invoice.customer.name,
        city: invoice.customer.city,
        distance: invoice.customer.distance,
        duration: invoice.customer.duration,
        settled: invoice.settled,
        charge: invoice.payment.delivery,
        total: toFixed(invoice.payment.due - invoice.payment.delivery, 2),
        amount: invoice.payment.balance
      }));
    },
    toggle(invoice) {
      invoice.select = !invoice.select;
    },
    setFilter(target) {
      this.filter = target;
    },
    setTarget(type) {
      switch (type) {
        case "ALL":
          this.invoices.forEach(i => Object.assign(i, { select: true }));
          break;
        case "REVERSE":
          this.invoices.forEach(i => Object.assign(i, { select: !i.select }));
          break;
        case "ASSIGNED":
          this.invoices.forEach(i => Object.assign(i, { select: !!i.driver }));
          break;
        case "UNASSIGNED":
          this.invoices.forEach(i => Object.assign(i, { select: !i.driver }));
          break;
        case "SELECTED":
          this.selected = this.filteredInvoices
            .filter(i => i.select)
            .map(i => i._id);

          if (this.selected.length !== 0) this.filter = "SELECTED";
          break;
      }
    },
    assign(name) {
      const targets = this.invoices.filter(i => i.select).map(i => i._id);

      this.invoices
        .filter(i => i.select)
        .forEach(i => Object.assign(i, { select: false, driver: name }));

      //update tickets
    },
    addDriver() {},
    panStart() {
      const dom = document.querySelector(".tickets ul.scrollable");
      dom && dom.classList.remove("scrollable");

      document.querySelector(".tickets ul").classList.add("block");
    },
    panEnd(e) {
      const target = document.querySelector("div.tickets ul");
      const top = document.querySelector("div.banner");
      const bot = document.querySelector(".tickets div.footer");
      const { height } = target.getBoundingClientRect();

      if (!util.isCollide(top, target, 1) || height < 580) {
        document.querySelector(".tickets ul").classList.add("scrollable");
        this.offset = 0;
      } else if (!util.isCollide(bot, target, 1)) {
        document.querySelector(".tickets ul").classList.add("scrollable");
        const { bottom, height } = bot.getBoundingClientRect();
        const difference =
          target.getBoundingClientRect().bottom - bottom + height + 5;

        this.offset -= difference;
      }

      this.lastDelta = this.offset;
      document.querySelector(".tickets ul").classList.remove("block");
    },
    move(e) {
      this.offset = this.lastDelta + e.deltaY;
    }
  },
  computed: {
    drivers() {
      const drivers = new Set();
      this.init.drivers.forEach(name => drivers.add(name));
      this.init.invoices.forEach(i => i.driver && drivers.add(i.driver));
      return Array.from(drivers).map(name => {
        const invoices = this.invoices.filter(i => i.driver === name);

        return {
          name,
          count: invoices.length,
          amount: invoices.reduce((a, c) => a + c.total, 0)
        };
      });
    },
    unassignedCount() {
      return this.invoices.filter(i => !i.driver).length;
    },
    selectedCount() {
      return this.invoices.filter(i => i.select).length;
    },
    filteredInvoices() {
      this.invoices.forEach(i => Object.assign(i, { select: false }));

      switch (this.filter) {
        case "ALL":
          return this.invoices;
        case "UNASSIGNED":
          return this.invoices.filter(i => !i.driver);
        case "SELECTED":
          return this.invoices.filter(i => this.selected.includes(i._id));
        default:
          return this.invoices.filter(i => i.driver === this.filter);
      }
    },
    totalDue() {
      return this.filteredInvoices.reduce((a, c) => a + c.total, 0);
    },
    scroll() {
      return { transform: `translate3d(0,${this.offset}px,0)` };
    },
    summary() {}
  },
  watch: {
    filter: {
      handler(n) {
        this.$nextTick(() => {
          const dom = document.querySelector(".drivers li.active");
          dom && dom.classList.remove("active");

          document
            .querySelector(`[data-filter="${n}"]`)
            .classList.add("active");
        });
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.wrap {
  padding: initial;
  width: 925px;
  height: 580px;
  display: grid;
  grid-template-columns: 130px 1fr 200px;
}

ul.drivers {
  background: #f6f6f6;
  height: 580px;
}

.tickets {
  background: #eceff1;
  height: 580px;
  overflow: hidden;
}

.tickets ul.block:after {
  content: " ";
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 2;
  position: absolute;
  top: 0;
  left: 0;
}

.drivers li {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 42px;
  margin: 4px 8px 4px 4px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #eee;
  position: relative;
}

.drivers li.active {
  border: 1px solid #b0bec5;
  background: #eceff1;
}

.drivers li.active:after {
  content: " ";
  position: absolute;
  right: -8px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid #b0bec5;
}

.tickets li {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 4px 0 4px 9px;
  margin: 4px 4px 6px;
  border-radius: 3px;
  height: 40px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.number {
  font-family: "Agency FB";
  font-weight: bold;
}

.info {
  flex: 1;
  padding: 0 15px;
}

.count {
  margin-left: 5px;
  opacity: 0.75;
}

.driver {
  min-width: 90px;
  padding: 5px;
  text-align: center;
}

.info p {
  font-size: 0.7em;
  display: flex;
  width: 70%;
}

.info p span {
  flex: 1;
  color: #424242;
}

.noWidth {
  min-width: initial !important;
}

.footer {
  position: absolute;
  bottom: 0;
  padding: 10px 0;
  width: 100%;
  background: #607d8b;
  color: #fff;
  display: flex;
  text-align: right;
  border-radius: 4px 4px 0 0;
}

.footer span {
  margin: 0 10px;
  padding: 0 5px;
  cursor: pointer;
}

.footer span:first-child {
  text-align: left;
  width: 105px;
  margin: 0 0 0 20px;
  padding: 0;
}

ul.assign {
  display: flex;
  flex-direction: column;
  padding: 5px;
  text-align: center;
}

ul.assign li {
  margin-bottom: 4px;
  padding: 15px 0;
}

i.close {
  padding: 15px 22px;
}
</style>



