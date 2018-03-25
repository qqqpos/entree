<template>
  <div>
    <header class="nav">
      <div class="back" @click="$router.push({ name: 'Setting.store' })">
        <i class="fa fa-chevron-left"></i>
      </div>
      <div class="title">{{$t('text.openHour')}}</div>
    </header>
    <div>
      <open-time v-for="(rule,index) in openingHours.rules" :key="index" :rule="rule" :day="$t(weekdays[index])"></open-time> 
    </div>
  </div>
</template>

<script>
import openTime from "../component/time";

export default {
  components: { openTime },
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
      openingHours: []
    };
  },
  created() {
    this.openingHours = this.$store.getters.store.openingHours;
  },
  beforeDestroy() {
    this.$socket.emit("[CONFIG] UPDATE", {
      key: "store.openingHours",
      value: this.openingHours
    });
  }
};
</script>
