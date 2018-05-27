<template>
  <div>
    <header class="nav">
      <nav>
        <span class="add" @click="option">{{$t('button.option')}}</span>
      </nav>
      <div class="title">
        <h5>{{$t('text.items',items.length)}}</h5>
        <h3>{{$t("title.item")}}</h3>
      </div>
      <nav>
        <span class="add" @click="create">{{$t('button.new')}}</span>
      </nav>
    </header>
    <div class="items">
      <div v-for="(item,index) in items" @contextmenu="edit(item)" :key="index">{{item[language]}}</div>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import editor from "./editor";

export default {
  props: ["group"],
  components: { editor },
  data() {
    return {
      language: this.$store.getters.language,
      componentData: null,
      component: null,
      items: []
    };
  },
  created() {
    console.log(this.group);
    this.items = this.$store.getters.submenu[this.group] || [];
  },
  methods: {
    create() {
      const item = {
        zhCN: "",
        usEN: "",
        subItem: true,
        group: this.group,
        price: 0,
        num: this.items.length,
        print: Object.keys(this.$store.getters.config.printers)
      };
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, item, edit: false };
        this.component = "editor";
      })
        .then(_item => {
          this.items.push(Object.assign({}, _item, { clickable: true }));
          this.$socket.emit("[SUBMENU] ADD", _item);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    edit(item, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, item, edit: true };
        this.component = "editor";
      })
        .then(_item => {
          this.$socket.emit("[SUBMENU] UPDATE", _item);
          this.exitComponent();
        })
        .catch(del => {
          if (del) {
            this.$socket.emit("[SUBMENU] REMOVE", item);
            this.items.splice(index, 1);
          }

          this.exitComponent();
        });
    },
    option() {}
  }
};
</script>