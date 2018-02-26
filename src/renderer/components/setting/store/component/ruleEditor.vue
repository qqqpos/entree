<template>
    <div class="popupMask dark center setting" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h5 v-if="init.edit">{{$t('title.edit')}}</h5>
                <h5 v-else>{{$t('title.create')}}</h5>
                <h3>{{$t('setting.surcharge')}}</h3>
            </header>
            <div class="wrap opt">
                <inputer title="text.guest" v-model.number="rule.guest"></inputer>
                <inputer title="text.amount" v-model.number="rule.fee"></inputer>
                <switches title="text.percentage" v-model="rule.percentage"></switches>
            </div>
            <footer>
              <div class="opt">
                <span class="del" @click="init.reject(true)" v-show="init.edit">{{$t('button.delete')}}</span>
              </div>
                <button class="btn" @click="confirm" :disabled="invalid">{{$t('button.done')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import switches from "../../common/switches";
export default {
  props: ["init"],
  components: { inputer, switches },
  data() {
    return {
      rule: Object.assign({}, this.init.rule)
    };
  },
  computed: {
    invalid() {
      return !isNumber(this.rule.guest) || !isNumber(this.rule.fee);
    }
  },
  methods: {
    confirm() {
      this.init.resolve(this.rule);
    }
  }
};
</script>