<template>
  <div class="groups">
    <div class="group" v-for="(group,index) in groups" :key="index" @click="setSeat(seats[index])">
      <div class="seat" :data-seat="'seat'+seats[index]">{{seats[index]}}</div>
      <div class="list">
        <div v-for="(item,idx) in group" :key="idx">
          <div class="main" @click.stop="select(item,index,idx)">
            <span class="qty">{{item.qty}}</span>
            <span class="wrap">
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
      language: this.$store.getters.language,
      places: [],
      groups: []
    };
  },
  created() {
    if (!this.seats) {
      let seats = new Set();

      this.items
        .filter(item => item.hasOwnProperty("seat"))
        .forEach(item => seats.add(item.seat));

      this.places = Array.from(seats);
    } else {
      this.places = this.seats;
    }
  },
  mounted() {
    this.groupify(this.items);
    this.setSeat(this.places[0]);
  },
  methods: {
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
    setSeat(seat) {
      this.$emit("update", seat);
      let dom = document.querySelector(".seat.current");
      dom && dom.classList.remove("current");

      this.$nextTick(() => {
        dom = document.querySelector(`[data-seat="seat${seat}"]`);
        dom && dom.classList.add("current");
      });
    },
    groupify(items) {
      let groups = [];
      this.places.forEach((seat, index) =>
        groups.push(items.filter(item => item.seat === seat))
      );
      this.groups = groups;
    },
    ...mapActions(["resetPointer", "resetChoiceSet", "setPointer"])
  },
  watch: {
    items: {
      handler(items) {
        this.groupify(items);
      },
      deep: true
    }
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
  margin-left: 1px;
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
  border-bottom: 1px solid #eee;
}

.main {
  display: flex;
}

.main .qty {
  min-width: 25px;
  text-align: center;
}

.main .wrap {
  flex: 1;
}

.main .price {
  min-width: 36px;
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

.hide {
  visibility: hidden;
}

.group div.active {
  background: #e0e0e0;
}

.seat.current {
  background: #607d8b;
}
</style>