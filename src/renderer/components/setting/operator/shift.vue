<template>
    <div>
        <ul class="tabs">
            <li class="tab" @click="setDay(0)">{{$t('calendar.sun')}}</li>
            <li class="tab" @click="setDay(1)">{{$t('calendar.mon')}}</li>
            <li class="tab" @click="setDay(2)">{{$t('calendar.tue')}}</li>
            <li class="tab" @click="setDay(3)">{{$t('calendar.wed')}}</li>
            <li class="tab" @click="setDay(4)">{{$t('calendar.thu')}}</li>
            <li class="tab" @click="setDay(5)">{{$t('calendar.fri')}}</li>
            <li class="tab" @click="setDay(6)">{{$t('calendar.sat')}}</li>
        </ul>
        <div class="employees">
            <table>
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Role</td>
                        <td>From</td>
                        <td>To</td>
                        <td>ClockIn</td>
                        <td>ClockOut</td>
                        <td>Edit</td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(op,index) in operators" :key="index">
                        <td>{{op.name}}</td>
                        <td>{{$t('type.'+op.role)}}</td>
                        <td>{{op.schedule[i].from}}</td>
                        <td>{{op.schedule[i].to}}</td>
                        <td></td>
                        <td></td>
                        <td><i class="fa fa-pencil"></i></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      i: moment().format("d"),
      operators: []
    };
  },
  created() {
    this.$socket.emit("[OPERATOR] LIST", data => {
      this.operators = data
        .filter(op => op.hasOwnProperty("schedule") && !op.schedule[this.i].off)
        .map(op => ({
          name: op.name,
          role: op.role,
          schedule: op.schedule,
          clockIn: "",
          clockOut: ""
        }));
    });
  },
  mounted() {
    this.setDay(this.i);
  },
  methods: {
    setDay(index) {
      const dom = document.querySelector(".router-link-exact-active");
      dom && dom.classList.remove("router-link-exact-active");

      document
        .querySelectorAll(".tabs li")
        [index].classList.add("router-link-exact-active");

      this.i = index;
    }
  }
};
</script>

<style scoped>

</style>