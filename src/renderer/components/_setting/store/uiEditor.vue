<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h2>{{$t('setting.uiEditor')}}</h2>
            </header>
            <div class="inner">
                <div class="input">
                    <label>{{$t('text.title')}}</label>
                    <input v-model.trim="ui.head">
                </div>
                <div class="input">
                    <label>{{$t('text.subtitle')}}</label>
                    <input v-model.trim="ui.subhead">
                </div>
                <div class="options">
                    <label>{{$t('text.function')}}</label>
                    <select v-model="ui.route">
                        <option :value="route" v-for="(route,index) in routes" :key="index">{{route}}</option>
                    </select>
                </div>
                <div class="options">
                    <label>{{$t('text.icon')}}</label>
                    <select v-model="ui.icon">
                        <option :value="icon" v-for="(icon,index) in icons" :key="index">{{icon}}</option>
                    </select>
                </div>
                <div class="default">
                    <checkbox label="text.enable" v-model="ui.enable"></checkbox>
                </div>
            </div>
            <footer>
                <div class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import checkbox from "../common/checkbox";
export default {
  components: { checkbox },
  props: ["init"],
  data() {
    return {
      ui: null,
      icons: [
        "fa-user",
        "fa-phone",
        "fa-car",
        "fa-cutlery",
        "fa-list",
        "fa-inbox",
        "fa-cog",
        "fa-lock"
      ],
      routes: [
        "sale",
        "order",
        "pickup",
        "delivery",
        "table",
        "buffet",
        "thirdParty",
        "history",
        "pickupList",
        "setting",
        "cashDrawer",
        "lock"
      ]
    };
  },
  created() {
    this.ui = Object.assign({}, this.init.ui);
  },
  methods: {
    confirm() {
      this.init.resolve(this.ui);
    }
  }
};
</script>