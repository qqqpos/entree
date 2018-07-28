<template>
    <div class="hibachi-setup-grid">
        <div class="hibachi-seat" :class="[item.layout,item.orientation]" v-for="(item,index) in items" :key="index">
            <span class="table-name" @contextmenu="edit(item,index)">{{item.name}}</span>
            <span v-for="(seat,idx) in item.seats" :key="idx" :index="idx" class="seat" tag="span" @click="swap($event,item.name,seat,idx)">{{seat.name}}</span>
        </div>
        <div class="add-hibachi" v-show="items.length !== 4" @click="edit()">
            <i class="fa fa-3x fa-plus"></i>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import editor from "../component/hibachiEditor";

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
          if (edit) {
            this.items.splice(index, 1, update);
          } else {
            this.items.push(update);
          }

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

.hibachi-seat span {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border-radius: 4px;
}
.hibachi-seat .table-name {
  font-weight: bold;
  color: #fff;
  background: #607d8b;
}

.hibachi-seat.eight {
  grid-template-rows: 1fr 1fr 1fr 1fr;
  grid-template-columns: 1fr 1fr 1fr;
}

.hibachi-seat.six {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
}

.six.left .table-name {
  grid-column: 2 / 3;
  grid-row: 2 / 4;
}

.six.right .table-name {
  grid-column: 1 / 2;
  grid-row: 2 / 4;
}

.eight.right .table-name {
  grid-column: 1 / 3;
  grid-row: 2/4;
}
.eight.left .table-name {
  grid-column: 2/4;
  grid-row: 2/4;
}

.seat.active {
  background: antiquewhite;
}
</style>

