<template>
    <div class="popupMask setting center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <div>
                    <h5>{{$t(init.edit ? 'title.edit': 'title.create')}}</h5>
                    <h3>{{$t('button.option')}}</h3>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <inputer title="text.alias" v-model="option.name" :autoFocus="true" :length="16" v-if="option.hasOwnProperty('name')"></inputer>
                <inputer title="text.maxItem" v-model.number="option.max"></inputer>
                <inputer title="text.startAt" v-model.number="option.startAt"></inputer>
                <inputer title="text.overCharge" v-model.number="option.addition"></inputer>
                <switches title="text.itemInline" v-model="option.inline"></switches>
                <inputer title="text.separator" v-model="option.separator" v-show="option.inline"></inputer>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" v-if="init.edit" @click="init.reject(true)">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
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
      option: JSON.parse(JSON.stringify(this.init.option))
    };
  },
  methods: {
    confirm() {
      this.init.resolve(this.option);
    }
  }
};
</script>