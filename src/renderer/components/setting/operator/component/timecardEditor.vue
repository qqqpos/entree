<template>
    <div class="popupMask setting dark center" @click.self="init.reject(false)">
        <div class="editor" v-show="!component">
            <header>
              <div>
                <h5>{{$t('title.edit')}}</h5>
                <h3>{{$t('title.timecard')}}</h3>
              </div>
                
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <inputer title="text.date" v-model="log.date" placeholder="YYYY-MM-DD"></inputer>
                <inputer title="text.clockIn" v-model="log.clockIn" placeholder="YYYY-MM-DD HH:mm:ss" mask="####-##-## ##:##:##">
                  <i class="fa fa-pencil-square" @click="edit('clockIn',log.clockIn)"></i>
                </inputer>
                <inputer title="text.clockOut" v-model="log.clockOut" placeholder="YYYY-MM-DD HH:mm:ss" mask="####-##-## ##:##:##">
                  <i class="fa fa-pencil-square" @click="edit('clockOut',log.clockOut)"></i>
                </inputer>
                <inputer title="text.tip" v-model.number="log.tip"></inputer>
                <inputer title="text.salary" v-model.number="log.wage" :placeholder="init.operator.wage"></inputer>
                <inputer title="text.note" v-model="log.note" type="textarea"></inputer>
                <toggle title="button.valid" v-model="log.valid" :defaultStyle="false"></toggle>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="init.reject(true)">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="confirm" :disabled="!valid">{{$t('button.confirm')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import picker from "./picker";
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";

export default {
  props: ["init"],
  components: { picker, toggle, inputer,  },
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
      componentData: null,
      component: null,
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
    edit(target, time) {
      time = value || moment().format("YYYY-MM-DD HH:mm:ss");

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, time };
        this.component = "picker";
      })
        .then(() => {
          this.$q();
        })
        .catch(() => this.$q());
    },
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