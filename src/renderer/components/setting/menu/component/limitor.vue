<template>
    <div class="popupMask dark center setting" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h3>{{$t('text.restriction')}}</h3>
                <h5>{{$t('tip.itemRestrictionRules')}}</h5>
            </header>
            <div class="wrap">
                <selector title="text.from" v-model="init.restrict.from" :opts="hours"></selector>
                <selector title="text.to" v-model="init.restrict.to" :opts="hours"></selector>
                <div class="days">
                    <checkbox v-for="(day,index) in weekdays" :key="index" v-model="init.restrict.days" :title="day" :val="index.toString()" :multiple="true"></checkbox>
                </div>
                <div class="days">
                    <checkbox v-for="(type,index) in types" :key="index" v-model="init.restrict.types" :title="$t('type.'+type)" :val="type" :multiple="true"></checkbox>
                </div>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="init.reject(true)">{{$t('button.remove')}}</span>
                </div>
                <button class="btn" @click="init.resolve(init.restrict)">{{$t('button.done')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import checkbox from "../../common/checkbox";
import selector from "../../common/selector";

export default {
  props: ["init"],
  components: { checkbox, selector },
  data() {
    return {
      weekdays: [
        "calendar.sun",
        "calendar.mon",
        "calendar.tue",
        "calendar.wed",
        "calendar.thu",
        "calendar.fri",
        "calendar.sat"
      ],
      types: [
        "WALK_IN",
        "PICK_UP",
        "DELIVERY",
        "DINE_IN",
        "HIBACHI",
        "BUFFET",
        "BAR",
        "SALES",
        "TO_GO"
      ],
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
  }
};
</script>

<style scoped>
.days {
  display: flex;
  flex-wrap: wrap;
  width: 350px;
  justify-content: space-between;
  border: 1px solid #eee;
  background: #fff;
  padding: 5px;
  border-radius: 2px;
  margin-top: 5px;
}
</style>