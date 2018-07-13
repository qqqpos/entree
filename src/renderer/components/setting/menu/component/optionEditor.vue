<template>
  <div class="popupMask setting dark center" @click.self="init.reject(false)">
    <div class="editor">
      <header>
        <div>
          <h5>{{$t('title.edit')}}</h5>
          <h3>{{$t('title.sideOption')}}</h3>
        </div>
      </header>
      <div class="banner"></div>
      <div class="wrap" :class="{extend}">
        <aside class="setup">
          <inputer v-model.trim="option.usEN" title="text.primary"></inputer>
          <inputer v-model.trim="option.zhCN" title="text.secondary"></inputer>
          <inputer v-model.number="option.price" title="text.price" placeholder="0.00"></inputer>
          <inputer v-model.number="option.extra" title="text.priceExtra" placeholder="0.00"></inputer>
          <selector v-model="option.template" :opts="templates" title="text.template" @update="toggleIgnore(!!option.template)"></selector>
          <external title="button.option" @open="openTemplateOption" v-show="option.template" :defaultStyle="false"></external>
          <switches v-model="option.replace" title="text.replaceName"></switches>
          <switches v-model="option.sub" title="text.subItem"></switches>
        </aside>
      </div>
      <footer>
        <div class="opt">
          <checkbox title="text.ignoreOptionText" v-model="option.ignore"></checkbox>
        </div>
        <button class="btn" @click="confirm">{{$t('button.done')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import editor from "../template/option";
import inputer from "../../common/inputer";
import switches from "../../common/switches";
import checkbox from "../../common/checkbox";
import selector from "../../common/selector";
import external from "../../common/external";

export default {
  props: ["init"],
  components: { inputer, switches, checkbox, selector, external, editor },
  data() {
    return {
      option: JSON.parse(JSON.stringify(this.init.option)),
      templates: this.$store.getters.templates.map(t => ({
        label: t.name,
        tooltip: t.note || this.$t("text.items", t.contain.length),
        plainText: true,
        value: t.name
      })),
      componentData: null,
      component: null,
      maxSubItem: 0,
      overCharge: 0,
      extend: false
    };
  },
  created() {
    this.templates.unshift({
      label: this.$t("text.disable"),
      tooltip: "",
      value: ""
    });
  },
  methods: {
    toggleIgnore(boolean) {
      this.option.ignore = boolean;
    },
    openTemplateOption() {
      const {
        templateOption = { addition: 0, startAt: 0, max: 0 }
      } = this.option;

      new Promise((resolve, reject) => {
        this.componentData = {
          option: templateOption,
          edit: true,
          resolve,
          reject
        };
        this.component = "editor";
      })
        .then(option => {
          delete option.name;
          Object.assign(this.option, { templateOption: option });
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    confirm() {
      if (this.extend) {
        Object.assign(this.option, {
          maxSubItem: this.maxSubItem,
          overCharge: this.overCharge
        });
      } else {
        delete this.option.subMenu;
      }
      this.init.resolve(this.option);
    }
  }
};
</script>

<style scoped>
.wrap.extend {
  display: flex;
  padding: 0;
}
.extend aside.setup {
  padding: 0px 25px 0px 25px;
  margin: 15px 0;
  border-right: 1px solid #eee;
}

.option {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  border: 1px solid #eee;
  background: #fff;
  padding: 2px;
  height: 188px;
  width: 320px;
  overflow: auto;
}
</style>