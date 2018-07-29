<template>
    <div class="hibachi-grid">
        <div class="hibachi-seat" :class="[table.layout,table.orientation]" v-for="(table,index) in tables" :key="index">
            <div class="table-name create" v-if="target === table.name && seats.length">
              <div class="mini-btn" @click="cancel"><i class="fas fa-hand-paper light space"></i>{{$t('button.cancel')}}</div>
              <div class="mini-btn" @click="create"><i class="fas fa-utensils light space"></i>{{$t('button.create')}}</div>
            </div>
            <span class="table-name" v-else>{{table.name}}</span>
            <span v-for="(seat,idx) in table.seats" :key="idx" :index="idx" class="seat" tag="span" @click="tap($event,table.name,seat)">{{seat.name}}</span>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: ["tables", "transfer"],
  data() {
    return {
      target: null,
      seats: []
    };
  },
  methods: {
    tap(e, target, seat) {
      seat.status === 1
        ? this.selectSeat(e, target, seat.name)
        : this.viewTicket(seat.invoice);
    },
    viewTicket(_id) {
      const invoice = this.history.find(t => t._id === _id);

      invoice ? this.setViewOrder(invoice) : this.noFoundDialog();
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
    noFoundDialog() {
      const prompt = {
        title: "dialog.ticketNotFound",
        msg: "dialog.actionProcess",
        buttons: [
          { text: "button.resetTable", fn: "reject" },
          { text: "button.sync", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => {
          this.$socket.emit("[ORDER] SYNC", orders => {
            this.setTodayOrder(orders);
            this.exitComponent();
          });
        })
        .catch(() => {
          this.$socket.emit("[HIBACHI] RESET", { session });
          this.exitComponent();
        });
    },
    create() {},
    cancel() {
      this.target = null;
      this.seats = [];
      this.resetStyle();
    }
  },
  computed: {
    ...mapGetters(["history"])
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