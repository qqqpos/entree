<template>
  <div class="groups">
    <div class="group" v-for="(group,index) in groups" :key="index" @click="setSeat(places[index])">
      <div class="seat" :data-seat="'seat'+places[index]">{{places[index]}}</div>
      <div class="list">
        <div v-for="(item,idx) in group" :key="idx" :class="{print:$route.name !== 'Menu' && !item.print}">
          <div class="main" @click.stop="select(item,index,idx)">
            <span class="qty">{{item.qty}}</span>
            <span class="f1">
              <span class="item">{{item[language]}}</span>
              <span class="side">{{item.side[language]}}</span>
            </span>
            <span class="price">{{item.total}}</span>
          </div>
          <div class="sub" v-for="(set,i) in item.choiceSet" :key="i" @click.stop="adjustChoiceSet(set,$event)">
            <span class="qty" :class="{hide:set.qty === 1}">{{set.qty}}</span>
            <span class="item">{{set[language]}}</span>
            <span class="price" :class="{hide:parseFloat(set.price) === 0}">({{set.price | decimal}})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  props: ["items", "seats"],
  data() {
    return {
      places: [],
      groups: []
    };
  },
  created() {
    this.$bus.on("SET_HIBACHI_SEAT", this.setSeat);
  },
  mounted() {
    this.setSeat(this.places[0]);
  },
  beforeDestroy() {
    this.$bus.off("SET_HIBACHI_SEAT", this.setSeat);
  },
  methods: {
    initial() {
      if (!this.seats) {
        const seats = new Set();

        this.items.forEach(item => item.seat && seats.add(item.seat));
        this.places = Array.from(seats);
      } else {
        this.places = this.seats;
      }

      this.groupItem(this.items);
    },
    select(item, g, i) {
      this.$route.name === "Menu" && this.focus(item, g, i);
    },
    focus(item, g, i) {
      const _item = this.$store.getters.item;
      const last = this.$store.getters.order.content.last();

      if (item === _item && item !== last) {
        const dom = document.querySelector(".groups .active");
        dom && dom.classList.remove("active");

        this.resetPointer();
      } else {
        let dom = document.querySelector(".groups .active");
        dom && dom.classList.remove("active");

        dom = document.querySelector(".sub.target");
        dom && dom.classList.remove("target");

        this.resetChoiceSet();

        document
          .querySelectorAll(".group")
          [g].children[1].children[i].classList.add("active");
        this.setPointer(item);
      }
    },
    adjustChoiceSet(choice, e) {
      if (this.ignore) return;
      if (this.$route.name !== "Menu") return;

      const dom = document.querySelector(".sub.target");
      dom && dom.classList.remove("target");

      if (this.choiceSet === choice) {
        this.setChoiceSetTarget(null);
      } else {
        e.currentTarget.classList.add("target");
        this.setChoiceSetTarget(choice);
      }
    },
    setSeat(seat) {
      this.$emit("update", seat);
      let dom = document.querySelector(".seat.current");
      dom && dom.classList.remove("current");

      this.$nextTick(() => {
        dom = document.querySelector(`[data-seat="seat${seat}"]`);
        dom && dom.classList.add("current");
      });
    },
    groupItem(items) {
      let groups = [];
      this.places.forEach((seat, index) =>
        groups.push(items.filter(item => item.seat === seat))
      );
      this.groups = groups;

      const dom = document.querySelector(".groups .active");
      dom && dom.classList.remove("active");
    },
    ...mapActions([
      "setPointer",
      "resetPointer",
      "resetChoiceSet",
      "setChoiceSetTarget"
    ])
  },
  watch: {
    items: {
      handler(items) {
        this.groupItem(items);
      },
      deep: true
    },
    "order._id": {
      handler: "initial",
      immediate: true
    },
    "order.number": "initial"
  },
  computed: {
    ...mapGetters(["language", "order"])
  }
};
</script>

<style scoped>
.group {
  display: grid;
  grid-template-columns: 20px 1fr;
  grid-template-areas: "seat list";
  min-height: 39px;
}

.seat {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #b0bec5;
  color: #fff;
}

.list {
  background: #eee;
  border-bottom: 1px dashed #ccc;
}

.list > div {
  background: #fff;
  display: flex;
  flex-direction: column;
  min-height: 29px;
  justify-content: center;
  padding: 5px 0;
  border-bottom: 1px dashed #e0e0e0;
}

.list > div:last-child {
  border-bottom: none;
}

.main {
  display: flex;
}

.main .qty {
  min-width: 25px;
  text-align: center;
}

.main .price {
  padding-right: 6px;
}

.sub {
  padding-left: 25px;
}

.sub .item {
  color: #666;
  text-indent: 8px;
}

.sub .price {
  min-width: 35px;
  padding-left: 4px;
  color: darkgray;
}

.hide,
.print .main .price {
  visibility: hidden;
}

.print:after {
  content: "\F04C";
  font-family: fontAwesome;
  font-weight: 600;
  position: absolute;
  right: 10px;
  color: #ff9800;
}

.group div.active {
  background: #b0bec5 !important;
}

.seat.current {
  background: #607d8b;
}

.seat.current + .list > div {
  background: #eceff1;
}
</style>