<template>
    <div class="popupMask dark center setting" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <div>
                  <h5>{{$t(init.edit ? 'title.edit' : 'title.create')}}</h5>
                  <h3>{{$t('setting.surcharge')}}</h3>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap opt">
                <inputer title="text.guest" v-model.number="rule.guest"></inputer>
                <inputer title="text.amount" v-model.number="rule.fee" :placeholder="rule.percentage ? '0':'0.00'">
                  <i class="fas fa-percentage" v-if="rule.percentage" @click="rule.percentage = false"></i>
                  <i class="fas fa-dollar-sign" v-else @click="rule.percentage = true"></i>
                </inputer>
            </div>
            <footer>
              <div class="opt">
                <span class="del" @click="init.reject(true)" v-show="init.edit">{{$t('button.delete')}}</span>
              </div>
                <button class="btn" @click="init.resolve(rule)" :disabled="invalid">{{$t('button.done')}}</button>
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
  }
};
</script>