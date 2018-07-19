<template>
  <div class="layout">
    <draggable v-model="layouts.request" @sort="isCategorySorted = true" :options="categoryOpt">
      <transition-group tag="div" class="category">
        <div v-for="(category,index) in layouts.request" @click="setCategory(category.contain,index)" @contextmenu="editCategory(category,index)" :key="index">{{category[language]}}</div>
      </transition-group>
    </draggable>
    <draggable v-model="layouts.action" @sort="isActionSorted = true" :options="{animation:300,group:'action',ghostClass:'actionGhost'}">
      <transition-group tag="div" class="prefix">
        <div v-for="(action,index) in layouts.action" @contextmenu="editAction(action,index)" :key="index">{{action[language]}}</div>
      </transition-group>
    </draggable>
    <div class="itemWrap">
      <div v-for="(group,groupIndex) in items" :key="groupIndex" class="item">
        <draggable :list="group" @sort="isItemSorted = true" :options="{animation: 300, group: group.category,ghostClass: 'itemGhost',draggable: '.draggable'}">
          <transition-group tag="section">
            <div v-for="(item,index) in group" @contextmenu="editItem(item,groupIndex,index)" :class="{draggable:item._id,disable:!item._id}" :key="index">{{item[language]}}</div>
          </transition-group>
        </draggable>
      </div>
    </div>
    <aside>
    </aside>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import categoryEditor from "./component/requestCategoryEditor";
import actionEditor from "./component/requestActionEditor";
import itemEditor from "./component/requestItemEditor";
import dialogModule from "../../common/dialog";
import draggable from "vuedraggable";

export default {
  components: {
    categoryEditor,
    dialogModule,
    actionEditor,
    itemEditor,
    draggable
  },
  data() {
    return {
      categoryOpt: {
        animation: 300,
        group: "category",
        ghostClass: "categoryGhost"
      },
      isCategorySorted: false,
      isActionSorted: false,
      isItemSorted: false,
      categoryIndex: 0,
      componentData: null,
      component: null,
      items: []
    };
  },
  computed: {
    ...mapGetters(["language", "request", "layouts"])
  },
  created() {
    this.getItems(this.layouts.request[0].contain);
  },
  beforeDestroy() {
    this.isItemSorted && this.updateSortedItem();
    this.isActionSorted && this.updateSortedAction();
    this.isCategorySorted && this.updateSortedCategory();
  },
  methods: {
    setCategory(index) {
      this.isItemSorted && this.updateSortedItem();
      this.getItems(index);
    },
    getItems(categories, index = this.categoryIndex) {
      this.categoryIndex = index;
      categories = categories || this.layouts.request[index].contain;

      let request = [];

      categories.forEach(category => {
        let items = this.request[category]
          ? this.request[category].slice()
          : [];

        let align = 6 - items.length % 3;
        if (align === 6) align = 3;

        Array(align)
          .fill()
          .forEach(() => items.push({ zhCN: "", usEN: "" }));
        request.push(items);
      });

      this.items = request;
    },
    editCategory(category, index) {
      new Promise((resolve, reject) => {
        this.$socket.emit("[REQUEST] CATEGORY", categories => {
          this.componentData = { resolve, reject, categories, category, index };
          this.component = "categoryEditor";
        });
      })
        .then(this.refreshData)
        .catch(this.exitComponent);
    },
    editAction(action, index) {
      !action.multiplier &&
        Object.assign(action, {
          multiplier: false,
          multiply: 0
        });

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, action, index };
        this.component = "actionEditor";
      })
        .then(this.refreshData)
        .catch(this.exitComponent);
    },
    editItem(item, groupIndex, index) {
      const categoryIndex = this.categoryIndex;

      const categories = this.layouts.request[categoryIndex].contain.map(
        category => ({
          label: category,
          tooltip: "",
          plainText: true,
          value: category
        })
      );

      if (!item._id) {
        Object.assign(item, {
          category: this.layouts.request[categoryIndex].contain[groupIndex],
          price: 0,
          affix: ""
        });
      }

      new Promise((resolve, reject) => {
        this.componentData = {
          categoryIndex,
          categories,
          groupIndex,
          resolve,
          reject,
          item,
          index
        };
        this.component = "itemEditor";
      })
        .then(update => {
          this.items[groupIndex].splice(index, 1, update);
          this.refreshData();
        })
        .catch(removeItem => {
          removeItem && this.items[groupIndex].splice(index, 1);
          this.refreshData();
        });
    },
    updateSortedItem() {
      this.isItemSorted = false;

      const items = [];

      this.items.forEach((group, i) => {
        let item = group.filter(item => item._id);

        const category = this.layouts.request[this.categoryIndex].contain[i];
        this.request[category] = item;

        items.push(item.map(item => item._id));
      });

      this.$socket.emit("[REQUEST] SORT_ITEM", items);
    },
    updateSortedAction() {
      this.isActionSorted = false;
      this.$socket.emit("[REQUEST] SORT_ACTION", this.layouts.action);
    },
    updateSortedCategory() {
      this.isCategorySorted = false;
      this.$socket.emit("[REQUEST] SORT_CATEGORY", this.layouts.request);
    },
    refreshData() {
      this.getItems();
      this.exitComponent();
    }
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: row;
}

.category,
.prefix {
  width: 142px;
  position: fixed;
  top: 31px;
}

.prefix {
  left: 217px;
}

.prefix div {
  height: 62.5px;
  width: 137.92px;
  justify-content: center;
  align-items: center;
  display: inline-flex;
  border: 1px solid #607d8b;
  background: #b0bec5;
  margin: 1px;
  vertical-align: top;
  font-size: 1.15em;
  text-align: center;
}

.itemWrap {
  width: 410px;
  display: flex;
  flex-direction: column;
  margin: 1px 0 0 284px;
}

.item > div {
  width: 410px;
}

.item section > div {
  display: inline-flex;
  text-align: center;
  flex-wrap: wrap;
  width: calc(33% - 3px);
  justify-content: center;
  align-items: center;
  height: 62.5px;
  border: 1px solid #78909c;
  margin: 1px;
  background: #92aaaf;
  vertical-align: top;
  font-size: 1.05em;
}

.item div.disable {
  background: rgba(207, 216, 220, 0.58);
}

.categoryGhost {
  background: rgba(33, 150, 243, 0.5);
  border: 1px dashed #607d8b;
}

.prefix .actionGhost {
  background: rgba(176, 190, 197, 0.5);
  border: 1px dashed #607d8b;
}

.item .itemGhost {
  background: rgba(146, 170, 175, 0.51);
  border: 1px dashed #607d8b;
}

aside {
  width: 180px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

aside .btn {
  width: 168px;
  margin: 5px;
}
</style>