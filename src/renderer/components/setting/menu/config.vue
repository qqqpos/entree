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
    <text-list title="setting.default.menuSort" v-model="defaults.menuSortBy" :opts="types"></text-list>
    <text-list title="setting.default.requestSort" v-model="defaults.requestSortBy" :opts="types.slice(0,3)"></text-list>
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
import importer from "./component/importer";

export default {
  components: { toggle, textList, external, importer },
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

      this.$open("importer", { menu });
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