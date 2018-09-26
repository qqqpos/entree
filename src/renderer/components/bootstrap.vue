<template>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Serialport from "serialport";
import Print from "../plugin/print";
import Magic from "wake_on_lan";
import Mac from "getmac";
import os from "os";

export default {
  data() {
    return {
      timeout: null,
      connected: false
    };
  },
  created() {
    this.startTick();
    this.initialEnvironment();
  },
  methods: {
    initialEnvironment() {
      const language = navigator.language === "zh-CN" ? "zhCN" : "usEN";
      moment.locale(language === "usEN" ? "en" : "zh-cn");
      this.$setLanguage(language);
      this.setApp({ date: today(), language, printer: true, database: true });
      window.appSocket = this.$socket;
      // window.addEventListener("online", this.setDevice({ online: true }));
      // window.addEventListener("offline", this.setDevice({ online: false }));
      this.setDevice({ online: navigator.onLine });

      this.progress("findHost");
      this.$socket.connected && this.connectionEstablished();
    },
    setStationEnvironment() {
      return new Promise((use, register) => {
        Mac.getMac((error, mac) => {
          if (error || !mac) {
            this.progress("hardwareIssue");
          } else {
            const { username } = os.userInfo();

            this.$socket.emit(
              "[STATION] INITIAL",
              { mac, username },
              station => {
                station ? use(station) : register({ mac, username });
              }
            );
          }
        });
      });
    },
    connectionEstablished() {
      if (this.connected) return;

      this.progress("hostConnected");
      this.$socket.emit("[INITIAL] POS");
      this.progress("initialApplication");
      this.connected = true;
    },
    initialized(data) {
      const { alias, mac } = data;
      this.setStation(data);
      this.awakeStation();
      this.initialDevice();
      this.initialPrinter()
        .then(() => {
          this.$socket.emit("[STATION] CONNECTED", { alias, mac });
          this.$electron.ipcRenderer.send("Initialized");
          this.$router.push("Login");
        })
        .catch(() => this.progress("printerServerError"));
    },
    registration(data) {
      this.$electron.ipcRenderer.send("Initialized");
      this.$router.push({ name: "Station", params: { reg: data } });
    },
    setExternalDisplay(config) {
      if (!config.CFD) return;

      config.CFD.enable &&
        this.$electron.ipcRenderer.send(
          "External::playlist",
          config.CFD.playlist
        );
    },
    awakeStation() {
      if (window.isServer) {
        this.progress("awakenStations");
        this.$socket.emit(
          "[STATION] AWAKE_LIST",
          data => data && data.foreach(station => Magic.wake(station))
        );
      }
    },
    initialDevice() {
      try {
        const {
          scale = {},
          callerID = {},
          terminal = "",
          customerDisplay = {}
        } = this.station;

        callerID.enable && this.initCallerID(callerID.devices);
        terminal && this.setDevice({ terminal: true });
        scale.enable && this.initScale(scale.port);
        this.initCustomerDisplay(customerDisplay);
      } catch (error) {
        this.$log(
          `Initial device failed. Please check station device configuration.\nError Message:\n${error.toString()}`,
          "error"
        );
      }
    },
    initCallerID(devices) {
      devices.forEach(({ line, port, command, forward }) => {
        const telephone = new Serialport(port, {
          autoOpen: false,
          parser: Serialport.parsers.raw
        });

        telephone.open(err => {
          err
            ? this.setDevice({ callerID: 0 })
            : telephone.write(command + "\r");
        });

        telephone.on("data", data => {
          const raw = data.toString().split("\n");

          switch (raw.length) {
            case 3:
              const type = raw[1].replace(/\W/g, "");
              switch (type) {
                case "RING":
                  clearTimeout(this.timeout);
                  this.timeout = setTimeout(() => {
                    this.phoneRing(null);
                  }, 1.2e4);
                  break;
                case "ERROR":
                  this.setDevice({ callerID: 0 });
                  break;
                case "OK":
                  this.setDevice({ callerID: 1 });
                  break;
                default:
                  this.setDevice({ callerID: 0 });
              }
              break;
            default:
              let name = raw.find(i => i.indexOf("NAME") !== -1);
              name = name
                ? name
                    .split("=")[1]
                    .replace(/[\r\n]/g, "")
                    .trim()
                : "";

              const hasInvalidString = [
                "AVAILABLE",
                "UNAVAILA",
                "WIRELESS",
                "CELL PHONE",
                "UNKNOWN"
              ].some(verb => name.includes(verb));

              if (hasInvalidString) name = "";

              let phone = raw.find(i => i.indexOf("NMBR") !== -1);
              phone = phone ? phone.split("=")[1].replace(/\D/g, "") : null;
              phone && this.phoneRing({ line, forward, phone, name });
              break;
          }
        });
      });
    },
    initCustomerDisplay({ poleDisplay = {}, ledDisplay = {} }) {
      poleDisplay.enable && this.initPoleDisplay(poleDisplay.port);
      if (ledDisplay.enable) {
        const { gallery = "", duration = 5 } = ledDisplay;
        this.$electron.ipcRenderer.send("External::config", {
          gallery,
          duration
        });
      }
    },
    initPoleDisplay(port) {
      const poleDisplay = new serialport(port, { autoOpen: false });

      poleDisplay.open(err => {
        if (err) {
          this.setDevice({ poleDisplay: false });
        } else {
          poleDisplay.write("\f");
          poleDisplay.write(line("United POS", "[888] 299-0524"));
          this.setDevice({ poleDisplay: true });
          window.poleDisplay = poleDisplay;
        }
      });
    },
    initScale(port) {
      // const SerialPort = require('serialport');
      // const Delimiter = SerialPort.parsers.Delimiter;
      // const port = new SerialPort('/dev/tty-usbserial1');
      // const parser = port.pipe(new Delimiter({ delimiter: Buffer.from('EOL') }));
      // parser.on('data', console.log);
    },
    initialPrinter() {
      this.progress("connectPrinter");
      const { config, station } = this;

      return new Promise((next, stop) => {
        let interval = null;

        if (window.CLODOP) {
          window.Printer = new Print(CLODOP, config, station);
          // reload when server printer changes
          CLODOP.On_Broadcast = event => {
            event.indexOf("PRINTER_CHANGED") !== -1 &&
              this.reloadPrinterScript(CLODOP.strHostURI);
          };
          CLODOP.On_Broadcast_Remain = true;
          next();
        } else {
          interval = setInterval(() => {
            if (window.CLODOP) {
              window.Printer = new Print(CLODOP, config, station);
              CLODOP.On_Broadcast = event => {
                event.indexOf("PRINTER_CHANGED") !== -1 &&
                  reloadPrinterScript(CLODOP.strHostURI);
              };
              CLODOP.On_Broadcast_Remain = true;
              clearInterval(interval);
              next();
            }
          }, 5000);
        }
      });
    },
    reloadPrinterScript(url) {
      const { config, station } = this;

      document.head.removeChild(document.getElementById("printScript"));

      const printScript = document.createElement("script");
      printScript.id = "printScript";
      printScript.type = "text/javascript";

      printScript.onload = () => {
        CLODOP.On_Broadcast = event => {
          event.indexOf("PRINTER_CHANGED") !== -1 &&
            this.reloadPrinterScript(CLODOP.strHostURI);
        };
        CLODOP.On_Broadcast_Remain = true;

        window.Printer = new Print(CLODOP, config, station);
      };

      printScript.onerror = () =>
        setTimeout(() => this.reloadPrinterScript(url), 5000);

      printScript.src = `${url}/CLodopfuncs.js?priority=1`;
      document.getElementsByTagName("head")[0].appendChild(printScript);
    },
    progress(text) {
      this.$electron.ipcRenderer.send("Loading", this.$t(`initial.${text}`));
    },
    ...mapActions([
      "setApp",
      "phoneRing",
      "startTick",
      "setDevice",
      "setStation",
      "setAppEnvironment"
    ])
  },
  sockets: {
    CONNECTED() {
      this.connectionEstablished();
    },
    SETUP_APP_RUNTIME(data) {
      this.progress("loadConfiguration");
      this.setAppEnvironment(data);
      this.progress("applyConfiguration");
      this.setStationEnvironment()
        .then(this.initialized)
        .catch(this.registration);
    }
  },
  computed: {
    ...mapGetters(["config", "station"])
  }
};
</script>