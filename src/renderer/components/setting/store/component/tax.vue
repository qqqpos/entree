<template>
  <div>
    <div class="tab-content">
      <header class="nav">
        <div class="back" @click="$router.push({ name: 'Setting.payment' })">
          <i class="fa fa-chevron-left"></i>
        </div>
        <h3 class="title">{{$t('title.tax')}}</h3>
        <nav>
          <span @click="create">{{$t('button.new')}}</span>
        </nav>
      </header>
      <toggle title="setting.taxBeforeDiscount" v-model="tax.beforeDiscount"></toggle>
      <toggle title="setting.plasticPenaltyTax" v-model="tax.plasticPenalty">
        <transition name="dropdown">
          <div class="opt" v-if="tax.plasticPenalty">
            <inputer title="text.amount" v-model.number="tax.plasticCharge"></inputer>
          </div>
        </transition>
      </toggle>
      <toggle title="text.taxFree" v-model="tax.defaultTaxFree" tooltip="tip.taxApply"></toggle>
      <table class="setting">
        <thead>
          <tr>
            <th>{{$t('thead.name')}}</th>
            <th>{{$t('text.taxRate')}}</th>
            <th>{{$t('thead.default')}}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(tax,index) in tax.class" :key="index">
            <td>{{tax.alias}}</td>
            <td class="amount">{{tax.rate}} %</td>
            <td v-if="tax.default">
              <i class="fa fa-check-circle"></i>
            </td>
            <td v-else class="clickable" @click="setDefault(tax)">
              <i class="fa fa-check-o"></i>
            </td>
            <td class="opt" @click="edit(tax,index,true)">
              <i class="fa fa-cog light"></i>
            </td>
          </tr>
        </tbody>
      </table>
      <div :is="component" :init="componentData"></div>
    </div>
  </div>
</template>

<script>
import editor from "../editor/tax";
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";

export default {
  components: { toggle, editor, inputer },
  data() {
    return {
      component: null,
      componentData: null,
      tax: Object.assign({}, this.$store.getters.tax)
    };
  },
  created() {
    // hot fix
    this.tax.plasticCharge = isNumber(this.tax.plasticCharge)
      ? this.tax.plasticCharge
      : 0.05;
  },
  methods: {
    create() {
      const name = "tax_" + String().random();
      const tax = {
        alias: "",
        rate: 0,
        default: false,
        apply: {
          WALK_IN: true,
          PICK_UP: true,
          DELIVERY: true,
          DINE_IN: true,
          HIBACHI: true,
          TO_GO: true,
          SALES: true,
          DRIVE_THRU:true,
          BAR: true,
          BUFFET: true
        }
      };

      this.edit(tax, name, false);
    },
    edit(tax, name, edit = true) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, tax, edit };
        this.component = "editor";
      })
        .then(update => {
          this.tax.class[name] = update;
          this.exitComponent();
        })
        .catch(removeTax => {
          removeTax && this.$delete(this.tax.class, name);
          this.exitComponent();
        });
    },
    setDefault(tax) {
      Object.keys(this.tax.class).forEach(
        name => (this.tax.class[name].default = false)
      );
      tax.default = true;
    }
  },
  beforeRouteLeave(to, from, next) {
    this.$socket.emit("[CONFIG] UPDATE", {
      key: "tax",
      value: this.tax
    });

    next();
  }
};
</script>

<style scoped>
.fa-check-circle {
  color: var(--green);
}
</style>