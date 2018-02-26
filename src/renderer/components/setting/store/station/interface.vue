<template>
  <div>
    <draggable v-model="station.interface" :options="{animation: 300,ghostClass: 'ghost'}">
      <transition-group tag="article" class="grid" :class="{enlarge:station.enlarge}">
        <div v-for="(grid,index) in station.interface" :key="index" class="block" @click.prevent.stop="edit(grid,index)" :class="{disable:!grid.enable}">
          <i class="fa icon" :class="[grid.icon]"></i>
          <h1>{{grid.head}}</h1>
          <h4>{{grid.subhead}}</h4>
        </div>
      </transition-group>
    </draggable>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import editor from "../component/interfaceEditor";
export default {
  components: { editor, draggable },
  data() {
    return {
      station: clone(this.$store.getters.station),
      componentData: null,
      component: null
    };
  },
  beforeDestroy() {
    this.$socket.emit("[STATION] UPDATE", {
      _id: this.station._id,
      key: "interface",
      value: this.station.interface
    });
  },
  methods: {
    edit(grid, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, grid };
        this.component = "editor";
      })
        .then(_grid => {
          this.station.interface.splice(index, 1, _grid);
          this.$q();
        })
        .catch(() => this.$q());
    }
  }
};
</script>

<style scoped>
.grid {
  display: flex;
  flex-wrap: wrap;
  background: #eceff1;
}

.block {
  width: 175px;
  margin: 1px;
  padding: 40px 20px 17px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #333;
  position: relative;
  cursor: pointer;
}

i.icon {
  position: absolute;
  right: 0;
  top: 0px;
  padding: 10px 15px;
  font-size: 22px;
  color: var(--deepBlue);
}

.enlarge h1 {
  font-size: 2em;
  font-weight: normal;
}

.block h4 {
  font-weight: normal;
  color: gray;
}

.disable {
  color: #f5f5f5;
}

.disable h4 {
  color: #f5f5f5;
}
</style>