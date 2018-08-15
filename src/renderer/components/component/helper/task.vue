<template>
    <div class="task">
        <div class="wrap">
            <div class="describes" @click="visible=!visible">
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
            <div class="action">
                <i class="fa fa-clock-o" title="Edit Timer" @click="$emit('edit',index)"></i>
                <i class="fa fa-print" title="Print Now" @click="$emit('print',index)"></i>
                <i class="fa fa-ban" title="Remove Timer" @click="$emit('remove',index)"></i>
            </div>
        </div>
        <ul class="content" v-if="visible">
            <li v-for="(item,index) in job.order.content" :key="index">
                <span class="qty">{{item.qty}}</span>
                <div class="item">
                    <p class="main">{{item[language]}}<span class="side">{{item.side[language]}}</span></p>
                    <p class="sub" v-for="(set,i) in item.choiceSet" :key="i">
                        <span class="qty">{{set.qty}}</span>
                        <span class="subItem">{{set[language]}}</span>
                    </p>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
  props: ["job", "time", "index", "language"],
  filters: {
    countDown(schedule, current) {
      const isToday =
        moment(schedule).format("MM-DD") === moment().format("MM-DD");
      const duration = schedule - current;
      const hh = (
        "00" + Math.floor((duration % (3600000 * 24)) / 3600000)
      ).slice(-2);
      const mm = ("00" + Math.floor((duration % 3600000) / 60000)).slice(-2);
      const ss = ("00" + Math.floor((duration % (1000 * 60)) / 1000)).slice(-2);
      return isToday && hh < 1
        ? `${mm}:${ss}`
        : moment(parseFloat(schedule)).toNow(true);
    }
  },
  data() {
    return {
      visible: false
    };
  }
};
</script>

<style scoped>
.task {
  margin: 7px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px #212121;
  display: flex;
  flex-direction: column;
}

h5 {
  font-weight: normal;
  display: flex;
}

h3 {
  margin: 3px 0 10px;
}

.wrap {
  display: flex;
  flex: 1;
}

.at {
  color: #009688;
}

.type:before {
  content: "·";
  margin: 0 5px;
  color: #9e9e9e;
}

.action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #434d7c;
  background: #eceff1;
  border-radius: 0 4px 4px 0;
}

.describes {
  padding: 10px;
  flex: 1;
  border-right: 1px solid #eeeeee;
}

.action i {
  padding: 5px 15px;
  flex: 1;
  cursor: pointer;
}

.content {
  border-top: 1px solid #eee;
  padding: 5px 0 5px 0px;
  color: #3c3c3c;
}

.content li {
  display: flex;
}

li .qty {
  width: 20px;
  text-align: center;
}

.side {
  margin-left: 3px;
  color: #9e9e9e;
}

p.sub {
  color: rgba(0, 0, 0, 0.5);
}
</style>