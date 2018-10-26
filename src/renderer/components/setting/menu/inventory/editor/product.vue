<template>
    <div class="popupMask dark center setting" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <div>
                    <h5>{{$t('title.create')}}</h5>
                    <h3>{{$t('inventory.product')}}</h3>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap">
               <section class="row">
                    <div class="column space-right">
                        <h5 class="space-left">{{$t('inventory.upc')}}</h5>
                        <input type="text" v-model="product.upc">
                    </div>
                    <div class="column space-right">
                        <h5 class="space-left">{{$t('inventory.category')}}</h5>
                        <input type="text" v-model="product.category">
                    </div>  
                    <div class="column space-right">
                        <h5 class="space-left">{{$t('inventory.unit')}}</h5>
                        <input type="text" v-model="product.unit">
                    </div>                         
                    <div class="column">
                        <h5 class="space-left">{{$t('inventory.size')}}</h5>
                        <input type="text" v-model="product.size">
                    </div>                                    
                </section>
                <section class="row">
                    <div class="column space-right">
                        <h5 class="space-left">{{$t('inventory.brand')}}</h5>
                        <input type="text" v-model="product.brand">
                    </div>                      
                    <div class="column f1">
                        <h5 class="space-left">{{$t('inventory.item')}}</h5>
                        <input type="text" v-model="product.description" ref="name">
                    </div>    
                </section>
                <section class="row">
                    <div class="column space-right">
                        <h5 class="space-left">{{$t('inventory.msrp')}}</h5>
                        <input type="text" v-model="product.msrp">
                    </div>  
                    <div class="column space-right">
                        <h5 class="space-left">{{$t('inventory.cost')}}</h5>
                        <input type="text" v-model="product.cost">
                    </div>                                        
                    <div class="column space-right">
                        <h5 class="space-left">{{$t('inventory.qty')}}</h5>
                        <input type="text" v-model.number="product.stock" ref="qty">
                    </div>  
                    <div class="column">
                        <h5 class="space-left">{{$t('inventory.stock')}}</h5>
                        <input type="text" v-model="stock" :disabled="true">
                    </div>                      
                </section>
            </div>
            <footer>
                <button class="btn" @click="init.resolve(product)" :disabled="!product.description">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      product: this.init.product
    };
  },
  mounted() {
    const target = this.product.description ? this.$refs.qty : this.$refs.name;
    target.focus();
  },
  computed: {
    stock() {
      return parseInt(this.product.stock - this.product.sold) || 0;
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


