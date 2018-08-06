<template>
    <div class="hibachi-grid">
        <div class="hibachi-seat" :class="[table.layout,table.orientation]" v-for="(table,index) in tables" :key="index" :data-hibachi="table._id">
            <div class="table-name create" v-if="target === table.name && seats.length">
              <div class="mini-btn" @click="cancel"><i class="fas fa-hand-paper light space"></i>{{$t('button.cancel')}}</div>
              <div class="mini-btn" @click="create"><i class="fas fa-utensils light space"></i>{{$t('button.create')}}</div>
            </div>
            <span class="table-name" v-else>{{table.name}}</span>
            <span v-for="(seat,idx) in table.seats" :key="idx" :index="idx" :data-seat="seat.name" class="seat" tag="span" @click="tap($event,table,seat)">{{seat.name}}</span>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dialogModule from "../../common/dialog";
import unlockModule from "../../common/unlock";
import tableCreate from "../../../mixins/tableCreate";

export default {
  props: ["tables", "transfer"],
  components: { dialogModule, unlockModule },
  mixins: [tableCreate],
  data() {
    return {
      componentData: null,
      component: null,
      target: null,
      seats: []
    };
  },
  methods: {
    tap(e, hibachi, seat) {
      if (!this.table || this.table._id === hibachi._id) {
        seat.status === 1
          ? this.selectSeat(e, hibachi.name, seat.name)
          : this.viewTicket(seat.invoice);
        this.setViewTable(hibachi);
      } else {
        this.seats = [];
        this.resetStyle();
        this.setViewTable(hibachi);
        this.tap(e, hibachi, seat);
      }
    },
    viewTicket(_id) {
      const invoice = this.history.find(t => t._id === _id);

      invoice ? this.viewHibachi(invoice) : this.noFoundDialog("HIBACHI",_id);
    },
    viewHibachi(invoice) {
      const { _id, tableID, seats } = invoice;
      this.setViewOrder(invoice);
    },
    selectSeat(e, target, seat) {
      if (this.target === null) this.target = target;

      if (this.target !== target) {
        this.resetStyle();
        this.target = target;
        this.seats = [seat];
        e.target.classList.add("active");
      } else {
        const index = this.seats.findIndex(number => number === seat);
        if (index === -1) {
          this.seats.push(seat);
          e.target.classList.add("active");
        } else {
          this.seats.splice(index, 1);
          e.target.classList.remove("active");
        }
      }
    },
    resetStyle() {
      document
        .querySelectorAll(".active")
        .forEach(dom => dom.classList.remove("active"));
    },
    cancel() {
      this.target = null;
      this.seats = [];
      this.resetStyle();
    },
    create() {
      this.checkAccessPin()
        .then(this.createTable)
        .catch(this.exitComponent);
    },
    createTable() {
      this.resetMenu();
      this.exitComponent();

      const session = ObjectId().toString();
      const _id = this.order._id;
      const server = this.op.name;
      const time = Date.now();

      this.setTicket({ type: "HIBACHI" });

      Object.assign(this.order, {
        table: this.table.name,
        tableID: this.table._id,
        guest: this.seats.length,
        seats: this.seats,
        type: "HIBACHI",
        session,
        server
      });

      this.table.seats.forEach(seat => {
        this.seats.includes(seat.name) &&
          Object.assign(seat, {
            invoice: _id,
            status: -1,
            session,
            server,
            time
          });
      });

      this.$socket.emit("[TABLE] UPDATE", this.table);
      this.$router.push({ path: "/main/menu" });
    },
    ...mapActions([
      "setApp",
      "resetMenu",
      "setTicket",
      "setOperator",
      "setViewTable",
      "setViewOrder"
    ])
  },
  computed: {
    ...mapGetters(["op", "table", "order", "history", "dineInOpt"])
  }
};
</script>

<style scoped>
.hibachi-grid {
  width: 637px;
  height: 700px;
  display: grid;
  grid-gap: 15px 5px;
  margin-top: -30px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  justify-self: center;
  align-self: center;
}

.hibachi-seat {
  margin: 5px 10px;
  background: #b0bec5;
  display: grid;
  grid-gap: 4px;
  padding: 4px;
}

.create {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: inherit;
  font-weight: inherit;
}

.create div {
  margin: 7px 0;
}

.active {
  background: #607d8b;
  color: #fff;
}
</style>