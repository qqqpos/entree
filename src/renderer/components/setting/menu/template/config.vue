<template>
    <div>
        <header class="nav">
            <div class="back" @click="$router.push({ name: 'Setting.template' })">
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
        <toggle title="template.itemize" tooltip="template.tip.itemize" v-model="template.itemize" @update="toggle"></toggle>    
        <toggle title="template.replace" tooltip="template.tip.replace" v-model="template.replace" :disabled="!template.itemize"></toggle>      
        <toggle title="template.insert" tooltip="template.tip.insert" v-model="template.insert" :disabled="template.itemize"></toggle>
        <toggle title="template.dynamicPrint" tooltip="template.tip.dynamicPrint" v-model="template.dynamicPrint"></toggle>
        <toggle title="template.autoJump" tooltip="template.tip.autoJump" v-model="template.autoJump"></toggle>     
        <external title="title.item" @open="$router.push({name:'Setting.template.item'})">
          <i class="fas fa-grip-vertical icon" slot="icon"></i>
        </external>
        <external title="title.sideOption" @open="$router.push({name:'Setting.template.side'})">
          <i class="fas fa-fill-drip icon" slot="icon"></i>
        </external> 
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import toggle from "../../common/toggle";
import external from "../../common/external";
import textInput from "../../common/textInput";
import dialogModule from "../../../common/dialog";

export default {
  props: ["template"],
  components: { toggle, external, textInput, dialogModule },
  data() {
    return {
      componentData: null,
      component: null,
      disabled: true,
      removed: false
    };
  },
  beforeRouteLeave(to, from, next) {
    this.removed
      ? next()
      : this.$socket.emit("[TEMPLATE] SAVE", this.template, next);
  },
  methods: {
    toggle() {
      if (this.template.itemize) {
        this.template.insert = false;
        // add id to all items
        this.patch();
      } else {
        this.template.replace = false;
      }
    },
    patch() {
      this.template.contain.forEach(page => {
        page.contain.forEach(item => {
          if (!item._id) item._id = ObjectId().toString();
        });
      });
    },
    remove() {
      const prompt = {
        type: "question",
        title: "dialog.confirm.remove",
        msg: "dialog.tip.removeTemplateConfirm",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.remove", fn: "resolve" }
        ]
      };

      this.$dialog(prompt)
        .then(() => {
          this.exitComponent();

          this.$socket.emit("[TEMPLATE] REMOVE", this.template._id, () => {
            this.removed = true;
            this.$router.push({ name: "Setting.template" });
          });
        })
        .catch(this.exitComponent);
    }
  }
};
</script>