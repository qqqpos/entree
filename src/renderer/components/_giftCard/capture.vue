<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="capture">
            <i class="fa info loader"></i>
            <h3>{{message}}</h3>
            <footer>
                <button class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</button>
            </footer>
        </div>
    </div>
</template>
<script>
export default {
  props: ["init"],
  mounted() {
    this.init.hasOwnProperty("number") && this.parser(this.init.number);
    window.addEventListener("keydown", this.reader, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.reader, false);
  },
  data() {
    return {
      read: "",
      timeout: null,
      message: this.$t("card.swipeGiftCard")
    };
  },
  methods: {
    reader(e) {
      e.preventDefault();
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.read = "";
      }, 300);

      e.key.length === 1 && (this.read += e.key);
      e.key === "Enter" && this.parser(this.read);
    },
    parser(data) {
      if (data.includes("%E") || data.includes(";E?")) {
        this.message = this.$t("card.readTrackFailed");
        this.read = "";
        return;
      }

      try {
        let number = data.match(/\d{16,16}/)[0];

        setTimeout(() => {
          this.$socket.emit("[GIFTCARD] QUERY", number, result => {
            this.init.resolve({ number, result });
          });
        }, 100);
      } catch (e) {
        this.message = this.$t("card.readTrackFailed");
        this.read = "";
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