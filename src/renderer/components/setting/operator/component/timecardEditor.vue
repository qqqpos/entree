<template>
    <div class="popupMask setting dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5>{{$t('title.edit')}}</h5>
                <h3>{{$t('title.timecard')}}</h3>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <inputer title="text.date" v-model="log.date" placeholder="YYYY-MM-DD"></inputer>
                <inputer title="text.clockIn" v-model="log.clockIn" placeholder="YYYY-MM-DD HH:mm:ss" mask="####-##-## ##:##:##"></inputer>
                <inputer title="text.clockOut" v-model="log.clockOut" placeholder="YYYY-MM-DD HH:mm:ss" mask="####-##-## ##:##:##"></inputer>
                <inputer title="text.salary" v-model.number="log.wage" :placeholder="init.operator.wage"></inputer>
                <inputer title="text.note" v-model="log.note" type="textarea"></inputer>
                <toggle title="button.valid" v-model="log.valid" :defaultStyle="false"></toggle>
            </div>
            <footer>
                <div class="opt">
                    <checkbox v-model="lock" title="text.lock"></checkbox>
                </div>
                <button class="btn" @click="confirm" :disabled="!valid">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import checkbox from "../../common/checkbox";

export default {
  props: ["init"],
  components: { toggle, inputer, checkbox },
  computed: {
    valid() {
      const { wage, date, clockIn, clockOut } = this.log;
      return (
        isNumber(wage) &&
        moment(date, "YYYY-MM-DD", true).isValid() &&
        moment(clockIn, "YYYY-MM-DD HH:mm:ss", true).isValid() &&
        moment(clockOut, "YYYY-MM-DD HH:mm:ss", true).isValid() &&
        moment(clockOut, "YYYY-MM-DD HH:mm:ss").isAfter(
          moment(clockIn, "YYYY-MM-DD HH:mm:ss")
        )
      );
    }
  },
  data() {
    return {
      log: Object.assign({}, this.init.log),
      op: this.$store.getters.op,
      lock: false
    };
  },
  created() {
    if (this.log.clockIn)
      this.log.clockIn = moment(this.log.clockIn).format("YYYY-MM-DD HH:mm:ss");
    if (this.log.clockOut)
      this.log.clockOut = moment(this.log.clockOut).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    if (!this.log.wage)
      Object.assign(this.log, {
        wage: this.init.operator.wage || 0
      });
  },
  methods: {
    confirm() {
      Object.assign(this.log, {
        lock: this.lock,
        clockIn: +moment(this.log.clockIn, "YYYY-MM-DD HH:mm:ss"),
        clockOut: +moment(this.log.clockOut, "YYYY-MM-DD HH:mm:ss")
      });

      this.log.valid &&
        Object.assign(this.log, {
          verifier: this.op.name,
          verifyDate: +new Date()
        });

      this.$socket.emit("[TIMECARD] UPDATE", this.log, () => {
        this.$emit("refresh");
        this.init.resolve();
      });
    }
  }
};
</script>