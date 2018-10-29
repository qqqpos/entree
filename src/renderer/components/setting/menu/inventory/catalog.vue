<template>
    <div class="column">
        <nav class="row flex-center">
            <h3 class="f1 normal">{{$t('inventory.productList')}}</h3>
            <button class="mini-btn" @click="registerItem"><i class="fa fa-plus space light"></i>{{$t('button.new')}}</button>
        </nav>
        <table v-if="items.length">
            <thead>
                <tr>
                    <th>{{$t('inventory.brand')}}</th>
                    <th class="name clickable" @click="toggleUPC">{{$t('inventory.item')}}</th>
                    <th>{{$t('inventory.category')}}</th>
                    <th>{{$t('inventory.size')}}</th>
                    <th class="clickable" @click="sortByStock">{{$t('inventory.stock')}} <i class="fa fa-sort ghost"></i></th>
                    <th>{{$t('inventory.value')}}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item,index) in items" :key="index">
                    <td>{{item.brand}}</td>
                    <td class="name" v-if="viewUPC">{{item.upc}}</td>
                    <td class="name" v-else>{{item.description}}</td>
                    <td>{{item.category}}</td>
                    <td>{{item.size}}</td>
                    <td><span class="relative">{{item.inStock}}<i class="fas fa-exclamation low" v-if="item.inStock < item.minStock" :title="$t('inventory.tip.stockRequire',item.minStock)"></i></span></td>
                    <td class="agency light">$ {{item.inStock * item.msrp | decimal}}</td>
                    <td class="fas fa-pen-square ghost clickable" @click="edit(item)"></td>
                </tr>
            </tbody>
            <tfoot>

            </tfoot>
        </table>
        <div class="placeholder clickable" v-else @click="importDialog">
          <i class="fas fa-boxes"></i>
          <p>Click to Import Items</p>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import scan from "./helper/scan";
import editor from "./editor/catalog";

export default {
  components: { scan, editor },
  beforeRouteEnter: (from, to, next) => {
    appSocket.emit("[INVENTORY] CATALOG", items =>
      next(vm => {
        vm.items = items.map(item =>
          Object.assign(item, { inStock: item.stock - item.sold })
        );
      })
    );
  },
  data() {
    return {
      componentData: null,
      component: null,
      lastSort: null,
      viewUPC: false,
      items: []
    };
  },
  methods: {
    scan() {
      return this.$promise("scan");
    },
    search(upc) {
      return new Promise(resolve => {
        this.$socket.emit("[INVENTORY] SEARCH_UPC", upc, item => {
          resolve(
            Object.assign(
              {
                upc,
                description: "",
                unit: "",
                size: "",
                msrp: "0.00",
                weight: "",
                category: "",
                brand: "",
                minStock: 0
              },
              item
            )
          );
        });
      });
    },
    register(product) {
      return this.$promise("editor", { product });
    },
    async registerItem() {
      try {
        const upc = await this.scan();
        const product = await this.search(upc);
        const detail = await this.register(product, false);

        this.refreshData();
      } catch (e) {
        console.log(e);
        this.exitComponent();
      }
    },
    async edit(product) {
      try {
        await this.register(product);

        this.refreshData();
      } catch (exception) {
        this.exitComponent();
      }
    },
    sortByStock() {
      this.lastSort === "STOCK"
        ? this.items.reverse()
        : this.items.sort((a, b) => (a.inStock > b.inStock ? 1 : -1));
      this.lastSort = "STOCK";
    },
    toggleUPC() {
      this.viewUPC = !this.viewUPC;
    },
    importDialog() {
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

      let product = [];
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
          product.push(item);
        }
      });

      this.processImport(product)
    },
    processImport(product){
      
    },
    refreshData() {
      this.$socket.emit("[INVENTORY] CATALOG", items => {
        this.exitComponent();
        this.items = items.map(item =>
          Object.assign(item, { inStock: item.stock - item.sold })
        );
      });
    }
  }
};
</script>

<style scoped>
nav {
  padding: 5px 10px 5px 15px;
  background: #607d8b;
  color: #fff;
}

.placeholder {
  height: 650px;
}

tr td {
  padding: 7px 4px;
  text-align: center;
}

tr th {
  padding: 5px 0 5px;
  border-bottom: 1px solid #eceff1;
  background: #f5f5f5;
  color: #505865;
}

.low {
  position: absolute;
  right: -15px;
  font-size: 10px;
  color: #ff5722;
}

.name {
  min-width: 130px;
}
</style>


