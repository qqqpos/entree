<template>
  <div>
    <header class="nav">
      <router-link tag="div" :to="{name:'Setting.printer.config',params:{printer}}" class="back">
        <i class="fa fa-chevron-left"></i>
      </router-link>
      <div class="title">
        <h3>{{printer}}</h3>
      </div>
      <nav>
        <span class="add">{{$t('button.default')}}</span>
      </nav>
    </header>
    <toggle title="print.storeContact" v-model="layout.contact"></toggle>
    <toggle title="print.title" v-model="layout.title"></toggle>
    <toggle title="print.customer" v-model="layout.customer"></toggle>
    <toggle title="print.payment" v-model="layout.payment"></toggle>
    <draggable v-model="layout.languages" :options="{animation: 300,ghostClass: 'ghost',handle:'.drag'}">
      <transition-group tag="section" class="cards">
        <div v-for="(language,index) in layout.languages" :key="index" class="card">
          <div class="header">
            <div>
              <span>{{languages[index]}}</span>
              <span class="gray">{{getLanguage(language.ref)}}</span>
            </div>
            <i class="fa fa-bars drag"></i>
            <external title="text.moreOption" :defaultStyle="false" @open="edit(language,index)"></external>
          </div>
          <div>
            <selector title="print.fontFamily" v-model="language.fontFamily" :opts="fonts"></selector>
            <range title="print.fontSize" :min="0" :max="40" :step="1" v-model="language.fontSize"></range>
            <switches title="button.print" v-model="language.enable" @update="doubleCheck(index)"></switches>
            <switches title="print.itemPrice" v-model="language.price"></switches>
          </div>
        </div>
      </transition-group>
    </draggable>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import range from "../common/range";
import draggable from "vuedraggable";
import toggle from "../common/toggle";
import selector from "../common/selector";
import switches from "../common/switches";
import external from "../common/external";
import editor from "./component/lineEditor";

export default {
  props: ["printer"],
  components: {
    range,
    toggle,
    editor,
    switches,
    selector,
    draggable,
    external
  },
  data() {
    return {
      layout: {},
      component: null,
      componentData: null,
      languages: [this.$t("print.firstLine"), this.$t("print.secondLine")],
      fonts: [
        {
          label: "Agency FB",
          tooltip: "(English)",
          plainText: true,
          value: "Agency FB"
        },
        {
          label: "Tahoma",
          tooltip: "(English)",
          plainText: true,
          value: "Tahoma"
        },
        {
          label: "Tensentype",
          tooltip: "(English)",
          plainText: true,
          value: "Tensentype RuiHeiJ-W2"
        },
        {
          label: "Futura LT Condensed",
          tooltip: "(English)",
          plainText: true,
          value: "Futura LT Condensed"
        },
        {
          label: "Franklin Gothic Bold",
          tooltip: "(English)",
          plainText: true,
          value: "Franklin Gothic Medium"
        },
        {
          label: "Impact Bolder",
          tooltip: "(English)",
          plainText: true,
          value: "Impact"
        },
        {
          label: "Roboto Condensed",
          tooltip: "(English)",
          plainText: true,
          value: "Roboto Condensed"
        },
        {
          label: "Noto Sans SC Light",
          tooltip: "(中文)",
          plainText: true,
          value: "Noto Sans SC Light"
        },
        {
          label: "Noto Sans SC Normal",
          tooltip: "(中文)",
          plainText: true,
          value: "Noto Sans CJK SC"
        },
        {
          label: "晴圆",
          tooltip: "(中文)",
          plainText: true,
          value: navigator.language === "zh-CN" ? "晴圆" : "QingYuan"
        },
        {
          label: "微软雅黑",
          tooltip: "(中文)",
          plainText: true,
          value: navigator.language === "zh-CN" ? "微软雅黑" : "Microsoft YaHei"
        }
      ]
    };
  },
  created() {
    this.layout = this.$store.getters.config.printers[this.printer].layout;
  },
  beforeDestroy() {
    this.$socket.emit("[CONFIG] UPDATE", {
      key: `printers.${this.printer}.layout`,
      value: this.layout
    });

    Object.assign(this.$store.getters.config.printers[this.printer], {
      layout: this.layout
    });

    Printer.initial(
      CLODOP,
      this.$store.getters.config,
      this.$store.getters.station
    );
  },
  methods: {
    getLanguage(ref) {
      return ref === "zhCN"
        ? this.$t("print.secondary")
        : this.$t("print.primary");
    },
    doubleCheck(index) {
      const status = this.layout.languages.some(language => language.enable);

      if (!status) this.layout.languages[index === 0 ? 1 : 0].enable = true;
    },
    edit(language, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, language, fonts: this.fonts };
        this.component = "editor";
      })
        .then(_language => {
          this.layout.languages.splice(index, 1, _language);
          this.$q();
        })
        .catch(() => this.$q());
    }
  }
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  height: 25px;
}

.card {
  margin-top: 5px;
  padding: 5px 18px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.header div {
  flex: 1;
}

.header i {
  width: 50px;
  text-align: center;
  margin-right: 20px;
  cursor: pointer;
}

section.cards {
  padding: 0px 5px 5px;
}

.ghost {
  opacity: 0.5;
}

.gray {
  color: #656565;
}
</style>