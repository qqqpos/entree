<template>
  <div>
    <header class="nav">
      <div class="title">
        <h5></h5>
        <h3>{{$t("title.operators")}}</h3>
      </div>
      <nav>
        <span class="add" @click="create">{{$t('button.new')}}</span>
      </nav>
    </header>
    <external :title="op.name" :tooltip="'type.'+op.role" v-for="(op,index) in operators" :key="index" @open="$emit('set',op)" :disabled="op.role === 'Owner' && !authorized" :translate="false"></external>
    <div class="pages" v-if="list.length > 12">
      <paginator :of="list" :maxPage="5" :perPage="12" @page="setPage" class="f1"></paginator>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import external from "../../common/external";
import editor from "../component/operatorEditor";
import paginator from "../../../common/paginator";

export default {
  components: { editor, external, paginator },
  data() {
    return {
      authorized: this.$store.getters.authorized,
      componentData: null,
      component: null,
      list: [],
      page: 0
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[OPERATOR] LIST", data => {
      next(vm => {
        const sort = [
          "Owner",
          "Manager",
          "Cashier",
          "Waitstaff",
          "Bartender",
          "Driver",
          "Worker"
        ];
        vm.list = data.sort(
          (a, b) => (sort.indexOf(a.role) > sort.indexOf(b.role) ? 1 : -1)
        );
      });
    });
  },
  computed: {
    operators() {
      const min = this.page * 12;
      const max = min + 12;
      return this.list.slice(min, max);
    }
  },
  methods: {
    create() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "editor";
      })
        .then(_operator => {
          this.$socket.emit("[OPERATOR] NEW", _operator, data => {
            const sort = [
              "Owner",
              "Manager",
              "Cashier",
              "Waitstaff",
              "Bartender",
              "Driver",
              "Worker"
            ];

            this.list = data.sort(
              (a, b) => (sort.indexOf(a.role) > sort.indexOf(b.role) ? 1 : -1)
            );
          });
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    setPage(num) {
      this.page = num;
    }
  }
};
</script>