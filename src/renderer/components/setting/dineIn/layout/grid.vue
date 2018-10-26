<template>
    <div v-if="zone">
        <slick-list axis="xy" v-model="items" class="grid-table-setup" @input="update">
            <slick-item v-for="(item,index) in items" :key="index" :index="index" @contextmenu.native="edit(item,index)" class="table-seat">
                <span :class="[item.shape]" class="icon"></span>
                <span class="name">{{item.name}}</span>
            </slick-item>
        </slick-list>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { SlickList, SlickItem } from "vue-slicksort";
import editor from "../editor/table";

export default {
  props: ["zone", "tables"],
  components: { SlickList, SlickItem, editor },
  data() {
    return {
      componentData: null,
      component: null,
      updatedSort: null,
      items: []
    };
  },
  beforeDestroy() {
    this.applySort();
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
          seat: 1,
          zone: this.zone,
          grid: index
        }));

      (tables || []).forEach(table => {
        seats[table.grid] = table;
      });

      this.items = seats;
      this.applySort();
    },
    async edit(table, index) {
      const edit = !!table._id;

      try {
        const update = await this.$promise("editor", { table, edit });
        this.items.splice(index, 1, update);
        this.$socket.emit("[TABLE] SAVE", update);
      } catch (removeTable) {
        removeTable && this.$socket.emit("[TABLE] REMOVE", table);
      } finally {
        this.exitComponent();
      }
    },
    applySort() {
      if (Array.isArray(this.updatedSort)) {
        this.$socket.emit("[TABLE] NEW_SORT", this.updatedSort);
        this.updatedSort = null;
      }
    },
    update(data) {
      this.updatedSort = data
        .map((table, index) => ({
          _id: table._id,
          grid: index
        }))
        .filter(d => d._id);
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

