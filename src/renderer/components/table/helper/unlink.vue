<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <div>
                    <h3>{{$t('title.unlink')}}</h3>
                </div>
            </header>
            <div class="wrap">
            <ul>
                <li class="header">
                    <span>{{$t('thead.ticket')}}</span>
                    <span>{{$t('thead.orderType')}}</span>
                    <span>{{$t('thead.amount')}}</span>
                    <span class="actions">{{$t('thead.action')}}</span>
                </li>
                <li v-for="(order,index) in ticket.link" :key="index" class="list">
                    <span>{{order.number}}</span>
                    <span>{{$t('type.'+order.type)}}</span>
                    <span><i class="fas fa-dollar-sign light space"></i>{{order.amount | decimal}}</span>
                    <div class="actions">
                        <span @click="view(order._id)" class="action yellow">{{$t('button.view')}}</span>
                        <span @click="removeDialog(order,index)" v-show="index !== 0" class="action red">{{$t("button.unlink")}}</span>
                    </div>                    
                </li>
            </ul>
            </div>
            <footer>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
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
      ticket: JSON.parse(JSON.stringify(this.init.ticket)),
      tickets: [],
      componentData: null,
      component: null
    };
  },
  created() {
    this.$socket.emit("[SPLIT] GET", this.ticket._id, tickets => {
      this.tickets = tickets;
    });
  },
  methods: {
    view(_id) {
      const ticket = this.tickets.find(t => t._id === _id);

      this.$open("ticket", { ticket, exit: true });
    },
    removeDialog(order, index) {
      const prompt = {
        type: "question",
        title: "dialog.unlinkTicket",
        msg: ["dialog.unlinkTicketConfirm", order.number]
      };

      this.$dialog(prompt)
        .then(() => {
          this.ticket.link.splice(index, 1);
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    confirm() {
      let unlinked = [];
      let links = this.ticket.link.map(link => link._id);

      this.init.ticket.link
        .map(link => link._id)
        .forEach(_id => !links.includes(_id) && unlinked.push(_id));

      this.$socket.emit("[ORDER] UNLINK", this.ticket._id, unlinked, () =>
        this.init.resolve()
      );
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

li.header {
  background: #009688;
  padding: 5px 0;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}

li.list {
  padding: 10px 0;
}

li.list:nth-child(even) {
  background: #eee;
  border-bottom: 1px solid #eceff1;
}

li {
  display: flex;
}

li span:not(:last-child) {
  text-align: center;
  width: 105px;
}

.actions {
  width: 150px;
  text-align: center;
}
</style>


