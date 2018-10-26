<template>
  <div>
    <div class="tab-content">
      <header class="nav">
        <div class="back" @click="save">
          <i class="fa fa-chevron-left"></i>
        </div>
        <nav>
          <span @click="create">{{$t('button.new')}}</span>
        </nav>
      </header>
      <toggle title="setting.surcharge" v-model="surcharge.enable">
        <transition name="dropdown">
          <ul v-if="surcharge.enable">
            <li v-for="(rule,index) in surcharge.rules" :key="index" class="relative row flex-center">
              <div>
                <i class="fas fa-users ghost space-right"></i>
                <i class="fas fa-greater-than-equal ghost space-right"></i>
                <span class="agency light">{{rule.guest}}</span>
              </div>
              <div>
                <i class="fas fa-hand-holding-usd ghost space-right"></i>
                  <span class="agency light" v-if="rule.percentage">{{rule.fee}} %</span>
                  <span class="agency light" v-else>$ {{rule.fee.toFixed(2)}}</span>
              </div>
              <i @click="edit(rule,index)" class="fas fa-cog ghost clickable"></i>
            </li>
          </ul>
        </transition>
      </toggle>
      <div :is="component" :init="componentData"></div>
    </div>
</div>
</template>

<script>
import editor from "./rule";
import toggle from "../../common/toggle";

export default {
  components: { toggle, editor },
  data() {
    return {
      surcharge: Object.assign({}, this.$store.getters.dineInOpt.surcharge),
      componentData: null,
      component: null
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

      !this.surcharge.rules && Object.assign(this.surcharge, { rules: [] });

      this.edit(rule, false);
    },
    async edit(rule, index) {
      const edit = isNumber(index);

      try {
        const update = await this.$promise("editor", { rule, edit });

        edit
          ? this.surcharge.rules.splice(index, 1, update)
          : this.surcharge.rules.push(update);
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

<style scoped>
ul {
  border-top: 1px solid #eee;
  padding: 5px 25px;
}

li:not(:last-child) {
  border-bottom: 1px dashed #eee;
}

li div {
  width: 130px;
  padding: 7px 5px;
  text-align: center;
  color: rgb(32, 33, 36);
  background: rgb(232, 234, 237);
  margin: 5px 8px;
  border-radius: 4px;
}

li > i {
  position: absolute;
  padding: 5px 10px;
  right: 0px;
}
</style>
