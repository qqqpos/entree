<template>
    <div class="popupMask dark center">
        <div class="book">
            <div class="form">
                <header>
                    <h3>{{$t("title.book")}}</h3>
                </header>
                <section>
                    <h5>{{$t('booking.date')}}</h5>
                    <div class="content center">
                        <div class="input-wrap">
                            <i class="far fa-calendar-alt light space"></i>
                            <input type="text" v-model="book.date" placeholder="YYYY-MM-DD">
                            <i class="fas fa-caret-right dialog" @click="openCalendar"></i>
                        </div> 
                        <div class="input-wrap">
                            <i class="far fa-clock light space"></i>
                            <input type="text" v-model="book.time" placeholder="HH:mm (24 Hours)">
                            <i class="fas fa-caret-right dialog"></i>
                        </div>                      
                    </div>
                </section>                
                <section>
                    <h5>{{$t('booking.type')}}</h5>
                    <div class="content center">
                        <input type="radio" name="type" v-model="book.type" value="WALK_IN" id="WALK_IN">
                        <label for="WALK_IN" class="mini-btn"><i class="fas fa-user-friends light space"></i>{{$t('type.WALK_IN')}}</label>
                        <input type="radio" name="type" v-model="book.type" value="PHONE" id="PHONE">
                        <label for="PHONE" class="mini-btn"><i class="fas fa-phone light space"></i>{{$t('type.PHONE')}}</label>
                    </div>
                </section>
                <section>
                    <h5>{{$t('booking.partySize')}}</h5>
                    <div class="content center">
                        <div class="age">
                            <span>{{$t('booking.adult')}}</span>
                            <span class="button-wrap">
                                <i class="fas fa-minus-square" @click="less(0)"></i>
                                    <span class="count">{{book.guest[0]}}</span>
                                <i class="fas fa-plus-square" @click="more(0)"></i>
                            </span>
                        </div>
                        <div class="age">
                            <span>{{$t('booking.kid')}}</span>
                            <span class="button-wrap">
                                <i class="fas fa-minus-square" @click="less(1)"></i>
                                    <span class="count">{{book.guest[1]}}</span>
                                <i class="fas fa-plus-square" @click="more(1)"></i>
                            </span>
                        </div>
                        <div class="age">
                            <span>{{$t('booking.elder')}}</span>
                            <span class="button-wrap">
                                <i class="fas fa-minus-square" @click="less(2)"></i>
                                    <span class="count">{{book.guest[2]}}</span>
                                <i class="fas fa-plus-square" @click="more(2)"></i>
                            </span>
                        </div>                                                
                    </div>
                </section>
                <section>
                    <h5>{{$t('booking.contact')}}</h5>
                    <div class="content center">
                        <div class="input-wrap">
                            <i class="fas fa-phone light space"></i>
                            <input type="text" v-model="book.phone" :placeholder="$t('text.phone')">
                            <i class="fas fa-caret-right dialog"></i>
                        </div> 
                        <div class="input-wrap">
                            <i class="fas fa-user-friends light space"></i>
                            <input type="text" v-model="book.name" :placeholder="$t('text.name')">
                        </div>                      
                    </div>
                </section>
                <section>
                    <h5>{{$t('booking.request')}}</h5>
                    <div class="content center">
                        <textarea v-model="book.note"></textarea>
                    </div>
                </section>
                <section class="center">   
                    <button class="btn" v-if="changed" @click="init.resolve">
                        <i class="fa fa-times"></i>
                        <span>{{$t('button.exit')}}</span>
                    </button>  
                    <button class="btn" @click="reset" v-else>
                        <i class="fas fa-user-times"></i>
                        <span>{{$t('button.reset')}}</span>
                    </button>                  
                    <button class="btn" @click="create">
                        <i class="fas fa-book"></i>
                        <span>{{$t('button.create')}}</span>
                    </button>
                </section>
            </div>
            <div class="detail">
              <header>
                <div class="calendar-date-box">
                  <i class="fas fa-angle-left" @click="prevDate"></i>
                  <P>
                    <span class="date">{{calendarDate | moment("YYYY-MM-DD")}}</span>
                    <span class="holiday">{{calendarDate | isHoliday}}</span>
                  </P>
                  <i class="fas fa-angle-right" @click="nextDate"></i>
                </div>
                <dropdown label="filter.category" :options="types" filter="filter"></dropdown>
              </header>
              <reservation :books="sortedList"></reservation>
            </div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import Holiday from "moment-holiday";
