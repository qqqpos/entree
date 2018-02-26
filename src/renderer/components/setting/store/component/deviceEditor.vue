<template>
    <div class="popupMask setting center dark" @click.self="init.reject(false)">
        <div class="editor" v-show="!component">
            <header>
                <h5 v-if="init.edit">{{$t('title.edit')}}</h5>
                <h5 v-else>{{$t('title.create')}}</h5>
                <h3>{{$t('title.device')}}</h3>
            </header>
            <div class="wrap">
                <div class="input">
                    <inputer title="text.alias" v-model.trim="device.alias" :disabled="init.edit"></inputer>
                    <inputer title="text.location" v-model.trim="device.location"></inputer>
                    <inputer title="text.ip" v-model="device.ip"></inputer>
                    <inputer title="text.port" v-model="device.port"></inputer>
                    <inputer title="text.model" v-model="device.model"></inputer>
                    <inputer title="text.S/N" v-model.trim="device.sn"></inputer>
                    <switches title="text.printReceipt" v-model="device.print"></switches>
                    <switches title="setting.tipSuggestion" v-model="device.tipSuggestion"></switches>
                </div>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="init.reject(true)" v-show="init.edit">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="search">{{$t('button.search')}}</button>
                <button class="btn" @click="confirm" :disabled="invalid">{{$t('button.confirm')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import search from "../../component/search";
import checkbox from "../../common/checkbox";
import switches from "../../common/switches";

export default {
  props: ["init"],
  components: { search, inputer, checkbox, switches },
  data() {
    return {
      componentData: null,
      component: null,
      device: JSON.parse(JSON.stringify(this.init.device))
    };
  },
  computed: {
    invalid() {
      let names = this.init.devices
        .filter(d => d._id !== this.device._id)
        .map(d => d.alias);
      return !this.device.alias || names.includes(this.device.alias);
    }
  },
  methods: {
    confirm() {
      this.init.resolve(this.device);
    },
    search() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "search";
      })
        .then(result => {
          Object.assign(this.device, result);
          this.$q();
        })
        .catch(() => this.$q());
    }
  }
};
</script>

<style scoped>

</style>