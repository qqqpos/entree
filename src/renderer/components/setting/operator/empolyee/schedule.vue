<template>
    <div class="wrap">
        <div class="day" v-for="(day,index) in operator.schedule" :key="index" :class="{break:day.off}">
            <h5>{{$t(weekdays[index])}}</h5>
            <selector :opts="hours" v-model="day.from" class="timeSession"></selector>
            <selector :opts="hours" v-model="day.to" class="timeSession"></selector>
            <switches v-model="day.off" title="text.dayOff" :reverse="true" class="off"></switches>
        </div>
    </div>
</template>

<script>
import switches from "../../common/switches";
import selector from "../../common/selector";

export default {
  props: ["operator"],
  components: { switches, selector },
  data() {
    return {
      weekdays: [
        "calendar.sun",
        "calendar.mon",
        "calendar.tue",
        "calendar.wed",
        "calendar.thu",
        "calendar.fri",
        "calendar.sat"
      ],
      hours: [
        "12:00 AM",
        "12:30 AM",
        "01:00 AM",
        "01:30 AM",
        "02:00 AM",
        "02:30 AM",
        "03:00 AM",
        "03:30 AM",
        "04:00 AM",
        "04:30 AM",
        "05:00 AM",
        "05:30 AM",
        "06:00 AM",
        "06:30 AM",
        "07:00 AM",
        "07:30 AM",
        "08:00 AM",
        "08:30 AM",
        "09:00 AM",
        "09:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "12:00 PM",
        "12:30 PM",
        "01:00 PM",
        "01:30 PM",
        "02:00 PM",
        "02:30 PM",
        "03:00 PM",
        "03:30 PM",
        "04:00 PM",
        "04:30 PM",
        "05:00 PM",
        "05:30 PM",
        "06:00 PM",
        "06:30 PM",
        "07:00 PM",
        "07:30 PM",
        "08:00 PM",
        "08:30 PM",
        "09:00 PM",
        "09:30 PM",
        "10:00 PM",
        "10:30 PM",
        "11:00 PM",
        "11:30 PM"
      ].map(h => ({
        plainText: true,
        value: h,
        tooltip: "",
        label: h
      }))
    };
  },
  created() {
    !this.operator.hasOwnProperty("schedule") &&
      Object.assign(this.operator, {
        schedule: [
          {
            off: false,
            from: "10:00 AM",
            to: "10:00 PM"
          },
          {
            off: false,
            from: "10:00 AM",
            to: "10:00 PM"
          },
          {
            off: false,
            from: "10:00 AM",
            to: "10:00 PM"
          },
          {
            off: false,
            from: "10:00 AM",
            to: "10:00 PM"
          },
          {
            off: false,
            from: "10:00 AM",
            to: "10:00 PM"
          },
          {
            off: false,
            from: "10:00 AM",
            to: "10:00 PM"
          },
          {
            off: false,
            from: "10:00 AM",
            to: "10:00 PM"
          }
        ]
      });
  },
  beforeRouteLeave(to, from, next) {
    this.$socket.emit("[OPERATOR] UPDATE", this.operator, () => next());
  }
};
</script>

<style scoped>
.day {
  border-bottom: 1px solid #eee;
  padding: 5px 10px;
  display: flex;
  align-items: center;
}

.day h5 {
  width: 60px;
}

.off {
  flex: 1;
  margin-left: 45px;
}

.day.break .selector {
  opacity: 0.35;
  pointer-events: none;
}
</style>