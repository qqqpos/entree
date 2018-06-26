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
                    <i class="fas fa-history" @click="toggleCardList"></i>
                    <input class="value" :value="creditCard" v-mask.card.check>
                    <i class="fas fa-exclamation-triangle check"></i>
                    <transition name="fadeUp">
                        <ul v-show="isListVisible" class="cardList">
                            <li></li>
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

            </template>
            <template v-else>

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
    "payment",
    "type",
    "paid",
    "tip",
    "split",
    "splitable",
    "creditCard",
    "expDate",
    "changeDue",
    "anchor"
  ],
  data() {
    return {
      isListVisible: false
    };
  },
  mounted() {
    this.$nextTick(this.updateInputField);
  },
  methods: {
    less() {
      if (this.split > 1) {
        this.$emit("updateSplit", this.split - 1);
      }
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
      this.isListVisible = !this.isListVisible;
    }
  },
  watch: {
    anchor: "updateInputField"
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
  left: 0;
  bottom: 83px;
  background: #f5f5f5;
  width: 100%;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.3);
  z-index: 1;
}
</style>

