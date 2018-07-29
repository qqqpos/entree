<template>
    <div class="popupMask setting dark center" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <div>
                    <h5>{{$t(init.edit ? 'title.edit' : 'title.create')}}</h5>
                    <h3>{{$t('table.hibachi')}}</h3>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <inputer title="text.alias" v-model="table.name" :autoFocus="true" @keydown.enter.native="confirm"></inputer>
                <selector title="table.layout" v-model="table.layout" :opts="layouts"></selector>
                <selector title="table.orientation" v-model="table.orientation" :opts="orientations"></selector>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="init.reject(true)">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="confirm" :disabled="!table.name">{{$t('button.confirm')}}</button>                
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import selector from "../../common/selector";

export default {
  props: ["init"],
  components: { inputer, selector },
  data() {
    return {
      layouts: ["six", "eight", "ten"].map(layout => ({
        label: this.$t(`table.${layout}Seats`),
        tooltip: "",
        value: layout
      })),
      orientations: ["left", "right"].map(direction => ({
        label: this.$t(`table.${direction}`),
        tooltip: "",
        value: direction
      })),
      table: clone(this.init.table)
    };
  },
  methods: {
    confirm() {
      switch (this.table.layout) {
        case "six":
          this.table.seat = 6;
          break;
        case "eight":
          this.table.seat = 8;
          break;
        case "ten":
          this.table.seat = 10;
          break;
      }
      this.table.seats = Array(this.table.seat)
        .fill()
        .map((_, index) => ({
          name: index + 1,
          time: null,
          invoice: "",
          number: "",
          server: "",
          status: 1
        }));

      this.init.resolve(this.table);
    }
  }
};
</script>

<style scoped>
</style>

