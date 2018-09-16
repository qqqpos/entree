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
                    <li @click="setFilter('UNASSIGNED')" data-filter="UNASSIGNED">{{$t('type.unassigned')}}<span class="count">({{unassignedCount}})</span></li>
                    <li @click="setFilter('ALL')" data-filter="ALL">{{$t('type.allInvoice')}}<span class="count">({{invoices.length}})</span></li>
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
                                    <span>{{invoice.city}}</span>
                                    <span>{{invoice.distance}}</span>
                                    <span>{{invoice.duration}}</span>
                                    <span>{{invoice.time}}</span>
                                </p>
                            </div>
                            <span class="number">$ {{invoice.amount | decimal}}</span>
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
                <ul class="report relative" v-if="selectedCount === 0">
                    <li v-for="(filed,index) in summary" :key="index">
                      <h5>{{filed.text}}</h5>
                      <h3>{{filed.value}}</h3>
                    </li>
                    <div class="settlement" v-show="report">
                      <button class="mini-btn" @click="printDialog"><i class="fa fa-print space"></i>{{$t('button.print')}}</button>
                      <button class="mini-btn" @click="settleDialog" :disabled="driverSettled"><i class="fas fa-hand-holding-usd space"></i>{{$t('button.settle')}}</button>
                    </div>
                </ul>
                <ul class="assign" v-else>
                    <li v-for="(driver,index) in drivers" :key="index" @click="assign(driver.name)" class="mini-btn" v-show="driver.name !== filter">{{$t('text.assignTo',driver.name)}}</li>
                    <li @click="assign(null)" class="mini-btn"><i class="fas fa-user-times space light"></i>{{$t('text.deassign')}}</li>
                </ul>
            </div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import dialogModule from "../common/dialog";
import unlockModule from "../common/unlock";
import driverInput from "./helper/driverInput";
import checkbox from "../setting/common/checkbox";

