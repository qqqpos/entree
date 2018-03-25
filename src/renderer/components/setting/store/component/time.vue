<template>
    <div class="time">
        <div>{{day}}</div>
        <switches v-model="rule.open" class="toggle"></switches>
        <div class="hours">
            <div class="timeSession" v-for="(session,index) in rule.hours" :key="index">
                <div class="name">   
                    <input v-model="session.alias">
                </div>
                <selector :opts="hours" v-model="session.from"></selector>
                <selector :opts="hours" v-model="session.to"></selector>
            </div>
        </div>
    </div>
</template>

<script>
import switches from "../../common/switches";
import selector from "../../common/selector";
export default {
  props: ["rule", "day"],
  components: { switches, selector },
  data() {
    return {
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
  methods: {}
};
</script>

<style scoped>
.time {
  display: flex;
  align-items: center;
  padding: 5px 0 5px 15px;
  border-bottom: 1px solid #eee;
}

.timeSession {
  display: flex;
  flex: 1;
}

input.name {
  border: 1px solid #eee;
  border-radius: 2px;
  height: 14px;
  padding: 5px 0;
}

.name {
  padding: 5px 0;
}

.name input {
  border: 1px solid #eee;
  padding: 5px;
  border-radius: 2px;
  width: 88px;
}

.toggle {
  margin: 0 15px;
}
</style>