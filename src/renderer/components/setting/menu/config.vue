<template>
  <div>
    <div class="tab-content">
    <header class="nav">
      <h3 class="title">{{$t('setting.default.orderLogic')}}</h3>
    </header>
    <toggle title="text.menuID" v-model="defaults.menuID"></toggle>
    <toggle title="text.favoriteItem" v-model="defaults.favorite"></toggle>
    <toggle title="setting.default.autoStack" tooltip="tip.default.autoStackItemQty" v-model="defaults.autoStackItem"></toggle>
    <toggle title="setting.default.matchQty" tooltip="tip.default.matchItemQty" v-model="defaults.matchItemQty"></toggle>
    <toggle title="setting.default.saveConfirm" tooltip="tip.default.saveConfirm" v-model="defaults.saveConfirm"></toggle>
    <text-list title="setting.default.menuSort" v-model="defaults.menuSortBy" :opts="types">
      <i class="fas fa-sort-numeric-down icon" slot="icon"></i>
    </text-list>
    <text-list title="setting.default.requestSort" v-model="defaults.requestSortBy" :opts="types.slice(0,3)">
      <i class="fas fa-sort-amount-down icon" slot="icon"></i>
    </text-list>
  </div>
  <div class="tab-content">
    <header class="nav">
      <h3 class="title">{{$t('setting.title.menuImport')}}</h3>
      <nav>
        <span @click="exportDialog">{{$t('button.export')}}</span>
      </nav>
    </header>
    <external title="button.import" @open="openDialog"></external>
  </div>
  <div :is="component" :init="componentData"></div>
</div>

</template>

<script>
import { mapActions } from "vuex";

import fileSaver from "file-saver";
import toggle from "../common/toggle";
import textList from "../common/textList";
import external from "../common/external";
import dialogModule from "../../common/dialog";

export default {
  components: { toggle, textList, external, dialogModule },
  data() {
    return {
      types: ["DEFAULT", "ALPHABETICAL", "PINYIN", "PRICE", "ID"].map(type => ({
        label: this.$t("sort." + type),
        tooltip: "",
        value: type
      })),
      componentData: null,
      component: null,
      defaults: {},
      sort: null
    };
  },
  created() {
    //hot patch
    const defaults = {
      paymentType: "CASH",
      percentageDiscount: true,
      percentageTip: true,
      autoStackItem: false,
      matchItemQty: false,
      menuID: false,
      favorite: true,
      menuSortBy: "DEFAULT"
    };

    this.defaults = this.$store.getters.config.defaults || defaults;
    this.sort = this.defaults.menuSortBy;
  },
  beforeDestroy() {
    this.sort !== this.defaults.alphabetical && this.setMenu();
  },
  beforeRouteLeave(to, from, next) {
    this.$socket.emit("[CONFIG] UPDATE", {
      key: "defaults",
      value: this.defaults
    });

    next();
  },
  methods: {
    openDialog() {
      const { remote } = this.$electron;
      const fs = remote.require("fs");
      const file = remote.dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "CSV", extensions: ["csv"] }]
      });

      if (!file) return;

      const csvFile = fs.readFileSync(file[0], "utf8");
      const splitCSV = row => {
        let matches = row.match(/(\s*"[^"]+"\s*|\s*[^,]+|,)(?=,|$)/g) || [];
        for (let n = 0; n < matches.length; ++n) {
          matches[n] = matches[n].trim();
          if (matches[n] == ",") matches[n] = "";
        }
        if (row[0] == ",") matches.unshift("");
        return matches;
      };

      let menu = [];
      let title = [];

      csvFile.split("\n").forEach((row, index) => {
        const values = splitCSV(row);

        // return if end of file
        if (values.length == 0) return;

        if (index === 0) {
          // The first line is title
          // use to define object keys
          title = values;
        } else {
          const item = values.reduce(
            (a, c, i) => Object.assign(a, { [title[i]]: c }),
            {}
          );
          menu.push(item);
        }
      });

      this.processImport(menu);
    },
    processImport(menu) {
      const { tax } = this.$store.getters;
      const codes = Object.keys(tax.class);
      const taxNames = Object.entries(tax.class).map(t => t[1].alias);
      const defaultTax = Object.entries(tax.class).findIndex(t => t[1].default);

      menu.forEach((item, index) => {
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
          num: index,
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
        msg: ["dialog.itemImported", menu.length],
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.$dialog(prompt).then(this.exitComponent);
    },
    exportDialog() {
      let excel = [
        [
          "menuID",
          "category",
          "usEN",
          "zhCN",
          "price",
          "taxClass",
          "printer",
          "manual",
          "spicy"
        ]
      ];
      let csvRows = [];

      for (let i = 0; i < excel.length; i++) {
        csvRows.push(excel[i].join(","));
      }
      let csvFile = csvRows.join("\n");
      let blob = new Blob([csvFile], { type: "text/plain;charset=utf-8" });

      const { config } = this.$store.getters;
      fileSaver.saveAs(blob, `${config.store.name} Menu.csv`);
    },
    ...mapActions(["setMenu"])
  }
};
</script>