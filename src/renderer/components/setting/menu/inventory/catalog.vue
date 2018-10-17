<template>
    <div class="column">
        <nav class="row flex-center">
            <h3 class="f1 normal">{{$t('inventory.productList')}}</h3>
            <button class="mini-btn" @click="registerItem"><i class="fa fa-plus space light"></i>{{$t('button.new')}}</button>
        </nav>
        <table>
            <thead>
                <tr>
                    <th>{{$t('inventory.brand')}}</th>
                    <th class="clickable">{{$t('inventory.item')}} <i class="fa fa-sort ghost"></i></th>
                    <th>{{$t('inventory.category')}}</th>
                    <th>{{$t('inventory.size')}}</th>
                    <th class="clickable">{{$t('inventory.stock')}} <i class="fa fa-sort ghost"></i></th>
                    <th>{{$t('inventory.value')}}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item,index) in items" :key="index">
                    <td>{{item.brand}}</td>
                    <td>{{item.description}}</td>
                    <td>{{item.category}}</td>
                    <td>{{item.size}}</td>
                    <td>{{item.stock - item.sold}}</td>
                    <td class="agency light">$ {{(item.stock - item.sold) * item.msrp | decimal}}</td>
                    <td class="fas fa-pen-square ghost clickable" @click="edit(item)"></td>
                </tr>
            </tbody>
            <tfoot>

            </tfoot>
        </table>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import scan from "./helper/scan";
import catalog from "../editor/catalog";

export default {
  components: { scan, catalog },
  beforeRouteEnter: (from, to, next) => {
    appSocket.emit("[INVENTORY] CATALOG", items =>
      next(vm => {
        vm.items = Object.freeze(items);
      })
    );
  },
  data() {
    return {
      componentData: null,
      component: null,
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
      return this.$promise("catalog", { product });
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
    refreshData() {
      this.$socket.emit("[INVENTORY] CATALOG", items => {
        this.exitComponent();
        this.items = Object.freeze(items);
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

tr td {
  padding: 7px;
  text-align: center;
}

tr th {
  padding: 5px 0 5px;
  border-bottom: 1px solid #eceff1;
  background: #f5f5f5;
  color: #505865;
}
</style>


