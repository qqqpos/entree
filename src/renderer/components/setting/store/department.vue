<template>
    <div>
        <header class="nav">
            <div class="title">
                <h3>{{$t("title.departments")}}</h3>
            </div>
            <nav>
                <span class="add" @click="create">{{$t('button.new')}}</span>
            </nav>
        </header>
        <external :title="department[language]" v-for="(department,index) in departments" :key="index" @open="edit(department,index)"></external>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import external from "../common/external";
import editor from "./component/departmentEditor";

export default {
  components: { external, editor },
  data() {
    return {
      departments: this.$store.getters.config.departments,
      language: this.$store.getters.language,
      componentData: null,
      component: null
    };
  },

  methods: {
    create() {
      this.$socket.emit("[CATEGORY] LIST", categories => {
        const department = {
          zhCN: "",
          usEN: "",
          contain: []
        };

        new Promise((resolve, reject) => {
          this.componentData = {
            resolve,
            reject,
            categories,
            department,
            edit: false
          };
          this.component = "editor";
        })
          .then(_department => {
            this.departments.push(_department);
            this.$socket.emit("[CONFIG] UPDATE", {
              key: "departments",
              value: this.departments
            });
            this.$q();
          })
          .catch(() => this.$q());
      });
    },
    edit(department, index) {
      this.$socket.emit("[CATEGORY] LIST", categories => {
        new Promise((resolve, reject) => {
          this.componentData = {
            resolve,
            reject,
            categories,
            department,
            edit: true
          };
          this.component = "editor";
        })
          .then(_department => {
            this.departments.splice(index, 1, _department);
            this.$socket.emit("[CONFIG] UPDATE", {
              key: "departments",
              value: this.departments
            });
            this.$q();
          })
          .catch(del => {
            if (del) {
              this.departments.splice(index, 1);
              this.$socket.emit("[CONFIG] UPDATE", {
                key: "departments",
                value: this.departments
              });
            }

            this.$q();
          });
      });
    }
  }
};
</script>