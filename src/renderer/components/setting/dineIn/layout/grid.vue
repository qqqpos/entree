<template>
    <div>
        <slick-list axis="xy" v-model="items" class="grid-table-setup" @input="update">
            <slick-item v-for="(item,index) in items" :key="index" :index="index" @contextmenu="edit(item)" class="table-seat">
                <span :class="[item.shape]" class="icon"></span>
                <span class="name">{{item.name}}</span>
            </slick-item>
        </slick-list>
    </div>
</template>

<script>
import { SlickList, SlickItem } from "vue-slicksort";

export default {
  props: ["zone", "tables"],
  components: { SlickList, SlickItem },
  data() {
    return {
      updated: [],
      items: []
    };
  },
  methods: {
    initial(tables) {
      const seats = Array(56)
        .fill()
        .map((_, index) => ({
          feature: [],
          invoice: [],
          session: null,
          server: null,
          time: null,
          status: 1,
          shape: "",
          name: "",
          seats: 1,
          zone: this.zone,
          grid: index
        }));

      (tables || []).forEach(table => {
        seats[table.grid] = table;
      });

      this.items = seats;
    },
    edit(table) {
      console.log(table);
    },
    update(data) {
      this.updated = data.map((table, index) => ({
        _id: table._id,
        grid: index
      }));
    }
  },
  watch: {
    tables: {
      immediate: true,
      handler: "initial"
    }
  }
};
</script>

<style scoped>
</style>

