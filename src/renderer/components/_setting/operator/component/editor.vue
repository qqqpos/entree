<template>
        <div class="popupMask center dark" @click.self="init.reject">
        <div class="editor" v-show="!component">
            <header>
                <h2>{{$t('title.timeSession')}}</h2>
                <h4></h4>
            </header>
            <div class="inner">
                <div class="input">
                    <label>{{$t('text.date')}}</label>
                    <input v-model="log.date" placeholder="YYYY-MM-DD">
                </div>
                <div class="input">
                    <label>{{$t('text.clockIn')}}</label>
                    <input v-model="log.clockIn" placeholder="YYYY-MM-DD HH:mm:ss">
                </div>
                <div class="input">
                    <label>{{$t('text.clockOut')}}</label>
                    <input v-model="log.clockOut" placeholder="YYYY-MM-DD HH:mm:ss">
                </div>
                <div class="input">
                    <label>{{$t('text.wage',init.profile.wage || 0)}}</label>
                    <input v-model.number="log.wage">
                </div>
                <div class="input">
                    <label>{{$t('text.note')}}</label>
                    <input v-model="log.note">
                </div>
                <div class="default">
                  <checkbox v-model="log.valid" label="button.valid"></checkbox>
                </div>
            </div>
            <footer>
              <div class="f1">
                <checkbox v-model="lock" label="text.lock"></checkbox>
              </div>
                <button class="btn" @click="confirm" :disabled="!valid">{{$t('button.confirm')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import checkbox from "../../common/checkbox";
import dialoger from "../../../common/dialoger";

export default {
  props: ["init"],
  components: { checkbox, dialoger },
  data() {
    return {
      componentData: null,
      component: null,
      lock: false,
      log: {},
      wage: 0
    };
  },
  created() {
    this.log = Object.assign({}, this.init.log);

    if (this.log.clockIn) {
      this.log.clockIn = moment(this.log.clockIn).format("YYYY-MM-DD HH:mm:ss");
    }

    if (this.log.clockOut) {
      this.log.clockOut = moment(this.log.clockOut).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    }

    if (!this.log.wage) {
      this.log.wage = this.init.profile.wage || 0;
    }
  },
  methods: {
    confirm() {
      this.sealSession()
        .then(this.update)
        .catch(this.failed);
    },
    sealSession() {
      return new Promise((resolve, reject) => {
        !this.lock
          ? resolve()
          : this.$dialog({
              type: "question",
              title: "dialog.lockSession",
              msg: "dialog.lockSessionTip",
              buttons: [
                { text: "button.cancel", fn: "reject" },
                { text: "button.lock", fn: "resolve" }
              ]
            })
              .then(() => {
                this.$q();
                Object.assign(this.log, { lock: true });
                resolve();
              })
              .catch(() => {
                this.$q();
                this.lock = false;
                reject();
              });
      });
    },
    update() {
      this.init.new
        ? Object.assign(this.log, {
            _id: ObjectId()
          })
        : Object.assign(this.log, {
            edit: +new Date(),
            editor: this.op.name
          });

      this.log.valid &&
        Object.assign(this.log, {
          verifier: this.op.name,
          verifyDate: +new Date()
        });

      Object.assign(this.log, {
        clockIn: +moment(this.log.clockIn, "YYYY-MM-DD HH:mm:ss"),
        clockOut: +moment(this.log.clockOut, "YYYY-MM-DD HH:mm:ss")
      });

      if (!isNumber(this.log.wage)) {
        this.log.wage = this.init.profile.wage || 0;
      }

      this.$socket.emit("[TIMECARD] UPDATE", this.log, () => {
        this.$emit("refresh");
        this.init.resolve();
      });
    },
    failed() {
      this.$q();
    }
  },
  computed: {
    valid() {
      return (
        isNumber(this.log.wage) &&
        moment(this.log.date, "YYYY-MM-DD", true).isValid() &&
        moment(this.log.clockIn, "YYYY-MM-DD HH:mm:ss", true).isValid() &&
        moment(this.log.clockOut, "YYYY-MM-DD HH:mm:ss", true).isValid() &&
        moment(this.log.clockOut, "YYYY-MM-DD HH:mm:ss").isAfter(
          moment(this.log.clockIn, "YYYY-MM-DD HH:mm:ss")
        )
      );
    },
    ...mapGetters(["op"])
  }
};
</script>