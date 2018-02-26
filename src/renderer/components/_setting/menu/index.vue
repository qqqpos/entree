<template>
    <div class="layout">
        <draggable v-model="categories" @sort="sortCategory" :options="{animation:300,group:'category',ghostClass:'cateGhost'}">
            <transition-group tag="section" class="category">
                <div v-for="(category,index) in categories" @click="setCategory(index)" @contextmenu="editCategory(category,index)" :key="index">{{category[language]}}</div>
            </transition-group>
            </section>
        </draggable>
        <div>
            <div v-for="(group,gIndex) in items" :key="gIndex">
                <draggable :list="group" @sort="sortItem" :options="{animation:300,group:group.category,ghostClass:'itemGhost',draggable:'.draggable'}">
                    <transition-group tag="section" class="items" :name="'drag'">
                        <div v-for="(item,index) in group" @contextmenu="editItem(item,gIndex,index)" :class="{draggable:item.clickable,disable:!item.clickable}" :key="index" :data-menuid="item.menuID">{{item[language]}}</div>
                    </transition-group>
                </draggable>
            </div>
        </div>
        <aside>
            <div>
                <div class="btn" @click="applyItemSort" v-if="isItemSort">{{$t('button.apply')}}</div>
                <div class="btn" @click="applyCategorySort" v-if="isCategorySort">{{$t('button.apply')}}</div>
            </div>
        </aside>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import categoryEditor from "./categoryEditor";
import dialoger from "../../common/dialoger";
import itemEditor from "./itemEditor";
import draggable from "vuedraggable";
import Preset from "../../../preset";

