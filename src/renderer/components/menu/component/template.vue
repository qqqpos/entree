<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="editor">
      <header>
        <div>
          <h5>{{template.name}}</h5>
          <h3>{{$t('title.template')}}</h3>
        </div>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <ul>
          <li v-for="(page,i) in template.contain" @click="index = i" class="page" :key="i">
            <span class="page">{{page.name}}<span class="count" v-show="itemCount[i] > 0">{{itemCount[i]}}</span></span>
            <i class="fa fa-caret-right"></i>
          </li>
        </ul>
        <div class="items">
          <div class="item" v-for="(item,index) in items" :key="index" @click="moreQty(item)">
            <span>{{item[language]}}</span>
            <span class="qty" @click.stop="resetQty(item,index)" v-show="item.qty > 0">{{item.qty}}</span>
          </div>
        </div>
      </div>
      <footer>
        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dialogModule from "../../common/dialog";

export default {
  props: ["init"],
  components: { dialogModule },
  computed: {
    ...mapGetters(["item", "templates", "language"])
  },
  data() {
    return {
      template: {},
      option: {},
      saved: [],
      items: [],
      index: 0,
      itemCount: [],
      insertMode: false,
      editMode: false,
      component: null,
      componentData: null
    };
  },
  created() {
    this.initialTemplate()
      .then(this.getTemplateItem)
      .then(this.retrieveItem)
      .catch(this.templateFailed);
  },
  methods: {
    initialTemplate() {
      return new Promise(next => {
        const {
          template,
          templateOption = {
            addition: 0,
            max: Infinity,
            startAt: 0
          }
        } = this.init.side;

        this.template = JSON.parse(
          JSON.stringify(this.templates.find(t => t.name === template))
        );
        Object.assign(this.template.contain[0], templateOption);
        console.log(this.template);
        this.insertMode = this.template.insert;
        this.itemCount = Array(this.template.contain.length).fill(0);

        next();
      });
    },
    getTemplateItem(index = this.index) {
      return new Promise(next => {
        const saved = this.saved[index];
        const {
          addition = 0,
          max = Infinity,
          startAt = 0
        } = this.template.contain[index];

        this.option = { addition, max, startAt };
        this.items = this.template.contain[index].contain.map(item => {
          if (saved) {
            const saveItem = saved.find(i => i.key === item.key);
            return saveItem ? saveItem : Object.assign(item, { qty: 0 });
          } else {
            return Object.assign(item, { qty: 0 });
          }
        });

        this.$nextTick(() => {
          const dom = document.querySelector("li.page.current");
          dom && dom.classList.remove("current");

          document.querySelectorAll("li.page")[index].classList.add("current");
        });

        next();
      });
    },
    retrieveItem() {
      if (!this.insertMode) {
        const { choiceSet } = this.item;
        let saved = Array.from({ length: this.template.contain.length }).map(
          _ => []
        );
      }
    },
    templateFailed() {
      const prompt = {
        title: "dialog.somethingWrong",
        msg: "dialog.templateMissing",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.$dialog(prompt).then(this.init.resolve);
    },
    saveItems(index) {
      this.saved[index] = this.items.filter(i => i.qty > 0);
    },
    moreQty(item) {
      const { autoJump } = this.template;
      let increased = false;
      let max = this.option.max * this.init.item.qty;
      let qty = this.items.reduce((a, c) => a + c.qty, 0);

      // reset max if 0
      max = max === 0 ? Infinity : max;

      if (qty < max) {
        item.qty++;
        this.itemCount[this.index]++;
        increased = true;
      }

      qty = this.items.reduce((a, c) => a + c.qty, 0);

      if (autoJump && qty === max) {
        if (this.editMode) {
          const saved = this.saved[this.index].shift();
          saved && (this.items.find(i => i.key === saved.key).qty = 0);
          !increased && item.qty++;
        }

        const maxPage = this.template.contain.length - 1;
        this.index < maxPage ? this.index++ : this.confirm();
      }
    },
    resetQty(item, index) {
      item.qty = 0;
      this.itemCount[this.index] = this.items.reduce((a, c) => a + c.qty, 0);
      this.items.splice(index, 1, item);
    },
    confirm() {
        
    },
    ...mapActions([
      "addChoiceSet",
      "seChoiceSet",
      "emptyChoiceSet",
      "alterItemOption"
    ])
  },
  watch: {
    index(n, o) {
      this.saveItems(o);
      this.getTemplateItem(n);
    }
  }
};
</script>

<style scoped>
.editor {
  margin-top: -30px;
}

.wrap {
  display: flex;
  align-items: flex-start;
  padding: 0px;
  min-height: 533px;
  max-height: 600px;
  background: #f5f5f5;
}

.items {
  display: flex;
  flex-wrap: wrap;
  width: 496px;
}

.items .item {
  width: 120px;
}

.item .qty {
  position: absolute;
  top: -2px;
  right: 1px;
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 20px;
  width: 35px;
  height: 23px;
  text-align: right;
  display: block;
  color: #fff;
  padding: 0 0 10px 5px;
  text-shadow: 0 1px 1px #333;
}

.qty:before {
  content: "x";
  padding-right: 2px;
  font-size: 18px;
}

ul {
  width: 150px;
  height: 100%;
  border-right: 1px solid #eee;
  background: #fff;
}

li {
  display: flex;
  color: #656565;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  padding: 15px 10px;
  align-items: center;
}

.page {
  flex: 1;
}

i {
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

li.current {
  color: #3c3c3c;
  font-weight: bold;
}

.current i {
  opacity: 1;
}

.count {
  margin-right: 5px;
  color: #009688;
  float: right;
}
</style>


