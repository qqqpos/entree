<template>
    <div class="popupMask center dark">
        <div class="editor">
            <header class="title relative">
                <div>
                    <h5></h5>
                    <h3>{{$t('title.timer')}}</h3>
                </div>
                <i class="fa fa-times" @click.self="init.reject(false)"></i>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <div class="schedule">
                    <div v-for="(items,time,index) in course" :key="index" class="course">
                        <div class="time">{{time}} {{$t('text.minute')}}</div>
                        <ul>
                            <li v-for="(item,idx) in items" :key="idx" @click="touch(item.unique)" :class="{active:isReturn(item.unique)}">
                                <div class="main"><span class="qty">{{item.qty}}</span>{{item[language]}}<span class="side">{{item.side[language]}}</span></div>
                                <div class="sub" v-for="(sub,idx) in item.choiceSet" :key="idx"><span class="qty" v-show="sub.qty > 1">{{sub.qty}}</span>{{sub[language]}}</div>
                            </li>
                        </ul>
                    </div>
                </div>
                <ul class="timer">
                    <div class="f1">
                        <button class="mini-btn" @click="delay(5)" :disabled="queue.length === 0">5 {{$t('text.minute')}}</button>
                        <button class="mini-btn" @click="delay(10)" :disabled="queue.length === 0">10 {{$t('text.minute')}}</button>
                        <button class="mini-btn" @click="delay(15)" :disabled="queue.length === 0">15 {{$t('text.minute')}}</button>
                        <button class="mini-btn" @click="delay(20)" :disabled="queue.length === 0">20 {{$t('text.minute')}}</button>
                        <button class="mini-btn" @click="delay(25)" :disabled="queue.length === 0">25 {{$t('text.minute')}}</button>
                        <button class="mini-btn" @click="delay(30)" :disabled="queue.length === 0">30 {{$t('text.minute')}}</button>
                        <button class="mini-btn" @click="delay(35)" :disabled="queue.length === 0">35 {{$t('text.minute')}}</button>
                        <button class="mini-btn" @click="delay(40)" :disabled="queue.length === 0">40 {{$t('text.minute')}}</button>
                    </div>
                    <div>
                        <button class="mini-btn" @click="reset">{{$t('button.reset')}}</button>
                    </div>
                </ul>
                <ul class="list">
                    <li v-for="(item,index) in items" :key="index" @click="tap(item.unique)" :class="{active:isSelected(item.unique)}">
                        <div class="main"><span class="qty">{{item.qty}}</span>{{item[language]}}<span class="side">{{item.side[language]}}</span></div>
                        <div class="sub" v-for="(sub,idx) in item.choiceSet" :key="idx"><span class="qty" v-show="sub.qty > 1">{{sub.qty}}</span>{{sub[language]}}</div>
                    </li>
                </ul>
            </div>
            <footer>
                <button class="btn" @click="initial" v-show="Object.keys(course).length">{{$t('button.reset')}}</button>
                <button class="btn" @click="confirmDialog">{{$t('button.confirm')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dialogModule from "../../common/dialog";

export default {
  props: ["init"],
  components: { dialogModule },
  data() {
    return {
      componentData: null,
      component: null,
      course: {},
      items: [],
      queue: [],
      dequeue: []
    };
  },
  created() {
    this.initial();
  },
  methods: {
    initial() {
      this.items = JSON.parse(
        JSON.stringify(
          this.order.content.filter(item => !item.print && !item.pending)
        )
      );

      this.ticket.type === "TO_GO" &&
        this.items.forEach(item => Object.assign(item, { orderType: "TO_GO" }));

      this.course = {};
      this.queue = [];
      this.dequeue = [];
    },
    reset() {
      Object.keys(this.course).forEach(time => {
        this.course[time] = this.course[time].filter(
          item => !this.dequeue.includes(item.unique)
        );

        if (this.course[time].length === 0) delete this.course[time];
      });

      const items = this.order.content.filter(item =>
        this.dequeue.includes(item.unique)
      );
      this.items.push(...JSON.parse(JSON.stringify(items)));
      this.dequeue = [];
    },
    tap(unique) {
      const index = this.queue.findIndex(u => u === unique);
      index !== -1 ? this.queue.splice(index, 1) : this.queue.push(unique);
    },
    touch(unique) {
      const index = this.dequeue.findIndex(u => u === unique);
      index !== -1 ? this.dequeue.splice(index, 1) : this.dequeue.push(unique);
    },
    delay(min) {
      const items = this.items.filter(item => this.queue.includes(item.unique));

      this.course[min]
        ? this.course[min].push(...items)
        : (this.course[min] = [...items]);

      this.items = this.items.filter(item => !this.queue.includes(item.unique));
      this.queue = [];
    },
    isSelected(unique) {
      return this.queue.includes(unique);
    },
    isReturn(unique) {
      return this.dequeue.includes(unique);
    },
    confirmDialog() {
      const prompt = {
        type: "question",
        title: "dialog.confirm.courseTime",
        msg: "dialog.courseTimeConfirm"
      };

      this.items.length || Object.keys(this.course).length
        ? this.$dialog(prompt)
            .then(this.checkOrder)
            .then(this.save)
            .then(this.print)
            .catch(this.exitComponent)
        : this.init.resolve();
    },
    checkOrder() {
      this.exitComponent();

      return new Promise(next => {
        if (this.ticket.type === "TO_GO") {
          let order = this.archivedOrder;
          let items = this.order.content.map(item =>
            Object.assign(item, { orderType: "TO_GO" })
          );

          order.content.push(...items);
          this.$calculatePayment(order);
          next(order);
        } else {
          next(this.order);
        }
      });
    },
    save(ticket) {
      const printed = this.items.map(item => item.unique);
      ticket.content.forEach(item => {
        printed.includes(item.unique)
          ? Object.assign(item, { print: true })
          : Object.assign(item, { pending: true });
      });

      return new Promise(next => {
        if (this.app.newTicket) {
          Object.assign(ticket, {
            customer: this.$minifyCustomer(this.customer),
            time: Date.now(),
            date: today()
          });

          if (this.dineInOpt.useTable && this.table) {
            Object.assign(this.table, {
              invoice: [ticket._id],
              status: 2
            });

            this.$socket.emit("[TABLE] UPDATE", this.table);

            this.$socket.emit("[ORDER] SAVE", ticket, false, order => {
              order.content = [];
              next(order);
            });
          }
        } else {
          this.$socket.emit("[ORDER] UPDATE", ticket, false);
          next(ticket);
        }
      });
    },
    print(order) {
      if (this.items.length) {
        Printer.setTarget("Order").print(
          Object.assign({}, order, {
            content: this.items,
            print: false,
            togo: this.ticket.type === "TO_GO"
          })
        );
      }

      Object.keys(this.course).forEach(time => {
        const delay = +moment().add(time, "minutes");
        const ticket = Object.assign({}, order, {
          content: this.course[time],
          schedule: delay,
          togo: this.ticket.type === "TO_GO"
        });

        const job = {
          type: "Delay",
          target: "Order",
          schedule: delay,
          creator: this.op.name,
          station: this.station.alias,
          order: ticket
        };

        this.delayPrint(job);
      });

      this.quit();
    },
    quit() {
      const { done } = this.station.autoLock;
      const { lockOnDone } = this.dineInOpt;

      if (lockOnDone || done) {
        this.resetAll();
        this.setOperator(null);
        this.$router.push({ path: "/main/lock" });
      } else {
        const { _id } = this.order;
        const ticket = this.history.find(t => t._id === _id);

        this.resetOrder(true);
        this.setApp({ newTicket: true });
        ticket && this.setViewOrder(ticket);
        this.$router.push({ path: "/main/table" });
      }
    },
    ...mapActions([
      "setApp",
      "setOrder",
      "resetAll",
      "delayPrint",
      "resetOrder",
      "setOperator",
      "setViewOrder"
    ])
  },
  computed: {
    ...mapGetters([
      "op",
      "app",
      "tax",
      "store",
      "order",
      "table",
      "ticket",
      "history",
      "station",
      "customer",
      "language",
      "dineInOpt",
      "archivedOrder"
    ])
  }
};
</script>

<style scoped>
.wrap {
  display: grid;
  grid-gap: 10px;
  padding: initial;
  grid-template-columns: 1fr 110px 1fr;
}

ul.timer {
  padding: 10px 0;
  text-align: center;
  border: 1px solid #eee;
  border-top: none;
  border-bottom: none;
  background: #fff;
  height: 500px;
  display: flex;
  flex-direction: column;
}

ul.list {
  padding: 10px 15px 10px 5px;
  width: 250px;
}

li {
  padding: 7px 5px;
  margin-bottom: 2px;
  border-bottom: 1px solid #eee;
}

li.active {
  color: #fff;
  background: #bdbdbd;
  text-shadow: 0 0px 1px #333;
  border-radius: 4px;
}

.active .sub {
  color: #fff3e0;
}

.main,
.sub {
  display: flex;
}

.qty {
  width: 20px;
  text-align: center;
}

ul.timer button {
  margin-bottom: 8px;
}

.schedule {
  padding: 5px 0 5px 5px;
}

.time {
  text-align: center;
  background: #cfd8dc;
  border-radius: 4px;
}

.course {
  margin-bottom: 5px;
}

.sub {
  color: #ff9800;
  font-size: 0.8em;
  text-indent: 2em;
}
</style>
