<template>
  <div class="popupMask setting dark center" @click.self="init.reject(false)">
    <div class="editor">
      <header>
        <h5 v-if="init.item._id">{{$t('title.edit')}}</h5>
        <h5 v-else>{{$t('title.create')}}</h5>
        <h3>{{$t(item[language])}}</h3>
      </header>
      <div class="wrap">
        <inputer title="text.primary" v-model.trim="item.usEN"></inputer>
        <inputer title="text.secondary" v-model.trim="item.zhCN"></inputer>
        <inputer title="text.price" v-model.number="item.price"></inputer>
        <selector title="text.affix" v-model="item.affix" :opts="actions"></selector>
        <selector title="text.category" v-model="item.category" :opts="categories"></selector>
      </div>
      <footer>
        <div class="opt">
          <span class="del" @click="init.reject(true)" v-show="init.item._id">{{$t('button.delete')}}</span>
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
    this.actions = this.$store.getters.actions.map(action => ({
      label: action.usEN,
      tooltip: action.zhCN,
      plainText: true,
      value: action
    }));
    this.actions.unshift({
      label: this.$t("text.noUse"),
      tooltip: "",
      plainText: true,
      value: ""
    });
  },
  methods: {
    confirm() {
      this.$socket.emit(
        "[REQUEST] UPDATE_ITEM",
        {
          item: this.item,
          categoryIndex: this.init.categoryIndex,
          groupIndex: this.init.groupIndex,
          index: this.init.index
        },
        () => this.init.resolve()
      );
    }
  }
};
</script>