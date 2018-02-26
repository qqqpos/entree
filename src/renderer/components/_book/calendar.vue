<template>
    <div class="window">
        <header class="title">{{$t('title.setDate')}}</header>
        <header class="tab">
            <div>
                <input type="radio" v-model="tab" id="calendar" value="calendar">
                <label for="calendar">
                    <i class="fa fa-2x fa-calendar"></i>
                </label>
            </div>
            <div>
                <input type="radio" v-model="tab" id="timer" value="timer">
                <label for="timer">
                    <i class="fa fa-2x fa-clock-o"></i>
                </label>
            </div>
        </header>
        <main>
            <div v-if="tab ==='calendar'" class="calendar">
                <div class="selector">
                    <i class="fa fa-chevron-left" @click="prev"></i>
                    <span>{{calendarDay | moment('YYYY-MM-DD')}}</span>
                    <i class="fa fa-chevron-right" @click="next"></i>
                </div>
                <header>
                    <span>{{$t('calendar.mon')}}</span>
                    <span>{{$t('calendar.tue')}}</span>
                    <span>{{$t('calendar.wen')}}</span>
                    <span>{{$t('calendar.thu')}}</span>
                    <span>{{$t('calendar.fri')}}</span>
                    <span>{{$t('calendar.sat')}}</span>
                    <span>{{$t('calendar.sun')}}</span>
                </header>
                <div class="dayWrap">
                    <div class="day" v-for="(calendar,index) in days" :class="{current:calendar.current,selected:selected.includes(calendar.date)}" :data-day="calendar.day" :key="index" @click="setDay(calendar.date)">{{calendar.day}}</div>
                </div>
            </div>
            <div v-else class="timer">
                <div class="time">
                    <div class="picker">
                        <h5>{{$t('text.hour')}} ({{date}})</h5>
                        <div class="inner">
                            <div v-for="(n,i) in clock" :key="i">
                                <input type="radio" v-model="time" :id="'from'+i" :value="n">
                                <label :for="'from'+i">{{n}}</label>
                            </div>
                            <div @click="period = !period">
                                <label v-show="!period" class="am">AM</label>
                                <label v-show="period" class="pm">PM</label>
                            </div>
                        </div>
                    </div>
                    <div class="picker">
                        <h5>{{$t('text.minute')}}</h5>
                        <div class="inner">
                            <div v-for="(n,i) in times" :key="i">
                                <input type="radio" v-model="minute" :id="'mm'+i" :value="n">
                                <label :for="'mm'+i">{{n}}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <footer>
            <div class="btn f1" @click="init.reject">{{$t('button.cancel')}}</div>
            <div class="btn f1" @click="confirm">{{$t('button.confirm')}}</div>
        </footer>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import moment from 'moment'
