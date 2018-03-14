<template>
    <div>
        <external title="text.from" @open="setFromDate" :tooltip="format(from)"></external>
        <external title="text.to" @open="setToDate" :tooltip="format(to)"></external>
        <div>
            <div class="text">
              <span class="f1" @dblclick="selectAll">{{$t('text.selectEmployee')}}</span>
              <i class="fa fa-sort-alpha-asc" @click="resort()"></i>
            </div>
            <div class="employee">
                <checkbox v-for="(operator,index) in operators" :key="index" :title="operator.name" :val="operator._id" v-model="target" :multiple="true">
                    <span class="role">({{$t('type.'+operator.role)}})</span>
                </checkbox>
            </div>
        </div>
        <external title="text.generatePayroll" @open="generate" v-show="valid"></external>
        <external title="button.print" @open="print" v-show="payrolls"></external>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import calendar from "../../common/calendar";
import checkbox from "../../common/checkbox";
import external from "../../common/external";
import dialoger from "../../../common/dialoger";

export default {
  props: ["config", "payrolls"],
  components: { checkbox, external, calendar, dialoger },
  computed: {
    valid() {
      return this.from && this.to && this.target.length > 0;
    }
  },
  data() {
    return {
      componentData: null,
      component: null,
      operators: [],
      range: "week",
      from: "",
      to: "",
      target: [],
      alphabet: false
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[OPERATOR] LIST", data => {
      next(vm => {
        const sort = [
          "Owner",
          "Manager",
          "Cashier",
          "Waitstaff",
          "Bartender",
          "Worker"
        ];
        vm.operators = data
          .filter(d => d.role !== "Owner")
          .sort(
            (a, b) => (sort.indexOf(a.role) > sort.indexOf(b.role) ? 1 : -1)
          )
          .map(op => ({
            _id: op._id,
            name: op.name,
            role: op.role
          }));
      });
    });
  },
  created() {
    if (this.config) {
      const { from, to, target } = this.config;

      this.from = moment(from);
      this.to = moment(to);
      this.target = target;
    }
  },
  methods: {
    format(date) {
      return date ? date.format("YYYY-MM-DD") : "";
    },
    setFromDate() {
      new Promise((resolve, reject) => {
        this.componentData = {
          resolve,
          reject,
          multiple: false,
          picked: this.to
        };
        this.component = "calendar";
      })
        .then(_date => {
          this.from = _date;
          this.$q();
        })
        .catch(() => this.$q());
    },
    setToDate() {
      new Promise((resolve, reject) => {
        this.componentData = {
          resolve,
          reject,
          multiple: false,
          picked: this.from
        };
        this.component = "calendar";
      })
        .then(_date => {
          this.to = _date;
          this.$q();
        })
        .catch(() => this.$q());
    },
    selectAll() {
      this.target =
        this.target.length === 0 ? this.operators.map(e => e._id) : [];
    },
    resort() {
      this.alphabet = !this.alphabet;

      if (this.alphabet) {
        this.operators.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        const sort = [
          "Owner",
          "Manager",
          "Cashier",
          "Waitstaff",
          "Bartender",
          "Worker"
        ];

        this.operators.sort(
          (a, b) => (sort.indexOf(a.role) > sort.indexOf(b.role) ? 1 : -1)
        );
      }
    },
    generate() {
      const from = this.from
        .hours(4)
        .minutes(0)
        .seconds(0);
      const to = this.to;
      this.$emit("generate", {
        from,
        to,
        target: this.target
      });
    },
    print() {
      if (this.payrolls.length > 1) {
        const prompt = {
          title: "dialog.printPreference",
          msg: "dialog.timecardReportSingletonMode",
          buttons: [
            { text: "button.separete", fn: "reject" },
            { text: "button.unified", fn: "resolve" }
          ]
        };

        this.$dialog(prompt)
          .then(() => {
            Printer.printTimecardReport(this.payrolls);
            this.$q();
          })
          .catch(() => {
            this.payrolls.forEach(
              payroll =>
                payroll.validSession.length > 0 &&
                Printer.printTimecardReport([payroll])
            );
            this.$q();
          });
      } else {
        Printer.printTimecardReport(this.payrolls);
      }
    }
  }
};
</script>

<style scoped>
.role {
  color: rgba(0, 0, 0, 0.75);
}

.text {
  padding: 15px 20px;
  display: flex;
}

.text i {
  padding: 0 12px;
  color: #555555;
  cursor: pointer;
}

.employee {
  display: flex;
  flex-wrap: wrap;
  padding: 15px;
  border-bottom: 1px solid #eee;
  background: #f5f5f5;
}

.employee .checkbox {
  width: 190px;
}

.employee .checkbox:nth-child(odd) {
  padding-right: 20px;
}
</style>