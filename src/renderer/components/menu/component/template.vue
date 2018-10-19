<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="editor" v-show="!component">
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
            <span class="f1">{{page.name}}<span class="count" v-show="itemCount[i] > 0">{{itemCount[i]}}</span></span>
            <i class="fa fa-caret-right"></i>
          </li>
        </ul>
        <div class="column">
            <div class="items f1">
              <div class="item" v-for="(item,index) in pageItem" :key="index" @click="moreQty(item)" :class="{placeholder:item.placeholder}">
                <span>{{item[language]}}</span>
                <span class="qty" @click.stop="resetQty(item,index)" v-show="item.qty > 0">{{item.qty}}</span>
              </div>
          </div>
          <paginator :of="items" @page="setPage" :perPage="32" :maxPage="8"></paginator>
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
import paginator from "../../common/paginator";

export default {
  props: ["init"],
  components: { dialogModule, paginator },
  computed: {
    pageItem() {
      const min = this.page * 32;
      const max = min + 32;
      return this.items.slice(min, max);
    },
    ...mapGetters(["item", "templates", "language"])
  },
  data() {
    return {
      template: {},
      option: {},
      saved: [],
      items: [],
      index: 0,
      page: 0,
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
      .catch(this.templateFailed);
  },
  methods: {
    initialTemplate() {
      return new Promise(next => {
        const { template, templateOption } = this.init.side;

        this.template = JSON.parse(
          JSON.stringify(this.templates.find(t => t.name === template))
        );

        if (templateOption)
          Object.assign(this.template.contain[0], templateOption);

        this.insertMode = this.template.insert;
        this.itemCount = Array(this.template.contain.length).fill(0);

        next();
      });
    },
    getTemplateItem(index = this.index) {
      this.page = 0;

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
    templateFailed() {
      const prompt = {
        type: "error",
        title: "dialog.somethingWrong",
        msg: ["dialog.templateMissing", this.init.side.template],
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.$dialog(prompt).then(this.init.resolve);
    },
    saveItems(index) {
      this.saved[index] = this.items.filter(i => i.qty > 0);
    },
    moreQty(item) {
      if (item.placeholder) return;

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
      this.saveItems(this.index);
      this.template.itemize ? this.itemizeHandler() : this.regularHandler();
    },
    itemizeHandler() {
      const target = this.item;
      // check if item is selected
      [].concat.apply([], this.saved).length &&
        this.template.replace &&
        this.lessQty(false);

      this.saved.forEach((items, i) => {
        items.forEach(select => {
          const { _id, zhCN, usEN, print, qty, price } = select;

          let printer = {};
          print.forEach(name => {
            printer[name] = {
              replace: false,
              zhCN: "",
              usEN: ""
            };
          });

          let item = Object.assign({}, target, {
            choiceSet: [],
            option: [],
            side: {},
            printer,
            usEN,
            zhCN,
            qty,
            _id,
            unique: String().random(),
            single: parseFloat(price),
            price: [parseFloat(price)],
            total: (price * qty).toFixed(2),
            pending: false,
            print: false
          });

          this.addToOrder(item);
        });
      });

      this.init.resolve();
    },
    regularHandler() {
      !this.insertMode && this.emptyChoiceSet({ _ti: this.template._id });

      this.alterItemOption({
        side: this.init.side,
        index: this.init.index,
        function: true
      });

      this.saved.forEach((items, i) => {
        let count = 0;
        let {
          startAt,
          addition,
          inline = false,
          separator = " & "
        } = this.template.contain[i];

        startAt = parseInt(startAt) || 0;
        addition = parseInt(addition) || 0;

        count += inline
          ? this.inlineHandler(items, separator)
          : this.itemHandler(items);

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

      this.template.dynamicPrint && this.setItemPrinter();
      this.init.resolve();
    },
    itemHandler(items) {
      let count = 0;
      items.forEach(({ zhCN, usEN, qty = 1, price, print, key }) => {
        price = parseFloat(price) || 0;

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

      return count;
    },
    inlineHandler(items, separator) {
      let count = 0;
      let primary = [];
      let secondary = [];
      let printer = new Set();
      let total = 0;
      let keys = [];

      items.forEach(({ zhCN, usEN, qty = 1, price, print, key }) => {
        qty = qty === 1 ? "" : `${qty} x `;
        primary.push(qty + usEN);
        secondary.push(qty + zhCN);
        printer.add(...print);
        total += parseFloat(price) || 0;
        keys.push(key);
        count++;
      });

      this.setChoiceSet({
        qty: 1,
        key: keys,
        zhCN: secondary.join(separator),
        usEN: primary.join(separator),
        print: Array.from(printer),
        single: toFixed(total, 2),
        price: toFixed(total, 2),
        _ti: this.template._id
      });

      return count;
    },
    setItemPrinter() {
      if (this.item.choiceSet.length === 0) {
        if (this.item.hasOwnProperty("defaultPrinter")) {
          this.item.printer = this.item.defaultPrinter;
          delete this.item.defaultPrinter;
        }
        return;
      }

      let printer = new Set();
      let printerSet = {};
      this.item.choiceSet
        .filter(sub => sub._ti === this.template._id)
        .forEach(
          sub =>
            Array.isArray(sub.print) &&
            sub.print.forEach(name => printer.add(name))
        );
      Array.from(printer).forEach(name => {
        printerSet[name] = {
          replace: false
        };
      });

      Array.from(printer).length &&
        Object.assign(this.item, {
          defaultPrinter: this.item.hasOwnProperty("defaultPrinter")
            ? this.item.defaultPrinter
            : JSON.parse(JSON.stringify(this.item.printer)),
          printer: printerSet
        });
    },
    setPage(page) {
      this.page = page;
    },
    ...mapActions([
      "lessQty",
      "addToOrder",
      "addChoiceSet",
      "setChoiceSet",
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
  padding: 0px;
  width: 647px;
  display: grid;
  min-height: 533px;
  max-height: 600px;
  background: #f5f5f5;
  grid-template-columns: 151px 1fr;
}

.items {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(8, 1fr);
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

.placeholder {
  opacity: 0.25;
  border: 1px dashed #607d8b;
}
</style>


