<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="capture">
            <i class="fa info loader"></i>
            <h3>{{message}}</h3>
            <footer>
                <button class="btn" @click="init.reject">{{$t('button.cancel')}}</button>
            </footer>
        </div>
    </div>
</template>
<script>
export default {
  props: ["init"],
  mounted() {
    window.addEventListener("keydown", this.entry, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.entry, false);
  },
  data() {
    return {
      read: "",
      compare: [],
      timeout: null,
      message: this.$t("card.swipeEmployeeCard")
    };
  },
  methods: {
    entry(e) {
      e.preventDefault();
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.read = "";
      }, 300);

      e.key.length === 1 && /[a-zA-Z0-9]/i.test(e.key) && (this.read += e.key);
      e.code === "Enter" && this.parser(this.read);
    },
    parser(data) {
      if (data.includes("5E")) {
        this.message = this.$t("card.readTrackFailed");
        this.read = "";
        return;
      }

      if (this.compare.length < 1) {
        this.compare.push(data);
        this.message = this.$t("card.swipeEmployeeCardAgain");
        this.read = "";
      } else {
        this.compare.push(data);
        this.confirm();
      }
    },
    confirm() {
      let [first, second] = this.compare;

      if (first === second) {
        this.init.resolve(first);
      } else {
        this.compare = [];
        this.message = this.$t("card.registerCardFailed");
        setTimeout(() => {
          this.init.reject();
        }, 3000);
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