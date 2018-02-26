<template>
    <div class="popupMask setting dark center" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h5 v-if="init.edit">{{$t('title.modify')}}</h5>
                <h5 v-else>{{$t('title.create')}}</h5>
                <h3>{{$t('nav.item')}}</h3>
            </header>
            <div class="wrap">
                <inputer title="text.primary" v-model="init.item.usEN" :autoFocus="true" @keydown.enter="confirm"></inputer>
                <inputer title="text.secondary" v-model="init.item.zhCN" @keydown.enter="confirm"></inputer>
                <inputer title="text.price" v-model.number="init.item.price" @keydown.enter="confirm"></inputer>
                <div class="printers">
                    <label>{{$t('text.printer')}}</label>
                    <div class="inner">
                        <checkbox :title="printer" v-model="init.item.print" v-for="(printer,index) in printers" :key="index" :multiple="true" :val="printer"></checkbox>
                    </div>
                </div>
                <switches title="text.subItem" v-model="init.item.subItem"></switches>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="init.reject(false)" v-show="init.edit">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import checkbox from "../../common/checkbox";
import switches from "../../common/switches";

export default {
  props: ["init"],
  components: { inputer, checkbox, switches },
  data() {
    return {
      printers: Object.keys(this.$store.getters.config.printers)
    };
  },
  methods: {
    confirm() {
      if (!this.init.item.usEN) return;

      this.init.item.zhCN = this.init.item.zhCN || this.init.item.usEN;
      this.init.item.price = isNumber(this.init.item.price)
        ? this.init.item.price
        : 0;

      this.init.resolve(this.init.item);
    }
  }
};
</script>