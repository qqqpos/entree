<template>
    <div class="reservation">
        <div class="frame">
            <div class="hourly" v-for="(value,key,index) in hours" :key="index" :data-hour="key" :style="{}">
                <h3 class="hour">{{key | hour}}</h3>
                <div class="book" v-for="(book,index) in value" :key="index" @click="getOption(book,$event)" :class="{inactive:book.status === 0}">
                    <span class="queue">
                        <span class="symbol">#</span>{{book.queue}}</span>
                    <div class="info">
                        <span class="name">{{book.name}}</span>
                        <span class="phone">{{book.phone | phone}}</span>
                    </div>
                    <div class="size">
                        <i class="fa fa-users"></i>
                        <span>{{book.size}}</span>
                    </div>
                </div>
            </div>
        </div>
        <div :is="component" :init="componentData" @reprint="reprint" @seat="seat" @active="active" @inactive="inactive" @cancel="cancel"></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import contextMenu from './context'
import dialoger from '../common/dialoger'
export default {
    components: { contextMenu, dialoger },
    data() {
        return {
            currentTimeFrame: moment().format('H'),
            componentData: null,
            component: null,
            book: null
        }
    },
    mounted() {
        this.checkSchedule();
    },
    methods: {
        getOption(book, e) {
            this.book = book;
            this.$p("contextMenu", { left: e.pageX, top: e.pageY - 20, book })
        },
        seat() {
            this.$q();
            this.$emit('seat')
            this.$bus.emit('seat', this.book);
        },
        reprint() {
            this.$q();
            Printer.printReservationTicket(this.book)
        },
        active() {
            Object.assign(this.book, { status: 1 })
            this.$socket.emit("[RESV] UPDATE", this.book)
            this.$q();
        },
        inactive() {
            Object.assign(this.book, { status: 0 })
            this.$socket.emit("[RESV] UPDATE", this.book)
            this.$q();
        },
        cancel() {
            this.$dialog({
                title: 'dialog.reservationCancel',
                msg: ['dialog.reservationCancelTip', this.book.name],
                buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.confirm', fn: 'resolve' }]
            }).then(() => {
                this.$q()
                Object.assign(this.book, { status: -1 })
                this.$socket.emit("[RESV] UPDATE", this.book)
            }).catch(() => { this.$q() })
        },
        checkSchedule() {

        }
    },
    filters: {
        phone(number) {
            return number.replace(/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "($1) $2-$3")
        },
        hour(value) {
            return `${value}:00`
        }
    },
    computed: {
        availability() {
            let seat = 0, tables = 0, available = 0;
            this.tables.forEach(section => {
                section.item.forEach(table => {
                    table._id && table.status === 1 && tables++;
                })
            })
            return { available }
        },
        hours() {
            let hours = {};
            this.reservation && this.reservation.filter(book => book.status !== -1 && book.status !== 3).forEach(book => {
                let frame = new Date(book.reserve).getHours();
                hours.hasOwnProperty(frame) ? hours[frame].push(book) : hours[frame] = [book]
            });
            return hours;
        },
        // offset() {
        //     let width = this.split * 250;
        //     let offset = this.page * 250;
        //     return { transform: `translate3d(${offset}px,0,0)` }
        // },
        ...mapGetters(['config', 'tables', 'reservation'])
    },
    watch: {
        reservation() {
            console.log('trigger update')
        }
    }
}
</script>

<style scoped>
.reservation {
    flex: 1;
    overflow: hidden;
}

.frame {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 3000px;
    transition: transform 0.22s ease;
}

h3.hour {
    color: #757575;
    margin-bottom: 10px;
    font-weight: normal;
}

.hourly {
    width: 240px;
    padding: 10px;
    border-right: 1px dashed #E0E0E0;
}

.book {
    background: #fff;
    margin-bottom: 5px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .3);
    display: flex;
    transition: transform 0.1s ease-out;
}

.book:active {
    transform: scale(0.97);
}

.info {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 0 5px;
    justify-content: center;
}

.size {
    display: flex;
    flex-direction: column;
    padding: 0 5px;
    justify-content: center;
    align-items: center;
    width: 40px;
    background: #009688;
    color: #fff;
}

.size i {
    color: #0c6b62;
}

.name {
    text-transform: capitalize;
}

.symbol {
    font-size: 14px;
    color: #757575;
}

.queue {
    padding: 10px 5px;
    min-width: 35px;
    text-align: center;
    font-family: 'Agency FB';
    font-weight: bold;
    font-size: 1.25em;
    background: #ECEFF1;
}

.inactive {
    filter: opacity(0.5);
}
</style>