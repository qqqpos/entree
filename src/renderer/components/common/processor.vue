<template>
    <div class="popupMask center dark">
        <div class="loader" v-show="!component">
            <h3>{{$t('dialog.systemProcessing')}}</h3>
            <div class="wrap">
                <div class="dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import dialoger from "./dialoger";
export default {
  props: ["init"],
  components: { dialoger },
  data() {
    return {
      componentData: null,
      component: null,
      timeout: null
    };
  },
  created() {
    let data = {
      title: "dialog.timeout",
      msg: "dialog.timeoutTip",
      buttons: [{ text: "button.confirm", fn: "resolve" }]
    };

    let duration = this.init.timeout || 300000;

    this.timeout = setTimeout(() => {
      this.$dialog(data).then(() => {
        this.init.reject();
      });
    }, duration);
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  }
};
</script>

<style scoped>
.loader {
  width: 300px;
  padding: 15px;
  border-radius: 6px;
  text-align: center;
  background: repeating-linear-gradient(
    -55deg,
    #f44336,
    #f44336 20px,
    #e63b32 20px,
    #e63b32 40px
  );
  animation: Move 5s infinite;
}
h3 {
  color: #fff;
  font-weight: normal;
  text-shadow: 0 1px 1px #333;
  letter-spacing: 2px;
}
.wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin: 15px auto 5px;
}
.dots {
  width: 80px;
}
.dot {
  display: inline-block;
  background: #fff;
  box-shadow: 0 1px 1px #333;
  height: 10px;
  width: 10px;
  opacity: 0.3;
  border-radius: 50%;
  animation: Bounce 1s infinite;
}
.dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dot:nth-child(3) {
  animation-delay: 0.4s;
}
.dot:nth-child(4) {
  animation-delay: 0.6s;
}
.dot:nth-child(5) {
  animation-delay: 0.8s;
}
@keyframes Bounce {
  0% {
    transform: translateY(0px);
  }
  35% {
    transform: translateY(0px);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px);
    opacity: 0.8;
  }
  70% {
    transform: translateY(3px);
    opacity: 0.8;
  }
  85% {
    transform: translateY(-3px);
  }
}
</style>