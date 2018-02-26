<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="accessor shadow">
      <template v-if="self">
        <h5>{{op.name}}</h5>
        <h2>{{$t('title.operatorPin')}}</h2>
      </template>
      <template v-else>
        <h5>{{$t('dialog.accessDenied')}}</h5>
        <h2>{{$t('title.accessPin')}}</h2>
      </template>
      <div class="input">
        <span v-for="(circle,index) in pin" :key="index"></span>
      </div>
      <section class="numpad">
        <div @click="setPin(7)" class="numKey">7</div>
        <div @click="setPin(8)" class="numKey">8</div>
        <div @click="setPin(9)" class="numKey">9</div>
        <div @click="setPin(4)" class="numKey">4</div>
        <div @click="setPin(5)" class="numKey">5</div>
        <div @click="setPin(6)" class="numKey">6</div>
        <div @click="setPin(1)" class="numKey">1</div>
        <div @click="setPin(2)" class="numKey">2</div>
        <div @click="setPin(3)" class="numKey">3</div>
        <div @click="reset" class="numKey">X</div>
        <div @click="setPin(0)" class="numKey">0</div>
        <div @click="access" class="numKey">√</div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      pin: [],
      self: true,
      op: this.$store.getters.op
    };
  },
  created() {
    this.self = this.init.hasOwnProperty("grant") ? false : true;
  },
  mounted() {
    window.addEventListener("keydown", this.entry, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.entry, false);
  },
  methods: {
    setPin(num) {
      this.pin.push(num);
    },
    reset() {
      this.pin = [];
    },
    delPin() {
      this.pin.pop();
    },
    entry(e) {
      e.preventDefault();
      switch (e.key) {
        case "Enter":
          this.access();
          break;
        case "Backspace":
          this.delPin();
          break;
        default:
          e.key.length === 1 &&
            /^[a-z,A-z,0-9]$/.test(e.key) &&
            this.setPin(e.key);
      }
    },
    access() {
      this.$socket.emit("[ACCESS] CODE", this.pin.join(""), op => {
        op ? this.init.resolve(op) : this.init.reject();
      });
    }
  }
};
</script>