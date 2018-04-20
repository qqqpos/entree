<template>
  <div class="popupMask dark setting center" @click.self="init.resolve">
      <ul>
          <li v-for="(record,index) in init.payroll.timecard" :key="index">
              <span class="date">{{record.date}}</span>
              <span class="time">{{record.clockIn | moment('HH:mm')}}<i class="fa fa-angle-right"></i>{{record.clockOut | moment('HH:mm')}}</span>
              <span class="hour">{{record.hour}}</span>
          </li>
      </ul>
  </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {};
  },
  created() {
    console.log(this.init.payroll);
  },
  methods: {}
};
</script>

<style scoped>
ul {
  background: #fafafa;
  height: 550px;
  width: 350px;
  border-radius: 6px;
}
</style>


