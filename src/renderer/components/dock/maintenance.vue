<template>
  <div class="maintenance">
    <div v-if="ban" class="banned">
      <i class="fa fa-5x fa-info-circle"></i>
      <h3>{{$t("dialog.maintenance")}}</h3>
      <h5>{{$t("dialog.maintenanceTip")}}</h5>
      <svg>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          </filter>
        </defs>
      </svg>
      <div class="circle">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="command" v-else>
      <input type="text" v-model="code" @keyup.enter="exc">
      <span v-show="result" class="result">{{result}}</span>
    </div>
  </div>
</template>

<script>
import Electron from "electron";
export default {
  props: ["init"],
  mounted() {
    if (this.init) {
      this.ban = false;
      this.$nextTick(() => {
        document.querySelector(".command input").focus();
      });
    }
  },
  data() {
    return {
      ban: true,
      code: "",
      result: null,
      terminal: null
    };
  },
  methods: {
    exc() {
      const code = this.code.split(" ");
      const command = code[0];
      const arg = code[1];
      const args = code.slice(1);

      switch (command) {
        case "ban":
          this.$socket.emit("MAINT_REQUEST_BAN");
          break;
        case "unban":
          this.$socket.emit("MAINT_REQUEST_UNBAN");
          break;
        case "see":
          console.log("check invoice #", arg);
          break;
        case "buzzer":
          Printer.buzzer(arg);
          break;
        case "testpage":
          Printer.testPage(arg);
          break;
        case "tip":
          if (args.length === 3 && args[0].includes("#")) {
            const transaction = args[0].replace(/\D/g, "");
            const tip = Math.round(args[1] * 100);
            const terminal = args[2];

            this.$socket.emit("[TERMINAL] CONFIG", terminal, config => {
              if (config) {
                const { ip, port, sn, model } = config;
                this.terminal = this.getParser(model).default();
                this.terminal
                  .initial(
                    ip,
                    port,
                    sn,
                    this.$store.getters.station.alias,
                    terminal
                  )
                  .then(response => {
                    const device = this.terminal.check(response.data);
                    if (device.code === "000000") {
                      this.terminal
                        .adjust(0, transaction, tip)
                        .then(response => {
                          this.exitComponent();
                          const result = this.terminal.explainTransaction(
                            response.data
                          );
                          if (result.code === "000000") {
                            this.result = `Tip ${args[1].toFixed(
                              2
                            )} Entered Successful On ${terminal}`;
                          } else {
                            this.result = "Tip Adjust Failed";
                          }
                        });
                    } else {
                      this.result = "Terminal Not Ready.";
                    }
                  });
              } else {
                this.result = "No such terminal";
              }
            });
          } else {
            this.result = "command Error";
          }
          break;
        case "forceBatch":
          break;
        case "reload":
          if (arg === "order") {
            this.$socket.emit("[SYNC] ORDER_LIST");
            this.ban = false;
            this.init.resolve();
          }
          break;
        case "debug":
          Electron.remote.getCurrentWindow().toggleDevTools();
          this.ban = false;
          this.init.resolve();
          break;
        case "exit":
          this.$socket.emit("MAINT_REQUEST_UNBAN");
          this.ban = false;
          this.init.resolve();
          break;
        default:
      }
      this.code = "";
    },
    exit() {
      if (!this.ban) this.init.resolve();
    },
    getParser(model) {
      switch (model) {
        case "SP30":
        case "S80":
        case "S300":
          return require("../payment/parser/pax.js");
        case "NX2200":
          return require("../payment/parser/exadigm.js");
        default:
          return require("../payment/parser/pax.js");
      }
    }
  }
};
</script>

<style scoped>
.maintenance {
  position: absolute;
  left: 0;
  top: 0;
  width: 1024px;
  height: 768px;
  z-index: 99;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: not-allowed;
}

.result {
  display: block;
  position: absolute;
  top: 430px;
  color: #fff;
}

.banned {
  width: 575px;
  height: 350px;
  background: #fff;
  border-top: 2px solid #ff9800;
  text-align: center;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.banned i {
  color: #ffc107;
  margin: 25px 0 5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.banned h3 {
  font-size: 2em;
  color: #3c3c3c;
  margin: 5px 0;
}

.banned h5 {
  font-size: 1.05em;
  color: #666;
  font-weight: normal;
  margin-bottom: 10px;
}

.command input {
  width: 600px;
  border: none;
  border-radius: 6px;
  font-size: 4em;
}

svg {
  width: 0;
  height: 0;
}

.circle {
  filter: url(#goo);
  position: absolute;
  bottom: 50px;
  left: 304px;
}

.circle div {
  background: #03a9f4;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: -50% -50%;
  animation: circle 2.5s infinite cubic-bezier(0.57, 0, 0.52, 1);
}

.circle div:nth-child(1) {
  animation-delay: 0.25s;
}

.circle div:nth-child(2) {
  animation-delay: 0.5s;
}

.circle div:nth-child(3) {
  animation-delay: 0.75s;
}

.circle div:nth-child(4) {
  animation-delay: 1s;
}

.circle div:nth-child(5) {
  animation-delay: 1.25s;
}

@keyframes circle {
  50% {
    width: 25px;
    height: 25px;
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
