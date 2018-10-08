<template>
    <fieldset>
        <legend>{{$t('text.balanceDue')}}</legend>
        <div class="values">
            <div class="f1"></div>
            <div class="due">
                <span class="balance agency">{{remain + tip - paid | decimal}}</span>
            </div>
            <div class="column flex-center" v-show="discount > 0">
                <span class="text">{{$t('text.discount')}}</span>
                <span>({{discount | decimal}})</span>
              </div>
            <div class="column flex-center" v-show="Math.max(0,tip - paid) > 0">
                <span class="text">{{$t('text.tip')}}</span>
                <span>({{Math.max(0,tip - paid) | decimal}})</span>
            </div>
            <div class="column flex-center" v-show="gratuity > 0">
                <span class="text">{{$t('text.gratuity')}}</span>
                <span>({{gratuity | decimal}})</span>
            </div>
        </div>
    </fieldset>
</template>

<script>
export default {
  props: ["payment", "paid"],
  data() {
    return {
      remain: 0,
      discount: 0,
      tip: 0,
      gratuity: 0
    };
  },
  watch: {
    payment: {
      deep: true,
      immediate: true,
      handler(data) {
        if (data) {
          const { remain = 0, discount = 0, tip = 0, gratuity = 0 } = data;

          this.remain = remain;
          this.discount = discount;
          this.gratuity = gratuity;
          this.tip = tip;
        }
      }
    }
  }
};
</script>

<style scoped>
fieldset {
  width: 275px;
  height: 49px;
  border-radius: 4px;
  border: 2px solid #607d8b;
  color: #3c3c3c;
  background: #f5f5f5;
  display: flex;
  margin-bottom: 4px;
}

legend {
  font-weight: 700;
  padding: 0 5px;
  margin-left: 10px;
}

.values {
  margin-top: -8px;
  padding: 0 5px;
  display: flex;
}

.due {
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 36px;
}

.balance {
  font-size: 36px;
}

.balance:before {
  content: "\F155";
  color: #009688;
  font-size: 24px;
  padding: 0 5px 0 0;
  font-family: fontAwesome;
}

.addition {
  margin-left: 5px;
  color: #ff9800;
  font-size: 14px;
}

.text {
  font-size: 14px;
}
</style>


