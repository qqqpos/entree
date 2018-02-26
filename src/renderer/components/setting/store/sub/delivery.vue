<template>
  <div>
    <header class="nav">
      <div class="back" @click="$router.push({ name: 'Setting.store.payment' })">
        <i class="fa fa-chevron-left"></i>
      </div>
      <div class="title">{{$t('title.deliveryRelated')}}</div>
      <nav>
        <span @click="create">{{$t('button.create')}}</span>
      </nav>
    </header>
    <toggle title="setting.delivery.tax" tooltip="tip.delivery.tax" v-model="tax.deliveryTax" @update="updateDeliveryTax"></toggle>
    <toggle title="setting.delivery.charge" true-tooltip="tip.delivery.charge" false-tooltip="tip.delivery.free" v-model="store.deliver.charge" :conditionalTooltip="true" @update="updateDelivery">
      <transition name="dropdown">
        <div class="opt" v-if="store.deliver.charge">
          <inputer title="text.amount" v-model.number="store.deliver.baseFee" @update="updateDeliveryFee"></inputer>
        </div>
      </transition>
    </toggle>
    <toggle title="setting.delivery.adjustTip" v-model="store.deliver.adjustTip" @update="updateDeliveryTip"></toggle>
    <toggle title="setting.delivery.surcharge" v-model="store.deliver.surcharge">
      <transition name="dropdown">
        <div v-if="store.deliver.surcharge">
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
              <tr v-for="(rule,index) in store.deliver.rules" :key="index">
                <td class="guest">{{$t('text.withInMile',rule.distance)}}</td>
                <td class="amount">$ {{rule.fee | decimal}}</td>
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
import { mapGetters } from "vuex";
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import editor from "../component/deliveryEditor";

export default {
  components: { toggle, inputer, editor },
  computed: {
    ...mapGetters(["config", "tax"])
  },
  data() {
    return {
      store: null,
      component: null,
      componentData: null
    };
  },
  created() {
    this.store = Object.assign({}, this.config.store);
  },
  methods: {
    update(data) {
      this.$socket.emit("[CONFIG] UPDATE", data);
    },
    updateDelivery(value) {
      this.update({
        key: "store.deliver.charge",
        value
      });
    },
    updateDeliveryFee(value) {
      this.update({
        key: "store.deliver.baseFee",
        value: parseFloat(value)
      });
    },
    updateDeliveryTax(value) {
      this.update({
        key: "tax.deliveryTax",
        value
      });
    },
    updateDeliveryTip() {
      this.update({
        key: "store.deliver.adjustTip",
        value: parseFloat(value)
      });
    },
    updateChargeRules() {
      this.update({
        key: "store.deliver.rules",
        value: this.store.deliver.rules
      });
    },
    create() {
      const rule = {
        distance: "",
        fee: 0
      };

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, rule, edit: false };
        this.component = "editor";
      })
        .then(_rule => {
          this.store.deliver.rules.push(_rule);
          this.updateChargeRules();
          this.$q();
        })
        .catch(() => this.$q());
    },
    edit(rule, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, rule, edit: true };
        this.component = "editor";
      })
        .then(_rule => {
          this.store.deliver.rules.splice(index, 1, _rule);
          this.updateChargeRules();
          this.$q();
        })
        .catch(del => {
          if (del) {
            this.store.deliver.rules.splice(index, 1);
            this.updateChargeRules();
          }
          this.$q();
        });
    }
  }
};
</script>