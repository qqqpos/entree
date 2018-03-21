<template>
    <div class="popupMask dark" @click.self="init.resolve">
        <transition>
            <div class="tasks">
                <div class="task" v-for="(job,index) in jobs" :key="index">
                    <h5>
                        <span>#{{job.order.number}} {{$t('type.'+job.order.type)}}</span>
                        <span class="type">{{job.type}}</span>
                    </h5>
                    <h3>{{job.schedule | toNow}}</h3>
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
    ...mapGetters(["spooler", "history"])
  },
  data() {
    return {
      componentData: null,
      component: null,
      isVisible: false,
      jobs: [
        {
          type: "计划中",
          schedule: 1521620641126,
          creator: "Manager",
          order: {
            number: 16,
            type: "DELIVERY"
          }
        }
      ]
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