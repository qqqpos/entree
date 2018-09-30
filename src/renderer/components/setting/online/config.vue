<template>
    <div>
        <div class="tab-content">
            <header class="nav">
                <h3 class="title">{{$t('setting.title.online')}}</h3>
            </header>
            <toggle title="online.setting.enable" v-model="online.enable"></toggle>
            <text-input title="online.setting.connectionStrings" v-model="online.connectionStrings" placeholder="mongodb://"></text-input>
            <text-input title="online.setting.database" v-model="online.database"></text-input>
            <text-input title="online.setting.socket" v-model="online.socket" placeholder="https://"></text-input>
            <div class="test">
                <div class="row">
                    <span class="target">{{$t('online.test.database')}}</span>
                    <span class="dots f1 text-center">................................................</span>
                    <span class="result">{{status(test.database)}}</span>
                </div>
                <div class="row">
                    <span class="target">{{$t('online.test.socket')}}</span>
                    <span class="dots f1 text-center">................................................</span>
                    <span class="result">{{status(test.socket)}}</span>
                </div>   
                <button @click="start">{{$t('button.test')}}</button>
            </div> 
        </div>
    </div>
</template>

<script>
import toggle from "../common/toggle";
import textInput from "../common/textInput";

export default {
  components: { toggle, textInput },
  data() {
    return {
      online: {},
      test: {
        database: 0,
        socket: 0
      }
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[ONLINE] CONFIG", config => {
      next(vm => {
        vm.online = config;
      });
    });
  },
  methods: {
    status(value) {
      switch (value) {
        case 0:
          return this.$t("online.test.notReady");
        case 1:
          return this.$t("online.test.passed");
        case -1:
          return this.$t("online.test.failed");
      }
    },
    start() {
      this.test = {
        database: 0,
        socket: 0
      };
    }
  }
};
</script>

