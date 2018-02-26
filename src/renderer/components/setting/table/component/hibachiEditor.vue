<template>
  <div class="popupMask dark center" @click.self="init.reject(false)">
    <div class="editor">
      <header>
        <h5 v-if="init.edit">{{$t('title.create')}}</h5>
        <h5 v-else>{{$t('title.modify')}}</h5>
        <h3>{{$t('title.hibachiTable')}}</h3>
      </header>
      <div class="wrap">
        <inputer title="text.alias" v-model="init.group"></inputer>
        <div class="layout">
          <div class="left" @click="setLayout('left')">
            <div class="seat" v-for="(seat,index) in left">
              <span>{{seat.name}}</span>
            </div>
          </div>
          <div class="middle"></div>
          <div class="right" @click="setLayout('right')">
            <div class="seat" v-for="(seat,index) in right">
              <span>{{seat.name}}</span>
            </div>
          </div>
        </div>
      </div>
      <footer>
        <div class="opt">
          <span class="del" @click="init.reject(true)" v-show="init.edit">{{$t('button.delete')}}</span>
        </div>
        <button class="btn" @click="confirm" :disabled="!init.group">{{$t("button.confirm")}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import inputer from "../../common/inputer";

export default {
  props: ["init"],
  components: { inputer },
  data() {
    return {
      direction: "left",
      left: [7, 8, 9, 10, 6, 5, 4, 3, 2, 1, null].map((seat, index) => ({
        group: "",
        direction: "left",
        grid: index,
        name: seat,
        session: "",
        status: 1
      })),
      right: [10, 9, 8, 7, 6, 5, 1, 2, 3, 4, null].map((seat, index) => ({
        group: "",
        direction: "right",
        grid: index,
        name: seat,
        session: "",
        status: 1
      }))
    };
  },
  created() {},
  mounted() {
    this.setLayout("left");
  },
  methods: {
    setLayout(direction) {
      this.direction = direction;
      const dom = document.querySelector(".selected");
      dom && dom.classList.remove("selected");

      document.querySelector(`.${direction}`).classList.add("selected");
    },
    confirm() {
      const { group } = this.init;
      const tables = this[this.direction].filter(t => t.name).map(table => {
        Object.assign(table, { group });
        return table;
      });

      this.init.resolve(tables);
    }
  }
};
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr 10px 1fr;
  grid-template-rows: 1fr;
  grid-template-areas: "left middle right";
}

.seat {
  margin: 2px;
  background: #fcfcfc;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1em;
  font-family: "Agency FB";
  font-weight: bold;
  color: #b0bec5;
  border-radius: 4px;
}

.left,
.right {
  display: grid;
  height: 170px;
  padding: 1px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  padding: 1px;
  border: 2px solid #eee;
  border-radius: 4px;
  background: #eceff1;
}

.left {
  grid-area: left;
}

.right {
  grid-area: right;
}

.middle {
  grid-area: middle;
}

.left .seat:last-child {
  grid-column: 2/5;
  grid-row: 2/4;
}

.right .seat:last-child {
  grid-column: 1/4;
  grid-row: 2/4;
}

.selected {
  border: 2px solid #607d8b;
  background: #607d8b;
}
</style>