export default {
  components: { draggable, dialoger, itemEditor, categoryEditor },
  data() {
    return {
      componentData: null,
      component: null,
      categories: null,
      items: null,
      categoryIndex: 0,
      isCategorySort: false,
      isItemSort: false,
      pointIndex: 0
    };
  },
  created() {
    this.categories = JSON.parse(JSON.stringify(this.menu));
    this.items = JSON.parse(JSON.stringify(this.categories[0].item));
  },
  mounted() {
    window.addEventListener("keydown", this.input, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.input, false);
  },
  methods: {
    setCategory(index) {
      this.pointIndex = null;
      this.categoryIndex = index;
      this.items = this.categories[index].item.slice();
    },
    editCategory(category, index) {
      this.$p("categoryEditor", { category, index });
    },
    editItem(item, sub, idx) {
      if (!item.clickable) {
        item = this.copyLastItem(sub, idx);
      } else {
        item.prices = Object.assign(
          {
            DEFAULT: item.price,
            WALK_IN: [],
            PICK_UP: [],
            DELIVERY: [],
            DINE_IN: [],
            BAR: []
          },
          item.prices
        );
      }
      new Promise((resolve, reject) => {
        let categories = this.categories[
          this.categoryIndex
        ].contain.map(category => ({ label: category, value: category }));
        this.componentData = { resolve, reject, item, categories };
        this.component = "itemEditor";
      })
        .then(result => {
          this.$socket.emit("[CMS] MODIFY_ITEM", {
            item: result.item,
            grp: this.categoryIndex,
            sub,
            idx
          });
          this.$q();
        })
        .catch(item => {
          this.$q();
          item && this.deleteConfirm(item, sub, idx);
        });
    },
    deleteConfirm(item, sub, idx) {
      this.$dialog({
        title: "dialog.deleteItemConfirm",
        msg: this.$t("deleteItemConfirmTip", item[this.language])
      })
        .then(() => {
          let id = item._id;
          let grp = this.categoryIndex;
          this.$socket.emit("[CMS] REMOVE_ITEM", { id, grp, sub, idx });
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    copyLastItem(sub, idx) {
      let item;
      let last = this.items[sub][idx - 1];
      if (last && last.clickable) {
        item = JSON.parse(JSON.stringify(last));
        item = Object.assign(item, {
          _id: undefined,
          menuID: "",
          zhCN: "",
          usEN: "",
          spicy: false,
          num: this.items[sub].filter(item => item.clickable).length,
          prices: Object.assign(
            {
              DEFAULT: item.price,
              WALK_IN: [],
              PICK_UP: [],
              DELIVERY: [],
              DINE_IN: [],
              BAR: []
            },
            item.prices
          )
        });
      } else {
        let defaultTax = Object.keys(this.tax.class)[0];
        for (var name in this.tax.class) {
          if (this.tax.class.hasOwnProperty(name)) {
            if (this.tax.class[name].default) defaultTax = name;
          }
        }
        item = Preset.item(defaultTax);
        item.printer = {};
        Object.keys(this.config.printer).forEach(name => {
          item.printer[name] = {};
        });
      }
      return item;
    },
    sortCategory() {
      this.isCategorySort = true;
    },
    sortItem() {
      this.pointIndex = null;
      for (let i = 0; i < this.items.length; i++) {
        let items = this.items[i];
        for (let x = 0; x < items.length; x++) {
          if (items[x].hasOwnProperty("num")) {
            this.items[i][x].num = x;
          } else {
            break;
          }
        }
      }
      this.isItemSort = true;
    },
    applyCategorySort() {
      let category = this.categories.map((category, index) => {
        category.num = index;
        return category;
      });
      this.$socket.emit("[CMS] RESORT_CATEGORY", category);
      this.isCategorySort = false;
    },
    applyItemSort() {
      let index = this.categoryIndex;
      let items = this.items;
      this.replaceMenuItem({ index, items });
      items = [].concat.apply([], this.items);
      let update = items
        .map(item => {
          if (item._id) {
            return {
              _id: item._id,
              num: item.num
            };
          }
        })
        .filter(item => item);
      this.$socket.emit("[CMS] RESORT_MENU_ITEM", update);
      this.isItemSort = false;
    },
    input(e) {
      let max = document.querySelectorAll(".items div").length;
      if (isNaN(this.pointIndex)) {
        this.pointIndex = 0;
        return;
      }
      switch (e.code) {
        case "ArrowUp":
          e.preventDefault();
          if (this.component === "itemEditor") return;
          this.pointIndex - 3 >= 0 && (this.pointIndex = this.pointIndex - 3);
          break;
        case "ArrowRight":
          if (this.component === "itemEditor") return;
          e.preventDefault();
          this.pointIndex < max && this.pointIndex++;
          break;
        case "ArrowDown":
          e.preventDefault();
          if (this.component === "itemEditor") return;
          this.pointIndex + 3 < max && (this.pointIndex = this.pointIndex + 3);
          break;
        case "ArrowLeft":
          if (this.component === "itemEditor") return;
          e.preventDefault();
          this.pointIndex !== 0 && this.pointIndex--;
          break;
        case "Escape":
          e.preventDefault();
          if (this.component === "itemEditor") {
            let target = document.getElementById("cancelEdit");
            target && target.dispatchEvent(new CustomEvent("click"));
          } else if (isNumber(this.pointIndex)) {
            this.pointIndex = null;
          }
          break;
        case "Tab":
          if (this.component !== "itemEditor") {
            e.preventDefault();
            e.shiftKey
              ? this.pointIndex !== 0 && this.pointIndex--
              : this.pointIndex < max && this.pointIndex++;
          }
          break;
        case "NumpadEnter":
        case "Enter":
          e.preventDefault();
          if (this.component === "itemEditor") {
            if (document.activeElement.id === "autoComplete") {
              let target = document.querySelectorAll("input")[4];
              target.focus();
              target.select();
            } else {
              let target = document.getElementById("confirmEdit");
              target && target.dispatchEvent(new CustomEvent("click"));
            }
          } else if (isNumber(this.pointIndex)) {
            let target = document.querySelector(".items .active");
            target && target.dispatchEvent(new CustomEvent("contextmenu"));
          }
          break;
        case "Space":
          break;
      }
    },
    ...mapActions(["replaceMenuItem"])
  },
  sockets: {
    ITEM_UPDATED() {
      this.$nextTick(() => {
        this.categories = JSON.parse(JSON.stringify(this.menu));
        this.items = JSON.parse(
          JSON.stringify(this.categories[this.categoryIndex].item)
        );
      });
      this.$exitComponent();
    },
    CATEGORY_UPDATE() {
      this.$nextTick(() => {
        this.categories = JSON.parse(JSON.stringify(this.menu));
        this.items = JSON.parse(
          JSON.stringify(this.categories[this.categoryIndex].item)
        );
      });
    }
  },
  watch: {
    pointIndex(n) {
      let dom = document.querySelector(".items .active");
      dom && dom.classList.remove("active");
      if (isNumber(n)) {
        dom = document.querySelectorAll(".items div")[n];
        dom && dom.classList.add("active");
      }
    }
  },
  computed: {
    ...mapGetters(["tax", "config", "menu", "language"])
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
  width: 285px;
  flex: none;
}

.items {
  width: 410px;
  flex: none;
}

.cateGhost {
  background: rgba(33, 150, 243, 0.5);
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

.itemGhost {
  background: #607d8b;
  border: 1px dashed #212121;
}

.items .active {
  background: #f44336;
  text-shadow: 0 1px 1px #333;
  color: #fff;
  border: 1px solid #795548;
}

.items div.active:after {
  content: "\f14b";
  position: absolute;
  font-family: fontAwesome;
  left: 3px;
  bottom: 2px;
}
</style>