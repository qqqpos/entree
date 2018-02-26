<template>
    <div>
        <external title="text.from" @open="setFromDate" :tooltip="format(from)"></external>
        <external title="text.to" @open="setToDate" :tooltip="format(to)"></external>
        <div>
            <p>{{$t('text.selectEmployee')}}</p>
            <div class="employee">
                <checkbox v-for="(operator,index) in operators" :key="index" :title="operator.name" :val="operator._id" v-model="target" :multiple="true">
                    <span class="role">({{operator.role}})</span>
                </checkbox>
            </div>
        </div>
        <external title="text.generatePayroll" @open="generate" v-show="valid"></external>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import calendar from "../../common/calendar";
import checkbox from "../../common/checkbox";
import external from "../../common/external";

export default {
  props: ["config"],
  components: { checkbox, external, calendar },
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
      target: []
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
          "Worker",
          "ThirdParty"
        ];
        vm.operators = data
          .sort(
            (a, b) => (sort.indexOf(a.role) > sort.indexOf(b.role) ? 1 : -1)
          )
          .map(op => ({
            _id: op._id,
            name: op.name,
            role: vm.$t("type." + op.role)
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
    }
  }
};
</script>

<style scoped>
.role {
  color: rgba(0, 0, 0, 0.75);
}

p {
  padding: 15px 20px;
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