<template>
    <div class="popupMask dark center setting" @click.self="init.reject">
        <div class="editor">
            <header>
                <div>
                    <h5>{{$t('title.edit')}}</h5>
                    <h3>{{$t('print.printStyle')}}</h3>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <selector title="print.fontFamily" v-model="language.fontFamily" :opts="fonts"></selector>
                <range title="print.fontSize" :min="0" :max="40" :step="1" v-model="language.fontSize"></range>
                <range title="print.subFontSize" :min="0.5" :max="1.5" :step="0.1" v-model="language.subFontSize"></range>
                <range title="print.lineHeight" :min="1" :max="2" :step="0.1" v-model="language.lineHeight"></range>
                <switches title="button.print" v-model="language.enable" @update="doubleCheck(index)"></switches>
                <switches title="print.itemQty" v-model="language.qty"></switches>
                <switches title="print.itemPrice" v-model="language.price"></switches>
                <switches title="print.menuID" v-model="language.id"></switches>
            </div>
            <footer>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import range from "../../common/range";
import inputer from "../../common/inputer";
import selector from "../../common/selector";
import switches from "../../common/switches";

export default {
  props: ["init"],
  components: { range, inputer, switches, selector },
  data() {
    return {
      language: JSON.parse(JSON.stringify(this.init.language)),
      fonts: this.init.fonts
    };
  },
  methods: {
    confirm() {
      this.init.resolve(this.language);
    }
  }
};
</script>