<template>
  <div>
    <div class="tab-content">
      <header class="nav">
        <div class="back" @click="$router.push({ name: 'Setting.store' })">
          <i class="fa fa-chevron-left"></i>
        </div>
        <h3 class="title">{{$t('text.openHour')}}</h3>
      </header>
      <div>
        <open-time v-for="(rule,index) in openingHours.rules" :key="index" :rule="rule" :day="$t(weekdays[index])"></open-time> 
      </div>
    </div>
  </div>
</template>

<script>
import openTime from "../editor/openTime";

export default {
  components: { openTime },
  data() {
    return {
      weekdays: [
        "date.sunday",
        "date.monday",
        "date.tuesday",
        "date.wednesday",
        "date.thursday",
        "date.friday",
        "date.saturday"
      ],
      openingHours: []
    };
  },
  created() {
    this.openingHours = this.$store.getters.store.openingHours || {};
  },
  beforeDestroy() {
    this.$socket.emit("[CONFIG] UPDATE", {
      key: "store.openingHours",
      value: this.openingHours
    });
  }
};
</script>
