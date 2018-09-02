<template>
  <div>
    <div class="tab-content">
      <header class="nav">
        <div class="title">
          <h5></h5>
          <h3>{{$t("title.template")}}</h3>
        </div>
        <nav>
          <span class="add" @click="create">{{$t('button.new')}}</span>
        </nav>
      </header>
      <external v-for="(template,index) in templates" :key="index" :title="template.name" :tooltip="template.note" :translate="false" @open="$emit('set',template)"></external>
      <div class="pages" v-if="list.length > 12">
        <paginator :of="list" :maxPage="5" :perPage="12" @page="setPage" class="f1"></paginator>
      </div>
      <div :is="component" :init="componentData"></div>
    </div>
  </div>
</template>

<script>
import external from "../../common/external";
import creator from "../component/templateCreator";
import paginator from "../../../common/paginator";

export default {
  components: { external, creator, paginator },
  data() {
    return {
      list: this.$store.getters.templates,
      componentData: null,
      component: null,
      page: 0
    };
  },
  computed: {
    templates() {
      const min = this.page * 12;
      const max = min + 12;
      return this.list.slice(min, max);
    }
  },
  methods: {
    create() {
      let template = {
        name: "",
        note: "",
        insert: false,
        autoJump: false,
        contain: [{
          name: "",
          addition: 0,
          startAt: 0,
          max: 0,
          contain: []
        }]
      };

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, template };
        this.component = "creator";
      })
        .then(_template => {
          this.$socket.emit("[TEMPLATE] SAVE", _template, () => {
            this.list = this.$store.getters.templates;
            this.exitComponent();
          });
        })
        .catch(this.exitComponent);
    },
    setPage(num) {
      this.page = num;
    }
  }
};
</script>