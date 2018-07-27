<template>
    <div class="table-layout-setting">
        <ul class="sections text-center">
            <li class="title">{{$t('text.section')}}</li>
            <li class="btn" v-for="(section,index) in sections" :key="index" @click="initialData(index)" @contextmenu="edit(section,index)">{{section[language]}}</li>
            <li class="btn" @click="edit()"><i class="fas fa-plus"></i></li>
        </ul>
        <component class="layout" :is="layout" :tables="sectionTables" :zone="zone"></component>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import grid from "./layout/grid";
import flow from "./layout/flow";
import hibachi from "./layout/hibachi";
import editor from "./component/sectionEditor";

export default {
  components: { grid, flow, hibachi, editor },
  computed: {
    ...mapGetters(["layouts", "tables", "language"])
  },
  data() {
    return {
      component: null,
      componentData: null,
      sectionTables: [],
      sections: [],
      layout: null,
      zone: ""
    };
  },
  created() {
    this.sections = this.layouts.table;

    this.initialData();
  },
  methods: {
    initialData(index = 0) {
      if (this.layouts.table[index]) {
        const { layout = "grid", zone } = this.layouts.table[index];

        this.sectionTables = this.tables[zone];
        this.zone = zone;
        this.layout = layout;
      }
    },
    edit(section, index) {
      let edit = false;

      if (section) {
        edit = true;
      } else {
        section = {
          zhCN: "",
          usEN: "",
          zone: "",
          layout: "grid"
        };
      }

      return new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, section, edit };
        this.component = "editor";
      })
        .then(update => {
          if (edit) {
            this.layouts.table.splice(index, 1, update);
          } else {
            this.layouts.table.push(update);
          }

          this.$socket.emit("[TABLE] SAVE_SECTION", this.layouts.table);
          this.exitComponent();
        })
        .catch(removeSection => {
          this.exitComponent();

          if (removeSection) {
            this.layouts.table.splice(index, 1);
            //update to database
          }
        });
    }
  }
};
</script>

<style scoped>
ul.sections {
  background: #f5f5f5;
  border-right: 1px solid #eee;
}

li.title {
  margin: 7px 0;
}
</style>

