<template>
  <div>
    <div class="tab-content">
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
                  <td @click="edit(rule,index)" class="fas fa-cog ghost clickable" colspan="2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </transition>
      </toggle>
      <div :is="component" :init="componentData"></div>
    </div>
</div>
</template>

<script>
import toggle from "../../common/toggle";
import editor from "./ruleEditor";
export default {
  components: { toggle, editor },
  data() {
    return {
      componentData: null,
      component: null,
      surcharge: Object.assign({}, this.$store.getters.dineInOpt.surcharge)
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

      this.edit(rule, false);
    },
    async edit(rule, index) {
      const edit = isNumber(index);

      try {
        const update = await this.$promise("editor", { rule, edit });
        edit
          ? this.surcharge.rules.push(update)
          : this.surcharge.rules.splice(index, 1, update);
      } catch (remove) {
        remove && this.surcharge.rules.splice(index, 1);
      } finally {
        this.exitComponent();
      }
    },
    save() {
      Object.assign(this.$store.getters.dineInOpt, {
        surcharge: this.surcharge
      });
      this.$router.push({ name: "Setting.dineIn.config" });
    }
  }
};
</script>