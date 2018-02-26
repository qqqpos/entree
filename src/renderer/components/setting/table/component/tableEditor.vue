<template>
  <div class="popupMask setting dark center" @click.self="init.reject(false)">
    <div class="editor">
      <header>
        <h5>{{$t('title.edit')}}</h5>
        <h3>{{$t('title.table')}}</h3>
      </header>
      <div class="wrap">
        <inputer title="table.name" v-model="init.table.name" :autoFocus="true"></inputer>
        <inputer title="table.zone" v-model="init.table.zone" :disabled="true"></inputer>
        <selector title="table.icon" v-model="init.table.shape" :opts="iconOpts"></selector>
        <selector title="table.type" v-model="init.table.type" :opts="tableOpts"></selector>
        <div class="checkboxes" v-if="init.table.type === 'hibachi'">
          <checkbox :title="hibachi" v-model="init.table.contain" :val="hibachi" v-for="(hibachi,index) in tables" :key="index" :multiple="true"></checkbox>
        </div>
        <div class="printers" v-else>
          <label>{{$t('table.feature')}}</label>
          <div class="inner">
            <checkbox title="table.smoke" val="smoke" v-model="init.table.feature" :multiple="true"></checkbox>
            <checkbox title="table.window" val="window" v-model="init.table.feature" :multiple="true"></checkbox>
            <checkbox title="table.accessibility" val="accessibility" v-model="init.table.feature" :multiple="true"></checkbox>
            <checkbox title="table.outdoor" val="outdoor" v-model="init.table.feature" :multiple="true"></checkbox>
            <checkbox title="table.heightTop" val="heightTop" v-model="init.table.feature" :multiple="true"></checkbox>
          </div>
        </div>
      </div>
      <footer>
        <div class="opt">
          <span class="del" @click="init.reject(true)">{{$t('button.delete')}}</span>
        </div>
        <button class="btn" @click="init.resolve(init.table)">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import inputer from "../../common/inputer";
import selector from "../../common/selector";
import checkbox from "../../common/checkbox";

export default {
  props: ["init"],
  components: { inputer, selector, checkbox },
  created() {
    !Array.isArray(this.init.table.feature) &&
      Object.assign(this.init.table, { feature: [] });
    !Array.isArray(this.init.table.contain) &&
      Object.assign(this.init.table, { contain: [] });

    this.$socket.emit("[HIBACHI] GROUP", data => {
      this.tables = data;
    });
  },
  data() {
    return {
      tables: [],
      iconOpts: [
        {
          label: this.$t("text.noUse"),
          tooltip: "",
          value: ""
        },
        {
          label: "Regular Table",
          tooltip: "4 Seats",
          value: "icon-table-set"
        },
        {
          label: "Round Table",
          tooltip: "2 Seats",
          value: "icon-round-couple"
        },
        {
          label: "Square Table",
          tooltip: "2 Seats",
          value: "icon-square-couple"
        }
      ],
      tableOpts: ["regular", "hibachi", "bar"].map(type => ({
        label: this.$t("table." + type),
        tooltip: "",
        value: type
      }))
    };
  }
};
</script>

<style scoped>
.checkboxes {
  width: 360px;
}
</style>