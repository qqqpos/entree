<template>
    <div class="popupMask center dark">
        <div class="window reservation" v-show="!component">
            <header class="title">
                <span>{{$t('reservation.create')}}</span>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <div class="inner">
                <section class="source" v-if="step === 0">
                    <div @click="current">
                        <i class="fa fa-3x fa-user"></i>
                        <span class="text">{{$t('reservation.walkIn')}}</span>
                    </div>
                    <div @click="future">
                        <i class="fa fa-3x fa-phone"></i>
                        <span class="text">{{$t('reservation.phone')}}</span>
                    </div>
                </section>
                <section v-if="step === 1">
                    <article v-if="book.type ==='walkIn'">
                        <div class="content">
                            <div class="input">
                                <div>
                                    <label>{{$t('reservation.name')}}</label>
                                    <div>
                                        <input type="text" v-model="book.name" ref="name">
                                    </div>
                                </div>
                                <div>
                                    <label>{{$t('text.phone')}}</label>
                                    <div>
                                        <input type="text" v-model="book.phone">
                                    </div>
                                </div>
                                <div>
                                    <label>{{$t('reservation.guest')}}</label>
                                    <div>
                                        <input type="number" v-model.number="book.size">
                                    </div>
                                </div>
                            </div>
                            <aside class="ticket">
                                <div class="queue">
                                    <span class="value">{{book.queue}}</span>
                                    <span class="text">{{$t('reservation.number')}}</span>
                                </div>
                            </aside>
                        </div>
                        <footer>
                            <div class="btn" @click="placeQueue">{{$t('button.create')}}</div>
                        </footer>
                    </article>
                    <article v-if="book.type ==='phone'">
                        <div class="content">
                            <div class="input">
                                <div>
                                    <label>{{$t('reservation.date')}}</label>
                                    <div>
                                        <input type="text" v-model="date" ref="date" @click="openCalendar">
                                    </div>
                                </div>
                                <div>
                                    <label>{{$t('reservation.name')}}</label>
                                    <div>
                                        <input type="text" v-model="book.name">
                                    </div>
                                </div>
                                <div>
                                    <label>{{$t('text.phone')}}</label>
                                    <div>
                                        <input type="text" v-model="book.phone">
                                    </div>
                                </div>
                                <div>
                                    <label>{{$t('reservation.guest')}}</label>
                                    <div>
                                        <input type="number" v-model.number="book.size">
                                    </div>
                                </div>
                                <div>
                                    <label>{{$t('text.note')}}</label>
                                    <div>
                                        <textarea type="text" v-model.number="book.note"></textarea>
                                    </div>
                                </div>
                            </div>
                            <aside class="tables">
                                <select v-model="section">
                                    <option v-for="(section,index) in tables" :key="section" :value="section">{{section.usEN}}</option>
                                </select>
                                <seat :section="section" :status="scheduled" @pick="pick"></seat>
                                <p>You selected: {{selected}}</p>
                            </aside>
                        </div>
                        <footer>
                            <div class="btn" @click="reserve">{{$t('button.create')}}</div>
                        </footer>
                    </article>
                </section>
            </div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapAction, mapGetters } from 'vuex'
import calendar from './calendar'
import seat from './seat'

export default {
    props: ['init'],
    components: { seat, calendar },
    data() {
        return {
            book: {
                _id: ObjectId(),
                type: '',
                name: '',
                phone: '',
                note: '',
                seats: [],
                time: +new Date(),
                reserve: +new Date(),
                date: today(),
                size: 1,
                queue: 1,
                status: 1,
                request: []
            },
            componentData: null,
            component: null,
            section: null,
            scheduled: [],
            selected: null,
            step: 0,
            date: null
        }
    },
    created() {
        let date = today();
        this.$socket.emit("[RESV] GET_QUEUE", date, (number) => { this.book.queue = number })
        this.section = this.tables[0];
        this.date = this.book.date;
    },
    methods: {
        current() {
            this.step++;
            this.book.type = 'walkIn';
        },
        future() {
            this.step++;
            this.book.type = 'phone';
        },
        placeQueue() {
            let date = today();
            this.$socket.emit("[RESV] GET_QUEUE", date, (number) => {
                Object.assign(this.book, {
                    op: this.op.name,
                    queue: number
                })
                this.$socket.emit("[RESV] CREATE", this.book);
                Printer.printReservationTicket(this.book)
                this.init.resolve()
            })
        },
        pick(seat) {
            this.selected = seat.join(",");
        },
        reserve() {
            this.$socket.emit("[RESV] GET_QUEUE", this.book.date, (number) => {
                Object.assign(this.book, {
                    op: this.op.name,
                    queue: number
                })
                this.$socket.emit("[RESV] CREATE", this.book);
                this.init.resolve()
            })
        },
        openCalendar() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = 'calendar'
            }).then((time) => {
                this.date = moment(time).format("MM-DD HH:mm");
                this.book.date = moment(time).format("YYYY-MM-DD");
                this.book.reserve = time;
                this.$q()
            }).catch(() => {
                this.$q()
            })
        }
    },
    computed: {
        ...mapGetters(['op', 'config', 'tables'])
    }
}
</script>

<style scoped>
.reservation {
    min-width: 600px;
}

section.source {
    display: flex;
    justify-content: center;
}

.source div {
    margin: 45px 30px;
    padding: 40px 70px 55px;
    border-radius: 4px;
    background: linear-gradient(#fefefe, #cfd0d3);
    display: flex;
    flex-direction: column;
    position: relative;
    align-items: center;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    cursor: pointer;
}

.source span {
    position: absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    padding: 10px 0;
    font-weight: bold;
    color: #3c3c3c;
}

.source div:active {
    background: linear-gradient(#E2E3E4, #AAADB4);
    color: #333;
}

article .content {
    display: flex;
    margin: 15px 0px;
}

article aside {
    flex: 1;
    border-left: 1px solid #fff;
    text-align: center;
}

.input {
    border-right: 1px solid #eee;
    padding: 0 30px;
}

.input label {
    display: block;
    color: #333;
    font-weight: bold;
    text-indent: 5px;
    margin: 0px 0 2px 0;
    position: relative;
}

.input input,
.input textarea {
    font-size: 25px;
    padding: 2px 5px;
    border: 2px solid #e5e5e5;
    width: 200px;
}

.input textarea {
    height: 100px;
    font-size: 16px;
    resize: none;
}

.queue {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.queue .value {
    font-size: 7em;
    font-family: 'Agency FB';
    font-weight: bold;
}

.queue .text {
    color: #757575;
}

aside.ticket {
    width: 325px;
}

aside.tables {
    width: 295px;
}
</style>