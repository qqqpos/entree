<template>
  <div>
    <header class="nav">
      <div class="back" @click="save">
        <i class="fa fa-chevron-left"></i>
      </div>
      <div class="title">{{$t('title.taxList')}}</div>
      <nav>
        <span @click="create">{{$t('button.new')}}</span>
      </nav>
    </header>
    <toggle title="setting.taxBeforeDiscount" v-model="tax.beforeDiscount" @update="updateTaxDiscount"></toggle>
    <toggle title="setting.taxBeforeCredit" v-model="tax.beforeCredit" @update="updateTaxCredit"></toggle>
    <toggle title="text.taxFree" v-model="tax.defaultTaxFree" tooltip="tip.taxApply" @update="updateTaxApply"></toggle>
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
            <i class="fa fa-ellipsis-v"></i>
          </td>
        </tr>
      </tbody>
    </table>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import toggle from "../../common/toggle";
import editor from "../component/taxEditor";

export default {
  components: { toggle, editor },
  data() {
    return {
      component: null,
      componentData: null,
      tax: Object.assign({}, this.$store.getters.tax)
    };
  },
  methods: {
    create() {
      const name = "tax" + String().random();
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
        .then(_tax => {
          Object.assign(this.tax.class[name], _tax);
          this.$q();
        })
        .catch(del => {
          del && this.$delete(this.tax.class, name);
          this.$q();
        });
    },
    update(data) {
      this.$socket.emit("[CONFIG] UPDATE", data);
    },
    setDefault(tax) {
      Object.keys(this.tax.class).forEach(
        name => (this.tax.class[name].default = false)
      );
      tax.default = true;
    },
    updateTaxDiscount(value) {
      this.update({
        key: "tax.beforeDiscount",
        value
      });
    },
    updateTaxCredit(value) {
      this.update({
        key: "tax.beforeCredit",
        value
      });
    },
    updateTaxApply(value){
      this.update({
        key:'tax.defaultTaxFree',
        value
      })
    },
    save() {
      this.$socket.emit("[CONFIG] UPDATE", {
        key: "tax.class",
        value: this.tax.class
      });
      this.$router.push({ name: "Setting.store.payment" });
    }
  }
};
</script>

<style scoped>
.fa-check-circle {
  color: var(--green);
}
</style>