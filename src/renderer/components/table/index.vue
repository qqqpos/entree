<template>
    <div class="table-outer">
        <div class="table-layout">
            <aside class="column">
                <div class="table-section">
                    <button class="btn relative" v-for="(zone,index) in layouts.table" :key="index" @click="setSection(index)">{{zone[language]}}<span class="notify blue">{{countSeats(index)}}</span></button>
                </div>
                <div class="column">
                    <button class="btn relative" @click="$open('bookModule')">
                        <span class="notify blue" v-show="currentBookingCount > 0">{{currentBookingCount}}</span>
                        <i class="far fa-calendar-check"></i>
                        <span class="text">{{$t('button.booking')}}</span>
                    </button>
                </div>
            </aside>
            <component :is="layout" :tables="sectionTables" :transfer.sync="transfer"></component>
        </div>
        <div class="ticket">
            <div class="wrap">
                <order-list layout="display" :display="true"></order-list>
                <buttons class="buttons" :transfer.sync="transfer"></buttons>
            </div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import grid from "./layout/grid";
import flow from "./layout/flow";
import hibachi from "./layout/hibachi";
import orderList from "../common/orderList";
import bookModule from "../book/index";
import buttons from "./buttons";

export default {
  components: {
    bookModule,
    orderList,
    buttons,
    hibachi,
    grid,
    flow
  },
  props: ["zone"],
  data() {
    return {
      viewTables: false,
      componentData: null,
      component: null,
      transfer: false,
      layout: "grid",
      section: 0
    };
  },
  created() {
    if (this.zone) {
      // auto jump to section
      const index = this.layouts.table.findIndex(t => t.zone === this.zone);
      this.section = index !== -1 ? index : 0;
    }
  },
  methods: {
    setSection(index) {
      this.section = index;
    },
    countSeats(section) {
      const { zone, layout = "grid" } = this.layouts.table[section];
      const tables = this.tables[zone] || [];

      if (layout === "hibachi") {
        return tables.reduce(
          (total, table) =>
            total + table.seats.filter(seat => seat.status === 1).length,
          0
        );
      } else {
        return tables.filter(
          ({ _id, type, status }) =>
            _id && type !== "placeholder" && status === 1
        ).length;
      }
    }
  },
  computed: {
    sectionTables() {
      const section = this.layouts.table[this.section] || {};
      const { zone = "Entree", layout = "grid" } = section;
      const tables = this.tables[zone] || [];
      this.layout = layout;

      return tables;
    },
    currentBookingCount() {
      const now = this.time;
      const before = now - 1.8e6;
      const after = now + 3.6e6;

      return this.books.filter(
        ({ timestamp, status }) =>
          timestamp > before && timestamp < after && status === 1
      ).length;
    },
    ...mapGetters([
      "op",
      "time",
      "table",
      "books",
      "tables",
      "layouts",
      "language"
    ])
  }
};
</script>

<style scoped>
.table-outer {
  display: grid;
  grid-template-columns: 1fr 285px;
  height: 100vh;
  width: 100vw;
  padding-top: 60px;
  background: url(../../assets/image/floor.png) #ebeff1;
}

.table-layout {
  display: grid;
  grid-template-columns: 100px 1fr;
}

aside {
  padding: 5px;
  height: calc(100vh - 35px);
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
</style>


