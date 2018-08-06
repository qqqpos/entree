import Vue from "vue";
import Ip from "ip";
import Net from "net";
import moment from "moment";
import VueTouch from "vue-touch";
import Electron from "vue-electron";
import VueSocketio from "vue-socket.io";
import { Mask, OuterClick } from "./plugin/directive"

import AmCharts from 'amcharts3'
import AmExport from "amcharts3/amcharts/plugins/export"
import "amcharts3/amcharts/plugins/export/export.css"
import AmSerial from 'amcharts3/amcharts/serial'
import AmRadar from "amcharts3/amcharts/radar"
import AmPie from "amcharts3/amcharts/pie"

import App from "./App";
import Bars from "vuebars";
import Trend from "vuetrend";
import router from "./router";
import i18n from "./plugin/dict";
import util from "./plugin/util";
import VueBus from "./plugin/bus";


Vue.use(VueTouch, { name: "v-touch" });
Vue.use(Electron);
Vue.use(VueBus);
Vue.use(Trend);
Vue.use(Bars);
Vue.use(util);
Vue.use(i18n);

Vue.directive('mask', Mask);
Vue.directive('outer-click', OuterClick);

Vue.config.debug = true;
window.moment = moment;
window.ObjectId = require("bson-objectid");

//change moment default text
moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "few sec",
    ss: "%d sec",
    m: "a min",
    mm: "%d mins",
    h: "an hr",
    hh: "%d hrs",
    d: "a day",
    dd: "%d days",
    M: "a mnth",
    MM: "%d mnths",
    y: "a yr",
    yy: "%d yrs"
  }
});

const ip =
  Ip.address()
    .split(".")
    .splice(0, 3)
    .join(".") + ".";

const { ipcRenderer } = require("electron");

new Promise((resolve, reject) => {
  const args = require("electron").remote.process.argv.slice(1);

  if (process.env.NODE_ENV === "development") {
    resolve("127.0.0.1");
    return;
  }
  if (args.includes("server")) {
    window.isServer = true;
    resolve("127.0.0.1");
    return;
  }
  let host = args.indexOf("host");

  if (host !== -1) {
    resolve(args[++host]);
    return;
  }

  const client = require("dgram").createSocket("udp4");
  const secret = Buffer.from("Entree POS");
  client.bind(() => client.setBroadcast(true));
  client.send(secret, 15666, '255.255.255.255', (error) => error && reject(error));

  client.on('message', (msg, server) =>
    msg.toString() === "Hello Entree POS" && resolve(server.address)
  );
}).then(async (ip) => {
  ipcRenderer.send("Loading", `Connecting to server: ${ip}`);
  Vue.use(VueSocketio, `http://${ip}:8888`);

  await connectPrinter(ip);

  Vue.filter("moment", (time, regEx) => time ? moment(Number(time)).format(regEx) : "");
  Vue.filter("decimal", value => isNumber(value) ? parseFloat(value).toFixed(2) : value);
  Vue.filter("fromNow", (time, pass) => time ? moment(Number(time)).fromNow(pass) : "");
  Vue.filter("toNow", (time, pass) => time ? moment(Number(time)).toNow(pass) : "");

  Vue.filter(
    "phone",
    number =>
      number && number.length === 10
        ? number.replace(/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "($1) $2-$3")
        : number
  );
  Vue.filter(
    "card",
    number =>
      number
        ? number.replace(
          /^\D?(\d{4})\D?(\d{4})\D?(\d{4})\D?(\d{4})/,
          "$1 $2 $3 $4"
        )
        : number
  );

  Vue.filter("tel", phone => {
    if (!phone) return "";

    switch (phone.length) {
      case 10:
        return phone.replace(
          /^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/,
          "($1) $2-$3"
        );
      case 0:
        return "PRIVATE NUMBER";
      default:
        return phone;
    }
  });

  new Vue({
    components: { App },
    router,
    template: "<App/>"
  }).$mount("#app");
}).catch(() =>
  ipcRenderer.send("Loading", "Error: Server is offline")
);


function connectPrinter(ip) {
  return new Promise((resolve, reject) => {
    // failed when attempt 50 times
    let attemptCount = 0;

    const loadScript = (remove) => {
      remove && document.head.removeChild(document.getElementById("printScript"));

      const printScript = document.createElement("script");
      printScript.id = "printScript";
      printScript.type = "text/javascript";

      printScript.onload = () => resolve();

      printScript.onerror = function () {
        attemptCount < 50 ? setTimeout(() => {
          attemptCount++;
          loadScript(true);
        }, 5000) : reject()
      }

      printScript.src = `http://${ip}:8000/CLodopfuncs.js?priority=1`;
      document.getElementsByTagName('head')[0].appendChild(printScript);
    }

    loadScript(false);
  })
}
