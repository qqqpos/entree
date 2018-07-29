<template>
    <div>
        <slick-list axis="xy" v-model="items" class="grid-table-setup" @input="update">
            <slick-item v-for="(item,index) in items" :key="index" :index="index" @contextmenu="edit(item)" class="table-seat">
                <span :class="[item.shape]" class="icon"></span>
                <span class="name">{{item.name}}</span>
            </slick-item>
        </slick-list>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { SlickList, SlickItem } from "vue-slicksort";
import tableEditor from "../component/tableEditor";

export default {
  props: ["zone", "tables"],
  components: { SlickList, SlickItem, tableEditor },
  data() {
    return {
      componentData: null,
      component: null,
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
      console.log(table)
      new Promise((resolve, reject) => {
        const edit = !!table._id;
        this.componentData = { resolve, reject, table, edit };
        this.compoennt = "tableEditor";
      })
        .then(update => {
          console.log(update)
          this.exitComponent();
        })
        .catch(removeTable => {
          this.exitComponent();
        });
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

