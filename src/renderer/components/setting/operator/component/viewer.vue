<template>
  <div class="popupMask dark setting center" @click.self="init.resolve">
      <table>
        <thead>
          <tr>
            <th class="status"></th>
            <th class="date">{{$t('text.date')}}</th>
            <th class="shift">{{$t('text.time')}}</th>
            <th>{{$t('text.hour')}}</th>
            <th>{{$t('thead.breakTime')}}</th>
            <th>{{$t('text.tip')}}</th>
            <th>{{$t('text.pay')}}</th>
            <th class="action"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record,index) in init.payroll.timecard" :key="index" :class="{settled:record.settled}">
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
        <tfoot>
          <tr>
            <td class="status"></td>
            <td class="date"></td>
            <td class="shift"></td>
            <td>{{init.payroll.hours}}</td>
            <td></td>
            <td>{{init.payroll.tips | decimal}}</td>
            <td>{{init.payroll.unpaid | decimal}}</td>
            <td class="action"></td>
          </tr>
        </tfoot>
      </table>
      <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import editor from "./timecardEditor";
import dialoger from "../../../common/dialoger";

export default {
  props: ["init"],
  components: { editor, dialoger },
  data() {
    return {
      op: this.$store.getters.op,
      componentData: null,
      component: null,
      editable: false
    };
  },
  created() {
    this.editable = this.approval(this.op.permission, "timecard");
  },
  methods: {
    format(time) {
      return time ? moment(time).format("YYYY-MM-DD HH:mm:ss") : "";
    },
    edit(record, index) {
      const operator = {
        wage: this.init.payroll.wage
      };

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, record, operator };
        this.component = "editor";
      })
        .then(_record => {
          this.init.payroll.timecard.splice(index, 1, _record);
          this.$q();
        })
        .catch(del => {
          del ? this.remove(record, index) : this.$q();
        });
    },
    remove(record, index) {
      const prompt = {
        title: "dialog.removeTimecard",
        msg: ["dialog.removeTimecardConfirm", record.date]
      };

      this.$dialog(prompt)
        .then(() => {
          this.$socket.emit("[TIMECARD] REMOVE", record._id, () => {
            this.init.payroll.timecard.splice(index, 1);
            this.$emit("reload");
          });
          this.$q();
        })
        .catch(() => this.$q());
    }
  }
};
</script>

<style scoped>
ul {
  background: #fafafa;
  height: 550px;
  width: 350px;
  border-radius: 6px;
}

thead {
  text-align: left;
}

tbody {
  overflow-y: auto;
  display: block;
  height: 572px;
  text-align: center;
}

tbody td {
  height: 45px;
  text-align: left;
}

thead th {
  padding: 15px 0;
  background: #f5f5f5;
  color: rgb(80, 88, 101);
}

tr {
  display: table;
  table-layout: fixed;
  width: 100%;
}

.status {
  width: 30px;
  text-align: center;
}

.date {
  width: 150px;
}

.time {
  color: rgba(0, 0, 0, 0.65);
  width: 50px;
  display: inline-block;
  text-align: center;
}

.shift i {
  color: #000;
  margin: 0 5px;
}

.shift {
  width: 200px;
}

.action {
  width: 150px;
}

.fa-check-circle {
  color: var(--green);
}

.fa-exclamation-circle {
  color: var(--yellow);
}

.button {
  padding: 5px 10px;
  margin: 0 5px;
  display: inline-block;
}

tfoot tr {
  height: 35px;
  border-top: 1px solid #eee;
  background: #eceff1;
  font-weight: bold;
  color: #37474f;
}

tr.settled {
  filter: grayscale(0.8) opacity(0.5);
  pointer-events: none;
}
</style>


