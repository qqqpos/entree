<template>
    <div class="popupMask center darker">
        <div class="wrap">
            <i class="fa fa-exclamation-circle icon"></i>
            <h3>{{$t("dialog.somethingWrong")}}</h3>
            <h5>
                <span>{{pass.minute}}</span>
                <span>:</span>
                <span>{{pass.second}}</span>
            </h5>
            <div v-show="!autoFix" class="shutdown" @click="shutdown">{{$t('control.shutdown')}}</div>
            <footer>
                <p v-if="autoFix">{{$t('dialog.attemptReconnect')}}</p>
                <template v-else>
                    <p>{{$t('dialog.attemptFailed')}}</p>
                    <p>{{$t('dialog.supportHotLine')}}</p>
                </template>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: ["init"],
  data() {
    return {
      happened: Date.now() - 1000,
      autoFix: true
    };
  },
  computed: {
    pass() {
      const diff = this.time - this.happened;
      this.autoFix = diff < 30000;

      const minute = Math.floor(diff / 1000 / 60);
      const second = Math.floor((diff / 1000) % 60);
      return {
        minute: ("0" + minute).slice(-2),
        second: ("0" + second).slice(-2)
      };
    },
    ...mapGetters(["time"])
  },
  methods: {
    shutdown() {
      this.$electron.ipcRenderer.send("Shutdown");
    }
  }
};
</script>

<style scoped>
.wrap {
  text-align: center;
  color: #fff;
  margin-top: 7em;
}

i {
  color: #ffeb3b;
  font-size: 5em;
  position: relative;
}

h3 {
  font-family: "Microsoft YaHei";
  margin-top: 10px;
}

h5 {
  padding: 5px;
  font-family: "Agency FB";
  font-size: 18px;
}

.shutdown {
  margin: 50px auto;
  padding: 10px;
  border: 1px solid #eee;
  background: rgba(255, 255, 255, 0.1);
  width: 200px;
}

footer {
  margin-top: 150px;
  font-size: 16px;
}
</style>