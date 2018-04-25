<template>
    <div>
        <ul class="dates">
          <li v-for="(date,index) in dates" :key="index" :class="{active:isActive(date)}" @click="set(date)">
            <span>{{date | moment('ddd')}}</span>
            <span>{{date | moment('D')}}</span>
          </li>
        </ul>
        <div class="employees">
            <table>
                <thead class="title">
                    <tr>
                        <td class="index"></td>
                        <td>{{$t('text.name')}}</td>
                        <td>{{$t('text.role')}}</td>
                        <td class="shift">{{$t('text.time')}}</td>
                        <td colspan="3"></td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(op,index) in onDuty" :key="index">
                        <td class="index">{{index + 1}}</td>
                        <td>{{op.name}}</td>
                        <td>{{$t('type.'+op.role)}}</td>
                        <td class="shift" :title="date.format('YYYY-MM-DD')">
                          <span class="time">{{op.schedule.from}}</span>
                          <i class="fa fa-angle-right"></i>
                          <span class="time">{{op.schedule.to}}</span>
                        </td>
                        <td colspan="3">
                          <time-bar :shift="op.schedule" :id="op.id" :date="date.format('YYYY-MM-DD')"></time-bar>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import timeBar from "./component/timeBar";

export default {
  components: { timeBar },
  data() {
    return {
      date: moment().startOf("days"),
      operators: [],
      onDuty: [],
      dates: []
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
          );
        vm.generateDates();
      });
    });
  },
  methods: {
    isActive(date) {
      return date === +this.date;
    },
    generateDates() {
      let dates = [];

      for (let i = 6; i > 0; i--) {
        dates.push(
          +this.date
            .clone()
            .subtract(i, "d")
            .startOf("days")
        );
      }
      dates.push(+this.date);

      for (let i = 1; i < 7; i++) {
        dates.push(
          +this.date
            .clone()
            .add(i, "d")
            .startOf("days")
        );
      }
      this.dates = dates;

      this.getOnDuty();
    },
    set(date) {
      this.date = moment(date);
      this.generateDates();
    },

    getOnDuty() {
      const index = this.date.format("d");
      this.onDuty = this.operators
        .filter(op => op.hasOwnProperty("schedule") && !op.schedule[index].off)
        .map(op => ({
          id: op._id,
          name: op.name,
          role: op.role,
          schedule: op.schedule[index]
        }));
    }
  }
};
</script>

<style scoped>
tbody {
  height: 637px;
  overflow-y: auto;
  overflow-x: hidden;
  display: block;
}

table thead,
table tbody tr {
  display: table;
  table-layout: fixed;
  width: 100%;
}

td.shift {
  width: 180px;
}

tbody td {
  padding: 14px;
}

.center {
  text-align: center;
}

.time {
  color: rgba(0, 0, 0, 0.65);
  margin: 0 10px;
}

.index {
  width: 15px;
  text-align: center;
  color: rgba(0, 0, 0, 0.65);
}

ul.dates {
  display: flex;
  padding: 5px 0;
  background: #90a4ae;
}

ul.dates li {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  margin: 0px 10px;
  padding: 4px;
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
}

ul.dates li.active {
  border-radius: 4px;
  background: rgba(250, 250, 250, 0.75);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  color: #263238;
  font-weight: bold;
}
</style>