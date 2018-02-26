<template>
    <div>
        <section class="card">
            <header>
                <span>{{$t('title.baseSetting')}}</span>
                <span class="tip"></span>
            </header>
            <article>
                <smart-input v-model="operator.name" label="text.name" :maximum="10"></smart-input>
                <smart-option v-model="operator.role" label="text.role" :options="roles"></smart-option>
                <smart-input v-model="operator.pin" label="text.password" type="password"></smart-input>
                <smart-option v-model="operator.language" label="text.defaultLanguage" :options="languages"></smart-option>
            </article>
        </section>
        <section class="card">
            <header>
                <span>{{$t('title.salary')}}</span>
            </header>
            <article>
                <smart-switch v-model="operator.timecard" label="text.timeCard"></smart-switch>
                <smart-input v-model.number="operator.wage" label="thead.wage" :disable="!operator.timecard"></smart-input>
            </article>
        </section>
        <section class="card list">
            <header>{{$t('setting.permission')}}
                <span class="tip">{{$t('setting.permissionTip')}}</span>
            </header>
            <div class="header">
                <span class="name">{{$t('text.name')}}</span>
                <span class="f1">{{$t('text.apply')}}</span>
            </div>
            <article>
                <div class="datalist">
                    <span class="name">{{$t('setting.access')}}</span>
                    <div class="f1">
                        <checkbox v-model="operator.access" val="setting" label="text.setting" :multiple="true"></checkbox>
                        <checkbox v-model="operator.access" val="employee" label="text.employee" :multiple="true"></checkbox>
                        <checkbox v-model="operator.access" val="report" label="text.report" :multiple="true"></checkbox>
                        <checkbox v-model="operator.access" val="terminal" label="text.terminal" :multiple="true"></checkbox>
                        <checkbox v-model="operator.access" val="history" label="text.historyInvoice" :multiple="true"></checkbox>
                    </div>
                </div>
                <div class="datalist">
                    <span class="name">{{$t('setting.permission')}}</span>
                    <div class="f1">
                        <checkbox v-model="operator.permission" val="timecard" label="text.timecard" :multiple="true"></checkbox>
                        <checkbox v-model="operator.permission" val="giftCard" label="text.issueGiftCard" :multiple="true"></checkbox>
                        <checkbox v-model="operator.permission" val="coupon" label="text.issueCoupon" :multiple="true"></checkbox>
                    </div>
                </div>
                <div class="datalist">
                    <span class="name">{{$t('setting.modify')}}</span>
                    <div class="f1">
                        <checkbox v-model="operator.modify" val="price" label="text.price" :multiple="true"></checkbox>
                        <checkbox v-model="operator.modify" val="item" label="text.removeItem" :multiple="true"></checkbox>
                        <checkbox v-model="operator.modify" val="order" label="text.order" :multiple="true"></checkbox>
                        <checkbox v-model="operator.modify" val="discount" label="text.discount" :multiple="true"></checkbox>
                        <checkbox v-model="operator.modify" val="driver" label="text.driver" :multiple="true"></checkbox>
                        <checkbox v-model="operator.modify" val="transaction" label="text.transaction" :multiple="true"></checkbox>
                        <checkbox v-model="operator.modify" val="tip" label="text.tip" :multiple="true"></checkbox>
                    </div>
                </div>
                <div class="datalist">
                    <span class="name">{{$t('setting.view')}}</span>
                    <div class="f1">
                        <checkbox v-model="operator.view" val="summary" label="text.viewSummary" :multiple="true"></checkbox>
                        <checkbox v-model="operator.view" val="invoices" label="text.viewInvoices" :multiple="true"></checkbox>
                        <checkbox v-model="operator.view" val="tables" label="text.viewTables" :multiple="true"></checkbox>
                    </div>
                </div>
                <div class="datalist">
                    <span class="name">{{$t('text.cashDrawer')}}</span>
                    <div class="f1">
                        <radio v-model="operator.cashCtrl" val="enable" label="text.enable" name="cashCtrl"></radio>
                        <radio v-model="operator.cashCtrl" val="staffBank" label="text.staffBank" name="cashCtrl"></radio>
                        <radio v-model="operator.cashCtrl" val="disable" label="text.disallow" name="cashCtrl"></radio>
                    </div>
                </div>
            </article>
        </section>
        <section class="card column">
            <div>
                <header>
                    <span>{{$t('setting.employeeCard')}}</span>
                    <span class="tip">{{$t('setting.employeeCardRegistration')}}</span>
                </header>
                <div>
                    <button class="btn" @click="registerEmployeeCard" v-if="!operator.card">{{$t('button.register')}}</button>
                    <button class="btn" @click="removeEmployeeCard" v-else>{{$t('button.unRegister')}}</button>
                </div>
            </div>
            <div>
                <header>
                    <span>{{$t('setting.userRemoval')}}</span>
                    <span class="tip">{{$t('setting.userRemovalTip')}}</span>
                </header>
                <div>
                    <div class="btn" @click="removeUser">{{$t('button.delete')}}</div>
                </div>
            </div>
        </section>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import smartOption from "../common/smartOption";
