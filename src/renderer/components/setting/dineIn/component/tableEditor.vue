<template>
    <div class="popupMask dark center setting" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <div>
                    <h5>{{$t(init.edit ? 'title.edit' : 'title.create')}}</h5>
                    <h3>{{$t('title.tableInfo')}}</h3>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <inputer title="table.name" v-model.trim="table.name" :autoFocus="true"></inputer>
                <inputer title="table.zone" v-model="table.zone" :disabled="true"></inputer>
                <inputer title="table.seat" v-model.number="table.seat"></inputer>
                <selector title="table.icon" v-model="table.shape" :opts="iconOpts"></selector>
                <selector title="table.type" v-model="table.type" :opts="tableOpts"></selector>
              <div class="printers">
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
                <span class="del" @click="init.reject(true)" v-show="init.edit">{{$t("button.delete")}}</span>
              </div>
                <button class="btn" @click="init.resolve(table)" :disabled="!table.name">{{$t('button.confirm')}}</button>
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
  data() {
    return {
      table: {},
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
      tableOpts: ["regular", "bar", "placeholder"].map(type => ({
        label: this.$t("table." + type),
        tooltip: "",
        value: type
      }))
    };
  },
  created() {
    const defaultOpt = {
      _id: ObjectId().toString(),
      type: "regular",
      feature: []
    };

    this.table = Object.assign({}, defaultOpt, this.init.table);
  }
};
</script>
