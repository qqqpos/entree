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
          <div class="card" v-if="reward.enable && profile">
            <h5>{{$t('text.rewardPoint')}}<i class="fas fa-ellipsis-h light more"></i></h5>
            <div class="wrap">
              <div class="column f1">
                <span class="value">{{reward.point}}</span>
                <span class="text">{{$t('reward.point')}}</span>
              </div>
              <div class="row f2">
                <div class="column">
                  <span class="value">$ {{reward.value | decimal}}</span>
                  <span class="text">{{$t('reward.value')}}</span>
                </div>
                <button class="column mini-btn redeem" :disabled="(reward.value <= 0 || !reward.redeemable)" @click="redeemDialog()">
                  <i class="fas fa-exchange-alt"></i>
                </button>
              </div>
            </div>
          </div>
          <template v-if="cards.length">
            <div class="card" v-for="(card,index) in cards" :key="index">
              <h5>{{$t('card.giftCard')}}<i class="fas fa-ellipsis-h light more"></i></h5>
              <div class="wrap">
                <div class="column f1">
                  <span class="value">{{card.number | card}}</span>
                  <span class="text">{{$t('card.number')}}</span>
                </div>
                <div class="column">
                  <span class="value">$ {{card.balance | decimal}}</span>
                  <span class="text">{{$t('card.balance')}}</span>
                </div>              
              </div>
            </div>
          </template>
          <template v-else-if="profile">
            <div class="card" @click="activateGiftcard">
              <h5 class="text-center">{{$t('card.customerNoGiftcard')}}</h5>
              <h3 class="text-center">{{$t('card.activation')}}</h3>
              <p class="ads boxCenter"><i class="fas fa-ad space"></i><span>{{$t('reward.marketing')}}</span></p>
            </div>
          </template>
          <template v-else>
            <div class="card" @click="swipeCardGetCustomer">
              <h5 class="text-center">{{$t('title.customerProfile')}}</h5>
              <h3 class="text-center">{{$t('card.swipeGiftCard')}}</h3>
            </div>            
          </template>
        </div>
        <transition name="fade">
          <div :is="module" :init="moduleData" class="preview"></div>
        </transition>
        <div :is="component" :init="componentData" @reload="reloadData"></div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import story from "./helper/story";
import redeem from "./helper/redeem";
import ticket from "../../common/ticket";
import dialogModule from "../../common/dialog";
import giftcardModule from "../../giftcard/index";

export default {
  components: { story, ticket, redeem, dialogModule, giftcardModule },
  props: ["init"],
  data() {
    return {
      componentData: null,
      component: null,
      moduleData: null,
      module: null,
      profile: false,
      invoices: [],
      cards: [],
      reward: {
        enable: false,
        redeemable: false,
        perPoint: 1,
        asValue: 0,
        point: 0,
        value: 0
      },
      view: null
    };
  },
  computed: {
    ...mapGetters(["customer"])
  },
  created() {
    this.cards = this.init.cards;
    this.profile = this.init.profile;
    this.invoices = this.init.invoices;
    this.calculateRewardValue(this.init.rewardPoint);
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
    calculateRewardValue(point) {
      const {
        reward = {
          enable: false,
          perPoint: 1,
          asValue: 0,
          redeemable: false
        }
      } = this.$store.getters.store;

      const rewardPoint = point;
      const each =
        isNumber(reward.perPoint) && reward.perPoint > 0 ? reward.perPoint : 1;

      Object.assign(this.reward, {
        enable: reward.enable,
        redeemable: reward.redeemable,
        perPoint: reward.perPoint,
        asValue: reward.asValue,
        point: rewardPoint,
        value: Math.trunc(rewardPoint / each * reward.asValue * 100) / 100
      });
    },
    reloadData() {
      const { _id, phone } = this.customer;

      this.$socket.emit(
        "[CUSTOMER] PORTAL",
        { _id, phone },
        ({ invoices, rewardPoint, cards }) => {
          this.cards = cards;
          this.profile = !!_id;
          this.invoices = invoices;
          this.calculateRewardValue(rewardPoint);
        }
      );
    },
    redeemDialog(redeem) {
      new Promise((resolve, reject) => {
        const cards = this.cards;
        const { value } = this.reward;
        redeem = redeem || value;

        this.componentData = { resolve, reject, value, redeem, cards };
        this.component = "redeem";
      })
        .then(({ type, redeem, card }) => {
          switch (type) {
            case "REDUCE":
              this.$dialog({
                type: "question",
                title: "dialog.redeemReward",
                msg: ["dialog.redeemRewardToTicket", redeem.toFixed(2)],
                buttons: [
                  { text: "button.cancel", fn: "reject" },
                  { text: "button.modify", fn: "retry" },
                  { text: "button.confirm", fn: "resolve" }
                ]
              })
                .then(() => this.redeemValueToTicket(redeem))
                .catch(retry => {
                  retry ? this.redeemDialog(redeem) : this.exitComponent();
                });
              break;
            case "TRANSFER":
              this.$dialog({
                type: "question",
                title: "dialog.redeemReward",
                msg: ["dialog.redeemRewardToGiftcard", redeem.toFixed(2)],
                buttons: [
                  { text: "button.cancel", fn: "reject" },
                  { text: "button.modify", fn: "retry" },
                  { text: "button.confirm", fn: "resolve" }
                ]
              })
                .then(() => this.redeemValueToCard(card, redeem))
                .catch(retry => {
                  retry ? this.redeemDialog(redeem) : this.exitComponent();
                });
              break;
            default:
          }
        })
        .catch(this.exitComponent);
    },
    redeemValueToTicket(value) {
      this.exitComponent();
    },
    redeemValueToCard(card, amount) {
      this.exitComponent();

      const { asValue, perPoint } = this.reward;
      const redeemRatio = `${perPoint}:${asValue}`;
      const redeemPoint = Math.trunc(amount / asValue * perPoint);
      const giftcard = this.cards.find(giftcard => giftcard.number === card);

      this.reward.point = this.reward.point - redeemPoint;
      this.calculateRewardValue(this.reward.point);

      giftcard.balance = toFixed(
        parseFloat(giftcard.balance) + parseFloat(amount),
        2
      );

      const record = {
        type: "REDEEM",
        point: -redeemPoint,
        value: this.$calculateRewardValue(redeemPoint),
        ratio: redeemRatio,
        settled: true,
        status: 1,
        customer: this.customer._id
      };

      const reload = {
        type: "REWARD",
        cashier: this.$store.getters.op.name,
        number: giftcard.number,
        change: parseFloat(amount),
        balance: giftcard.balance
      };

      this.$socket.emit("[REWARD] REDEEM_TO_GIFTCARD", record, reload, () =>
        this.reloadData()
      );
    },
    activateGiftcard() {
      const { phone, name } = this.customer;

      this.$open("giftcardModule", {
        assign: true,
        reload: true,
        preset: {
          phone,
          holder: name
        }
      });
    },
    swipeCardGetCustomer() {
      const { phone, name } = this.customer;

      this.$open("giftcardModule", {
        callback: true,
        reload: true,
        preset: {
          phone,
          holder: name
        }
      });
    },
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
  color: #3c3c3c;
}

.card h3 {
  margin: 2px 0;
}

.card .wrap {
  display: flex;
  margin-top: 2px;
}

.card .wrap > div {
  padding: 0 7px;
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

.ads {
  font-size: 14px;
  color: #ff9800;
  font-weight: lighter;
}

.ads i {
  color: #ff9800;
  font-size: 16px;
}
</style>


