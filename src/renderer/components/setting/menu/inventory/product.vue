<template>
    <div class="column">
        <nav class="row flex-center">
            <h3 class="f1 normal">{{$t('inventory.productList')}}</h3>
            <button class="mini-btn" @click="addProduct"><i class="fa fa-plus space light"></i>{{$t('button.new')}}</button>
        </nav>
        <table>
            <thead>
                <tr>
                    <th>Brand</th>
                    <th class="clickable">Item <i class="fa fa-sort ghost"></i></th>
                    <th>Category</th>
                    <th>Size</th>
                    <th class="clickable">Stock <i class="fa fa-sort ghost"></i></th>
                    <th>Value</th>
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
    </div>
</template>

<script>
export default {
  beforeRouteEnter: (from, to, next) => {
    appSocket.emit("[INVENTORY] PRODUCT_LIST", items =>
      next(vm => {
        vm.items = Object.freeze(items);
      })
    );
  },
  data() {
    return {
      items: []
    };
  },
  methods: {
    addProduct() {}
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


