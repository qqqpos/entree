<template>
    <div class="inputField">
        <div class="inner">
            <div class="field" id="paid" @click="$emit('changeAnchor','paid')" data-format="decimal">
                <h3 class="text">{{$t('text.pay')}}</h3>
                <span class="value">{{paid}}</span>
            </div>
            <div class="field" id="tip" @click="$emit('changeAnchor','tip')" data-format="decimal">
                <h3 class="text">{{$t('text.tip')}}</h3>
                <span class="value">{{tip}}</span>
            </div>  
            <template v-if="type === 'CASH'">
                <div class="field">
                    <h3 class="text">{{$t('text.changeDue')}}</h3>
                    <span class="value">{{changeDue | decimal}}</span>
                </div>    
                <div class="field relative">
                    <h3 class="text">{{$t('title.evenSplit')}}</h3>
                    <div class="value">
                        <div class="control">
                            <i class="fas fa-chevron-circle-left" @click="less"></i>
                            <span class="target">{{split}}</span>
                            <i class="fas fa-chevron-circle-right" @click="more"></i>
                        </div>
                    </div>
                    <button class="btn" @click="$emit('excSplit')" :disabled="splitable || split === 1">{{$t('button.split')}}</button>
                </div>               
            </template>
            <template v-else-if="type === 'CREDIT'">
                <div class="field relative" id="creditCard" @click="$emit('changeAnchor','creditCard')" data-format="number" data-length="16">
                    <h3 class="text">{{$t('card.number')}}</h3>
                    <i class="fas fa-history" @click="toggleCardList" v-show="creditCards.length"></i>
                    <input class="value" :value="creditCard" v-mask.card.check>
                    <i class="fas fa-exclamation-triangle check"></i>
                    <transition name="fadeUp">
                        <ul v-show="showPrevsList" class="cardList">
                            <v-touch tag="li" v-for="(log,index) in creditCards" :key="index" @press="decode(log)">
                              <div class="number"><i class="far fa-credit-card"></i>{{log.card[0]}}</div>
                              <div>
                                <span><i class="far fa-calendar-alt"></i>{{log.card[1]}}</span>
                                <span><i class="fab fa-expeditedssl"></i>{{log.card[2]}}</span>
                              </div>
                            </v-touch>
                        </ul>
                    </transition>
                </div>  
                <div class="field" id="expDate" @click="$emit('changeAnchor','expDate')" data-format="number" data-length="4">
                    <h3 class="text">{{$t('card.expirationDate')}}</h3>
                    <input :value="expDate" class="value" v-mask.date.check>
                    <i class="fas fa-exclamation-triangle check"></i>
                </div>                  
            </template>
            <template v-else-if="type === 'THIRD'">
              <div class="external">
                <div class="type" v-for="(external,index) in externals" :key="index">
                  <input type="radio" v-model="externalType" :value="external" :id="external" @change="$emit('updateExternalType',$event.target.value)">
                  <label :for="external">{{external}}</label>
                </div>
              </div>
            </template>
            <template v-else>
              <template v-if="typeof giftCard === 'string'">
                <div class="field" id="giftCard" @click="$emit('changeAnchor','giftCard')" data-format="number" data-length="16">
                  <h3 class="text">{{$t('card.giftCard')}}</h3>
                  <input class="value" :value="giftCard" v-mask.card>
                </div>  
                <div class="field" id="balance">
                  <h3 class="text">{{$t('text.balance')}}</h3>
                  <span></span>
                </div> 
              </template>
              <template v-else>
                <div class="field">
                  <h3 class="text">{{$t('card.giftCard')}}</h3>
                  <span class="value">{{giftCard.number | card}}</span>
                </div>  
                <div class="field" id="balance">
                  <h3 class="text">{{$t('text.balance')}}</h3>
                  <span class="value">{{giftCard.balance | decimal}}</span>
                </div> 
              </template>
            </template>
        </div>
        <aside class="padCtrl">
            <div @click="$emit('delete')">&#8592;</div> 
            <div @click="$emit('clear')">C</div>
            <div @click="$emit('charge')" :class="{disabled:paid === '0.00'}">&#8626;</div>
        </aside> 
    </div>
</template>

