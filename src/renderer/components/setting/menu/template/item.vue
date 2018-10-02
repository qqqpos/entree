<template>
    <div class="template">
        <ul>
            <div class="header clickable" @click="$router.push({ name: 'Setting.template' })">
              <i class="fa fa-chevron-left"></i>
              <span>{{$t('button.back')}}</span>
            </div>
            <draggable v-model="template.contain" :options="{animation: 300,group: 'page',ghostClass: 'ghost'}">
                <transition-group>
                    <li v-for="(page,i) in template.contain" :key="i" @click="setIndex(i)">
                        <span>{{page.name}}</span>
                        <i class="fa fa-caret-right"></i>
                    </li>
                </transition-group>
            </draggable>
            <li @click="newPage">
                <span>{{$t('button.new')}}</span>
                <i class="fa fa-plus"></i>
            </li>
        </ul>
        <section>
            <header class="nav">
                <div>
                    <h3>{{template.contain[index].name}}</h3>
                    <h5>{{$t("text.items",template.contain[index].contain.length)}}</h5>
                </div>
                <nav>
                    <span @click="setOption">{{$t('button.option')}}</span>
                    <span @click="create">{{$t('button.create')}}</span>
                </nav>
            </header>
            <div class="column">
                <draggable v-model="template.contain[index].contain" :options="{animation: 300,group: 'item',ghostClass: 'ghost',draggable:'.draggable'}" class="f1">
                    <transition-group tag="div" class="items">
                        <div v-for="(item,i) in template.contain[index].contain" :key="i" @contextmenu="edit(item,i)" class="draggable" :class="{placeholder:item.placeholder}">{{item[language]}}</div>
                    </transition-group>
                </draggable>
            </div>
        </section>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import opt from "./option";
import editor from "./editor";
import draggable from "vuedraggable";

export default {
  props: ["template"],
  components: { opt, editor, draggable },
  data() {
    return {
      printers: Object.keys(this.$store.getters.config.printers),
      language: this.$store.getters.language,
      componentData: null,
      component: null,
      index: 0
    };
  },
  computed: {
    items() {
      const min = this.page * 32;
      const max = min + 32;

      return this.template.contain[this.index].contain.slice(min, max);
    }
  },
  beforeRouteLeave(to, from, next) {
    this.$socket.emit("[TEMPLATE] SAVE", this.template, () => next());
  },
  mounted() {
    setTimeout(() => {
      if (
        Array.isArray(this.template.contain) &&
        this.template.contain.length === 0
      )
        this.template.contain.push({
          name: "",
          addition: 0,
          startAt: 0,
          max: 0,
          contain: []
        });
      !this.template.contain[0].name && this.setOption();
    }, 500);
  },
  methods: {
    create() {
      const item = {
        zhCN: "",
        usEN: "",
        price: 0,
        print: this.printers.slice(),
        key: String().random(4)
      };
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, item, printers: this.printers };
        this.component = "editor";
      })
        .then(update => {
          this.template.contain[this.index].contain.push(update);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    edit(item, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, item, printers: this.printers };
        this.component = "editor";
      })
        .then(update => {
          this.template.contain[this.index].contain.splice(index, 1, update);
          this.exitComponent();
        })
        .catch(remove => {
          this.exitComponent();
          remove && this.template.contain[this.index].contain.splice(index, 1);
        });
    },
    setOption() {
      const {
        addition,
        startAt,
        max,
        name,
        inline = false,
        separator
      } = this.template.contain[this.index];
      const option = { addition, startAt, max, name, inline, separator };

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, option, edit: true };
        this.component = "opt";
      })
        .then(update => {
          Object.assign(this.template.contain[this.index], update);
          this.exitComponent();
        })
        .catch(remove => {
          if (remove) {
            const index = this.index;
            this.index = 0;
            this.template.contain.splice(index, 1);
          }

          this.exitComponent();
        });
    },
    newPage() {
      const option = { addition: 0, startAt: 0, max: 0, name: "" };

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, option, edit: false };
        this.component = "opt";
      })
        .then(update => {
          Object.assign(update, { contain: [] });
          this.template.contain.push(update);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    setIndex(index) {
      this.index = index;
    }
  }
};
</script>

<style scoped>
.template {
  display: flex;
  width: 679px;
  margin-top: 5px;
}

ul {
  width: 150px;
  border-right: 1px solid #e0e0e0;
  position: relative;
  background: #eaeaea;
}

h5 {
  font-weight: normal;
  color: #8e8e8e;
}

section {
  flex: 1;
  height: 730px;
  background: #f5f5f5;
}

.header {
  text-align: center;
  padding: 21px 0px;
  border-bottom: 1px solid #e0e0e0;
}

header {
  display: flex;
  padding: 10px 15px 10px 25px;
  border-bottom: 1px solid #eee;
  align-items: center;
}

nav {
  flex: 1;
  justify-content: flex-end;
  display: flex;
}

nav span {
  margin-left: 10px;
}

.items {
  height: 670px;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
}

.items div {
  width: 126px;
  height: 63px;
}

li {
  padding: 15px 10px;
  display: flex;
  cursor: pointer;
  background: #fff;
  border-bottom: 1px solid #eee;
}

li span {
  flex: 1;
}

.placeholder {
  opacity: 0.25;
  border: 1px dashed #333;
}
</style>