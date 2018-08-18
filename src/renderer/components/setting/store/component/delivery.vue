<template>
  <div>
    <div class="tab-content">
      <header class="nav">
        <div class="back" @click="$router.push({ name: 'Setting.payment' })">
          <i class="fa fa-chevron-left"></i>
        </div>
        <h3 class="title">{{$t('setting.title.delivery')}}</h3>
        <nav>
          <span @click="create">{{$t('button.create')}}</span>
        </nav>
      </header>
      <toggle title="setting.delivery.charge" true-tooltip="tip.delivery.charge" false-tooltip="tip.delivery.free" v-model="store.deliver.charge" :conditionalTooltip="true">
        <transition name="dropdown">
          <div class="opt" v-if="store.deliver.charge">
            <inputer title="text.amount" v-model.number="store.deliver.baseFee"></inputer>
          </div>
        </transition>
      </toggle>
      <toggle title="setting.delivery.tax" tooltip="tip.delivery.tax" v-model="tax.deliveryTax"></toggle>
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
                  <td class="guest">{{$t('text.overMile',rule.distance)}}</td>
                  <td class="amount">$ {{rule.fee | decimal}}</td>
                  <td @click="edit(rule,index)" class="opt" colspan="2">
                    <i class="fas fa-ellipsis-v light"></i>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </transition>
      </toggle>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import editor from "../editor/delivery";

export default {
  components: { toggle, inputer, editor },
  computed: {
    ...mapGetters(["config", "tax"])
  },
  data() {
    return {
      store: null,
      componentData: null,
      component: null
    };
  },
  created(){
    this.store = Object.assign({}, this.config.store);
  },
  beforeDestroy() {
    this.update({
      key: "store.deliver",
      value: this.store.deliver
    });
  },
  methods: {
    update(data) {
      this.$socket.emit("[CONFIG] UPDATE", data);
    },
    create() {
      const rule = {
        distance: 0,
        fee: 0
      };

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, rule, edit: false };
        this.component = "editor";
      })
        .then(update => {
          this.store.deliver.rules.push(update);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    edit(rule, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, rule, edit: true };
        this.component = "editor";
      })
        .then(update => {
          this.store.deliver.rules.splice(index, 1, update);
          this.exitComponent();
        })
        .catch(remove => {
          this.exitComponent();
          remove && this.store.deliver.rules.splice(index, 1);
        });
    }
  }
};
</script>