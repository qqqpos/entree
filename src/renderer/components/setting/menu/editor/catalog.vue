<template>
    <div class="popupMask dark center setting" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <div>
                    <h5>{{$t(product._id ? 'title.edit':'title.create')}}</h5>
                    <h3>{{$t('inventory.product')}}</h3>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap">
               <section class="row">
                    <div class="column space-right">
                        <h5 class="space-left">{{$t('inventory.upc')}}</h5>
                        <input type="text" v-model="product.upc" :disabled="product._id">
                    </div>
                    <div class="column space-right">
                        <h5 class="space-left">{{$t('inventory.category')}}</h5>
                        <input type="text" v-model="product.category">
                    </div>  
                    <div class="column">
                        <h5 class="space-left">{{$t('inventory.brand')}}</h5>
                        <input type="text" v-model="product.brand">
                    </div>                                      
                </section>
                <section class="row">
                    <div class="column space-right f1">
                        <h5 class="space-left">{{$t('inventory.item')}}</h5>
                        <input type="text" v-model="product.description" ref="name">
                    </div>    
                    <div class="column">
                        <h5 class="space-left">{{$t('inventory.msrp')}}</h5>
                        <input type="text" v-model="product.msrp">
                    </div>  
                </section>
                <section class="row">
                    <div class="column space-right">
                        <h5 class="space-left">{{$t('inventory.unit')}}</h5>
                        <input type="text" v-model="product.unit">
                    </div>                         
                    <div class="column space-right">
                        <h5 class="space-left">{{$t('inventory.size')}}</h5>
                        <input type="text" v-model="product.size">
                    </div>     
                    <div class="column">
                        <h5 class="space-left">{{$t('inventory.minStockAlert')}}</h5>
                        <input type="text" v-model.number="product.minStock">
                    </div>                                    
                </section>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="removeDialog" v-show="product._id">{{$t('button.remove')}}</span>
                </div>
                <button class="btn" @click="update" :disabled="!product.description" v-if="product._id">{{$t('button.update')}}</button>
                <button class="btn" @click="save" v-else>{{$t('button.save')}}</button>
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
      component: null,
      componentData: null,
      product: clone(this.init.product)
    };
  },
  mounted() {
    this.$refs.name.focus();
  },
  methods: {
    removeDialog() {
      const prompt = {
        type: "question",
        title: "inventory.dialog.removeProduct",
        msg: ["inventory.tip.removeProduct", this.init.product.description],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.remove", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(this.remove)
        .catch(this.exitComponent);
    },
    save() {
      this.$socket.emit(
        "[INVENTORY] REGISTER_UPC",
        this.product,
        this.init.resolve
      );
    },
    update() {
      this.$socket.emit(
        "[INVENTORY] UPDATE_UPC",
        this.product,
        this.init.resolve
      );
    },
    remove() {
      this.$socket.emit(
        "[INVENTORY] UNREGISTER_UPC",
        this.product.upc,
        this.init.resolve
      );
    }
  }
};
</script>

<style scoped>
section {
  margin: 0 0 5px;
}

input {
  padding: 4px 6px;
  border: 2px solid #eee;
  border-radius: 4px;
  font-size: 18px;
}

.triple {
  width: 419px;
}

.triple input {
  width: 120px;
}

input[type="text"]:focus {
  border: 2px solid #64b5f6;
}
</style>


