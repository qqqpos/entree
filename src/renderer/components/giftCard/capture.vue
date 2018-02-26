<template>
  <div class="popupMask center dark">
    <div class="capture">
      <i class="fa info loader"></i>
      <h3>{{message}}</h3>
      <footer>
        <button class="btn" @click="init.reject('manual')">{{$t('text.manualInput')}}</button>
        <button class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      message: this.init.vip
        ? this.$t("card.swipeVipCard")
        : this.$t("card.swipeGiftCard"),
      timeout: null,
      buffer: ""
    };
  },
  created() {
    this.init.hasOwnProperty("number") && this.parser(this.init.number);
    window.addEventListener("keydown", this.reader, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.reader, false);
  },
  methods: {
    reader(e) {
      e.preventDefault();
      clearTimeout(this.timeout);

      this.timeout = setTimeout(() => {
        this.buffer = "";
      }, 300);

      e.key.length === 1 && (this.buffer += e.key);
      e.key === "Enter" && this.parser(this.buffer);
    },
    parser(buffer) {
      if (buffer.includes("%E") || buffer.includes(";E?")) {
        this.message = this.$t("card.readTrackFailed");
        this.buffer = "";
      } else {
        try {
          const number = buffer.match(/\d{16,16}/)[0];
          this.$socket.emit("[GIFTCARD] QUERY", number, card => {
            card ? this.init.resolve(card) : this.init.reject(number);
          });
        } catch (e) {
          this.message = this.$t("card.readTrackFailed");
          this.read = "";
        }
      }
    }
  }
};
</script>

<style scoped>
.capture {
  background: #eff3f6;
  width: 400px;
  min-height: 170px;
  border-radius: 4px;
  text-align: center;
  color: #3c3c3c;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
}

i {
  font-size: 6em;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  margin: 15px 0;
}

footer {
  background: #eee;
  margin-top: 15px;
  display: flex;
}

footer .btn {
  margin: 10px;
  flex: 1;
}
</style>