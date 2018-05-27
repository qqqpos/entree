<template>
    <div>
        <header class="nav">
            <div class="back" @click="save">
                <i class="fa fa-chevron-left"></i>
            </div>
            <div class="title" @click="disabled = false">
                <h5>{{$t('title.template')}}</h5>
                <h3>{{template.name}}</h3>
            </div>
            <nav>
                <span @click="remove" class="remove">{{$t('button.remove')}}</span>
            </nav>
        </header>
        <text-input title="text.alias" v-model="template.name" :disabled="disabled"></text-input>
        <text-input title="text.note" v-model="template.note"></text-input>
        <toggle title="text.insert" tooltip="tip.insertTemplateItem" v-model="template.insert"></toggle>
        <toggle title="text.dynamicPrint" tooltip="tip.dynamicPrint" v-model="template.dynamicPrint"></toggle>
        <toggle title="text.autoJump" tooltip="tip.autoJumpNext" v-model="template.autoJump"></toggle>
        <external title="text.contain" @open="$router.push({name:'Setting.template.item'})"></external>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import toggle from "../../common/toggle";
import external from "../../common/external";
import textInput from "../../common/textInput";
import dialoger from "../../../common/dialoger";

export default {
  props: ["template"],
  components: { toggle, external, textInput, dialoger },
  data() {
    return {
      componentData: null,
      component: null,
      disabled:true
    };
  },
  beforeRouteLeave(to, from, next) {
    this.$socket.emit("[TEMPLATE] SAVE", this.template, () => next());
  },
  methods: {
    save() {
      this.$emit("reset");
    },
    remove() {
      const prompt = {
        type: "question",
        title: "removeTemplate",
        msg: "removeTemplateConfirm",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.remove", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => {
          this.exitComponent();
          this.$socket.emit("[TEMPLATE] REMOVE", this.template._id, () =>
            this.$emit("reset")
          );
        })
        .catch(this.exitComponent);
    }
  }
};
</script>