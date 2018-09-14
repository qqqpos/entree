<template>
  <div class="popupMask setting dark center" @click.self="exit">
    <div class="editor">
      <header>
        <div>
          <h5>{{$t('title.edit')}}</h5>
          <h3>{{$t('title.category')}}</h3>
        </div>
        <nav class="tabs">
          <div>
            <input type="radio" v-model="tab" value="basic" name="tab" id="basic">
            <label for="basic">{{$t('setting.basic')}}</label>
          </div>
          <div>
            <input type="radio" v-model="tab" value="print" name="tab" id="print" :disabled="!Array.isArray(category.contain)">
            <label for="print">{{$t('setting.print')}}</label>
          </div>
          <div>
            <input type="radio" v-model="tab" value="rename" name="tab" id="rename" :disabled="!Array.isArray(category.contain)">
            <label for="rename">{{$t('text.rename')}}</label>
          </div>
          <div>
            <input type="radio" v-model="tab" value="restriction" name="tab" id="restriction" :disabled="!Array.isArray(category.contain)">
            <label for="restriction">{{$t('text.restriction')}}</label>
          </div>
        </nav>
      </header>
      <template v-if="tab === 'basic'">
        <div class="wrap">
          <inputer title="text.primary" v-model.trim="category.usEN"></inputer>
          <inputer title="text.secondary" v-model.trim="category.zhCN"></inputer>
          <inputer title="text.description" v-model.trim="category.description"></inputer>
          <inputer title="text.contain" v-model="category.contain" v-if="manual"></inputer>
          <div class="checkboxes categories" v-else>
            <checkbox :title="name" v-model="category.contain" :val="name" v-for="(name,index) in categories" :key="index" :multiple="true" :translate="false" :class="{missing:check(name)}"></checkbox>
          </div>
        </div>
      </template>
      <template v-else-if="tab === 'print'">
        <div class="wrap">
          <div v-for="(category,index) in category.contain" :key="index">
            <h3>{{category}}</h3>
            <div class="checkboxes">
              <checkbox v-model="print[index]" v-for="(name,idx) in printers" :title="name" :val="name" :key="idx" :multiple="true" v-show="isShowPrinter(name)"></checkbox>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="tab === 'rename'">
        <div class="wrap">
          <div v-for="(category,index) in category.contain" :key="index">
            <h3>{{category}}</h3>
            <inputer title="text.alias" v-model="rename[index]" :placeholder="category"></inputer>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="wrap">
          <div v-for="(category,index) in category.contain" :key="index">
            <h3>{{category}}</h3>
            <external title="tip.itemRestrictionRules" @open="setRestriction(category)" :defaultStyle="false"></external>
          </div>
        </div>
      </template>
      <footer>
        <div class="opt">
          <switches title="text.manualInput" v-model="manual" :reverse="true"></switches>
        </div>
        <button class="btn" @click="confirm" v-if="tab === 'basic'">{{$t('button.done')}}</button>
        <button class="btn" @click="update" v-else-if="tab === 'print'">{{$t('button.apply')}}</button>
        <button class="btn" @click="modify" v-else-if="tab === 'rename'">{{$t('button.update')}}</button>
        <button class="btn" @click="apply" v-else>{{$t('button.apply')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import limitor from "./limitor";
import inputer from "../../common/inputer";
import checkbox from "../../common/checkbox";
import switches from "../../common/switches";
import external from "../../common/external";

export default {
  props: ["init"],
  components: { limitor, inputer, checkbox, switches, external },
  data() {
    return {
      tab: "basic",
      manual: false,
      selected: [],
      categories: this.init.categories.sort((a, b) => a.localeCompare(b)),
      category: JSON.parse(JSON.stringify(this.init.category)),
      printers: Object.keys(this.$store.getters.config.printers),
      component: null,
      componentData: null,
      allowExit: true,
      restrictions: {},
      rename: [],
      print: []
    };
  },
  created() {
    const selected = new Set();

    this.$store.getters.layouts.menu.forEach(category =>
      category.contain.forEach(t => selected.add(t))
    );
    this.selected = Array.from(selected);
  },
  methods: {
    check(category) {
      return !this.selected.includes(category);
    },
    isShowPrinter(name) {
      return !/cashier/i.test(name);
    },
    confirm() {
      if (!Array.isArray(this.category.contain))
        this.category.contain = this.category.contain
          .split(",")
          .map(name => name.trim());

      let { usEN, zhCN } = this.category;

      zhCN = zhCN || usEN;

      this.category.usEN = this.safeStringLength(usEN);
      this.category.zhCN = this.safeStringLength(zhCN);

      this.category.item = [];
      this.init.resolve(this.category);
    },
    safeStringLength(text) {
      if (text.indexOf(" ") === -1 && text.length > 15) {
        text = text.slice(0, 15) + " " + text.slice(15, text.length);
      }

      return text;
    },
    update() {
      this.tab = "basic";
      const defaultPrinter = this.printers.filter(name =>
        /cashier/i.test(name)
      );
      let printers = [];
      const categories = this.category.contain;

      this.print.forEach((group, index) => {
        group.length
          ? printers.push(defaultPrinter.concat(...group))
          : printers.push([]);
      });

      this.$socket.emit("[CATEGORY] PRINTER", { categories, printers });
      this.allowExit = false;
    },
    modify() {
      let update = {};

      this.category.contain.forEach((category, index) => {
        if (this.rename[index]) {
          this.category.contain.splice(index, 1, this.rename[index]);
          update[category] = this.rename[index];
        }
      });

      this.$socket.emit("[CATEGORY] RENAME", update, categories => {
        this.allowExit = false;
        this.categories = categories;
        this.tab = "basic";
      });
    },
    setRestriction(group) {
      new Promise((resolve, reject) => {
        const restrict = {
          from: "09:00 AM",
          to: "11:00 PM",
          holiday: false,
          days: ["0", "1", "2", "3", "4", "5", "6"],
          types: [
            "WALK_IN",
            "PICK_UP",
            "DELIVERY",
            "DINE_IN",
            "HIBACHI",
            "BUFFET",
            "BAR",
            "SALES",
            "TO_GO"
          ]
        };
        this.componentData = { resolve, reject, restrict };
        this.component = "limitor";
      })
        .then(rule => {
          this.restrictions[group] = rule;
          this.exitComponent();
        })
        .catch(del => {
          if (del) {
            this.restrictions[group] = null;
          }
          this.exitComponent();
        });
    },
    apply() {
      this.allowExit = false;
      this.tab = "basic";
      this.$socket.emit("[CATEGORY] RESTRICTION", this.restrictions);
    },
    exit() {
      if (this.allowExit) this.init.reject(false);
    }
  }
};
</script>

<style scoped>
header {
  flex-direction: row;
  justify-content: flex-start;
}

.categories {
  max-height: 405px;
  overflow: auto;
}
</style>