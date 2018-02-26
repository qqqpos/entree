<template>
    <div class="popupMask dark center setting" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5></h5>
                <h3>{{$t('title.registration')}}</h3>
            </header>
            <div class="wrap">
                <inputer title="text.storeName" v-model.trim="name"></inputer>
                <inputer title="text.licenseKey" v-model.trim="key"></inputer>
            </div>
            <footer>
                <button class="btn" @click="register" :disabled="invalid">{{$t('button.register')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
export default {
  props: ["init"],
  components: { inputer },
  data() {
    return {
      name: "",
      key: ""
    };
  },
  computed: {
    invalid() {
      let value = 0;
      for (let i = 0; i < value.length; i++) {
        value += this.name.charCodeAt(i) * 15;
      }
      return atob(this.key) !== value;
    }
  },
  methods: {
    register() {}
  }
};
</script>