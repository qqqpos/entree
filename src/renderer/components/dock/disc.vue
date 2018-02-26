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
            <footer>
                <p v-if="autoFix">{{$t('dialog.attemptRecover')}}</p>
                <template v-else>
                    <p>{{$t('dialog.attemptFailed')}}</p>
                    <p>{{$t('dialog.supportHotLine')}}</p>
                </template>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: ['init'],
    data() {
        return {
            happened: +new Date() - 1000,
            autoFix: true
        }
    },
    computed: {
        pass() {
            const diff = this.time - this.happened;

            this.autoFix = diff < 60000;

            const minute = Math.floor(diff / 1000 / 60);
            const second = Math.floor(diff / 1000 % 60);
            return {
                minute: ("0" + minute).slice(-2),
                second: ("0" + second).slice(-2)
            }
        },
        ...mapGetters(['time'])
    }
}
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
}
footer {
  margin-top: 245px;
  font-size: 16px;
}
</style>