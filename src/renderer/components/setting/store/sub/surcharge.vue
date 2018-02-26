<template>
  <div>
    <header class="nav">
      <div class="back" @click="save">
        <i class="fa fa-chevron-left"></i>
      </div>
      <div class="title"></div>
      <nav>
        <span @click="create">{{$t('button.new')}}</span>
      </nav>
    </header>
    <toggle title="setting.surcharge" v-model="surcharge.enable">
      <transition name="dropdown">
        <div v-if="surcharge.enable">
          <table class="setting">
            <thead>
              <tr>
                <th>{{$t('thead.condition')}}</th>
                <th>{{$t('thead.amount')}}</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rule,index) in surcharge.rules" :key="index">
                <td class="guest">{{$t('text.chargeAbove',rule.guest)}}</td>
                <td class="amount" v-if="rule.percentage">{{rule.fee}} %</td>
                <td class="amount" v-else>$ {{rule.fee}}</td>
                <td @click="edit(rule,index)" class="opt" colspan="2">
                  <i class="fa fa-pencil-square"></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </transition>
    </toggle>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import toggle from "../../common/toggle";
import editor from "../component/ruleEditor";
export default {
  components: { toggle, editor },
  data() {
    return {
      componentData: null,
      component: null,
      surcharge: Object.assign({}, this.$store.getters.dinein.surcharge)
    };
  },
  methods: {
    create() {
      const rule = {
        guest: null,
        fee: null,
        percentage: false,
        template: ""
      };

      !this.surcharge.hasOwnProperty("rules") &&
        Object.assign(this.surcharge, { rules: [] });

      this.edit(rule);
    },
    edit(rule, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, rule, edit: !isNaN(index) };
        this.component = "editor";
      })
        .then(_rule => {
          isNaN(index)
            ? this.surcharge.rules.push(_rule)
            : this.surcharge.rules.splice(index, 1, _rule);
          this.$q();
        })
        .catch(del => {
          del && this.surcharge.rules.splice(index, 1);
          this.$q();
        });
    },
    save() {
      this.$socket.emit("[CONFIG] UPDATE", {
        key: "dinein.surcharge",
        value: this.surcharge
      });
      this.$router.push({ name: "Setting.store.dinein" });
    }
  }
};
</script>