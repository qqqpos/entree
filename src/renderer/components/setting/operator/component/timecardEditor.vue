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
                <inputer title="text.date" v-model="record.date" placeholder="YYYY-MM-DD"></inputer>
                <inputer title="text.clockIn" v-model="record.clockIn" placeholder="YYYY-MM-DD HH:mm:ss" mask="####-##-## ##:##:##">
                  <i class="far fa-calendar-alt" @click="editTimestamp('clockIn',record.clockIn)"></i>
                </inputer>
                <inputer title="text.clockOut" v-model="record.clockOut" placeholder="YYYY-MM-DD HH:mm:ss" mask="####-##-## ##:##:##">
                  <i class="far fa-calendar-alt" @click="editTimestamp('clockOut',record.clockOut)"></i>
                </inputer>
                <inputer title="text.tip" v-model.number="record.tip">
                  <i class="fas fa-keyboard" @click="editTip(record.tip)"></i>
                </inputer>
                <inputer title="text.salary" v-model.number="record.wage" :placeholder="init.operator.wage"></inputer>
                <inputer title="text.note" v-model="record.note" type="textarea"></inputer>
                <toggle title="text.validRecord" v-model="record.valid" :defaultStyle="false"></toggle>
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
import clock from "./clock";
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import entry from "../../../component/inputer";

export default {
  props: ["init"],
  components: { clock, toggle, inputer, entry },
  computed: {
    valid() {
      const { wage, date, clockIn, clockOut } = this.record;
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
      record: Object.assign({}, this.init.record),
      op: this.$store.getters.op,
      componentData: null,
      component: null,
      lock: false
    };
  },
  created() {
    if (this.record.clockIn)
      this.record.clockIn = moment(this.record.clockIn).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    if (this.record.clockOut)
      this.record.clockOut = moment(this.record.clockOut).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    if (!this.record.wage)
      Object.assign(this.record, {
        wage: this.init.operator.wage || 0
      });
  },
  methods: {
    editTimestamp(target, time) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, time };
        this.component = "clock";
      })
        .then(time => {
          Object.assign(this.record, {
            [target]: time.second(0).format("YYYY-MM-DD HH:mm:ss")
          });
          target === "clockIn" &&
            Object.assign(this.record, { date: time.format("YYYY-MM-DD") });
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    editTip(tip) {
      new Promise((resolve, reject) => {
        const title = "title.setTips";
        const amount = tip;

        this.componentData = { resolve, reject, title, amount };
        this.component = "entry";
      })
        .then(({ amount }) => {
          Object.assign(this.record, { tip: amount });
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    confirm() {
      Object.assign(this.record, {
        lock: this.lock,
        clockIn: +moment(this.record.clockIn, "YYYY-MM-DD HH:mm:ss"),
        clockOut: +moment(this.record.clockOut, "YYYY-MM-DD HH:mm:ss")
      });

      this.record.valid &&
        Object.assign(this.record, {
          verifier: this.op.name,
          verifyDate: +new Date()
        });

      this.$socket.emit("[TIMECARD] UPDATE", this.record, () => {
        this.$emit("refresh");
        this.init.resolve(this.record);
      });
    }
  }
};
</script>