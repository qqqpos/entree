<template>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>time</th>
                <th>station</th>
                <th>operator</th>
                <th>type</th>
                <th>event</th>
                <th>status</th>
                <th>data</th>
                <th>data</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(event,index) in events" :key="index">
                <td>{{index+1}}</td>
                <td>{{event.time | moment("HH:mm:ss")}}</td>
                <td>{{event.station}}</td>
                <td>{{event.operator}}</td>
                <td>{{event.type}}</td>
                <td>{{event.event}}</td>
                <td>{{event.status}}</td>
                <td></td>
                <td></td>
            </tr>
        </tbody>
    </table>
</template>

<script>
export default {
  data() {
    return {
      events: []
    };
  },
  sockets: {
    SYS_EVENT(record) {
      this.events.push(record);
    }
  }
};
</script>

<style scoped>
table {
  width: 100%;
}
td {
  text-align: center;
}
</style>