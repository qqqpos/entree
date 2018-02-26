<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window" v-show="!component">
            <header class="title">
                <span>{{$t('title.selectTask')}}</span>
            </header>
            <div class="inner">
                <div v-if="!card">
                    <input type="radio" name="task" v-model="task" value="activation" id="activation" :disabled="!issuable">
                    <label for="activation">
                        <i class="fa fa-credit-card"></i>{{$t('card.activation')}}</label>
                </div>
                <div v-else>
                    <input type="radio" name="task" v-model="task" value="print" id="print">
                    <label for="print">
                        <i class="fa fa-print"></i>{{$t('card.printBalance')}}</label>
                </div>
                <div>
                    <input type="radio" name="task" v-model="task" value="reload" id="reload">
                    <label for="reload">
                        <i class="fa fa-money"></i>{{$t('card.reload')}}
                        <span class="text" v-if="card">{{card.number | card}}</span>
                    </label>
                </div>
                <div>
                    <input type="radio" name="task" v-model="task" value="view" id="history">
                    <label for="history">
                        <i class="fa fa-list-ol"></i>{{$t('card.history')}}
                        <span class="text" v-if="card">{{$t('text.records',card.transaction)}}</span>
                    </label>
                </div>
                <div v-if="card && card.balance > 0">
                    <input type="radio" name="task" v-model="task" value="redemption" id="redemption">
                    <label for="redemption">
                        <i class="fa fa-usd"></i>{{$t('card.redemption')}}
                        <span class="text" v-if="card">$ {{card.balance.toFixed(2)}}</span>
                    </label>
                </div>
                <div v-else>
                    <input type="radio" name="task" v-model="task" value="deactivation" id="deactivation" :disabled="!issuable">
                    <label for="deactivation">
                        <i class="fa fa-ban"></i>{{$t('card.deactivation')}}
                    </label>
                </div>
            </div>
        </div>
        <div :is="component" :init="componentData" @reloaded="reloaded"></div>
    </div>
</template>

<script>
import loader from "./loader";
import capture from "./capture";
import history from "./history";
import dialoger from "../common/dialoger";
import { mapGetters } from "vuex";
export default {
  props: ["init"],
  components: { capture, dialoger, loader, history },
  data() {
    return {
      componentData: null,
      component: null,
      issuable: false,
      task: null,
      card: null
    };
  },
  created() {
    this.issuable = this.approval(this.op.permission, "giftCard");
  },
  filters: {
    card(number) {
      return number
        ? number.replace(
            /^\D?(\d{4})\D?\D?(\d{4})\D?(\d{4})\D?(\d{4})/,
            "$1 $2 $3 $4"
          )
        : "";
    }
  },
  watch: {
    task(n) {
      n && this.confirm();
    }
  },
  methods: {
    confirm() {
      this.card
        ? this.doTask()
        : new Promise((resolve, reject) => {
            this.componentData = { resolve, reject };
            this.component = "capture";
          })
            .then(data => {
              this.$q();
              const { number, result } = data;
              this.card = result;
              this.doTask(result, number);
            })
            .catch(() => {
              this.task = null;
              this.$q();
            });
    },
    doTask(card, num) {
      card = card || this.card;
      switch (this.task) {
        case "activation":
          if (!card) {
            this.$dialog({
              title: "dialog.giftCardActivation",
              msg: [
                "dialog.giftCardActivationTip",
                num.replace(
                  /^\D?(\d{4})\D?\D?(\d{4})\D?(\d{4})\D?(\d{4})/,
                  "$1 $2 $3 $4"
                )
              ],
              buttons: [
                { text: "button.cancel", fn: "reject" },
                { text: "button.confirm", fn: "resolve" }
              ]
            })
              .then(() => {
                this.activateCard(num);
              })
              .catch(() => {
                this.task = null;
                this.$q();
              });
          } else {
            this.$dialog({
              title: "dialog.giftCardRegistered",
              msg: "dialog.giftCardRegisteredInfo",
              buttons: [{ text: "button.confirm", fn: "resolve" }]
            }).then(() => {
              this.card = card;
              this.task = null;
              this.$q();
            });
          }
          break;
        case "reload":
          let { number, balance } = card;
          this.$p("loader", { number, balance });
          break;
        case "view":
          this.$p("history", { card: this.card });
          break;
        case "redemption":
          this.withdrawn();
          break;
        case "print":
          Printer.printGiftCard("Balance", this.card);
          this.task = null;
          break;
        case "deactivation":
          this.deactivation();
          break;
      }
    },
    activateCard(number) {
      this.$p("loader", { number, balance: 0, activation: true });
    },
    recordCashDrawerAction(inflow, outflow) {
      let activity = {
        type: "CASHFLOW",
        inflow: parseFloat(inflow),
        outflow: parseFloat(outflow),
        time: +new Date(),
        ticket: {},
        operator: this.op.name
      };
      switch (this.op.cashCtrl) {
        case "enable":
          this.station.cashDrawer.enable
            ? Printer.openCashDrawer()
            : this.cashDrawerUnavailable();
          this.$socket.emit("[CASHFLOW] ACTIVITY", {
            cashDrawer: this.station.cashDrawer.name,
            activity
          });
          break;
        case "staffBank":
          this.$socket.emit("[CASHFLOW] ACTIVITY", {
            cashDrawer: this.op.name,
            activity
          });
          break;
        case "disable":
        default:
      }
    },
    cashDrawerUnavailable() {
      this.$dialog({
        title: "dialog.cashDrawerUnavailable",
        msg: "dialog.cashDrawerUnavailableTip",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      }).then(() => this.$q());
    },
    deactivation() {
      this.task = null;
      this.$dialog({
        title: "dialog.deactivationConfirm",
        msg: "dialog.deactivationConfirmTip"
      })
        .then(() => {
          this.$socket.emit("[GIFTCARD] DEACTIVATION", this.card.number);
          this.$q();
        })
        .catch(() => this.$q());
    },
    withdrawn() {
      this.$dialog({
        title: "dialog.cashingOutConfirm",
        msg: ["dialog.cashingOutConfirmTip", this.card.balance.toFixed(2)]
      })
        .then(() => this.$q())
        .catch(() => this.$q());
    },
    reloaded(card) {
      this.$q();
      this.card = card;
    }
  },
  computed: {
    ...mapGetters(["op", "station"])
  }
};
</script>

<style scoped>
label {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  height: 25px;
  width: 250px;
  padding: 15px;
  align-items: center;
  margin: 5px;
  cursor: pointer;
  position: relative;
}

input:checked + label {
  background: url("../../assets/image/mis.png") #009688;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}

input:checked + label:after {
  position: absolute;
  bottom: 5px;
  right: 7px;
  content: "\f058";
  font-family: fontAwesome;
  color: #fff;
}

label .fa {
  margin-right: 10px;
  width: 20px;
}

span.text {
  padding: 0 10px;
  color: #ff9800;
  display: inline-block;
  flex: 1;
  text-align: right;
}

input:disabled + label {
  cursor: not-allowed;
  opacity: 0.5;
  color: #f44336;
}
</style>