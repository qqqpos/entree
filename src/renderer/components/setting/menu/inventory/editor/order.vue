<template>
    <div class="popupMask dark center setting" @click.self="exit">
        <div class="editor">
            <header>
                <div class="f1">
                    <h5>{{$t('title.create')}}</h5>
                    <h3>{{$t('inventory.order')}}</h3>
                </div>
                <button class="remove" @click="init.reject(false)" v-show="inventory.items.length">{{$t('button.cancel')}}</button>
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
                            <div class="row header">
                                <span class="f1 text-center">{{$t('inventory.product')}}<span v-show="inventory.items.length" class="space-left ghost">( {{inventory.items.length}} )</span></span>
                                <span class="info">{{$t('inventory.qty')}}</span>
                                <span class="info">{{$t('inventory.cost')}}</span>
                            </div>
                            <ul ref="items">
                                <li v-for="(item,index) in inventory.items" :key="index" class="row flex-center item">
                                    <span class="f1 text-center">{{item.description}}</span>
                                    <span class="row flex-center info">
                                        <i class="fas fa-minus-circle space-right light clickable" @click="lessQty(item,index)"></i>
                                        <input v-model.number="item.stock">
                                        <i class="fas fa-plus-circle space-left light clickable" @click="moreQty(item)"></i>
                                    </span>
                                    <span class="info"><input v-model.number="item.cost"></span>
                                </li>
                            </ul>
                        </template>
                        <div class="placeholder" v-else>
                            <i class="fas fa-search-dollar"></i>
                            <p>{{$t('inventory.tip.emptyList')}}</p>
                        </div>
                    </div>
                    <div class="row flex-center">
                        <div class="column space-right">
                            <h5 class="space-left">{{$t('text.subtotal')}}</h5>
                            <input type="text" v-model="inventory.subtotal">
                        </div>
                        <div class="column space-right">
                            <h5 class="space-left">{{$t('text.tax')}}</h5>
                            <input type="text" v-model.number="inventory.tax" @input="calculate">
                        </div>
                        <div class="column space-right">
                            <h5 class="space-left">{{$t('text.shipping')}}</h5>
                            <input type="text" v-model.number="inventory.shipping" @input="calculate">
                        </div>  
                        <div class="column space-right">
                            <h5 class="space-left">{{$t('inventory.totalCost')}}</h5>
                            <input type="text" v-model.number="inventory.total">
                        </div>  
                    </div>
                </section>
            </div>
            <footer>
                <button class="btn" @click="scanItem">{{$t('button.scan')}}</button>
                <button class="btn" :disabled="inventory.items.length === 0" @click="confirm">{{$t('button.done')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
 </template>

<script>
import scanner from "../helper/scan";

export default {
  props: ["init"],
  components: { scanner },
  data() {
    return {
      component: null,
      componentData: null,
      inventory: this.init.inventory
    };
  },
  watch: {
    "inventory.items": {
      handler: "calculate",
      deep: true
    }
  },
  methods: {
    getBarcode() {
      return this.$promise("scanner");
    },
    getProduct(upc) {
      return new Promise(resolve => {
        this.$socket.emit("[INVENTORY] SEARCH_UPC", upc, item => {
          if (item) delete item._id;

          const product = Object.assign(
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
              stock: 1,
              sold: 0,
              orders: []
            }
          );

          resolve(product);
        });
      });
    },
    replenishment() {},
    async scanItem() {
      try {
        const upc = await this.getBarcode();
        const product = await this.getProduct(upc);
        const item = await this.replenishment(product);

        this.inventory.items.push(product);

        await this.$nextTick();
        this.$refs.items.scrollTop = this.$refs.items.scrollHeight;
        this.exitComponent();
      } catch (e) {
        this.exitComponent();
      }
    },
    lessQty(item, index) {
      item.stock > 1 ? item.stock-- : this.inventory.items.splice(index, 1);
    },
    moreQty(item) {
      item.stock++;
    },
    confirm() {
      this.$socket.emit("[INVENTORY] SAVE", this.inventory, this.init.resolve);
    },
    calculate() {
      const { items, tax, shipping } = this.inventory;

      const subtotal = items.reduce(
        (a, c) => a + (parseFloat(c.cost) || 0) * c.stock,
        0
      );

      const total =
        parseFloat(subtotal) +
        (parseFloat(tax) || 0) +
        (parseFloat(shipping) || 0);

      this.inventory.subtotal = toFixed(subtotal, 2);
      this.inventory.total = toFixed(total, 2);
    },
    exit() {
      this.inventory.items.length === 0 && this.init.reject(false);
    }
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
  height: 347px;
  background: #fff;
  margin: 10px 2px;
  border-radius: 4px;
}

.item input {
  width: 45px;
  text-align: center;
  border: none;
  background: #f6f6f6;
  margin: 2px 0;
}

.header {
  padding: 5px 7px 5px 0;
  background: #cfd8dc;
  border-radius: 4px 4px 0 0;
  font-weight: bold;
  color: #404a4e;
}

.info {
  width: 110px;
  text-align: center;
}

ul {
  height: 320px;
  overflow: auto;
}

.item {
  border-bottom: 1px solid #f5f5f5;
  padding: 2px 0;
}
</style>


