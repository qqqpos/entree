<template>
  <div class="popupMask setting center dark" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5>{{$t('title.create')}}</h5>
        <h3>{{$t('title.template')}}</h3>
      </header>
      <div class="wrap">
        <inputer title="text.alias" v-model="init.template.name" :autoFocus="true" @keydown.enter.native="checkDuplicate"></inputer>
        <inputer title="text.note" v-model="init.template.note"></inputer>
        <selector title="text.copy" v-model="source" :opts="templates"></selector>
      </div>
      <footer>
        <button class="btn" @click="checkDuplicate">{{$t('button.confirm')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import inputer from "../../common/inputer";
import selector from "../../common/selector";
import dialoger from "../../../common/dialoger";

export default {
  props: ["init"],
  components: { inputer, selector, dialoger },
  data() {
    return {
      componentData: null,
      component: null,
      templates: this.$store.getters.templates.map(t => ({
        label: t.name,
        tooltip: t.note,
        plainText: true,
        value: t.name
      })),
      source: ""
    };
  },
  created() {
    this.templates.unshift({
      label: this.$t("text.noUse"),
      tooltip: "",
      plainText: true,
      value: ""
    });
  },
  methods: {
    checkDuplicate() {
      const prompt = {
        type: "error",
        title: "dialog.cantExecute",
        msg: "dialog.duplicateError",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      const found = this.$store.getters.templates.find(
        t => t.name === this.init.template.name
      );

      found || !this.init.template.name
        ? this.$dialog(prompt).then(() => this.$q())
        : this.confirm();
    },
    confirm() {
      if (this.source) {
        let source = JSON.parse(
          JSON.stringify(
            this.$store.getters.templates.find(t => t.name === this.source)
          )
        );
        source.contain.forEach(page => {
          page.contain.forEach(item => {
            item.key = Math.random()
              .toString(36)
              .substr(2, 6);
          });
        });

        let template = Object.assign({}, source, {
          _id: ObjectId(),
          name: this.init.template.name,
          note: this.init.template.note
        });
        this.init.resolve(template);
      } else {
        this.init.resolve(this.init.template);
      }
    }
  }
};
</script>