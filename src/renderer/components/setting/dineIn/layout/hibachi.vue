<template>
    <div class="hibachi-setup-grid">
        <div class="hibachi-seat" :class="[item.layout,item.orientation]" v-for="(item,index) in items" :key="index">
            <span class="table-name" @contextmenu="edit(item,index)">{{item.name}}</span>
            <span v-for="(seat,idx) in item.seats" :key="idx" :index="idx" class="seat" tag="span" @click="swap($event,item.name,seat,idx)">{{seat.name}}</span>
        </div>
        <div class="add-hibachi" v-show="items.length !== 4" @click="edit()">
            <i class="fa fa-3x fa-plus ghost"></i>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import editor from "../editor/hibachi";

export default {
  props: ["zone", "tables"],
  components: { editor },
  data() {
    return {
      target: null,
      items: [],
      buffer: [],
      component: null,
      componentData: null
    };
  },
  beforeDestroy() {
    this.$socket.emit("[TABLE] UPDATE_HIBACHI_TABLES", {
      tables: this.items,
      zone: this.zone
    });
  },
  watch: {
    tables: {
      immediate: true,
      handler: "initial"
    },
    buffer: "resetStyle"
  },
  methods: {
    initial(tables) {
      this.items = tables || [];
    },
    swap(e, target, seat, index) {
      if (this.target === null) this.target = target;

      if (this.target !== target) {
        this.resetStyle([]);
        this.target = target;
        this.buffer = [index];
        e.target.classList.add("active");
      } else {
        this.buffer.push(index);
        e.target.classList.add("active");
      }

      if (this.buffer.length === 2) {
        const table = this.items.find(table => table.name === this.target);
        const [a, b] = this.buffer;

        const first = table.seats[a];
        const second = table.seats[b];

        table.seats.splice(a, 1, second);
        table.seats.splice(b, 1, first);
        this.buffer = [];
        this.target = null;
      }
    },
    edit(table, index) {
      let edit = false;
      
      if (table) {
        edit = true;
      } else {
        table = {
          feature: [],
          invoice: [],
          session: null,
          name: "",
          seat: 8,
          status: 1,
          seats: Array(8)
            .fill()
            .map((_, index) => ({
              name: index + 1,
              time: null,
              invoice: "",
              number: "",
              server: "",
              status: 1
            })),
          layout: "six",
          orientation: "left",
          type: "hibachi",
          zone: this.zone,
          grid: this.items.length,
          _id: ObjectId().toString()
        };
      }

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, table, edit };
        this.component = "editor";
      })
        .then(update => {
          edit ? this.items.splice(index, 1, update) : this.items.push(update);

          this.$socket.emit("[TABLE] SAVE", update);

          this.exitComponent();
        })
        .catch(removeTable => {
          this.exitComponent();

          if (removeTable) {
            this.items.splice(index, 1);
            this.$socket.emit("[TABLE] REMOVE", table);
          }
        });
    },
    resetStyle(buffer) {
      buffer.length === 0 &&
        document
          .querySelectorAll(".active")
          .forEach(dom => dom.classList.remove("active"));
    }
  }
};
</script>

<style scoped>
.hibachi-seat {
  margin: 5px 40px;
  background: #b0bec5;
  display: grid;
  grid-gap: 4px;
  padding: 4px;
}

.add-hibachi {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  border: 2px dashed #eee;
  background: #fff;
  margin: 5px 40px;
  cursor: pointer;
}

.seat.active {
  background: antiquewhite;
}
</style>

