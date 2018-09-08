<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="portal">
          <ul class="invoices">
            <story v-for="(invoice,index) in invoices" :invoice="invoice" :key="index" :focus="view === index"
             @menu="toggle(index)" 
             @preview="preview(invoice)"
             @copy="copy(invoice)"
             @reimburse="reimburse(invoice)"></story>
          </ul>
          <div class="card">
            <h5>{{$t('text.rewardPoint')}}<i class="fas fa-ellipsis-h light more"></i></h5>
            <div class="wrap">
              <div class="column f1">
                <span class="value">{{reward.point}}</span>
                <span class="text">{{$t('setting.reward.point')}}</span>
              </div>
              <div class="row f2">
                <div class="column">
                  <span class="value">$ {{reward.value | decimal}}</span>
                  <span class="text">{{$t('setting.reward.value')}}</span>
                </div>
                <div class="column mini-btn redeem" v-show="reward.value > 0">
                  <i class="fas fa-exchange-alt"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="card" v-for="(card,index) in giftCards" :key="index">
            <h5>{{$t('card.giftCard')}}<i class="fas fa-ellipsis-h light more"></i></h5>
            <div class="wrap">
              <div class="column f1">
                <span class="value">{{card.number | card}}</span>
                <span class="text">{{$t('card.number')}}</span>
              </div>
              <div class="column">
                <span class="value">$ {{card.balance |decimal}}</span>
                <span class="text">{{$t('card.balance')}}</span>
              </div>              
            </div>
          </div>
        </div>
        <transition name="fade">
          <div :is="module" :init="moduleData" class="preview"></div>
        </transition>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapActions } from "vuex";

import story from "./helper/story";
import ticket from "../../common/ticket";
import dialogModule from "../../common/dialog";

export default {
  components: { story, ticket, dialogModule },
  props: ["init"],
  data() {
    return {
      componentData: null,
      component: null,
      invoices: this.init.invoices || [],
      moduleData: null,
      module: null,
      giftCards: [],
      reward: {
        point: 0,
        value: 0
      },
      view: null
    };
  },
  created() {
    const { _id, phone } = this.$store.getters.customer;
    if (_id) {
      this.$socket.emit("[REWARD] GET_POINT", _id, point => {
        this.reward.point = point;
      });

      this.$socket.emit("[GIFTCARD] SEARCH", { phone }, cards => {
        this.giftCards = cards;
      });
    }
  },
  methods: {
    toggle(index) {
      this.view = this.view === index ? null : index;
    },
    preview(ticket) {
      new Promise((resolve, reject) => {
        this.moduleData = { resolve, reject, ticket, exit: true };
        this.module = "ticket";
      })
        .then(this.exitModule)
        .catch(this.exitModule);
    },
    copy(invoice) {
      const { newTicket } = this.$store.getters.app;
      const contentExist = this.$store.getters.order.content.length > 0;
      if (!newTicket && contentExist) {
        const prompt = {
          type: "question",
          title: "dialog.addToOrderContent",
          msg: "dialog.addToOrderContentConfirm"
        };

        this.$dialog(prompt)
          .then(() => this.addItem(invoice.content))
          .catch(this.exitComponent);
      } else {
        const prompt = contentExist
          ? {
              type: "warning",
              title: "dialog.orderContentReplace",
              msg: "dialog.existOrderContentReplace"
            }
          : {
              type: "question",
              title: "dialog.copyOrderContent",
              msg: "dialog.copyOrderContentConfirm"
            };

        this.$dialog(prompt)
          .then(() => this.copyItem(invoice.content))
          .catch(this.exitComponent);
      }
    },
    copyItem(content) {
      this.exitComponent();
      this.view = null;

      content.forEach(item => {
        Object.assign(item, {
          unique: String().random(),
          print: false,
          pending: false,
          void: false
        });
      });

      this.setOrder({ content });
    },
    addItem(content) {
      this.exitComponent();
      this.view = null;

      content.forEach(item =>
        this.$store.getters.order.content.push(
          Object.assign({}, item, {
            unique: String().random(),
            print: false,
            pending: false,
            void: false
          })
        )
      );
    },
    reimburse(invoice) {},
    exitModule() {
      this.module = null;
      this.moduleData = null;
    },
    ...mapActions(["setOrder"])
  }
};
</script>

<style scoped>
.portal {
  position: fixed;
  right: 285px;
  top: 30px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0 0 4px 4px;
  width: 340px;
  padding-bottom: 4px;
}

.preview {
  position: fixed;
  left: 37px;
  top: 0;
}

.card {
  background: #fff;
  margin: 5px 5px 0;
  border-radius: 6px;
  padding: 6px 12px;
  position: relative;
}

.card h5 {
  margin-bottom: 5px;
  color: #3c3c3c;
}

.card .wrap {
  display: flex;
}

.card .wrap > div {
  padding: 0 7px;
}

.column {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
}

.card .value {
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 24px;
  color: #333;
}

.card .text {
  color: #3666d4;
  font-size: 12px;
}

.card i.more {
  cursor: pointer;
  float: right;
  padding-left: 15px;
}

.redeem {
  padding: 8px 20px;
  position: absolute;
  right: 15px;
  bottom: 18px;
}
</style>


