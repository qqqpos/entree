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
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item,index) in items" :key="index">
                    <td>{{item.brand}}</td>
                    <td>{{item.description}}</td>
                    <td>{{item.category}}</td>
                    <td>{{item.size}}</td>
                    <td>{{item.stock}}</td>
                    <td class="agency light">$ {{item.stock * item.msrp | decimal}}</td>
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
import register from "../editor/product";

export default {
  components: { scan, register },
  beforeRouteEnter: (from, to, next) => {
    appSocket.emit("[INVENTORY] PRODUCT_LIST", items =>
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
    scanItem() {
      return this.$promise("scan");
    },
    searchProduct(upc) {
      return new Promise(resolve => {
        this.$socket.emit("[INVENTORY] SEARCH_PRODUCT", upc, item => {
          if (item) delete item._id;

          resolve(
            Object.assign(
              {
                upc,
                description: "",
                unit: "",
                size: "",
                stock: 0,
                sold: 0,
                cost: "0.00",
                msrp: "0.00",
                weight: "",
                category: "",
                brand: ""
              },
              item,
              {
                stock: 0,
                sold: 0
              }
            )
          );
        });
      });
    },
    dialog(product) {
      return this.$promise("register", { product });
    },
    async registerItem() {
      try {
        const upc = await this.scanItem();
        const product = await this.searchProduct(upc);
        const detail = await this.dialog(product);
        
        this.$socket.emit(
          "[INVENTORY] REGISTER_PRODUCT",
          detail,
          this.refreshData
        );
      } catch (e) {
        console.log(e);
        this.exitComponent();
      }
    },
    refreshData() {
      this.$socket.emit("[INVENTORY] PRODUCT_LIST", items => {
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


