<template>
    <div class="wrap">
       <div class="weekday">
           <div class="title">
               <h4>{{$t('calendar.mon')}}</h4>
               <span class="time">{{monday[0]}}</span>
               <span class="time">{{monday[1]}}</span>
           </div>
           <slider v-model="monday" :piecewise="true" :data="times" tooltip="hover" :dot-size="20"></slider>
        </div> 
        <div class="weekday">
           <div class="title">
               <h4>{{$t('calendar.tue')}}</h4>
               <span class="time">{{tuesday[0]}}</span>
               <span class="time">{{tuesday[1]}}</span>
           </div>
           <slider v-model="tuesday" :piecewise="true" :data="times" tooltip="hover" :dot-size="20"></slider>
        </div> 
        <div class="weekday">
            <div class="title">
                <h4>{{$t('calendar.wed')}}</h4>
                <span class="time">{{wednesday[0]}}</span>
                <span class="time">{{wednesday[1]}}</span>
            </div>
           <slider v-model="wednesday" :piecewise="true" :data="times" tooltip="hover" :dot-size="20"></slider>
        </div> 
        <div class="weekday">
            <div class="title">
                <h4>{{$t('calendar.thu')}}</h4>
                <span class="time">{{thursday[0]}}</span>
                <span class="time">{{thursday[1]}}</span>
           </div>
           <slider v-model="thursday" :piecewise="true" :data="times" tooltip="hover" :dot-size="20"></slider>
        </div> 
        <div class="weekday">
            <div class="title">
                <h4>{{$t('calendar.fri')}}</h4>
                <span class="time">{{friday[0]}}</span>
                <span class="time">{{friday[1]}}</span>
           </div>
           <slider v-model="friday" :piecewise="true" :data="times" tooltip="hover" :dot-size="20"></slider>
        </div> 
        <div class="weekday">
            <div class="title">
                <h4>{{$t('calendar.sat')}}</h4>
                <span class="time">{{saturday[0]}}</span>
                <span class="time">{{saturday[1]}}</span>
           </div>
           <slider v-model="saturday" :piecewise="true" :data="times" tooltip="hover" :dot-size="20"></slider>
        </div> 
        <div class="weekday">
            <div class="title">
                <h4>{{$t('calendar.sun')}}</h4>
                <span class="time">{{sunday[0]}}</span>
                <span class="time">{{sunday[1]}}</span>
           </div>
           <slider v-model="sunday" :piecewise="true" :data="times" tooltip="hover" :dot-size="20"></slider>
        </div> 
        <div class="weekday">

        </div>
    </div>
</template>

<script>
import slider from "../../common/slider";

export default {
  components: { slider },
  data() {
    return {
      monday: ["11:00", "23:00"],
      tuesday: ["11:00", "23:00"],
      wednesday: ["11:00", "23:00"],
      thursday: ["11:00", "23:00"],
      friday: ["11:00", "23:00"],
      saturday: ["11:00", "23:00"],
      sunday: ["11:00", "23:00"],
      times: [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
        "18:30",
        "19:00",
        "19:30",
        "20:00",
        "20:30",
        "21:00",
        "21:30",
        "22:00",
        "22:30",
        "23:00",
        "23:30",
        "00:00"
      ]
    };
  }
};
</script>

<style scoped>
.wrap {
  width: 700px;
}

.weekday {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.weekday h4 {
  color: #3c3c3c;
  margin-bottom: 5px;
}

.title {
  display: flex;
}

.time {
  margin: 0 15px;
}
</style>