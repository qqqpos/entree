<template>
  <div class="popupMask center dark">
    <div class="editor">
      <header>
        <div class="f1">
          <h5>{{$t('title.create')}}</h5>
          <h3>{{$t('title.payout')}}</h3>
        </div>
        <i class="fas fa-times" @click="init.reject"></i>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <div class="textWrap">
          <textarea v-model="note"></textarea>
          <span class="hint" v-show="!note">{{$t('tip.payout')}}</span>
        </div>
        <div class="detail">
          <div>
            <label>{{$t('text.receiver')}}</label>
            <input type="text" v-model="receiver">
          </div>
          <div>
            <label>{{$t('text.amount')}}</label>
            <input type="text" v-model="amount" placeholder="0.00">
          </div>
        </div>
        <div class="signature">
          <span class="text">{{$t('text.signature')}}</span>
          <i class="fa fa-times" v-show="reset" @click="clearSignature"></i>
          <canvas width="650" height="150" ref="pad"></canvas>
        </div>
      </div>
      <footer>
        <div class="row f1">
          <p>
            <b>{{$t('text.cashier')}}:</b>
            <span class="ghost">{{op.name}}</span>
          </p>
          <p>
            <b>{{$t('text.cashDrawer')}}:</b>
            <span class="ghost">{{station.cashDrawer.name}}</span>
          </p>
        </div>
        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template> 

<script>
import { mapGetters } from "vuex";
import dialogModule from "../common/dialog";
import * as SignaturePad from "signature_pad";

export default {
  props: ["init"],
  components: { dialogModule },
  data() {
    return {
      componentData: null,
      component: null,
      receiver: "",
      amount: "0.00",
      signaturePad: null,
      reset: false,
      note: ""
    };
  },
  mounted() {
    this.signaturePad = new SignaturePad(this.$refs.pad, {
      backgroundColor: "rgb(255,255,255)"
    });

    this.signaturePad.onBegin = () => {
      this.reset = true;
    };
  },
  methods: {
    confirm() {
      this.validation()
        .then(this.checkSignature)
        .then(this.confirmPayout)
        .then(this.saveSignature)
        .then(this.saveToDatabase)
        .catch(this.payoutFailed);
    },
    validation() {
      return new Promise((resolve, reject) => {
        if (isNumber(this.amount) && this.receiver) {
          resolve();
        } else if (!isNumber(this.amount)) {
          reject("amount");
        } else {
          reject("receiver");
        }
      });
    },
    checkSignature() {
      return new Promise((resolve, reject) => {
        this.signaturePad.isEmpty() ? reject("signature") : resolve();
      });
    },
    clearSignature() {
      this.signaturePad.clear();
      this.reset = false;
    },
    confirmPayout() {
      return new Promise((next, stop) => {
        const prompt = {
          type: "question",
          title: "dialog.payoutConfirm",
          msg: [
            "dialog.payoutCashConfirm",
            this.amount.toFixed(2),
            this.receiver
          ]
        };

        this.$dialog(prompt)
          .then(next)
          .catch(stop);
      });
    },
    payoutFailed(error) {
      let prompt = {
        title: "dialog.payoutFailed",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      };

      switch (error) {
        case "receiver":
          prompt.msg = "dialog.payoutReceiverRequired";
          this.$dialog(prompt).then(this.exitComponent);
          break;
        case "amount":
          prompt.type = "question";
          prompt.msg = "dialog.payoutAmountIncorrect";
          this.$dialog(prompt).then(this.exitComponent);
          break;
        case "signature":
          prompt.type = "alert";
          prompt.msg = "dialog.payoutSignatureRequired";
          this.$dialog(prompt).then(this.exitComponent);
          break;
        default:
          this.exitComponent();
      }
    },
    saveSignature() {
      return new Promise(next => {
        const data = {
          _id: ObjectId().toString(),
          for: "Payout",
          note: this.note,
          image: this.signaturePad.toDataURL()
        };

        this.$socket.emit("[SIGNATURE] SAVE", data, () => next(data._id));
      });
    },
    saveToDatabase(credential) {
      Printer.openCashDrawer();

      const amount = parseFloat(this.amount);
      const ticket = { number: null, type: null };
      const cashDrawer = this.station.cashDrawer.name;

      const transaction = {
        _id: ObjectId().toString(),
        date: today(),
        time: Date.now(),
        order: null,
        ticket,
        paid: amount,
        change: 0,
        actual: amount,
        tip: 0,
        cashier: this.op.name,
        server: null,
        cashDrawer,
        station: this.station.alias,
        receiver: this.receiver.toCapitalCase(),
        type: "CASH",
        for: "Payout",
        subType: null,
        credential,
        lfd: null,
        note: this.note
      };

      const activity = {
        type: "CASHFLOW",
        inflow: 0,
        outflow: amount,
        ticket,
        time: Date.now(),
        operator: this.op.name
      };

      this.$socket.emit("[TRANSACTION] SAVE", transaction);
      this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });
      this.init.resolve();
    }
  },
  computed: {
    ...mapGetters(["op", "station"])
  }
};
</script>

<style scoped>
.editor {
  width: 650px;
  background: #fafafa;
}

header i {
  padding: 18px 25px;
  cursor: pointer;
}

.wrap {
  padding: initial;
}

.textWrap {
  height: 95px;
  width: 100%;
  position: relative;
}

textarea {
  border: none;
  resize: none;
  outline: none;
  width: calc(100% - 50px);
  height: 65px;
  padding: 15px 25px;
  font-family: "Yuanti-SC";
  font-size: 18px;
}

.hint {
  position: absolute;
  font-style: italic;
  color: lightgray;
  top: 16px;
  left: 25px;
}

footer {
  padding: 0 0 0 25px;
}

p {
  margin-right: 25px;
}

.detail {
  display: flex;
  justify-content: center;
  background: #607d8b;
  padding: 5px;
  border-top: 1px dashed #ddd;
  border-bottom: 1px dashed #ddd;
  box-shadow: inset 1px 0px 13px rgba(0, 0, 0, 0.5);
}

.detail > div {
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
  margin: 0 5px;
  background: #fff;
  border-radius: 4px;
  flex: 1;
}

.detail input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 24px;
  text-indent: 30px;
}

label {
  text-indent: 15px;
  padding: 5px 0 0;
}

.signature {
  position: relative;
  height: 150px;
}

.signature .text {
  position: absolute;
  left: 20px;
  top: 15px;
  font-style: italic;
  color: #bdbdbd;
  pointer-events: none;
}

.signature i {
  position: absolute;
  padding: 10px 15px;
  right: 0;
}
</style>