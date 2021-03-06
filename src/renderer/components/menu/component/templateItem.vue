<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5>{{template.name}}</h5>
        <h3>{{$t('title.template')}}</h3>
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
        <div class="opt">
          <checkbox title="text.insert" v-model="insert"></checkbox>
        </div>
        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import checkbox from "../../setting/common/checkbox";

export default {
  props: ["init"],
  components: { checkbox },
  computed: {
    ...mapGetters(["item", "templates", "language"])
  },
  data() {
    return {
      template: {},
      saved: [],
      items: [],
      index: 0,
      itemCount: [],
      insert: false,
      editMode: false,
      max: Infinity
    };
  },
  created() {
    const { template, max = Infinity } = this.init.side;

    this.template = this.templates.find(t => t.name === template);
    this.insert = this.template.insert;
    this.itemCount = Array(this.template.contain.length).fill(0);
    this.retrieve();
    this.initialItems();
  },
  methods: {
    initialItems(index) {
      index = index || this.index;
      const saved = this.saved[index];
      this.items = this.template.contain[index].contain.map(item => {
        if (saved) {
          const _item = saved.find(i => i.key === item.key);
          return _item ? _item : Object.assign({}, item, { qty: 0 });
        } else {
          return Object.assign({}, item, { qty: 0 });
        }
      });

      this.max =
        index === 0
          ? this.init.side.max || this.template.contain[index].max || Infinity
          : this.template.contain[index].max || Infinity;

      this.$nextTick(() => {
        const dom = document.querySelector("li.page.current");
        dom && dom.classList.remove("current");

        document.querySelectorAll("li.page")[index].classList.add("current");
      });
    },
    retrieve() {
      const { choiceSet } = this.item;

      if (choiceSet.length === 0) {
        this.insert = true;
      } else {
        let saved = Array.from({ length: this.template.contain.length }).map(
          _ => []
        );

        this.template.contain.forEach((page, index) => {
          page.contain.forEach(item => {
            choiceSet.forEach(set => {
              set.key === item.key &&
                saved[index].push(Object.assign({}, item, { qty: set.qty }));
            });
          });
          this.itemCount[index] = saved[index].reduce((a, c) => a + c.qty, 0);
        });
        this.saved = saved;
        this.insert = false;
        this.editMode = choiceSet.filter(i => i._ti).length > 0;
      }
    },
    saveItems(index) {
      this.saved[index] = this.items.filter(i => i.qty > 0);
    },
    moreQty(item) {
      let increased = false;
      const { autoJump } = this.template;
      const max = this.max * this.init.item.qty;
      let qty = this.items.reduce((a, c) => a + c.qty, 0);

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
      this.saveItems(this.index);
     !this.insert && this.emptyChoiceSet({ _ti: this.template._id });

      const { skip, ignore } = this.init.side;

      this.alterItemOption({
        side: this.init.side,
        index: this.init.index,
        function: true
      });

      this.saved.forEach((page, index) => {
        let { startAt, addition } = this.template.contain[index];
        let count = 0;
        startAt = isNumber(startAt) ? parseInt(startAt) : 0;
        addition = isNumber(addition) ? parseFloat(addition) : 0;

        page.forEach(({ zhCN, usEN, qty = 1, price, print, key }) => {
          this.setChoiceSet({
            qty,
            key,
            zhCN,
            usEN,
            print,
            single: price,
            price: (price * qty).toFixed(2),
            _ti: this.template._id
          });

          count += qty;
        });
        if (startAt > 0 && count - startAt > 0) {
          const qty = count - startAt;

          this.setChoiceSet({
            qty,
            key: String().random(),
            zhCN: "Extra Charge",
            usEN: "Extra Charge",
            print: [],
            single: addition,
            price: (addition * qty).toFixed(2),
            _ti: this.template._id
          });
        }
      });

      this.init.resolve();
    },
    ...mapActions([
      "addChoiceSet",
      "setChoiceSet",
      "emptyChoiceSet",
      "alterItemOption"
    ])
  },
  watch: {
    index(n, o) {
      this.saveItems(o);
      this.initialItems(n);
    }
  }
};
</script>

<style scoped>
.wrap {
  display: flex;
  align-items: flex-start;
  padding: 0px;
  height: 533px;
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