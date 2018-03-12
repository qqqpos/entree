<template>
  <div>
    <header class="nav">
      <router-link tag="div" :to="{name:'Setting.operator'}" class="back">
        <i class="fa fa-chevron-left"></i>
      </router-link>
      <div class="title">
        <h5>{{$t('type.'+operator.role)}}</h5>
        <h3>{{operator.name}}</h3>
      </div>
      <nav>
        <span class="remove" @click="remove" v-show="op._id !== operator._id">{{$t('button.remove')}}</span>
      </nav>
    </header>
    <text-input v-model="operator.pin" title="text.accessPin" :type="view">
      <i class="fa fa-eye view" v-if="view === 'password'" @click="view = 'text'"></i>
      <i class="fa fa-eye-slash view" v-else @click="view = 'password'"></i>
    </text-input>
    <external title="setting.employeeCardRegistration" @open="swipe" v-if="!operator.card"></external>
    <external title="card.removeEmployeeCard" @open="unregister" v-else></external>
    <text-list v-model="operator.role" title="text.role" :opts="roles" v-show="authorized"></text-list>
    <text-input v-model.number="operator.wage" title="text.salary"></text-input>
    <toggle v-model="operator.timecard" title="text.timecard" tooltip="tip.timecard.forOne"></toggle>
    <toggle v-model="operator.sessionReport" title="text.sessionReport" tooltip="tip.sessionReport"></toggle>
    <text-list v-model="operator.language" title="text.defaultLanguage" :opts="languages"></text-list>
    <text-list v-model="operator.cashCtrl" title="setting.cashDrawer" :opts="ctrl"></text-list>
    <external title="setting.permission.access" @open="$router.push({name:'Setting.operator.access',params:{operator}})"></external>
    <external title="setting.permission.modify" @open="$router.push({name:'Setting.operator.modify',params:{operator}})"></external>
    <external title="setting.permission.view" @open="$router.push({name:'Setting.operator.view',params:{operator}})"></external>
    <external title="setting.permission.permission" :disabled="!authorized" @open="$router.push({name:'Setting.operator.permission',params:{operator}})"></external>
    <toggle v-model="operator.restrict" title="text.restrict" true-tooltip="tip.restrictPermission" false-tooltip="tip.temporaryPermission" :conditionalTooltip="true"></toggle>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import capture from "./capture";
import toggle from "../../common/toggle";
import textList from "../../common/textList";
import external from "../../common/external";
import textInput from "../../common/textInput";
import dialoger from "../../../common/dialoger";

export default {
  props: ["operator"],
  components: { capture, toggle, textList, external, textInput, dialoger },
  computed: {
    ...mapGetters(["authorized"])
  },
  data() {
    return {
      op: this.$store.getters.op,
      componentData: null,
      component: null,
      view: "password",
      removed: false,
      languages: [
        {
          label: "text.english",
          tooltip: "text.primary",
          value: "usEN"
        },
        {
          label: "text.chinese",
          tooltip: "text.secondary",
          value: "zhCN"
        }
      ],
      ctrl: ["enable", "disable", "staffBank"].map(type => ({
        label: "text." + type,
        tooltip: "tip.cashdrawer." + type,
        value: type
      })),
      roles: [
        "Owner",
        "Manager",
        "Cashier",
        "Waitstaff",
        "Bartender",
        "Worker",
        "ThirdParty"
      ].map(role => ({
        label: "type." + role,
        tooltip: "",
        value: role
      }))
    };
  },
  beforeRouteLeave(to, from, next) {
    if (!this.removed) {
      this.op._id === this.operator._id && this.setOp(this.operator);
      this.$socket.emit("[OPERATOR] UPDATE", this.operator, () => next());
    } else {
      next();
    }
  },
  methods: {
    remove() {
      const content = {
        type: "question",
        title: "dialog.deleteOperator",
        msg: ["dialog.deleteOperatorConfirm", this.operator.name]
      };

      this.$dialog(content)
        .then(() => {
          this.$q();
          this.removed = true;
          this.$socket.emit("[OPERATOR] REMOVE", this.operator, () =>
            this.$router.push({ name: "Setting.operator" })
          );
        })
        .catch(() => this.$q());
    },
    swipe() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "capture";
      })
        .then(card => {
          this.$socket.emit("[CHECK] EMPLOYEE_CARD", card, exist => {
            const prompt = {
              title: "dialog.employeeCardRegisterFailed",
              msg: "dialog.employeeCardRegistered",
              buttons: [{ text: "button.confirm", fn: "resolve" }]
            };

            exist
              ? this.$dialog(prompt).then(() => this.$q())
              : this.register(card);
          });
        })
        .catch(() => this.$q());
    },
    register(card) {
      this.operator = Object.assign({}, this.operator, { card });
      this.$q();
    },
    unregister() {
      const prompt = {
        title: "card.removeEmployeeCard",
        msg: "card.removeEmployeeCardConfirm"
      };

      this.$dialog()
        .then(() => {
          delete this.operator.card;
          this.$q();
        })
        .catch(() => this.$q());
    },
    ...mapActions(["setOp"])
  }
};
</script>

<style scoped>
i.view {
  padding: 10px 21px;
  color: #555;
  cursor: pointer;
  margin: 0 10px;
}
</style>