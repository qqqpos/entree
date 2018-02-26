<template>
  <div class="summary" :class="{hide:!viewable}">
    <div class="filter active" @click="setFilter('',$event)">
      <div class="text">{{$t('type.allInvoice')}}
        <span class="count">{{summary.totalCount}}</span>
      </div>
      <div class="value">$ {{summary.totalAmount | decimal}}</div>
    </div>
    <div class="filter" @click="setFilter('WALK_IN',$event)" v-show="summary.walkInCount">
      <div class="text">{{$t('type.walkInInvoice')}}
        <span class="count">{{summary.walkInCount}}</span>
      </div>
      <div class="value">$ {{summary.walkInAmount | decimal}}</div>
    </div>
    <div class="filter" @click="setFilter('PICK_UP',$event)" v-show="summary.pickUpCount">
      <div class="text">{{$t('type.pickUpInvoice')}}
        <span class="count">{{summary.pickUpCount}}</span>
      </div>
      <div class="value">$ {{summary.pickUpAmount | decimal}}</div>
    </div>
    <div class="filter dropDown" @click="setFilter('DELIVERY',$event)" v-show="summary.deliveryCount">
      <div class="text">{{$t('type.deliveryInvoice')}}
        <span class="count">{{summary.deliveryCount}}</span>
      </div>
      <div class="value">$ {{summary.deliveryAmount | decimal}}</div>
      <div class="drivers" v-show="!driver">
        <div class="driver" v-for="(value,key,index) in summary.driver" :key="index" @click.stop="setDriver(key)">
          <span>{{key}}{{$t('text.driver')}} ({{value.count}})</span>
          <span class="price">$ {{value.total | decimal}}</span>
        </div>
      </div>
    </div>
    <div class="filter" @click="setFilter('DINE_IN',$event)" v-show="summary.dineInCount">
      <div class="text">{{$t('type.dineInInvoice')}}
        <span class="count">{{summary.dineInCount}}</span>
      </div>
      <div class="value">$ {{summary.dineInAmount | decimal}}</div>
    </div>
    <div class="filter" @click="setFilter('UNSETTLE',$event)" v-show="summary.unsettledCount">
      <div class="text">{{$t('type.unpaidInvoice')}}
        <span class="count">{{summary.unsettledCount}}</span>
      </div>
      <div class="value">$ {{summary.unsettledAmount |decimal}}</div>
    </div>
    <transition name="fadeDown" appear>
      <div class="date" id="calendar">
        <i class="fa fa-angle-left" @click="prev" v-show="shortCut"></i>
        <span class="text" @click="shortCut = !shortCut">{{date}}</span>
        <i class="fa fa-angle-right" @click="next" v-show="shortCut"></i>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["data", "date"],
  data() {
    return {
      viewable: false,
      allInvoices: false,
      shortCut: false,
      driver: null,
      type: null
    };
  },
  created() {
    this.viewable = this.approval(this.op.view, "summary");
    this.allInvoices = this.approval(this.op.view, "invoices");
  },
  methods: {
    setFilter(type, e) {
      document.querySelector(".filter.active").classList.remove("active");
      e.currentTarget.classList.add("active");
      let dom = document.querySelector(".invoice.active");
      dom && dom.classList.add("active");
      this.type === type && type === "DELIVERY" && (this.driver = !this.driver);
      this.$emit("filter", type);
      this.type = type;
    },
    setDriver(id) {
      this.driver = id;
      this.$emit("filter", "DRIVER", id);
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
    }
  },
  computed: {
    summary() {
      const sum = (a, b) => a + b;
      let driver = {};
      let totalCount = 0,
        walkInCount = 0,
        pickUpCount = 0,
        deliveryCount = 0,
        dineInCount = 0,
        buffetCount = 0,
        unsettledCount = 0;

      let totalAmount = 0,
        walkInAmount = 0,
        pickUpAmount = 0,
        deliveryAmount = 0,
        dineInAmount = 0,
        buffetAmount = 0,
        unsettledAmount = 0;

      const invoices = this.allInvoices
        ? this.data
        : this.data.filter(t => t.server === this.op.name);

      invoices.forEach(invoice => {
        const { tip, delivery, due } = invoice.payment;

        if (invoice.status === 1) {
          totalCount++;
          totalAmount += due;

          switch (invoice.type) {
            case "WALK_IN":
              walkInCount++;
              walkInAmount += due;
              break;
            case "PICK_UP":
              pickUpCount++;
              pickUpAmount += due;
              break;
            case "DELIVERY":
              deliveryCount++;
              deliveryAmount += due;

              if (invoice.driver) {
                if (driver.hasOwnProperty(invoice.driver)) {
                  const name = invoice.driver;

                  driver[name].count++;
                  driver[name].total += due;
                  driver[name].tip += tip;
                } else {
                  driver[invoice.driver] = {
                    count: 1,
                    total: due,
                    tip
                  };
                }
              }
              break;
            case "DINE_IN":
              dineInCount++;
              dineInAmount += due;
              break;
            case "BUFFET":
              buffetCount++;
              buffetAmount += due;
              break;
          }

          if (!invoice.settled) {
            unsettledCount++;
            unsettledAmount += due;
          }
        }
      });

      return {
        totalCount,
        totalAmount,
        pickUpCount,
        pickUpAmount,
        walkInCount,
        walkInAmount,
        deliveryCount,
        deliveryAmount,
        dineInCount,
        dineInAmount,
        buffetCount,
        buffetAmount,
        unsettledCount,
        unsettledAmount,
        driver
      };
    },
    ...mapGetters(["op"])
  }
};
</script>

<style scoped>
.filter {
  padding: 0 10px;
  height: 62px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  justify-content: center;
  text-align: center;
  color: #fafafa;
  min-width: 70px;
  transition: background 0.22s linear;
}
.count {
  margin-left: 5px;
  font-family: "Agency FB";
}

.count:before {
  content: "∙";
  margin-right: 5px;
}
.filter .value {
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 28px;
}

.filter.active {
  background: #fff;
  font-weight: bold;
  border-bottom: 2px solid #ff9800;
  color: #263238;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.dropDown {
  position: relative;
}

.dropDown.active .drivers {
  display: block;
}

.dropDown.active::after {
  content: " ";
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  margin: auto;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 10px 10px 0 10px;
  border-color: #ff9800 transparent transparent transparent;
}

.summary.hide .value {
  visibility: hidden;
}

.date {
  position: absolute;
  right: 0px;
  min-width: 235px;
  text-align: center;
}

.date i {
  color: #fff;
  padding: 9px 20px;
  cursor: pointer;
}

.date .text {
  font-size: 3em;
  font-style: italic;
  font-family: "Agency FB";
  color: #fff;
  font-weight: bold;
  text-shadow: 1px 1px 1px rgb(25, 25, 25);
}

.drivers {
  position: absolute;
  display: none;
  z-index: 2;
  top: 75px;
  left: 0;
  width: 100%;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

.driver {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.price {
  font-weight: lighter;
  color: gray;
}
</style>