<script>
export default {
  props: [
    "tip",
    "type",
    "paid",
    "split",
    "splitable",
    "changeDue",
    "creditCard",
    "giftCard",
    "expDate",
    "anchor",
    "payment",
    "external",
    "customer"
  ],
  data() {
    return {
      showPrevsList: false,
      externals: [],
      externalType: "",
      creditCards: []
    };
  },
  created() {
    const { defaults = {} } = this.$store.getters.config;

    this.externals = defaults.externals || [
      "Visa",
      "Master Card",
      "AmEx",
      "Discover",
      "Gift Card",
      "Online Order"
    ];
    
    //this.externalType = defaults.externals[0];
    this.getCreditCard();
  },
  mounted() {
    this.$nextTick(this.updateInputField);
  },
  methods: {
    less() {
      this.split > 1 && this.$emit("updateSplit", this.split - 1);
    },
    more() {
      this.$emit("updateSplit", this.split + 1);
    },
    updateInputField(anchor) {
      anchor = anchor || this.anchor;

      const dom = document.querySelector(".inputField .active");
      dom && dom.classList.remove("active");

      const target = document.getElementById(anchor);
      target && target.classList.add("active");
    },
    toggleCardList() {
      this.showPrevsList = !this.showPrevsList;
    },
    getCreditCard() {
      this.customer &&
        this.$socket.emit(
          "[CUSTOMER] GET_CREDIT_CARD",
          this.customer,
          creditCards => {
            this.creditCards = creditCards;
          }
        );
    },
    decode(log) {
      const ciphertext = log.cipher;
      const key = "whoisyourdaddy";

      this.$socket.emit("[CRYPT] DECRYPT", { ciphertext, key }, json => {
        if (json) {
          this.$emit("apply", JSON.parse(json));
          this.showPrevsList = false;
        }
      });
    }
  },
  watch: {
    anchor: "updateInputField",
    external(newType) {
      this.externalType = newType;
    }
  }
};
</script>

<style scoped>
.field {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 255px;
  height: 59px;
  border-radius: 2px;
  margin-bottom: 6px;
  background: #fff;
  color: #4c4b4b;
  box-shadow: var(--shadow);
  padding: 12px;
}

.text {
  color: #616161;
  font-weight: normal;
}

input[type="text"],
.value {
  border: none;
  font-size: 24px;
  text-align: right;
  outline: none;
  margin-top: 10px;
  font-family: "Agency FB";
  font-weight: bold;
  color: #3c3c3c;
}

.control {
  width: 120px;
  text-align: left;
  display: flex;
  align-items: center;
  margin-left: -10px;
}

.control .target {
  width: 40px;
  text-align: center;
  background: #eee;
  border-radius: 4px;
}

.control i {
  flex: 1;
  text-align: center;
  color: #b0bec5;
}

.check {
  position: absolute;
  bottom: 17px;
  color: yellow;
  display: none;
}

.active .invalid + .check {
  display: block;
}

.btn {
  position: absolute;
  right: 10px;
  bottom: 2px;
  height: 40px;
}

.inputField {
  display: flex;
}

.inner {
  margin-right: 5px;
}

.disabled {
  filter: brightness(1.3) grayscale(0.5);
  pointer-events: none;
}

.field.active,
.field.active input {
  background: #3f51b5;
}

.field.active .value,
.field.active .text,
.field.active .fa-history {
  color: #fff;
}

.fa-history {
  position: absolute;
  right: 0;
  top: 0;
  padding: 10px 20px;
}

ul.cardList {
  position: absolute;
  left: 7px;
  bottom: 83px;
  background: #fff;
  width: 264px;
  box-shadow: 0 1px 6px 1px rgba(0, 0, 0, 0.3);
  border-radius: 4px 4px 0 0;
  z-index: 1;
}

.cardList li {
  padding: 7px 5px;
}

.cardList i {
  display: inline-block;
  text-align: center;
  width: 30px;
}

.cardList .number {
  margin-bottom: 2px;
}

.cardList li:nth-child(even) {
  background: #eceff1;
}

.external {
  display: flex;
  flex-wrap: wrap;
  width: 279px;
}

.external label {
  display: flex;
  width: 131px;
  height: 50px;
  margin: 2px;
  justify-content: center;
  background: #fff;
  border: 2px solid #e0e0e0;
  position: relative;
  text-align: center;
  align-items: center;
  border-radius: 4px;
  color: #bdbdbd;
}

.type input:checked + label {
  background: #66bb6a;
  color: #fafafa;
  border: 2px solid #009688;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.type input:checked + label:before {
  position: absolute;
  content: " ";
  width: 23px;
  height: 15px;
  background: #009688;
  bottom: 0;
  right: 0;
  border-top-left-radius: 4px;
}

.type input:checked + label:after {
  position: absolute;
  content: "\2713";
  bottom: -2px;
  right: 5px;
  transform: rotate(20deg);
}
</style>

