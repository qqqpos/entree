<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <div>
                    <h3>{{$t('title.unlinkTicket')}}</h3>
                </div>
            </header>
            <div class="wrap">
              <table class="event">
                <thead>
                  <tr>
                    <th class="status"></th>
                    <th>{{$t('thead.ticket')}}</th>
                    <th>{{$t('thead.orderType')}}</th>
                    <th>{{$t('thead.amount')}}</th>
                    <th>{{$t('thead.view')}}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(order,index) in ticket.link" :key="index" @click="toggleUnlink(order._id,index)" class="clickable" :class="{unlink:unlinks.includes(order._id)}">
                    <td class="status" v-if="index">
                      <i class="fas fa-unlink light" v-if="unlinks.includes(order._id)"></i>
                      <i class="fas fa-link light" v-else></i>
                    </td>
                    <td class="status" v-else></td>
                    <td class="agency light"># {{order.number}}</td>
                    <td>{{$t('type.'+order.type)}}</td>
                    <td><i class="fas fa-dollar-sign light space-right"></i>{{order.amount | decimal}}</td>
                    <td @click.stop="view(order._id)" class="actions">
                      <span class="action yellow">{{$t('button.view')}}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <footer>
                <button class="btn" @click="unlink" v-if="unlinks.length">{{$t('button.unlink')}}</button>
                <button class="btn" @click="init.resolve" v-else>{{$t('button.confirm')}}</button>
            </footer>
        </div>
        <div class="popupMask dark center" v-if="component" @click.self="exitComponent">
            <div :is="component" :init="componentData"></div>
        </div>
    </div>
</template>

<script>
import ticket from "../../common/ticket";
import dialogModule from "../../common/dialog";

export default {
  props: ["init"],
  components: { ticket, dialogModule },
  data() {
    return {
      ticket: this.init.ticket,
      componentData: null,
      component: null,
      tickets: [],
      unlinks: []
    };
  },
  created() {
    this.$socket.emit("[SPLIT] GET", this.ticket._id, tickets => {
      this.tickets = tickets.sort(
        (a, b) =>
          +a.number.replace(/\D/g, "") > +b.number.replace(/\D/g, "") ? 1 : -1
      );
    });
  },
  methods: {
    view(_id) {
      const ticket = this.tickets.find(t => t._id === _id);

      this.$open("ticket", { ticket, exit: true });
    },
    toggleUnlink(_id, i) {
      if (i === 0) return;

      const index = this.unlinks.findIndex(id => id === _id);

      index === -1 ? this.unlinks.push(_id) : this.unlinks.splice(index, 1);
    },
    async unlink() {
      const numbers = this.tickets
        .reduce(
          (a, c) => (this.unlinks.includes(c._id) ? [...a, c.number] : a),
          []
        )
        .join(", ");

      const prompt = {
        type: "question",
        title: "dialog.unlinkTicket",
        msg: ["dialog.unlinkTicketConfirm", numbers]
      };

      try {
        await this.$dialog(prompt);

        delete this.init.ticket.link;
        
        const unlinked = this.unlinks;
        this.$socket.emit(
          "[ORDER] UNLINK",
          this.ticket._id,
          unlinked,
          this.init.resolve
        );
      } catch (e) {
        this.exitComponent();
      }
    }
  }
};
</script>

<style scoped>
.wrap {
  padding: initial;
  min-height: 390px;
  width: 415px;
  background: #fafafa;
}

table.event tbody td {
  padding: 10px 0;
}

.status {
  width: 40px;
  text-align: right;
}

.unlink {
  color: #f44336;
}
</style>