import dialogModule from "../common/dialog";
import reservation from "./component/reservation";
import calendar from "../history/component/calendar";
import dropdown from "../history/component/dropdown";

export default {
  props: ["init"],
  components: { calendar, dialogModule, reservation, dropdown },
  data() {
    return {
      filter: null,
      componentData: null,
      component: null,
      bookingList: null,
      calendarDate: moment(),
      book: {
        type: "WALK_IN",
        date: today(),
        time: moment().format("HH:mm"),
        guest: [1, 0, 0],
        seat: null,
        phone: null,
        name: null,
        request: [],
        note: "",
        status: 1
      },
      types: [
        {
          text: this.$t("filter.allBooks"),
          value: "ALL"
        },
        {
          text: this.$t("filter.cancelled"),
          value: "CANCELLED"
        },
        {
          text: this.$t("filter.noShows"),
          value: "NOSHOWS"
        }
      ]
    };
  },
  created() {
    this.$bus.on("filter", this.applyFilter);
  },
  beforeDestroy() {
    this.$bus.off("filter", this.applyFilter);
  },
  filters: {
    isHoliday(date) {
      return Holiday(date).isHoliday() ? Holiday(date).isHoliday() : "";
    }
  },
  computed: {
    sortedList() {
      return Array.isArray(this.bookingList) ? this.bookingList : this.books;
    },
    changed() {
      const book = {
        type: "WALK_IN",
        date: today(),
        time: moment().format("HH:mm"),
        guest: [1, 0, 0],
        seat: null,
        phone: null,
        name: null,
        request: [],
        note: "",
        status: 1
      };

      return JSON.stringify(book) === JSON.stringify(this.book);
    },
    ...mapGetters(["op", "books"])
  },
  methods: {
    less(i) {
      const guest = this.book.guest[i];
      const value = guest > 0 ? guest - 1 : guest;
      this.book.guest.splice(i, 1, value);
    },
    more(i) {
      const value = this.book.guest[i] + 1;
      this.book.guest.splice(i, 1, value);
    },
    applyFilter(value) {},
    prevDate() {
      this.calendarDate = moment(this.calendarDate).subtract(1, "d");
      this.getBookingList();
    },
    nextDate() {
      this.calendarDate = moment(this.calendarDate).add(1, "d");
      this.getBookingList();
    },
    openCalendar() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "calendar";
      })
        .then(date => {
          this.book.date = date;
          this.calendarDate = moment(date, "YYYY-MM-DD", true);
          date !== today() && this.getBookingList(date);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    getBookingList(date) {
      date = date || this.calendarDate.format("YYYY-MM-DD");

      this.$socket.emit("[BOOK] LIST", date, list => {
        this.bookingList = list;
      });
    },
    reset() {
      this.book = {
        type: "WALK_IN",
        date: today(),
        time: moment().format("HH:mm"),
        guest: [1, 0, 0],
        seat: null,
        phone: null,
        name: null,
        request: [],
        note: "",
        status: 1
      };
    },
    create() {
      this.checkDate()
        .then(this.checkGuest)
        .then(this.save)
        .then(this.reset)
        .catch(this.exception);
    },
    checkDate() {
      return new Promise((next, stop) => {
        const timestamp = moment(
          this.book.date + " " + this.book.time,
          "YYYY-MM-DD HH:mm",
          true
        );

        if (timestamp.isValid()) {
          Object.assign(this.book, { timestamp: +timestamp });
          this.book.date >= today() ? next() : stop("DATE PASS");
        } else {
          stop("DATE INCORRECT");
        }
      });
    },
    checkGuest() {
      return new Promise((next, stop) => {
        const count = this.book.guest.reduce((a, c) => a + c, 0);
        count >= 1 ? next() : stop("GUEST INCORRECT");
      });
    },
    save() {
      return new Promise(next => {
        const readable = moment(this.book.timestamp).format(
          "MMM DD ddd hh:mm a"
        );
        const prompt = {
          title: "dialog.bookingConfirm",
          msg: ["dialog.bookingTimeDetail", readable]
        };

        this.$dialog(prompt)
          .then(() => {
            this.$socket.emit("[BOOK] SAVE", this.book);
            this.exitComponent();
            next();
          })
          .catch(this.exitComponent);
      });
    },
    exception(error) {
      console.log(error);
      let prompt = {
        type: "error",
        title: "dialog.cantExecute",
        msg: "dialog.errorOccurred",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };
      switch (error) {
        case "DATE PASS":
          prompt.msg = "dialog.invalidDate";
          break;
        case "DATE INCORRECT":
          prompt.msg = "dialog.entryInvalid";
          break;
        case "GUEST INCORRECT":
          prompt.msg = "dialog.guestMustGreaterThanZero";
          break;
      }

      this.$dialog(prompt).then(this.exitComponent);
    }
  }
};
</script>

