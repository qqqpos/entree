<template>
  <div>
    <div class="tab-content">
      <header class="nav">
        <div class="title">
          <h5></h5>
          <h3>{{$t("nav.submenu")}}</h3>
        </div>
        <nav>
          <span class="add" @click="create">{{$t('button.new')}}</span>
        </nav>
      </header>
      <external v-for="(submenu,index) in submenus" :key="index" :title="submenu" :translate="false" @open="$emit('set',submenu)"></external>
      <div class="pages" v-if="list.length > 12">
        <pagination :of="list" :max="5" :contain="12" @page="setPage" class="f1"></pagination>
      </div>
      <div :is="component" :init="componentData"></div>
    </div>
  </div>
</template>

<script>
import creator from "./creator";
import external from "../../common/external";

export default {
  props: ["submenu"],
  components: { external, creator },
  data() {
    return {
      list: [],
      componentData: null,
      component: null,
      page: 0
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[SUBMENU] GROUP", data => {
      next(vm => {
        vm.list = data;
      });
    });
  },
  computed: {
    submenus() {
      const min = this.page * 12;
      const max = min + 12;
      return this.list.slice(min, max);
    }
  },
  methods: {
    create() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "creator";
      })
        .then(name => {
          this.list.push(name);
          this.$q();
        })
        .catch(() => this.$q());
    },
    setPage(num) {
      this.page = num;
    }
  }
};
</script>