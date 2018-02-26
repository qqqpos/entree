<template>
  <div class="layout">
    <draggable v-model="request" @sort="isCategorySorted = true" :options="{animation:300,group:'category',ghostClass:'categoryGhost'}">
      <transition-group tag="div" class="category">
        <div v-for="(category,index) in request" @click="setCategory(index)" @contextmenu="editCategory(category,index)" :key="index">{{category[language]}}</div>
      </transition-group>
    </draggable>
    <draggable v-model="actions" @sort="isActionSorted = true" :options="{animation:300,group:'action',ghostClass:'actionGhost'}">
      <transition-group tag="div" class="prefix">
        <div v-for="(action,index) in actions" @contextmenu="editAction(action,index)" :key="index">{{action[language]}}</div>
      </transition-group>
    </draggable>
    <div class="itemWrap">
      <div v-for="(group,groupIndex) in items" :key="groupIndex" class="item">
        <draggable :list="group" @sort="isItemSorted = true" :options="{animation:300,group:group.category,ghostClass:'itemGhost',draggable:'.draggable'}">
          <transition-group tag="section">
            <div v-for="(item,index) in group" @contextmenu="editItem(item,groupIndex,index)" :class="{draggable:item.clickable,disable:!item.clickable}" :key="index">{{item[language]}}</div>
          </transition-group>
        </draggable>
      </div>
    </div>
    <aside>
      <!-- <div>
        <div class="btn" @click="updateItemSort" v-if="isItemSorted">{{$t('button.update')}}</div>
        <div class="btn" @click="updateActionSort" v-if="isActionSorted">{{$t('button.update')}}</div>
        <div class="btn" @click="updateCategorySort" v-if="isCategorySorted">{{$t('button.update')}}</div>
      </div> -->
    </aside>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import dialoger from "../../common/dialoger";
import categoryEditor from "./component/requestCategoryEditor";
import actionEditor from "./component/requestActionEditor";
import itemEditor from "./component/requestItemEditor";

export default {
  components: { dialoger, draggable, categoryEditor, actionEditor, itemEditor },
  data() {
    return {
      language: this.$store.getters.language,
      request: this.$store.getters.request,
      actions: this.$store.getters.actions,
      isCategorySorted: false,
      isActionSorted: false,
      isItemSorted: false,
      categoryIndex: 0,
      componentData: null,
      component: null,
      items: []
    };
  },
  created() {
    this.getItems();
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
    getItems(index = this.categoryIndex) {
      this.categoryIndex = index;
      this.items = this.request[index].item.slice();
    },
    editCategory(category, index) {
      new Promise((resolve, reject) => {
        this.$socket.emit("[REQUEST] CATEGORY", categories => {
          this.componentData = { resolve, reject, categories, category, index };
          this.component = "categoryEditor";
        });
      })
        .then(this.refreshData)
        .catch(() => this.$q());
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
        .catch(() => this.$q());
    },
    editItem(item, groupIndex, index) {
      const categoryIndex = this.categoryIndex;
      const categories = this.request[categoryIndex].contain.map(category => ({
        label: category,
        tooltip: "",
        plainText: true,
        value: category
      }));

      if (!item.clickable) {
        Object.assign(item, {
          category: this.request[categoryIndex].contain[groupIndex],
          price: 0,
          affix: ""
        });
      }

      new Promise((resolve, reject) => {
        this.componentData = {
          resolve,
          reject,
          categoryIndex,
          categories,
          groupIndex,
          item,
          index
        };
        this.component = "itemEditor";
      })
        .then(this.refreshData)
        .catch(del => this.$q());
    },
    updateSortedItem() {
      const items = [];
      this.items.forEach(group => {
        const item = group.filter(item => item._id).map(item => item._id);
        items.push(item);
      });

      this.$socket.emit("[REQUEST] SORT_ITEM", items);
      this.isItemSorted = false;
    },
    updateSortedAction() {
      this.$socket.emit("[REQUEST] SORT_ACTION", this.action);
      this.isActionSorted = false;
    },
    updateSortedCategory() {
      Object.assign(this.$store.getters.request, this.request);

      const categories = this.request.map(category =>
        Object.assign({}, category, { item: [] })
      );
      this.$socket.emit("[REQUEST] SORT_CATEGORY", categories);
      this.isCategorySorted = false;
    },
    refreshData() {
      this.request = this.$store.getters.request;
      this.actions = this.$store.getters.actions;
      this.getItems();
      this.$q();
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