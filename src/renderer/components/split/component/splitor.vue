<template>
  <div class="split-item-list">
    <div v-for="(split,index) in items" @click="setIndex(index)" :key="index">
      <p v-for="(item,idx) in split" :key="idx">
        <span class="qty">{{item.qty}}</span>
        <span>{{item[language]}}</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      language: this.$store.getters.language,
      items: this.init.items,
      index: null
    };
  },
  created() {
    this.$bus.on("release", this.remove);
    this.$bus.on("destroy", this.destroy);
  },
  beforeDestroy() {
    this.$bus.off("release", this.remove);
    this.$bus.on("destroy", this.destroy);
  },
  methods: {
    setIndex(index) {
      this.index = index;

      const dom = document.querySelector(".split-item-list .selected");
      dom && dom.classList.remove("selected");

      document
        .querySelectorAll(".split-item-list div")
        [index].classList.add("selected");

      this.$emit("pick", this.items[index]);
    },
    remove() {
      const dom = document.querySelector(".split-item-list .selected");
      dom && dom.classList.remove("selected");

      if (isNumber(this.index)) {
        this.items.splice(this.index, 1);
        this.index = null;

        this.items.length === 0 && this.init.resolve();
      }
    },
    destroy() {
      this.init.resolve();
    }
  }
};
</script>

<style scoped>
.split-item-list {
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  width: 250px;
  height: 490px;
}

.split-item-list div {
  background: #fff;
  margin: 2px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 30px;
  padding: 5px 0;
  border-radius: 4px;
}

p {
  width: 240px;
  padding: 0 5px;
}

.qty {
  display: inline-block;
  min-width: 20px;
  text-align: center;
}

div.selected {
  background: #cfd8dc;
}
</style>