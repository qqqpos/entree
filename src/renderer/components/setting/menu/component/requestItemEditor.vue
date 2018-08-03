<template>
  <div class="popupMask setting dark center" @click.self="init.reject(false)">
    <div class="editor">
      <header>
        <div>
          <h5>{{$t(init.item._id ? 'title.edit' : 'title.create')}}</h5>
          <h3>{{$t(item[language])}}</h3>
        </div>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <inputer title="text.primary" v-model.trim="item.usEN"></inputer>
        <inputer title="text.secondary" v-model.trim="item.zhCN"></inputer>
        <inputer title="text.price" v-model.number="item.price"></inputer>
        <selector title="text.affix" v-model="item.affix" :opts="actions"></selector>
        <selector title="text.category" v-model="item.category" :opts="categories"></selector>
      </div>
      <footer>
        <div class="opt">
          <span class="del" @click="remove" v-show="init.item._id">{{$t('button.delete')}}</span>
        </div>
        <button class="btn" @click="confirm">{{$t('button.done')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import inputer from "../../common/inputer";
import switches from "../../common/switches";
import checkbox from "../../common/checkbox";
import selector from "../../common/selector";

export default {
  props: ["init"],
  components: { inputer, switches, checkbox, selector },
  data() {
    return {
      actions: [],
      categories: this.init.categories,
      language: this.$store.getters.language,
      item: JSON.parse(JSON.stringify(this.init.item))
    };
  },
  created() {
    this.actions = this.$store.getters.layouts.action
      .filter(({ zhCN, usEN }) => zhCN && usEN)
      .map(({ usEN, zhCN, key }) => ({
        label: usEN,
        tooltip: zhCN,
        plainText: true,
        value: key
      }));

    this.actions.unshift({
      label: this.$t("text.noUse"),
      tooltip: "",
      plainText: true,
      value: ""
    });
  },
  methods: {
    remove() {
      this.$socket.emit("[REQUEST] REMOVE_ITEM", this.item, () =>
        this.init.reject(true)
      );
    },
    confirm() {
      if (!this.item.zhCN) this.item.zhCN = this.item.usEN;

      this.$socket.emit("[REQUEST] UPDATE_ITEM", this.item, item =>
        this.init.resolve(item)
      );
    }
  }
};
</script>