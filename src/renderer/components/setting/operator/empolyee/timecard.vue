<template>
    <div class="table">
        <table>
            <thead class="title">
            <tr>
                <td class="status"></td>
                <td class="date">{{$t('text.date')}}</td>
                <td class="shift">{{$t('text.time')}}</td>
                <td>{{$t('text.hour')}}</td>
                <td>{{$t('thead.breakTime')}}</td>
                <td>{{$t('text.tip')}}</td>
                <td>{{$t('text.earn')}}</td>
                <td class="action"></td>
            </tr>
            </thead>
            <tbody>
                <tr v-for="(record,index) in records" :key="index" :class="{settled:record.settled}">
                    <td class="status">
                    <i class="fa fa-check-circle" v-if="record.valid"></i>
                    <i class="fa fa-exclamation-circle" v-else></i>
                    </td>
                    <td class="date">{{record.date}}</td>
                    <td class="shift">
                    <span class="time" :title="format(record.clockIn)">{{record.clockIn | moment('HH:mm')}}</span>
                    <i class="fa fa-angle-right"></i>
                    <span class="time" :title="format(record.clockOut)">{{record.clockOut | moment('HH:mm')}}</span>
                    </td>
                    <td>{{record.hours}}</td>
                    <td>{{record.breakTime}}</td>
                    <td>{{record.tip | decimal}}</td>
                    <td>{{record.unpaid | decimal}}</td>
                    <td class="action" v-if="editable">
                    <span class="button" @click="edit(record,index)">{{$t('button.edit')}}</span>
                    <span class="button" @click="remove(record,index)">{{$t('button.delete')}}</span>
                    </td>
                    <td class="action" v-else></td>
                </tr>
            </tbody>
            <tfoot></tfoot>
        </table>
    </div>
</template>

<script>
export default {
  props: ["operator"],
  data() {
    return {
      records: [],
      fetchTime: Date.now(),
      editable: false
    };
  },
  created() {
    this.load();
  },
  methods: {
    load() {
      const { _id } = this.operator;
      const to = this.fetchTime;
      const from = +moment(to).subtract(1, "M");

      this.$socket.emit(
        "[TIMECARD] RECORDS",
        { _id, from, to },
        records => records.length && this.records.push(...records)
      );
    },
    format(time) {
      return time ? moment(time).format("YYYY-MM-DD HH:mm:ss") : "";
    },
    edit() {},
    remove() {}
  }
};
</script>

<style scoped>
tbody td {
  padding: 10px 15px;
}

.status {
  width: 15px;
}

.time {
  display: inline-block;
  text-align: center;
  width: 50px;
}

.fa-check-circle {
  color: var(--green);
}

.fa-exclamation-circle {
  color: var(--yellow);
}
</style>
