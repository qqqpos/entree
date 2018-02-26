<template>
    <div class="popupMask center" @click.self="init.reject">
        <div class="wrap">
            <header>
                <div class="top">
                    <div class="calendar">
                        <i class="fa fa-angle-left" @click="prevDate"></i>
                        <span>{{date | moment('dddd MMM D')}}</span>
                        <i class="fa fa-angle-right" @click="nextDate"></i>
                    </div>
                </div>
                <div class="btm">
                    <nav class="tab">
                        <div>
                            <input type="radio" name="tab" v-model="tab" :value="0" id="reservation">
                            <label for="reservation">{{$t('reservation.timeline')}}</label>
                        </div>
                        <div>
                            <input type="radio" name="tab" v-model="tab" :value="1" id="wait">
                            <label for="wait">{{$t('reservation.list')}}</label>
                        </div>
                    </nav>
                </div>
                <i class="fa fa-plus add" @click="create"></i>
            </header>
            <reservation v-if="tab === 0" @seat="seat"></reservation>
            <wait-list v-else></wait-list>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import reservation from "./reservation";
import waitList from "./waitList";
import nodemailer from "nodemailer";
import editor from "./editor";
export default {
  props: ["init"],
  components: { reservation, waitList, editor },
  data() {
    return {
      tab: 0,
      reservation: [],
      component: null,
      componentData: null,
      date: moment().subtract(4, "hours")
    };
  },
  created() {
    this.checkSync();
    this.reservation = this.$store.getters.reservation;
  },
  methods: {
    checkSync() {
      this.$socket.emit("[SYNC] POS", time => {
        time !== this.sync && console.log("SYNC REQUIRED");
        time !== this.sync && this.$socket.emit("[SYNC] RESERVATION_LIST");
      });
    },
    create() {
      this.$p("editor");
    },
    seat(reservation) {
      this.init.resolve(reservation);
    },
    prevDate(){

    },
    nextDate(){
        
    }
  },
  computed: {
    ...mapGetters(["sync"])
  }
};
</script>

<style scoped>
.wrap {
  position: absolute;
  right: 0;
  top: 0;
  width: 922px;
  height: 738px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e0e0e0;
  background: url(../../assets/image/grid.png) #ebeff1;
}

header {
  background: #fff;
  height: 77px;
  position: relative;
  border-bottom: 1px solid #cfd8dc;
}

.calendar {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.calendar span {
  padding: 8px 25px;
  color: #757575;
}

.calendar i {
  color: #03a9f4;
  padding: 0 25px;
  border-radius: 4px;
  width: 25px;
  text-align: center;
  cursor: pointer;
}

i.add {
  position: absolute;
  right: 0;
  top: 0;
  width: 100px;
  height: 77px;
  text-align: center;
  line-height: 77px;
  background: #03a9f4;
  color: #fff;
  text-shadow: 0 1px 3px #333;
  cursor: pointer;
}

nav.tab {
  display: flex;
}

nav input {
  display: none;
}

nav label {
  border-bottom: 5px solid transparent;
  padding: 0 15px 15px;
  color: gray;
  cursor: pointer;
  transition: all 0.3s ease;
}

nav input:checked + label {
  color: #000;
  border-bottom: 5px solid#03A9F4;
}
</style>
