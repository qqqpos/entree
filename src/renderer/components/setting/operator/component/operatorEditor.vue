<template>
    <div class="popupMask setting dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5>{{$t('title.create')}}</h5>
                <h3>{{$t('setting.operator')}}</h3>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <inputer title="text.name" v-model.trim="name" :autoFocus="true"></inputer>
                <inputer title="text.accessPin" v-model.trim="pin"></inputer>
                <inputer title="text.salary" v-model.number="wage"></inputer>
                <selector title="text.role" v-model="role" :opts="roles"></selector>
            </div>
            <footer>
                <button class="btn" @click="confirm" :disabled="!name || !pin || !role">{{$t('button.confirm')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import Preset from "../../../../preset";
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
      name: "",
      role: "Worker",
      pin: "",
      wage: "",
      roles: [
        {
          label: this.$t("type.Manager"),
          tooltip: "",
          plainText: true,
          value: "Manager"
        },
        {
          label: this.$t("type.Cashier"),
          tooltip: "",
          plainText: true,
          value: "Cashier"
        },
        {
          label: this.$t("type.Waitstaff"),
          tooltip: "",
          plainText: true,
          value: "Waitstaff"
        },
        {
          label: this.$t("type.Bartender"),
          tooltip: "",
          plainText: true,
          value: "Bartender"
        },
        {
          label: this.$t("type.Worker"),
          tooltip: "",
          plainText: true,
          value: "Worker"
        }
      ]
    };
  },
  created() {
    const op = this.$store.getters.op;

    op.role === "Developer" &&
      this.roles.splice(0, 0, {
        label: "type.Owner",
        tooltip: "",
        value: "Owner"
      });
  },
  methods: {
    confirm() {
      this.checkName()
        .then(this.checkPin)
        .then(this.addOperator)
        .catch(this.addFailed)
    },
    checkName() {
      return new Promise((resolve, reject) => {
        this.$socket.emit("[OPERATOR] CHECK_NAME", this.name, exist => {
          exist ? reject("name") : resolve()
        })
      })
    },
    checkPin() {
      return new Promise((resolve, reject) => {
        this.$socket.emit("[OPERATOR] CHECK_PIN", { pin: this.pin }, exist => {
          exist ? reject("pin") : resolve();
        })
      })
    },
    addOperator() {
      const operator = Preset.operator(this.name, this.role, this.pin, this.wage);
      this.init.resolve(operator);
    },
    addFailed(error) {
      let content = {
        title: "dialog.addFailed",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };
      switch (error) {
        case "name":
          content.msg = "dialog.operatorNameDuplicate";
          break;
        case "pin":
          content.msg = "dialog.operatorPinDuplicate";
          break;
      }

      this.$dialog(content).then(() => this.$q())
    }
  }
};
</script>