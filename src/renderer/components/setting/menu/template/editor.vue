<template>
    <div class="popupMask setting dark center" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <div>
                    <h5></h5>
                    <h3>{{$t('title.item')}}</h3>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <inputer title="text.primary" v-model="item.usEN" :autoFocus="true" @keydown.enter.native="confirm"></inputer>
                <inputer title="text.secondary" v-model="item.zhCN" @keydown.enter.native="confirm"></inputer>
                <inputer title="text.price" v-model.number="item.price" @keydown.enter.native="confirm"></inputer>
                <div class="printers" v-if="printers.length > 0">
                    <label>{{$t('text.printer')}}</label>
                    <div class="inner">
                        <checkbox :title="name" v-model="printer" :val="name" v-for="(name,index) in printers" :key="index" :multiple="true" :translate="false"></checkbox>
                    </div>
                </div>
                <switches v-model="item.placeholder" title="text.placeholder"></switches>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="init.reject(true)">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="confirm" :disabled="!item.usEN">{{$t('button.confirm')}}</button>
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
      item: JSON.parse(JSON.stringify(this.init.item)),
      printers: this.init.printers.filter(name => !/cashier/i.test(name)),
      printer: this.init.item.print || this.init.printers || []
    };
  },
  methods: {
    confirm() {
      if (!this.item.zhCN) this.item.zhCN = this.item.usEN;
      let printers = new Set();
      this.init.printers
        .filter(name => /cashier/i.test(name))
        .forEach(name => printers.add(name));
      this.printer.forEach(name => printers.add(name));

      this.init.resolve(
        Object.assign(this.item, { print: Array.from(printers) })
      );
    }
  }
};
</script>