export default {
  props: ["init"],
  components: { checkbox, dialogModule, unlockModule, driverInput },
  data() {
    return {
      filter: "UNASSIGNED",
      componentData: null,
      component: null,
      temporary: [],
      invoices: [],
      selected: [],
      report: false,
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
        tip: invoice.payment.tip,
        due: invoice.payment.due,
        total: toFixed(invoice.payment.due - invoice.payment.delivery, 2),
        paid: invoice.payment.paid,
        amount: invoice.payment.balance,
        remain: invoice.payment.remain
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
      this.$checkPermission("modify", "driver")
        .then(() => {
          const invoices = this.invoices.filter(i => i.select);
          invoices.forEach(i =>
            Object.assign(i, { select: false, driver: name })
          );

          //update tickets
          this.$socket.emit("[ORDER] DRIVER", name, invoices.map(i => i._id));
        })
        .catch(() => {});
    },
    addDriver() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "driverInput";
      })
        .then(name => {
          this.temporary.push(name);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
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
    },
    printDialog() {
      const prompt = {
        type: "question",
        title: "dialog.driverReport",
        msg: ["dialog.driverReportDetail", this.filter],
        buttons: [
          {
            text: "button.cancel",
            fn: "resolve"
          },
          {
            text: "button.printDetail",
            fn: "detail"
          },
          {
            text: "button.print",
            fn: "reject"
          }
        ]
      };

      this.$dialog(prompt)
        .then(this.exitComponent)
        .catch(this.printReport);
    },
    printReport(detail) {
      this.exitComponent();

      const invoices = detail ? this.filteredInvoices : [];

      Printer.printDriverReport({
        title: `Driver Report`,
        driver: this.filter,
        date: this.init.date,
        summary: this.summary,
        invoices
      });
    },
    settleDialog() {
      const driver = this.filter;
      const amount = this.summary.last().value;

      const prompt = {
        type: "question",
        title: "dialog.driverSettle",
        msg: ["dialog.driverSettledConfirm", this.filter],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: ["button.received", amount], fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => {
          const invoices = this.invoices.filter(
            i => i.driver === driver && !i.settled
          );
          this.$socket.emit("[DRIVER] SETTLE", invoices.map(i => i._id), () => {
            invoices.forEach(i => Object.assign(i, { settled: true }));
            this.exitComponent();
          });
        })
        .catch(this.exitComponent);
    }
  },
  computed: {
    drivers() {
      const drivers = new Set();
      this.init.drivers.forEach(name => drivers.add(name));
      this.init.invoices.forEach(i => i.driver && drivers.add(i.driver));

      this.temporary.length &&
        this.temporary.forEach(name => drivers.add(name));

      return Array.from(drivers).map(name => {
        const invoices = this.invoices.filter(i => i.driver === name);
        const settled = invoices.filter(i => i.settled || i.paid > 0);
        const unsettled = invoices.filter(
          i => !i.settled && i.amount === i.remain
        );

        const partially = invoices.filter(
          i => i.amount !== i.remain && i.remain !== 0
        );

        const unsettledAmount = unsettled.reduce((a, c) => a + c.due, 0);
        const remainAmount = partially.reduce((a, c) => a + c.remain, 0);

        return {
          name,
          count: invoices.length,
          settledCount: settled.length,
          unsettledCount: unsettled.length + partially.length,
          partiallyCount: partially.length,
          tip: invoices.reduce((a, c) => a + c.tip, 0),
          charge: invoices.reduce((a, c) => a + c.charge, 0),
          amount: invoices.reduce((a, c) => a + c.total, 0),
          settledAmount: settled.reduce((a, c) => a + c.paid, 0),
          unsettledAmount: unsettledAmount + remainAmount,
          remainAmount
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
      this.offset = 0;
      this.lastDelta = 0;
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
      return this.filteredInvoices.reduce((a, c) => a + c.amount, 0);
    },
    scroll() {
      return { transform: `translate3d(0,${this.offset}px,0)` };
    },
    summary() {
      switch (this.filter) {
        case "ALL":
        case "UNASSIGNED":
        case "SELECTED":
          this.report = false;
          return [];
        default:
          const {
            name,
            count,
            settledCount,
            unsettledCount,
            partiallyCount,
            charge,
            tip,
            amount,
            settledAmount,
            unsettledAmount,
            remainAmount
          } = this.drivers.find(driver => driver.name === this.filter);
          this.report = true;

          return [
            { text: this.$t("report.driver"), value: name },
            { text: this.$t("report.count"), value: count },
            {
              text: this.$t("report.deliveryFee"),
              value: "$ " + charge.toFixed(2)
            },
            { text: this.$t("text.tip"), value: "$ " + tip.toFixed(2) },
            {
              text: this.$t("report.settled") + ` ( ${settledCount} )`,
              value: "$ " + settledAmount.toFixed(2)
            },
            {
              text:
                this.$t("report.partiallyRemain") + ` ( ${partiallyCount} )`,
              value: `( $ ${remainAmount.toFixed(2)} )`
            },
            {
              text: this.$t("report.unsettled") + ` ( ${unsettledCount} )`,
              value: "$ " + unsettledAmount.toFixed(2)
            },
            {
              text:
                this.$t("report.accountsPayable") +
                ` (${this.$t("text.tip")}+${this.$t("report.deliveryFee")})`,
              value: "$ " + (charge + tip).toFixed(2)
            },
            {
              text: this.$t("report.expectTotal"),
              value:
                "$ " + Math.max(0, unsettledAmount - charge - tip).toFixed(2)
            }
          ];
      }
    },
    driverSettled() {
      return this.filteredInvoices.every(i => i.settled);
    },
    ...mapGetters(["op"])
  },
  watch: {
    filter: {
      handler(target) {
        target !== "SELECTED" &&
          this.$nextTick(() => {
            const dom = document.querySelector(".drivers li.active");
            dom && dom.classList.remove("active");

            document
              .querySelector(`[data-filter="${target}"]`)
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
  grid-template-columns: 135px 1fr 200px;
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
  height: 44px;
  margin: 4px 8px 4px 4px;
  cursor: pointer;
  background: #fff;
  position: relative;
  border-radius: 3px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.4);
}

.drivers li.active {
  background: #607d8b;
  color: #fff;
}

.drivers li.active:after {
  content: " ";
  position: absolute;
  right: -8px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid #607d8b;
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
  min-width: 40px;
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
}

.info p span {
  flex: 1;
  color: #424242;
  margin-right: 5px;
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

ul.report {
  padding: 15px;
}

ul.report li {
  margin-bottom: 15px;
}

ul.report h3 {
  font-family: "Agency FB";
  margin: 2px 0 0 0px;
}

ul.report h5 {
  font-weight: normal;
  color: #3c3c3c;
}

.settlement {
  position: absolute;
  left: 0;
  bottom: 30px;
  display: flex;
  justify-content: space-evenly;
  width: 200px;
}
</style>



