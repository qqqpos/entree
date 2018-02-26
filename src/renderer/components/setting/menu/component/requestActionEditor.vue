<template>
    <div class="popupMask setting dark center" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h5>{{$t('title.edit')}}</h5>
                <h3>{{$t(action[language])}}</h3>
            </header>
            <div class="wrap">
                <inputer title="text.primary" v-model.trim="action.usEN"></inputer>
                <inputer title="text.secondary" v-model.trim="action.zhCN"></inputer>
                <switches title="text.prefix" v-model="action.prefix"></switches>
                <toggle title="text.multiplier" v-model="action.multiplier" :defaultStyle="false">
                    <transition name="dropdown">
                        <div class="opt" v-if="action.multiplier">
                            <inputer title="text.value" v-model.number="action.multiply"></inputer>
                        </div>
                    </transition>
                </toggle>
            </div>
            <footer>
              <div class="opt">
                <span class="del" @click="clear">{{$t('button.clear')}}</span>
              </div>
              <button class="btn" @click="confirm">{{$t('button.done')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import switches from "../../common/switches";
export default {
  props: ["init"],
  components: { toggle, inputer, switches },
  data() {
    return {
      language: this.$store.getters.language,
      action: JSON.parse(JSON.stringify(this.init.action))
    };
  },
  methods: {
    clear() {
      Object.assign(this.action, {
        usEN: "",
        zhCN: "",
        prefix: true,
        multiplier: false,
        multiply: 1
      });
    },
    confirm() {
      this.$socket.emit(
        "[REQUEST] UPDATE_ACTION",
        {
          action: this.action,
          index: this.init.index
        },
        () => this.init.resolve()
      );
    }
  }
};
</script>