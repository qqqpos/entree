<template>
    <div class="popupMask dark center setting" @click.self="exit">
        <div class="editor">
            <header>
                <div class="f1">
                    <h5>{{$t('title.create')}}</h5>
                    <h3>{{$t('inventory.order')}}</h3>
                </div>
                <button class="remove" @click="removeDialog" v-if="inventory._id">{{$t('button.remove')}}</button>
                <button class="remove" @click="init.reject(false)" v-show="inventory.items.length" v-else>{{$t('button.cancel')}}</button>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <section class="row">
                    <div class="f1 column space-right">
                        <h5 class="space-left">{{$t('text.date')}}</h5>
                        <input type="text" v-model="inventory.date" placeholder="YYYY-MM-DD">
                    </div>
                    <div class="f1 column space-right">
                        <h5 class="space-left">{{$t('text.time')}}</h5>
                        <input type="text" v-model="inventory.create" placeholder="HH:mm">
                    </div>                    
                    <div class="f1 column space-right">
                        <h5 class="space-left">{{$t('inventory.handler')}}</h5>
                        <input type="text" name="handler" v-model="inventory.handler" onfocus="this.select()">
                    </div>  
                    <div class="column">
                        <h5 class="space-left">{{$t('inventory.vendor')}}</h5>
                        <input type="text" name="vendor" v-model="inventory.vendor" onfocus="this.select()">
                    </div>        
                </section>
                <section class="row">
                    <div class="f1 column space-right">
                        <h5 class="space-left">{{$t('inventory.memo')}}</h5>
                        <input type="text" v-model.number="inventory.memo">
                    </div>  
                    <div class="column">
                        <h5 class="space-left">{{$t('inventory.reference')}}</h5>
                        <input type="text" v-model="inventory.reference">
                    </div>                      
                </section>
                <section>
                    <div class="inventory-item">
                        <template v-if="inventory.items.length">
                            <div class="row header">
                                <span class="f1 text-center"><span v-show="inventory.items.length" class="space-right normal light">{{inventory.items.length}}</span>{{$t('inventory.product')}}</span>
                                <span class="info">{{$t('inventory.qty')}}</span>
                                <span class="info">{{$t('inventory.cost')}}</span>
                            </div>
                            <ul ref="items">
                                <li v-for="(item,index) in inventory.items" :key="index" class="row flex-center item">
                                    <span class="f1 text-center">{{item.description}}</span>
                                    <span class="row flex-center info">
                                        <i class="fas fa-minus-circle space-right light clickable" @click="lessQty(item,index)"></i>
                                        <input v-model.number="item.stock" onfocus="this.select()">
                                        <i class="fas fa-plus-circle space-left light clickable" @click="moreQty(item)"></i>
                                    </span>
                                    <span class="info"><input v-model.number="item.cost" onfocus="this.select()"></span>
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
                            <input type="text" v-model="inventory.subtotal" :disabled="true">
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
                            <input type="text" v-model.number="inventory.total" :disabled="true">
                        </div>  
                    </div>
                </section>
            </div>
            <footer>
                <button class="btn" :disabled="inventory.items.length === 0" @click="update" v-if="inventory._id">{{$t('button.update')}}</button>
                <button class="btn" :disabled="inventory.items.length === 0" @click="confirm" v-else>{{$t('button.done')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
 </template>

<script>
import dialogModule from "../../../../common/dialog";

export default {
  props: ["init"],
  components: { dialogModule },
  data() {
    return {
      buffer: "",
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
  created() {
    window.addEventListener("keydown", this.reader, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.reader, false);
  },
  methods: {
    async reader(e) {
      clearTimeout(this.timeout);

      this.timeout = setTimeout(() => {
        this.buffer = "";
      }, 200);

      if (e.key.length === 1) this.buffer += e.key;

      if (e.key === "Enter") {
        try {
          const product = await this.getProduct(this.buffer);
          const item = await this.replenishment(product);

          this.inventory.items.push(product);

          await this.$nextTick();
          this.$refs.items.scrollTop = this.$refs.items.scrollHeight;
          this.exitComponent();
        } catch (e) {
          this.exitComponent();
        }
      }
    },
    getProduct(upc) {
      return new Promise((resolve, reject) => {
        this.$socket.emit("[INVENTORY] SEARCH_UPC", upc, item => {
          if (item) {
            delete item._id;
          } else {
            reject();
          }

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
    lessQty(item, index) {
      item.stock > 1 ? item.stock-- : this.inventory.items.splice(index, 1);
    },
    moreQty(item) {
      item.stock++;
    },
    confirm() {
      const { date, create } = this.inventory;
      const time = new Date(date + " " + create);

      if (moment(time).isValid()) {
        Object.assign(this.inventory, { time: +time });

        this.$socket.emit(
          "[INVENTORY] SAVE",
          this.inventory,
          this.init.resolve
        );
      } else {
        const prompt = {
          title: "dialog.invalidDate",
          msg: "dialog.checkDateFormat",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        this.$dialog(prompt).then(this.exitComponent);
      }
    },
    update() {
      this.$socket.emit(
        "[INVENTORY] UPDATE",
        this.inventory,
        this.init.resolve
      );
    },
    async removeDialog() {
      const prompt = {
        title: "dialog.confirm.remove",
        msg: "dialog.tip.removeInventoryConfirm"
      };

      try {
        await this.$dialog(prompt);
        this.$socket.emit(
          "[INVENTORY] REMOVE",
          this.inventory._id,
          this.init.resolve
        );
      } catch (e) {
        this.exitComponent();
      }
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
      if (this.inventory._id || this.inventory.items.length === 0)
        this.init.reject(false);
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

input:focus {
  border: 2px solid #2196f3;
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


