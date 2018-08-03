<template>
  <div>
    <draggable v-model="layouts.menu" @sort="isCategorySorted = true" :options="categoryOpt" class="category-wrap">
      <transition-group tag="section" class="category">
        <div v-for="(category,index) in layouts.menu" @click="setCategory(index)" @contextmenu="editCategory(category,index)" :key="index">{{category[language]}}</div>
      </transition-group>
    </draggable>
    <div class="items-wrap">
      <div v-for="(group,groupIndex) in items" :key="groupIndex">
        <draggable :list="group" @sort="isItemSorted = true" :options="{animation:300,group:group.category,ghostClass:'itemGhost',draggable:'.draggable'}">
          <transition-group tag="section" class="items" :name="'drag'">
            <div v-for="(item,itemIndex) in group" @contextmenu="editItem(item,groupIndex,itemIndex)" :class="{draggable:item._id,disable:!item._id}" :key="itemIndex" :data-menuid="item.menuID">{{item[language]}}</div>
          </transition-group>
        </draggable>
      </div>
    </div>
    <aside>
      <item-trend @edit="search"></item-trend>
    </aside>
    <div :is="component" :init="componentData" @copy="copy" :transfer="clipboard"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import Preset from "../../../preset";
import draggable from "vuedraggable";
import itemTrend from "./component/itemTrend";
import dialogModule from "../../common/dialog";
import itemEditor from "./component/itemEditor";
import categoryEditor from "./component/categoryEditor";

export default {
  components: {
    categoryEditor,
    dialogModule,
    itemEditor,
    draggable,
    itemTrend
  },
  data() {
    return {
      categoryOpt: {
        animation: 300,
        group: "category",
        ghostClass: "categoryGhost"
      },
      isCategorySorted: false,
      isItemSorted: false,
      componentData: null,
      component: null,
      clipboard: null,
      items: []
    };
  },
  computed: {
    ...mapGetters(["language", "layouts", "menu"])
  },
  created() {
    this.getItems();
  },
  mounted() {
    //window.addEventListener("keydown", this.entry, false);
  },
  beforeDestroy() {
    //window.removeEventListener("keydown", this.entry, false);

    this.isCategorySorted && this.updateCategorySort();
    this.isItemSorted && this.updateItemSort();
  },
  methods: {
    entry(e) {},
    setCategory(index) {
      this.isItemSorted && this.updateItemSort();
      this.getItems(index);
    },
    getItems(index = 0) {
      this.categoryIndex = index;

      let menu = [];

      this.layouts.menu[index].contain.forEach(category => {
        let items = (this.menu[category] || []).slice();
        let align = 6 - items.length % 3;
        if (align === 6) align = 3;

        Array(align)
          .fill()
          .forEach(() => items.push({ zhCN: "", usEN: "" }));

        menu.push(items);
      });

      this.items = menu;
    },
    editCategory(category, index) {
      new Promise((resolve, reject) => {
        this.$socket.emit("[CATEGORY] LIST", categories => {
          this.componentData = { resolve, reject, categories, category };
          this.component = "categoryEditor";
        });
      })
        .then(update => {
          this.$socket.emit(
            "[CATEGORY] UPDATE",
            { category: update, index },
            () => this.refreshData()
          );
        })
        .catch(this.exitComponent);
    },
    editItem(item, group, index) {
      const categories = this.layouts.menu[this.categoryIndex].contain.map(
        category => ({
          label: category,
          tooltip: "",
          plainText: true,
          value: category
        })
      );

      if (!item._id) item = this.copyLastItem(group, index);

      new Promise((resolve, reject) => {
        this.componentData = {
          edit: !!item._id,
          categories,
          resolve,
          reject,
          item
        };
        this.component = "itemEditor";
      })
        .then(update =>
          this.$socket.emit("[ITEM] UPDATE", update, () => this.refreshData())
        )
        .catch(deleteItem => {
          deleteItem ? this.itemDeleteDialog(item) : this.exitComponent();
        });
    },
    itemDeleteDialog(item) {
      const prompt = {
        title: "dialog.deleteConfirm",
        msg: ["dialog.deleteItemConfirm", item[this.language]],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.delete", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() =>
          this.$socket.emit("[ITEM] REMOVE", item, () => this.refreshData())
        )
        .catch(this.exitComponent);
    },
    copyLastItem(group, index) {
      let item;
      let lastItem = this.items[group][index - 1];

      if (lastItem && lastItem._id) {
        item = JSON.parse(JSON.stringify(lastItem));
        Object.assign(item, {
          _id: null,
          menuID: "",
          usEN: "",
          zhCN: "",
          price: [0],
          num: this.items[group].filter(i => i._id).length,
          prices: {}
        });
      } else {
        let defaultTax = "";
        Object.keys(this.$store.getters.tax.class).forEach(name => {
          if (this.$store.getters.tax.class[name].default === true)
            defaultTax = name;
        });

        item = Preset.item();
        const category = this.layouts.menu[this.categoryIndex].contain[group];
        Object.assign(item, {
          taxClass: defaultTax,
          category
        });
      }
      return item;
    },
    search({ category, _id }) {
      // const categoryIndex = this.categories.findIndex(group =>
      //   group.contain.includes(category)
      // );
      // if (categoryIndex !== -1) {
      //   this.setCategory(categoryIndex);
      //   this.items.forEach((group, index) => {
      //     const _index = group.findIndex(i => i._id === _id);
      //     if (_index !== -1) {
      //       const item = this.items[index][_index];
      //       this.editItem(item, index, _index);
      //     }
      //   });
      // }
    },
    updateCategorySort() {
      this.$socket.emit("[CATEGORY] SORT", this.layouts.menu);
      this.isCategorySorted = false;
    },
    updateItemSort() {
      const items = [];

      this.items.forEach((group, i) => {
        let item = group.filter(item => item._id);

        const category = this.layouts.menu[this.categoryIndex].contain[i];
        this.menu[category] = item;

        items.push(item.map(item => item._id));
      });

      this.$socket.emit("[ITEM] SORT", this.items);
      this.isItemSorted = false;
    },
    refreshData() {
      this.$nextTick(() => {
        this.categories = this.$store.getters.menu;
        this.getItems(this.categoryIndex);
        this.exitComponent();
      });
    },
    copy(data) {
      this.clipboard = data;
    }
  }
};
</script>

<style scoped>
.category-wrap {
  top: 31px;
  position: fixed;
  height: calc(100vh - 31px);
}

.items-wrap {
  margin-left: 284px;
  margin-top: 1px;
}

.category {
  width: 284px;
  display: grid;
  height: inherit;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(11, 1fr);
}

.items {
  width: 410px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.items div {
  display: inline-flex;
  width: calc(100% / 3 - 4px);
  max-width: initial;
  height: 63px;
}

.categoryGhost {
  background: rgba(33, 150, 243, 0.5);
  border: 1px dashed #607d8b;
}

aside {
  position: fixed;
  right: 7px;
  top: 32px;
  flex: 1;
}
</style>