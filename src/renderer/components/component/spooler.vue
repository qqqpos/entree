<template>
    <div class="popupMask dark" @click.self="init.resolve">
        <transition>
            <div class="tasks">
                <div class="task" v-for="(job,index) in spooler" :key="index">
                    <h5>
                        <span>#{{job.order.number}} {{$t('type.'+job.order.type)}}</span>
                        <span class="type">{{$t('type.'+job.type)}}</span>
                    </h5>
                    <h3>{{job.schedule | countDown(time)}}</h3>
                    <h5>
                        <span class="f1">{{job.creator}}</span>
                        <span class="at">{{job.schedule | moment('hh:mm a')}}</span>
                    </h5>
                </div>
                
            </div>
        </transition>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dialoger from "../common/dialoger";

export default {
  props: ["init"],
  components: { dialoger },
  computed: {
    ...mapGetters(["time", "spooler", "history"])
  },
  filters: {
    countDown(schedule, current) {
      const isToday = moment(schedule).format("MM-DD") === moment().format("MM-DD");
      const duration = schedule - current;
      const hh = (
        "00" + Math.floor((duration % (3600000 * 24)) / 3600000)
      ).slice(-2);
      const mm = ("00" + Math.floor((duration % 3600000) / 60000)).slice(-2);
      const ss = ("00" + Math.floor((duration % (1000 * 60)) / 1000)).slice(-2);
      return (isToday && hh < 1) ? `${mm}:${ss}` : moment(parseFloat(schedule)).toNow(true);
    }
  },
  data() {
    return {
      componentData: null,
      component: null,
      isVisible: false
    };
  }
};
</script>

<style scoped>
.tasks {
  width: 270px;
  height: 100%;
  background: rgba(255, 255, 255, 0.45);
  float: right;
}

.task {
  margin: 7px;
  background: #fff;
  border-radius: 4px;
  padding: 10px 15px;
  box-shadow: 0 1px 3px #212121;
}

.task h5 {
  font-weight: normal;
  display: flex;
}

.task h3 {
  margin: 3px 0 10px;
}

.at {
  color: #009688;
}

.type:before {
  content: "·";
  margin: 0 8px;
  color: #9e9e9e;
}
</style>