<template>
    <div class="popupMask dark center setting" @click.self="init.reject">
        <div class="editor">
            <header>
                <div>
                    <h5>{{$t('text.edit')}} {{$t('text.price')}}</h5>
                    <h3>{{item[language]}}</h3>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <inputer title="text.price" v-model.number="price" :autoFocus="true"></inputer>
            </div>
            <footer>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../../common/inputer";

export default {
  props: ["init"],
  components: { inputer },
  data() {
    return {
      price: "0.00",
      item: this.init.item,
      language: this.$store.getters.language
    };
  },
  created() {
    this.item.price = [parseFloat(this.item.price[0]) || 0];
    this.price = this.item.price[0];
  },
  methods: {
    confirm() {
      this.item.price = [parseFloat(this.price) || 0];

      if (this.item.hasOwnProperty("prices"))
        this.item.prices.DEFAULT = this.item.price;

      this.init.resolve(this.item);
    }
  }
};
</script>

