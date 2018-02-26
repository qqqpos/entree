<template>
  <div class="popupMask setting dark center" @click.self="init.reject(false)">
    <div class="editor">
      <header>
        <h5>{{$t('title.edit')}}</h5>
        <h3>{{$t('title.sideOption')}}</h3>
      </header>
      <div class="wrap" :class="{extend}">
        <aside class="setup">
          <inputer v-model.trim="option.usEN" title="text.primary"></inputer>
          <inputer v-model.trim="option.zhCN" title="text.secondary"></inputer>
          <inputer v-model.number="option.price" title="text.price" placeholder="0.00"></inputer>
          <inputer v-model.number="option.extra" title="text.priceExtra" placeholder="0.00"></inputer>
          <selector v-model="option.template" :opts="templates" title="text.template" @update="toggleIgnore(!!option.template)"></selector>
          <switches v-model="option.replace" title="text.replaceName"></switches>
          <switches v-model="option.sub" title="text.subItem"></switches>
          <switches v-model="extend" title="button.setSubMenu" @input="toggleIgnore(extend)"></switches>
        </aside>
        <aside class="submenu" v-if="extend">
          <inputer v-model.number="maxSubItem" title="text.maxItem"></inputer>
          <inputer v-model.number="overCharge" title="text.overCharge" placeholder="0.00"></inputer>
          <div class="option">
            <checkbox :title="group" :val="group" v-for="(group,index) in groups" v-model="subMenu" :multiple="true" :key="index"></checkbox>
          </div>
        </aside>
      </div>
      <footer>
        <div class="opt">
          <checkbox title="text.ignore" v-model="option.ignore"></checkbox>
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
      option: JSON.parse(JSON.stringify(this.init.option)),
      groups: Object.keys(this.$store.getters.submenu) || [],
      templates: this.$store.getters.templates.map(t => ({
        label: t.name,
        tooltip: t.note || this.$t("text.items", t.contain.length),
        plainText: true,
        value: t.name
      })),
      maxSubItem: 0,
      overCharge: 0,
      subMenu: [],
      extend: false
    };
  },
  created() {
    this.templates.unshift({ label: this.$t("text.disable"), tooltip: "", value: "" });

    const { subMenu, maxSubItem, overCharge } = this.option;

    if (Array.isArray(subMenu)) {
      this.extend = true;
      this.subMenu = subMenu;
      this.maxSubItem = maxSubItem;
      this.overCharge = overCharge;
    }
  },
  methods: {
    toggleIgnore(boolean) {
      this.option.ignore = boolean;
    },
    confirm() {
      if (this.extend) {
        Object.assign(this.option, {
          maxSubItem: this.maxSubItem,
          overCharge: this.overCharge,
          subMenu: this.subMenu
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

.extend aside.submenu {
  padding: 0px 25px 0px 25px;
  margin: 15px 0;
  border-left: 1px solid #fff;
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