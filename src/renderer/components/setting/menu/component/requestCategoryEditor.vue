<template>
  <div class="popupMask setting dark center" @click.self="init.reject(false)">
    <div class="editor">
      <header>
        <h5 v-if="category[language]">{{$t('title.edit')}}</h5>
        <h5 v-else>{{$t('title.create')}}</h5>
        <h3>{{$t(category[language])}}</h3>
      </header>
      <div class="wrap">
        <inputer title="text.primary" v-model.trim="category.usEN" length="19"></inputer>
        <inputer title="text.secondary" v-model.trim="category.zhCN" length="19"></inputer>
        <inputer title="text.contain" v-model.trim="category.contain" v-if="manual"></inputer>
        <div class="checkboxes" v-else>
          <checkbox :title="name" v-model="category.contain" :val="name" v-for="(name,index) in categories" :key="index" :multiple="true" :translate="false"></checkbox>
        </div>
      </div>
      <footer>
        <div class="opt">
          <switches title="text.manualInput" v-model="manual" :reverse="true"></switches>
        </div>
        <button class="btn" @click="clear">{{$t('button.clear')}}</button>
        <button class="btn" @click="confirm">{{$t('button.done')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import inputer from "../../common/inputer";
import switches from "../../common/switches";
import checkbox from "../../common/checkbox";
export default {
  props: ["init"],
  components: { inputer, switches, checkbox },
  data() {
    return {
      manual: false,
      language: this.$store.getters.language,
      category: JSON.parse(JSON.stringify(this.init.category)),
      categories: this.init.categories
    };
  },
  methods: {
    clear() {
      Object.assign(this.category, {
        usEN: "",
        zhCN: "",
        contain: ""
      });
    },
    confirm() {
      !Array.isArray(this.category.contain) &&
        (this.category.contain = this.category.contain.split(","));

      this.category.item = [];
      this.$socket.emit(
        "[REQUEST] UPDATE_CATEGORY",
        {
          category: this.category,
          index: this.init.index
        },
        () => this.init.resolve()
      );
    }
  }
};
</script>