<template>
  <div class="popupMask center dark">
    <div class="creditCard">
      <i class="fa loader" :class="[icon]"></i>
      <h3>{{msg}}</h3>
      <h5>{{tip}}</h5>
      <footer>
        <button class="btn" @click="abort" :disabled="!cancelable">{{$t('button.cancelAction')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      station: this.$store.getters.station.alias,
      attached: this.$store.getters.station.terminal,
      transacting: false,
      cancelable: false,
      terminal: null,
      timeout: null,
      device: null,
      config: null,
      icon: "info",
      msg: "",
      tip: ""
    };
  },
  mounted() {
    this.initialData()
      .then(this.initTerminal)
      .then(this.initTransaction)
      .then(this.parseData)
      .catch(this.transactionFailed);
  },
  methods: {
    initialData() {
      return new Promise((next, stop) => {
        this.timeout = setTimeout(() => {
          this.cancelable = true;
        }, 30000);

        this.$socket.emit("[TERMINAL] CONFIG", this.attached, config => {
          if (!config) {
            stop({ error: "CONFIG_FILE_NO_FOUND" });
          } else {
            this.config = config;
            this.terminal = this.getParser(config.model).default();
            next();
          }
        });
      });
    },
    initTerminal() {
      return new Promise(next => {
        let { ip, port, sn, model } = this.config;

        this.msg = this.$t("terminal.initial", model);

        this.terminal
          .initial(ip, port, sn, this.station, this.attached)
          .then(response => next(response.data))
          .catch(e => {
            throw new Error({ error: "TERMINAL_RETURN_ERROR" });
          });
      });
    },
    initTransaction(initial) {
      return new Promise((next, reject) => {
        this.device = this.terminal.check(initial);

        if (this.device.code !== "000000") {
          reject({ error: "DEVICE_RETURN_ERROR" });
        } else {
          const { creditCard } = this.init.card;

          this.msg =
            creditCard.number && creditCard.date
              ? this.$t(
                "terminal.transacting",
                this.device.model || this.config.model
              )
              : this.$t(
                "terminal.ready",
                this.device.model || this.config.model
              );

          this.terminal.charge(this.init.card).then(response => {
            next(response.data);
          });
        }
      });
    },
    parseData(data) {
      return new Promise((next, stop) => {
        const result = this.terminal.explainTransaction(data);

        if (result.code !== "000000") {
          stop({ error: "TRANSACTION_FAILED", data: result });
        } else {
          this.init.resolve(result);
        }
      });
    },
    getParser(model) {
      switch (model) {
        case "SP30":
        case "S80":
        case "S300":
          return require("./parser/pax.js");
        case "NX2200":
          return require("./parser/exadigm.js");
        default:
          return require("./parser/pax.js");
      }
    },
    transactionFailed({ error, data }) {
      this.icon = "error";
      this.cancelable = true;
      switch (error) {
        case "CONFIG_FILE_NO_FOUND":
          this.msg = this.$t("terminal.configInvalid")
          break;
        case "TERMINAL_RETURN_ERROR":
          this.msg = this.$t("terminal.terminalError")
          break;
        case "DEVICE_RETURN_ERROR":
          this.msg = this.$t("terminal.removeTryAgain");
          break;
        case "TRANSACTION_FAILED":
          this.msg = this.$t(data.msg);
          this.tip = data.error ? data.error : "";
          setTimeout(() => {
            this.init.reject();
          }, 2500);
          break;
      }
    },
    abort() {
      this.init.reject();
    }
  }
};
</script>

<style scoped>
.creditCard {
  background: #eff3f6;
  width: 400px;
  min-height: 170px;
  border-radius: 4px;
  text-align: center;
  color: #3c3c3c;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
}

h5 {
  color: #ff5722;
  margin-top: 10px;
}

i {
  font-size: 6em;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  margin: 15px 0;
}

footer {
  background: #eee;
  margin-top: 15px;
}

.btn {
  margin: 10px;
  width: 90%;
}
</style>