<style scoped>
.book {
  display: flex;
  width: 95%;
  height: 650px;
  overflow: hidden;
  margin-top: -42px;
  border-radius: 6px;
  background: #fff;
}

.form {
  flex: 2;
  overflow: hidden;
  background: #f4f4f4;
  border-right: 1px solid #e0e0e0;
}

.form h3 {
  text-align: left;
  padding: 20px 0 15px 20px;
  border-bottom: 10px solid #009688;
}

h5 {
  text-indent: 1em;
  margin: 7px 0;
  color: #424242;
  text-align: left;
}

.center {
  text-align: center;
}

.content label {
  margin: 4px 6px;
  display: inline-block;
  opacity: 0.5;
}

input:checked + label {
  opacity: 1;
}

.input-wrap {
  position: relative;
  display: flex;
  border: 2px solid #eee;
  width: 220px;
  background: #fff;
  border-radius: 4px;
  margin: 5px auto;
  align-items: baseline;
  padding: 5px;
}

.input-wrap input {
  border: none;
  background: transparent;
  outline: none;
  text-indent: 5px;
  font-family: "Yuanti-SC";
  color: #333;
  font-size: 18px;
}

.input-wrap i {
  width: 35px;
  font-size: 16px;
  padding-left: 5px;
}

.age {
  display: flex;
  margin: 0px 30px;
  align-items: center;
}

.button-wrap {
  flex: 1;
  text-align: right;
}

.button-wrap i {
  padding: 7px 15px;
  cursor: pointer;
}

.button-wrap .count {
  width: 25px;
  display: inline-block;
  text-align: center;
  background: #fff;
  border-radius: 4px;
  font-weight: bold;
  color: #607d8b;
  padding: 2px 4px;
}

textarea {
  width: 204px;
  height: 60px;
  resize: none;
  outline: none;
  border-radius: 2px;
  padding: 7px 10px;
  border: 2px solid #eee;
  font-family: "Yuanti-SC";
}

.btn {
  margin: 3px 20px;
  display: inline-flex;
}

i.dialog {
  position: absolute;
  right: 0;
  top: 0;
  padding: 7px 0;
  cursor: pointer;
  background: #eee;
  width: 50px;
}

.detail {
  flex: 5;
  background: #eceff1;
}

.detail header {
  display: flex;
  padding: 8px 0;
  background: #fff;
  border-bottom: 1px solid rgba(221, 221, 221, 0.9);
}

.calendar-date-box p {
  display: flex;
  flex-direction: column;
}

.holiday {
  font-size: 12px;
  color: #ff5722;
}
</style>

