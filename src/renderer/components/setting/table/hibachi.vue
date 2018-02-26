<template>
  <div class="tab-content">
    <header class="nav">
      <div class="title">
        <h3>{{$t("title.hibachiTable")}}</h3>
      </div>
      <nav>
        <span class="add" @click="create">{{$t('button.new')}}</span>
      </nav>
    </header>
    <external :title="table" v-for="(table,index) in list" :key="index" @open="edit(table)"></external>
    <div class="pages" v-if="tables.length === 12">
      <pagination :of="tables" :max="5" :contain="12" @page="setPage" class="f1"></pagination>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import external from "../common/external";
import editor from "./component/hibachiEditor";

export default {
  components: { editor, external },
  computed: {
    list() {
      const min = this.page * 12;
      const max = this.page + 12;
      return this.tables.slice(min, max);
    }
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[HIBACHI] GROUP", data => {
      next(vm => {
        vm.tables = data;
      });
    });
  },
  data() {
    return {
      componentData: null,
      component: null,
      tables: [],
      page: 0
    };
  },
  methods: {
    create() {
      new Promise((resolve, reject) => {
        this.componentData = {
          resolve,
          reject,
          edit: false,
          group: "",
          tables: []
        };
        this.component = "editor";
      })
        .then(_tables => {
          this.$socket.emit("[HIBACHI] SAVE", _tables, () => {
            this.$socket.emit("[HIBACHI] GROUP", data => {
              this.tables = data;
              this.$q();
            });
          });
        })
        .catch(() => this.$q());
    },
    edit(table) {
      this.$socket.emit("[HIBACHI] TABLES", table, tables => {
        new Promise((resolve, reject) => {
          this.componentData = {
            resolve,
            reject,
            tables,
            edit: true,
            group: table
          };
          this.component = "editor";
        })
          .then(_tables => {
            this.$q();
          })
          .catch(del => {
            if (del) {
            }
            this.$q();
          });
      });
    },
    setPage(num) {
      this.page = num;
    }
  }
};
</script>