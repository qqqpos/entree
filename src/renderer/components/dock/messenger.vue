<template>
    <div class="popupMask" @click.self="init.reject">
        <div class="spooler" v-show="!component">
            <header>
                <nav>
                    <div>
                        <input type="radio" name="tab" v-model="tab" id="info" value="message">
                        <label for="info">{{$t('text.message')}}</label>
                    </div>
                    <div>
                        <input type="radio" name="tab" v-model="tab" id="queue" value="queue">
                        <label for="queue">{{$t('text.queue')}}</label>
                    </div>
                </nav>
                <i class="fa fa-bell"></i>
                <i class="fa fa-bars"></i>
            </header>
            <ul>
                <li v-for="(invoice,index) in spooler" :key="index">
                    <span class="timer" v-if="index === 0">{{invoice.schedule | countDown(time)}}</span>
                    <span class="timer" v-else>{{invoice.schedule | moment('HH:mm')}}</span>
                    <div class="f1">
                        <span class="invoice">{{invoice.number}}</span>
                        <span>{{$t('type.'+invoice.type)}}</span>
                        <span v-if="invoice.course">{{$t('type.'+invoice.course)}}</span>
                    </div>
                    <span class="items" :title="invoice.content | tooltip(language)">{{$t('text.items',invoice.content.length)}}</span>
                    <i class="fa fa-print print" @click="printConfirm(index)"></i>
                    <i class="fa fa-times" @click="remove(index)"></i>
                </li>
            </ul>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import dialoger from '../common/dialoger'

export default {
    props: ['init'],
    components: { dialoger },
    data() {
        return {
            componentData: null,
            component: null,
            tab: 'message'
        }
    },
    created() {
        this.init.view && (this.tab = 'queue')
    },
    methods: {
        printConfirm(i) {
            const time = this.spooler[i].schedule;
            const schedule = moment(time).format("hh:mm");
            const toNow = moment(time).toNow(true);
            const prompt = {
                type: "question", title: "dialog.printConfirm",
                msg: ["dialog.printSpoolerTip", schedule, toNow],
                buttons: [{ text: "button.cancel", fn: 'reject' }, { text: "button.print", fn: 'resolve' }]
            };

            this.$dialog(prompt).then(() => this.printFromSpooler(i)).catch(() => this.$q())
        },
        printFromSpooler(i) {
            this.$q();

            let items = [];
            const _id = this.spooler[i]._id;

            this.spooler[i].content.forEach(item => items.push(item.unique));
            Printer.setTarget('All').print(this.spooler[0])
            this.removeSpooler(i);

            const index = this.history.findIndex(order => order._id === _id);
            let order = Object.assign({}, this.history[index]);

            items.forEach(unique => {
                for (let i = 0; i < order.content.length; i++) {
                    if (order.content[i].unique === unique) {
                        order.content[i].print = true;
                        order.content[i].pending = false;
                        break;
                    }
                }
            });

            this.$socket.emit("[UPDATE] INVOICE", order);
        },
        remove(i) {
            const prompt = {
                type: "question",
                title: "dialog.removeSpooler",
                msg: "dialog.removeSpoolerConfirm"
            }

            this.$dialog(prompt).then(() => {
                this.removeSpooler(i);
                this.$q();
            }).catch(() => this.$q())

        },
        ...mapActions(['removeSpooler'])
    },
    filters: {
        tooltip(data, lang) {
            return data.map(item => (item.qty + ' ' + item[lang])).join("\n")
        },
        countDown(schedule, current) {
            const duration = schedule - current;
            const hh = ('00' + Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).slice(-2);
            const mm = ('00' + Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))).slice(-2);
            const ss = ('00' + Math.floor((duration % (1000 * 60)) / 1000)).slice(-2);
            return hh > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
        }
    },
    computed: {
        ...mapGetters(['time', 'config', 'history', 'spooler', 'language'])
    }
}
</script>

<style scoped>
.spooler {
  min-width: 330px;
  font-size: 16px;
  position: absolute;
  right: 10px;
  top: 40px;
  overflow: hidden;
  background: rgba(250, 250, 250, 0.43);
  max-height: 705px;
  color: #424242;
  border-radius: 2px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

header {
  display: flex;
  background: #4fc3f7;
  color: #fff;
  line-height: initial;
  padding: 10px;
}

nav {
  display: flex;
  align-items: center;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.4);
  flex: 1;
}

input {
  display: none;
}

header > i {
  color: #bdebff;
  padding: 0 5px;
  cursor: pointer;
}

label {
  border-bottom: 2px solid transparent;
  padding-bottom: 9px;
  margin-right: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

input:checked + label {
  border-bottom: 2px solid #e1f5fe;
}

ul {
  padding: 7px;
}

li {
  padding: 5px;
  margin-bottom: 0px;
  background: #fafafa;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
}

.timer {
  background: #03a9f4;
  color: #fff;
  padding: 0px 3px;
  border-radius: 4px;
  min-width: 35px;
  font-family: "Agency FB";
  font-weight: bold;
  text-align: center;
  height: 20px;
  line-height: 20px;
  text-shadow: 0 1px 1px #333;
}

.f1 {
  margin-left: 10px;
}

li.i {
  float: right;
  padding: 2px 5px;
}

.items {
  font-size: 11px;
  color: #ff9800;
  white-space: pre;
}

i.print {
  padding: 0 5px;
}
</style>