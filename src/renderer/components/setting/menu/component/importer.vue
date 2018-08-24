<template>
    <div class="popupMask dark setting center">
      <div class="editor" v-if="!component">
        <header>
          <div>
            <h3>{{$t('title.menu')}}</h3>
          </div>
        </header>
        <div class="wrap no-padding">
          <table>
            <tr class="text-center">
              <th v-for="(title,index) in titles" :key="index">{{title}}</th>
            </tr>
            <tr v-for="(item,index) in init.menu" :key="index" class="text-center">
              <td v-for="(value,key,i) in item" :key="i">{{value}}</td>
            </tr>
          </table>
        </div>
        <footer>
          <button class="btn" @click="init.reject">{{$t('button.cancel')}}</button>
          <button class="btn" @click="importMenu">{{$t('button.import')}}</button>
        </footer>
      </div>
      <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import dialogModule from "../../../common/dialog";

export default {
  props: ["init"],
  components: { dialogModule },
  data() {
    return {
      componentData: null,
      component: null,
      titles: []
    };
  },
  created() {
    this.titles = Object.keys(this.init.menu[0]);
  },
  methods: {
    importMenu() {
      const { tax } = this.$store.getters;
      const codes = Object.keys(tax.class);
      const taxNames = Object.entries(tax.class).map(t => t[1].alias);
      const defaultTax = Object.entries(tax.class).findIndex(t => t[1].default);

      this.init.menu.forEach(item => {
        if (!item.zhCN) item.zhCN = item.usEN;

        let printer = {};
        const taxIndex = taxNames.findIndex(name => name === item.taxClass);
        const taxClass = taxIndex !== -1 ? codes[taxIndex] : codes[defaultTax];

        item.printer
          .split(",")
          .forEach(
            name => (printer[name] = { replace: false, zhCN: "", usEN: "" })
          );

        Object.assign(item, {
          printer,
          taxClass,
          num: 99,
          priority: 0,
          option: [],
          price: item.price.split(","),
          spicy: !!item.spicy,
          manual: !!item.manual
        });

        this.$socket.emit("[ITEM] UPDATE", item);
      });

      const prompt = {
        title: "dialog.importedSuccessful",
        msg: ["dialog.itemImported", this.init.menu.length],
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.$dialog(prompt).then(this.init.resolve);
    }
  }
};
</script>

<style scoped>
.wrap {
  height: 500px;
  max-width: 850px;
  overflow: auto;
}
th {
  padding: 5px;
  background: #607d8b;
  font-weight: normal;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}

td {
  padding: 2px 8px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: clip;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
}
</style>

