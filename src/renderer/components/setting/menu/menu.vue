<template>
  <div class="layout">
    <draggable v-model="categories" @sort="isCategorySorted = true" :options="{animation: 300,group: 'category',ghostClass: 'categoryGhost'}">
      <transition-group tag="section" class="category">
        <div v-for="(category,index) in categories" @click="setCategory(index)" @contextmenu="editCategory(category,index)" :key="index">{{category[language]}}</div>
      </transition-group>
      </section>
    </draggable>
    <div>
      <div v-for="(group,groupIndex) in items" :key="groupIndex">
        <draggable :list="group" @sort="isItemSorted = true" :options="{animation:300,group:group.category,ghostClass:'itemGhost',draggable:'.draggable'}">
          <transition-group tag="section" class="items" :name="'drag'">
            <div v-for="(item,index) in group" @contextmenu="editItem(item,groupIndex,index)" :class="{draggable:item.clickable,disable:!item.clickable}" :key="index" :data-menuid="item.menuID">{{item[language]}}</div>
          </transition-group>
        </draggable>
      </div>
    </div>
    <aside>
      <item-trend @edit="search"></item-trend>
    </aside>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import Preset from "../../../preset";
import draggable from "vuedraggable";
import dialoger from "../../common/dialoger";
import itemEditor from "./component/itemEditor";
import categoryEditor from "./component/categoryEditor";
import itemTrend from "./component/itemTrend";

export default {
  components: { dialoger, draggable, itemEditor, categoryEditor, itemTrend },
  data() {
    return {
      language: this.$store.getters.language,
      categories: this.$store.getters.menu,
      isCategorySorted: false,
      isItemSorted: false,
      componentData: null,
      component: null,
      categoryIndex: 0,
      items: []
    };
  },
  created() {
    this.getItems();
  },
  mounted() {
    document.querySelector(".category div").classList.add("active");
    window.addEventListener("keydown", this.entry, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.entry, false);

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
      this.items = this.categories[index].item.slice();
    },
    editCategory(category, index) {
      new Promise((resolve, reject) => {
        this.$socket.emit("[CATEGORY] LIST", categories => {
          this.componentData = { resolve, reject, categories, category };
          this.component = "categoryEditor";
        });
      })
        .then(_category => {
          this.$socket.emit(
            "[CATEGORY] UPDATE",
            { category: _category, index },
            () => this.refreshData()
          );
        })
        .catch(() => this.$q());
    },
    editItem(item, group, index) {
      const categories = this.categories[this.categoryIndex].contain.map(
        category => ({
          label: category,
          tooltip: "",
          plainText: true,
          value: category
        })
      );

      if (!item.clickable) item = this.copyLastItem(group, index);

      new Promise((resolve, reject) => {
        this.componentData = {
          resolve,
          reject,
          categories,
          item,
          edit: !!item._id
        };
        this.component = "itemEditor";
      })
        .then(_item => {
          let sequence = [this.categoryIndex, group, index];
          this.$socket.emit(
            "[MENU] UPDATE",
            {
              item: _item,
              sequence
            },
            () => this.refreshData()
          );
        })
        .catch(del => {
          del ? this.deleteItemConfirm(item, group, index) : this.$q();
        });
    },
    deleteItemConfirm(item, group, index) {
      this.$dialog({
        title: "dialog.deleteItem",
        msg: ["dialog.deleteItemConfirm", item[this.language]],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.delete", fn: "resolve" }
        ]
      })
        .then(() => {
          const sequence = [this.categoryIndex, group, index];

          this.$socket.emit(
            "[MENU] REMOVE",
            {
              _id: item._id,
              sequence
            },
            () => this.refreshData()
          );
        })
        .catch(() => this.$q());
    },
    copyLastItem(group, index) {
      let item;
      let lastItem = this.items[group][index - 1];
      if (lastItem && lastItem.clickable) {
        item = JSON.parse(JSON.stringify(lastItem));
        Object.assign(item, {
          _id: undefined,
          menuID: "",
          usEN: "",
          zhCN: "",
          spicy: "",
          price: [0],
          num: this.items[group].filter(i => i.clickable).length,
          prices: {}
        });
      } else {
        let taxClass = Object.keys(this.$store.getters.tax.class);
        let defaultTax = "";
        taxClass.forEach(name => {
          this.$store.getters.tax.class[name].default === true &&
            (defaultTax = name);
        });

        item = Preset.item();
        const category = this.categories[this.categoryIndex].contain[group];
        Object.assign(item, {
          taxClass: defaultTax,
          category
        });
      }
      return item;
    },
    search({ category, _id }) {
      const categoryIndex = this.categories.findIndex(group =>
        group.contain.includes(category)
      );

      if (categoryIndex !== -1) {
        this.setCategory(categoryIndex);

        this.items.forEach((group, index) => {
          const _index = group.findIndex(i => i._id === _id);

          if (_index !== -1) {
            const item = this.items[index][_index];
            this.editItem(item, index, _index);
          }
        });
      }
    },
    updateCategorySort() {
      this.$socket.emit("[CATEGORY] SORT", this.categories);
      this.isCategorySorted = false;
    },
    updateItemSort() {
      this.$socket.emit("[MENU] SORT", this.items);
      this.isItemSorted = false;
    },
    refreshData() {
      this.$nextTick(() => {
        this.categories = this.$store.getters.menu;
        this.getItems(this.categoryIndex);
        this.$q();
      });
    }
  },
  watch: {
    categoryIndex(n) {
      let dom = document.querySelector(".category .active");
      dom && dom.classList.remove("active");

      document.querySelectorAll(".category div")[n].classList.add("active");
    }
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  overflow-y: auto;
}

.category {
  width: 284px;
  flex: none;
}

.items {
  width: 410px;
  flex: none;
}

.categoryGhost {
  background: rgba(33, 150, 243, 0.5);
  border: 1px dashed #607d8b;
}

aside {
  flex: 1;
}
</style>