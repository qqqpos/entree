<template>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { ipcRenderer } from "electron";
import serialport from "serialport";
import Print from "../plugin/print";
import Magic from "wake_on_lan";
import Mac from "getmac";
import os from "os";

export default {
  data() {
    return {
      timeout: null
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
      this.setApp({
        date: today(),
        language,
        printer: true,
        database: true
      });
      window.appSocket = this.$socket;
      this.setDevice({ online: navigator.onLine });
      ipcRenderer.send("Loading", this.$t("initial.findHost"));
    },
    setEnvironment({
      config,
      menu,
      submenu,
      request,
      orders,
      table,
      template,
      reservations,
      sync
    }) {
      try {
        this.setConfig(config);
        this.setMenu(menu);
        this.setSubmenu(submenu);
        this.setRequest(request);
        ipcRenderer.send("Loading", this.$t("initial.applyConfiguration"));
        this.setTable(table);
        this.setTemplates(template);
        this.setReservation({ reservations, sync });
        this.setTodayOrder({ orders, sync });
        this.setLastSync(sync);
        this.setStationEnvironment()
          .then(this.initialized)
          .catch(this.registration);
      } catch (error) {
        this.$socket.emit("[SYS] LOG", {
          eventID: 9000,
          type: "failure",
          source: this.$options.name,
          cause: error,
          note:
            "Application was unable to start. It's probably because the database wasn't correctly setup."
        });
      }
    },
    setStationEnvironment() {
      return new Promise((use, register) => {
        Mac.getMac((error, mac) => {
          if (error || !mac) {
            ipcRenderer.send("Loading", this.$t("initial.hardwareIssue"));

            this.$log({
              eventID: 9001,
              type: "failure",
              event: `Station profile not found.\n\nError Message:\n${error.toString()}`
            });
          } else {
            const { username } = os.userInfo();

            this.$socket.emit(
              "[INITIAL] STATION",
              { mac, username },
              station => {
                station ? use(station) : register({ mac, username });
              }
            );
          }
        });
      });
    },
    initialized(data) {
      this.setStation(data);
      this.awakeStation();
      this.initialDevice();
      this.initialPrinter();

      const { alias, mac } = data;
      this.$socket.emit("[STATION] CONNECTED", { alias, mac });
      ipcRenderer.send("Initialized");
      this.$router.push("Login");
    },
    registration(data) {
      ipcRenderer.send("Initialized");
      this.$router.push({ name: "Station", params: { reg: data } });
    },
    awakeStation() {
      if (window.isServer) {
        ipcRenderer.send("Loading", this.$t("initial.awakeClients"));
        this.$socket.emit("[AWAKEN] STATIONS", data => {
          data && data.foreach(station => Magic.wake(station));
        });
      }
    },
    initialDevice() {
      try {
        this.station.callid.enable && this.initCallerId(this.station.callid);
        this.station.pole.enable &&
          this.initPoleDisplay(this.station.pole.port);
        this.station.scale.enable && this.initScale(this.station.scale.port);
        this.station.terminal && this.setDevice({ terminal: true });
      } catch (error) {
        this.$log({
          eventID: 9002,
          type: "failure",
          note: `Initial device failed. Please check device configuration.\n\nError Message:\n${error.toString()}`
        });
      }
    },
    initCallerId(opt) {
      const { command, port } = opt;
      this.setDevice({ callid: true });

      let telephone = new serialport(port, {
        autoOpen: false,
        parser: serialport.parsers.raw
      });

      telephone.open(err => {
        err
          ? this.setDevice({ callid: false })
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
                this.setDevice({ callid: false });
                break;
              case "OK":
                this.setDevice({ callid: true });
                break;
              default:
                this.setDevice({ callid: false });
            }
            break;
          default:
            let name = raw.find(i => i.indexOf("NAME") !== -1);
            name = name ? name.split("=")[1].replace(/[\W_]+/g, "") : "";

            let phone = raw
              .find(i => i.indexOf("NMBR") !== -1)
              .split("=")[1]
              .replace(/\D/g, "");
            this.phoneRing({ phone, name });
            break;
        }
      });
    },
    initPoleDisplay(port) {
      let poleDisplay = new serialport(port, { autoOpen: false });
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
      const config = this.config;
      const station = this.station;
      CLODOP
        ? (window.Printer = new Print(CLODOP, config, station))
        : setTimeout(
            function() {
              window.Printer = new Print(CLODOP, config, station);
            },
            20000,
            CLODOP,
            config,
            station
          );
    },
    ...mapActions([
      "setApp",
      "setMenu",
      "setTable",
      "phoneRing",
      "startTick",
      "setConfig",
      "setDevice",
      "setSubmenu",
      "setStation",
      "setRequest",
      "setLastSync",
      "setTemplates",
      "setTodayOrder",
      "setReservation"
    ])
  },
  sockets: {
    CONNECTED() {
      ipcRenderer.send("Loading", this.$t("initial.hostConnected"));
      this.$socket.emit("[INITIAL] POS");
      ipcRenderer.send("Loading", this.$t("initial.initialApplication"));
    },
    APP_RUNTIME_CONFIG(data) {
      ipcRenderer.send("Loading", this.$t("initial.loadConfiguration"));
      this.setEnvironment(data);
    }
  },
  computed: {
    ...mapGetters(["config", "station"])
  }
};
</script>