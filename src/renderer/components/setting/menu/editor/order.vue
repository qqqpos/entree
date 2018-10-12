<template>
    <div class="popupMask dark center setting">
        <div class="editor">
            <header>
                <div class="f1">
                    <h5>{{$t('title.create')}}</h5>
                    <h3>{{$t('inventory.order')}}</h3>
                </div>
                <button class="remove" @click="init.reject(false)">{{$t('button.cancel')}}</button>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <section class="row">
                    <div class="column space-right">
                        <h5 class="space-left">{{$t('text.date')}}</h5>
                        <input type="text" v-model="inventory.date">
                    </div>
                    <div class="column space-right">
                        <h5 class="space-left">{{$t('inventory.handler')}}</h5>
                        <input type="text" v-model="inventory.handler">
                    </div>  
                    <div class="column space-right">
                        <h5 class="space-left">{{$t('inventory.vendor')}}</h5>
                        <input type="text" v-model="inventory.vendor">
                    </div>                         
                    <div class="column">
                        <h5 class="space-left">{{$t('inventory.reference')}}</h5>
                        <input type="text" v-model="inventory.reference">
                    </div>                                    
                </section>
                <section class="row">
                    <div class="f1 column">
                        <h5 class="space-left">{{$t('inventory.memo')}}</h5>
                        <input type="text" v-model.number="inventory.memo">
                    </div>  
                </section>
                <section>
                    <div class="inventory-item">
                        <template v-if="inventory.items.length">
                            <!-- <div class="row">
                                <span class="f1">{{$t('inventory.product')}}</span>
                                <span>{{$t('inventory.qty')}}</span>
                                <span>{{$t('inventory.cost')}}</span>
                            </div>
                            <div v-for="(item,index) in inventory.items" :key="index" class="row">
                                <span class="f1">{{item.description}}</span>
                                <span>{{item.qty}}</span>
                                <span>{{item.cost}}</span>
                            </div> -->
                            <table>
                                <tr>
                                    <th>{{$t('inventory.product')}}</th>
                                    <th>{{$t('inventory.qty')}}</th>
                                    <th>{{$t('inventory.cost')}}</th>
                                </tr>
                                <tr v-for="(item,index) in inventory.items" :key="index" class="text-center">
                                    <td>{{item.description}}</td>
                                    <td>{{item.stock}}</td>
                                    <td>{{item.cost}}</td>
                                </tr>
                            </table>
                        </template>
                        <div class="placeholder" v-else>
                            <i class="fas fa-search-dollar"></i>
                            <p>List is Empty</p>
                        </div>
                    </div>
                    <div class="row flex-center">
                        <div class="column space-right">
                            <h5 class="space-left">{{$t('inventory.upc')}}</h5>
                            <input type="text" v-model="item.upc">
                        </div>
                        <div class="column space-right">
                            <h5 class="space-left">{{$t('inventory.qty')}}</h5>
                            <input type="text" v-model.number="item.qty">
                        </div>
                        <div class="column space-right">
                            <h5 class="space-left">{{$t('inventory.cost')}}</h5>
                            <input type="text" v-model.number="item.cost">
                        </div>  
                    </div>
                </section>
            </div>
            <footer>
                <button class="btn" @click="openScanDialog">{{$t('button.scan')}}</button>
                <button class="btn">{{$t('button.done')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
 </template>

<script>
import scanner from "../inventory/helper/scan";

export default {
  props: ["init"],
  components: { scanner },
  data() {
    return {
      component: null,
      componentData: null,
      inventory: this.init.inventory,
      item: {
        upc: "",
        qty: 1,
        cost: 0.0
      }
    };
  },
  methods: {
    openScanDialog() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "scanner";
      })
        .then(upc => this.getProduct(upc))
        .catch(this.exitComponent);
    },
    getProduct(upc) {
      this.$socket.emit("[INVENTORY] SEARCH_PRODUCT", upc, item => {
        this.exitComponent();
        this.stockIn(item);
      });
    },
    stockIn(item) {}
  }
};
</script>

<style scoped>
.wrap {
  padding: 5px 20px;
}

section {
  margin: 5px 0;
}

input {
  padding: 4px 6px;
  border: 2px solid #eee;
  border-radius: 4px;
}

.inventory-item {
  height: 350px;
  background: #fff;
  margin: 10px 2px;
  border-radius: 4px;
}
</style>


