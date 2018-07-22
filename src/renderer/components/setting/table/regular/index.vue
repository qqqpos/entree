<template>
  <div class="layout">
    <draggable v-model="layouts.table" @sort="isSectionSorted = true" :options="sectionOpt">
      <transition-group tag="section" class="section">
        <div class="btn draggable" v-for="(section,index) in layouts.table" @click="setSection(index)" @contextmenu="editSection(section,index)" :key="index">{{section[language]}}</div>
        <div class="btn add" @click="newSection" :key="-1">
          <i class="fa fa-plus"></i>
        </div>
      </transition-group>
    </draggable>
    <draggable v-model="tabs" @sort="isTableSorted = true" :options="tableOpt" class="f1">
      <transition-group tag="section" class="tables">
        <div class="table" v-for="(table,index) in tableSection" @contextmenu="editTable(table,index)" :key="index">
          <span :class="[table.shape]" class="icon"></span>
          <span class="name">{{table.name}}</span>
        </div>
      </transition-group>
    </draggable>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import draggable from "vuedraggable";
import dialogModule from "../../../common/dialog";
import tableEditor from "../component/tableEditor";
import sectionEditor from "../component/sectionEditor";

export default {
  components: { draggable, dialogModule, tableEditor, sectionEditor },
  data() {
    return {
      sectionOpt: {
        animation: 300,
        group: "section",
        ghostClass: "sectionGhost",
        draggable: ".draggable"
      },
      tableOpt: {
        animation: 300,
        group: "table",
        ghostClass: "tableGhost"
      },
      isSectionSorted: false,
      isTableSorted: false,
      componentData: null,
      component: null,
      section: 0,
      tabs: []
    };
  },
  computed: {
    tableSection() {
      const { zone } = this.layouts.table[this.section];
      const tables = this.tables[zone];

      let seats = Array(56)
        .fill()
        .map(() => ({
          feature: [],
          invoice: [],
          name: "",
          server: null,
          session: null,
          shape: "",
          status: 0,
          time: 0,
          grid: 0,
          status: 1,
          zone
        }));

      tables.forEach(table => {
        seats[table.grid] = table;
      });
      return seats;
    },
    ...mapGetters(["language", "tables", "layouts"])
  },
  beforeDestroy() {
    this.isSectionSorted && this.updateSortedSection();
    this.isTableSorted && this.updateSortedTable();
  },
  methods: {
    setSection(index) {
      this.section = index;
    },
    newSection() {
      const section = {
        usEN: "",
        zhCN: "",
        zone: "",
        item: []
      };
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, section, edit: false };
        this.component = "sectionEditor";
      })
        .then(section => {
          const { zone } = section;

          const tables = Array(56)
            .fill()
            .map((_, index) => ({
              feature: [],
              invoice: [],
              seats: 4,
              name: "",
              server: null,
              session: null,
              shape: "",
              status: 1,
              time: 0,
              grid: index,
              zone
            }));

          const index = this.layouts.table.length;
          this.layouts.table[index] = section;
          this.tables[zone] = tables;
          this.section = index;
          this.$socket.emit("[TABLE] SAVE_SECTION", this.layout.table);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    editSection(section, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, section, edit: true };
        this.component = "sectionEditor";
      })
        .then(() => {
          const sections = this.layout.table.map(section =>
            Object.assign(section, { item: [] })
          );
          this.$socket.emit("[TABLE] SAVE_SECTION", sections);
          this.exitComponent();
        })
        .catch(deleteSection => {
          this.exitComponent();

          deleteSection && this.deleteSectionDialog(index);
        });
    },
    deleteSectionDialog(index) {
      const prompt = {
        title: "dialog.removeConfirm",
        msg: "dialog.tableSectionRemoveConfirm",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.remove", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => this.checkSectionStatus(index))
        .catch(this.exitComponent);
    },
    checkSectionStatus(index) {
      this.$socket.emit("[TABLE] CHECK_SECTION", index, inuse => {
        const prompt = {
          title: "dialog.cantExecute",
          msg: ["dialog.tablesInuse", inuse],
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };
        inuse > 0
          ? this.$dialog(prompt).then(this.exitComponent)
          : this.deleteSection(index);
      });
    },
    deleteSection(index) {
      this.$socket.emit("[TABLE] REMOVE_SECTION", index);
      this.layouts.table.splice(index, 1);
      this.exitComponent();
    },
    editTable(table, index) {
      const { zone } = this.layouts.table[this.section];

      table = JSON.parse(JSON.stringify(table));
      table.seats = table.seats || 0;
      table._id = table._id || ObjectId().toString();
      Object.assign(table, { zone, grid: index });

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, table };
        this.component = "tableEditor";
      })
        .then(update => {
          this.$socket.emit("[TABLE] SAVE", update);
          this.tables[zone].splice(index, 1, update);
          this.exitComponent();
        })
        .catch(deleteTable => {
          deleteTable
            ? this.removeTableDialog(table, index)
            : this.exitComponent();
        });
    },
    removeTableDialog(table, index) {
      const prompt = {
        title: "dialog.removeConfirm",
        msg: ["dialog.tableRemoveConfirm", table.name]
      };

      this.$dialog(prompt)
        .then(() => this.removeTable(table, index))
        .catch(this.exitComponent);
    },
    removeTable(table, index) {
      const { _id, zone } = table;
      _id && this.$socket.emit("[TABLE] REMOVE", table);

      this.tables[zone].splice(
        index,
        1,
        Object.assign(table, {
          _id: null,
          feature: [],
          invoice: [],
          name: "",
          server: null,
          session: null,
          shape: "",
          status: 0,
          time: null
        })
      );
      this.exitComponent();
    },
    updateSortedSection() {
      // const sections = this.sections.map(section => {
      //   Object.assign(section, { item: [] });
      //   return section;
      // });
      this.$socket.emit("[TABLE] SAVE_SECTION", sections);
      this.isSectionSorted = false;
    },
    updateSortedTable() {
      // const tables = this.tabs.map(table => table._id);
      // this.$socket.emit("[TABLE] SORT", tables);
      this.isTableSorted = false;
    }
  }
};
</script>

<style scoped>
.layout {
  display: flex;
}

section.section {
  margin: 5px;
  display: flex;
  flex-direction: column;
  height: 726px;
  text-align: center;
}

.tables {
  display: flex;
  flex-wrap: wrap;
  padding: 5px 106px;
}

.table {
  display: inline-flex;
  flex-direction: column;
  width: 83px;
  height: 83px;
  background: linear-gradient(
    135deg,
    rgb(245, 247, 250) 0%,
    rgb(195, 207, 226) 110%
  );
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  margin: 4px;
  justify-content: center;
  align-items: center;
}

.icon {
  font-size: 4em;
}

.tableGhost {
  opacity: 0.5;
}

.apply {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
</style>