import checkbox from '../setting/common/checkbox'
import dialoger from '../common/dialoger'
export default {
    props: ['init'],
    components: { checkbox, dialoger },
    data() {
        return {
            date: null,
            time: null,
            minute: null,
            days: [],
            period: false,
            tab: 'calendar',
            today: +moment().subtract(4, 'hours').startOf('day'),
            calendarDay: +moment().subtract(4, 'hours').startOf('day'),
            component: null,
            componentData: null,
            selected: [],
            clock: [12, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11],
            times: ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
        }
    },
    created() {
        this.generateCalendar();
    },
    methods: {
        setDay(date) {
            this.date = date;
            this.tab = 'timer';
        },
        prev() {
            this.calendarDay = +moment(this.calendarDay).subtract(1, 'M').format('x');
            this.generateCalendar();
        },
        next() {
            this.calendarDay = +moment(this.calendarDay).add(1, 'M').format('x');
            this.generateCalendar();
        },
        generateCalendar() {
            let time = this.calendarDay;
            let isCurrentMonth = moment(this.today).format("YYYY-MM-DD") === moment(time).format('YYYY-MM-DD');
            let days = moment(time).daysInMonth();
            let start = +moment(time).startOf('month').format('d');
            start = start === 0 ? 6 : start - 1;
            let lastMonthDay = +moment(time).subtract(1, 'M').endOf('month').format('D') - start;
            let calendar = [];
            let date = moment(time).subtract(1, 'M').format('YYYY-MM-');
            for (let i = 1; i <= start; i++) {
                calendar.push({
                    current: false,
                    day: lastMonthDay + i,
                    date: date + ("0" + (lastMonthDay + i)).slice(-2)
                })
            }
            date = moment(time).format('YYYY-MM-');
            for (let i = 0; i < days; i++) {
                calendar.push({
                    current: true,
                    day: i + 1,
                    date: date + ("0" + (i + 1)).slice(-2)
                });
            }
            date = moment(time).add(1, 'M').format('YYYY-MM-');
            for (let i = 1; calendar.length < 42; i++) {
                calendar.push({
                    current: false,
                    day: i,
                    date: date + ("0" + i).slice(-2)
                })
            }
            this.days = calendar;

            this.$nextTick(() => {
                let dom = document.querySelector('.currentMonth');
                dom && dom.classList.remove('currentMonth');
                dom = document.querySelector('.day.today');
                dom && dom.classList.remove('today');
                if (isCurrentMonth) {
                    document.querySelector('.dayWrap').classList.add("currentMonth");
                    let today = moment().format('D') - 1;
                    today = document.querySelectorAll('[data-day]')[(start + today)];
                    today.classList.add("today");
                }
            })
        },
        confirm() {
            this.checkTime() ? this.init.resolve(+this.date) : this.invalidDate();
        },
        invalidDate() {
            this.$dialog({
                type: "error", title: "dialog.invalidDate", msg: "dialog.reserveDateIsPassed",
                buttons: [{ text: "button.confirm", fn: "resolve" }]
            }).then(() => {
                this.date = today();
                this.tab = 'calendar'
                this.$q()
            })
        },
        checkTime() {
            let date = this.date + ' ' + (this.period ? this.time + 12 : this.time) + ':' + this.minute + ':00';
            this.date = moment(date, 'YYYY-MM-DD H:mm:ss', true)
            return this.date.isValid() && (+this.date > +new Date)
        }
    }
}
</script>

<style scoped>
.window {
    width: 500px;
    background: #fff;
    display: flex;
    flex-direction: column
}

header.tab {
    display: flex;
    justify-content: center;
    align-items: center;
}

.tab>div {
    flex: 1;
}

.tab input {
    display: none;
}

main {
    flex: 1;
    background: #FAFAFA;
}

.tab label {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 10px 0;
    color: #E0E0E0;
    border-bottom: 2px solid #FAFAFA;
    cursor: pointer;
    transition: all 0.3s ease;
}

.tab input:checked+label {
    border-bottom: 2px solid #2196F3;
    background: #fff;
}

.tab input:checked+label i {
    color: #42A5F5;
}

.calendar header {
    display: flex;
    border-bottom: 1px solid #ddd;
    background: #fff;
}

.calendar header span {
    flex: 1;
    text-align: center;
    padding: 5px 0;
}

.dayWrap {
    display: flex;
    flex-wrap: wrap;
}

.day {
    width: 71.4px;
    text-align: center;
    padding: 19.7px 0;
    color: lightgray;
    font-weight: lighter;
}

.current.day {
    color: #333;
    background: #EEEEEE;
    font-weight: bold;
}

div.current.today {
    color: #009688;
}

.selector {
    display: flex;
    justify-content: center;
    background: #607D8B;
    color: #fff;
    align-items: center;
    justify-content: center;
    height: 40px;
}

.selector i {
    flex: 1;
    text-align: center;
    cursor: pointer;
    padding: 12px;
}

div.day.selected {
    background: #009688;
    color: #fff;
}

.time {
    margin: 10px auto;
    display: flex;
    position: relative;
}

.time input {
    display: none;
}

.time .picker {
    flex: 1;
    padding: 0 10px;
}

.time h5 {
    text-align: center;
    margin-bottom: 10px;
    color: #FF5722;
}

.timer .option {
    border: 1px dashed #ddd;
    padding: 10px 15px 5px;
    width: 200px;
    text-align: center;
    margin: 10px auto;
}

.time label {
    width: 25px;
    display: block;
    padding: 23px;
    background: #fff;
    margin: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.picker .inner {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

.picker .inner div {
    text-align: center;
}

.picker input:checked+label {
    background: #009688;
    color: #fff;
}

label.am {
    background: #FF9800;
    color: #fff;
}

label.pm {
    background: #FF5722;
    color: #fff;
}

.mask {
    width: 500px;
    position: absolute;
    height: 297px;
    background: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
}
</style>