<template>
  <div class="layout">
    <draggable v-model="sections" @sort="isSectionSorted = true" :options="{animation: 300,group: 'section',ghostClass: 'sectionGhost',draggable:'.draggable'}">
      <transition-group tag="section" class="section">
        <div class="btn draggable" v-for="(section,index) in sections" @click="viewSection(index)" @contextmenu="editSection(section,index)" :key="index">{{section[language]}}</div>
        <div class="btn add" @click="newSection" :key="-1">
          <i class="fa fa-plus"></i>
        </div>
      </transition-group>
    </draggable>
    <draggable v-model="tabs" @sort="isTableSorted = true" :options="{animation: 300,group: 'table',ghostClass: 'tableGhost'}" class="f1">
      <transition-group tag="section" class="tables">
        <div class="table" v-for="(table,index) in tabs" @contextmenu="editTable(table,index)" :key="index">
          <span :class="[table.shape]" class="icon"></span>
          <span class="name">{{table.name}}</span>
        </div>
      </transition-group>
    </draggable>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import dialoger from "../../common/dialoger";
import tableEditor from "./component/tableEditor";
import sectionEditor from "./component/sectionEditor";

export default {
  components: { draggable, dialoger, tableEditor, sectionEditor },
  data() {
    return {
      language: this.$store.getters.language,
      sections: this.$store.getters.tables,
      isSectionSorted: false,
      isTableSorted: false,
      componentData: null,
      component: null,
      sectionIndex: 0,
      tabs: []
    };
  },
  created() {
    this.viewSection(0);
  },
  beforeDestroy() {
    this.isSectionSorted && this.updateSortedSection();
    this.isTableSorted && this.updateSortedTable();
  },
  methods: {
    viewSection(index) {
      let section = this.sections[index];

      this.sectionIndex = index;
      this.tabs =
        section.item.length !== 0
          ? section.item
          : Array(56).fill({ name: "", shape: "", zone: section.zone });
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
        .then(_section => {
          const { zone, usEN, zhCN } = _section;
          const item = Array(56)
            .fill()
            .map((_, index) => ({
              feature: [],
              invoice: [],
              name: "",
              server: null,
              session: null,
              shape: "",
              status: 1,
              time: 0,
              grid: index,
              zone
            }));

          this.sections.push({ usEN, zhCN, zone, item });
          this.viewSection(this.sections.length - 1);

          const sections = this.sections.map(section => {
            Object.assign(section, { item: [] });
            return section;
          });
          this.$socket.emit("[TABLE] SAVE_SECTION", sections);
          this.$q();
        })
        .catch(() => this.$q());
    },
    editSection(section, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, section, edit: true };
        this.component = "sectionEditor";
      })
        .then(() => {
          const sections = this.sections.map(section => {
            Object.assign(section, { item: [] });
            return section;
          });
          this.$socket.emit("[TABLE] SAVE_SECTION", sections);
          this.$q();
        })
        .catch(del => {
          if (del) {
            this.$socket.emit("[TABLE] REMOVE_ZONE", index);
            this.$store.getters.tables.splice(index, 1);
          }
          this.$q();
        });
    },
    editTable(table, index) {
      const { zone } = this.sections[this.sectionIndex];

      table = JSON.parse(JSON.stringify(table));
      Object.assign(table, { zone, grid: index });

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, table };
        this.component = "tableEditor";
      })
        .then(_table => {
          this.tabs.splice(index, 1, _table);
          this.$socket.emit("[TABLE] SAVE", {
            index,
            table: _table,
            section: this.sectionIndex
          });
          this.$q();
        })
        .catch(del => {
          del && this.removeTable(table, index);
          this.$q();
        });
    },
    removeTable(table, index) {
      table._id && this.$socket.emit("[TABLE] REMOVE", table._id);

      this.$store.getters.tables[this.sectionIndex].item.splice(index, 1, {
        _id: null,
        contain: [],
        feature: [],
        grid: index,
        name: "",
        shape: "",
        status: 1,
        zone: ""
      });

      this.$q();
    },
    updateSortedSection() {
      const sections = this.sections.map(section => {
        Object.assign(section, { item: [] });
        return section;
      });
      this.$socket.emit("[TABLE] SAVE_SECTION", sections);
      this.isSectionSorted = false;
    },
    updateSortedTable() {
      Object.assign(this.$store.getters.tables[this.sectionIndex], { item: this.tabs });
      const tables = this.tabs.map(table => table._id);
      this.$socket.emit("[TABLE] SORT", tables);
      this.isTableSorted = false;
    },
    refreshData() {
      this.sections = this.$store.getters.tables;
      this.viewSection(this.sectionIndex);
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