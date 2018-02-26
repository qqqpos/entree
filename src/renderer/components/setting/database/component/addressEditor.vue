<template>
    <div class="popupMask setting dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5>{{$t('title.create')}}</h5>
                <h3>{{$t('title.address')}}</h3>
            </header>
            <div class="wrap">
                <inputer title="text.street" v-model.trim="street" :autoFocus="true"></inputer>
                <inputer title="text.city" v-model.trim="city"></inputer>
                <inputer title="text.zipCode" v-model.trim="zipCode" mask="#####"></inputer>
            </div>
            <footer>
                <button class="btn" @click="confirm" :disabled="!street ||!city">{{$t('button.confirm')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import dialoger from "../../../common/dialoger";

export default {
  props: ["init"],
  components: { inputer, dialoger },
  data() {
    return {
      componentData: null,
      component: null,
      street: "",
      city: "",
      zipCode: ""
    };
  },
  methods: {
    confirm() {
      this.checkDuplicate()
        .then(this.save)
        .catch(this.saveFailed);
    },
    checkDuplicate() {
      return new Promise((next, stop) => {
        const data = { street: this.street, city: this.city };
        this.$socket.emit("[ADDRESS] CHECK", data, exist => {
          exist ? stop : next(data);
        });
      });
    },
    save(address) {
      Object.assign(address, { zipCode: this.zipCode });
      this.init.resolve(address);
    },
    saveFailed() {
      const prompt = {
        title: "dialog.createFailed",
        msg: "dialog.duplicateAddress",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      this.$dialog(prompt).then(() => this.$q());
    }
  }
};
</script>