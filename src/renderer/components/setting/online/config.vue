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
                    <b class="light">{{$t('online.test.database')}}</b>
                    <span class="f1"></span>
                    <span class="result light">{{status(test.database)}}</span>
                </div>
                <div class="row">
                    <b class="light">{{$t('online.test.socket')}}</b>
                    <span class="f1"></span>
                    <span class="result light">{{status(test.socket)}}</span>
                </div>   
                <div class="button"><i class="fas fa-bug space light"></i>{{$t('button.test')}}</div>
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
          return this.$t("online.test.ready");
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

<style scoped>
.test {
  padding: 10px 35px;
  text-align: center;
}

.test .row {
  padding: 3px 0;
  border-bottom: 1px dotted #eee;
}

.button {
  padding: 15px 0;
  margin: 10px 0 0px;
}
</style>