import smartSwitch from "../common/smartSwitch";
import smartInput from "../common/smartInput";
import dialoger from "../../common/dialoger";
import checkbox from "../common/checkbox";
import radio from "../common/radio";
import capture from "./capture";
export default {
  props: ["profile"],
  components: {
    smartOption,
    smartSwitch,
    smartInput,
    checkbox,
    radio,
    dialoger,
    capture
  },
  data() {
    return {
      componentData: null,
      component: null,
      languages: [
        { label: this.$t("text.primary") + " us-en", value: "usEN" },
        { label: this.$t("text.secondary") + " zh-cn", value: "zhCN" }
      ],
      roles: [
        "Owner",
        "Manager",
        "Cashier",
        "Waitstaff",
        "Bartender",
        "ThirdParty"
      ],
      operator: {}
    };
  },
  created() {
    this.operator = JSON.parse(JSON.stringify(this.profile));
    //patch
    !this.operator.hasOwnProperty("permission") &&
      (this.operator = Object.assign({}, this.operator, { permission: [] }));
  },
  methods: {
    removeUser() {
      this.$dialog({
        title: "dialog.deleteOperatorConfirm",
        msg: ["dialog.deleteOperatorConfirmTip", this.operator.name]
      })
        .then(() => {
          this.$socket.emit("[CMS] REMOVE_USER", this.operator._id);
          this.$q();
          this.$nextTick(() => {
            this.$router.push({ name: "Setting.operator.index" });
          });
        })
        .catch(() => {
          this.$q();
        });
    },
    registerEmployeeCard() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "capture";
      })
        .then(card => {
          this.$socket.emit("[CHECK] EMPLOYEE_CARD", card, exist => {
            exist
              ? this.$dialog({
                  title: "dialog.employeeCardRegisterFailed",
                  msg: "dialog.employeeCardRegistered",
                  buttons: [{ text: "button.confirm", fn: "resolve" }]
                }).then(() => {
                  this.$q();
                })
              : (this.operator = Object.assign({}, this.operator, { card }));
          });
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    removeEmployeeCard() {
      this.$dialog({
        title: "card.removeEmployeeCard",
        msg: "card.removeEmployeeCardTip"
      })
        .then(() => {
          this.operator.card = null;
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    }
  },
  watch: {
    operator: {
      handler(n) {
        let keys = Object.keys(n);
        let isChange = keys.some(key => {
          switch (typeof n[key]) {
            case "string":
            case "number":
              return n[key] !== this.profile[key];
            case "object":
              if (Array.isArray(n[key])) {
                return (
                  n[key].length !== this.profile[key].length &&
                  n[key].every((v, i) => v !== this.profile[i])
                );
              } else {
                return (
                  JSON.stringify(n[key]) !== JSON.stringify(this.profile[key])
                );
              }
              break;
            case "boolean":
              return n[key] !== this.profile[key];
          }
        });
        isChange ? this.$emit("change", n) : this.$emit("unchanged");
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.f1 {
  display: flex;
  flex-wrap: wrap;
}

.header {
  padding: 10px 20px;
  background: #4d6d83;
  color: #fff;
  display: flex;
  border-bottom: 1px solid #455a64;
}

.name {
  width: 150px;
}

.datalist .name {
  text-align: center;
}

.datalist .f1 {
  margin-left: 2em;
}

.column {
  display: flex;
}

.column > div {
  flex: 1;
}

.column .btn {
  margin-right: 10px;
}
</style>