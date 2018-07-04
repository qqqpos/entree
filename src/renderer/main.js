import Vue from "vue";
import Ip from "ip";
import Net from "net";
import moment from "moment";
import VueTouch from "vue-touch";
import Electron from "vue-electron";
import VueSocketio from "vue-socket.io";
import AmCharts from 'amcharts3'
import AmExport from "amcharts3/amcharts/plugins/export"
import "amcharts3/amcharts/plugins/export/export.css"
import AmSerial from 'amcharts3/amcharts/serial'
import AmPie from "amcharts3/amcharts/pie"
import App from "./App";
import router from "./router";
import i18n from "./plugin/dict";
import util from "./plugin/util";
import VueBus from "./plugin/bus";
import Trend from "vuetrend";
import Bars from "vuebars";

Vue.use(Electron);
Vue.use(VueBus);
Vue.use(Trend);
Vue.use(Bars);
Vue.use(VueTouch, { name: "v-touch" });
Vue.use(util);
Vue.use(i18n);

Vue.config.debug = true;
window.moment = moment;

Vue.directive("mask", function (el, binding) {
  if (binding.expression) {
    // console.log(binding.expression)
    // const mask = binding.expression;
    // const value = el.value.split("");

    // let index = 0;

    // el.value = mask.split("").map((char, i) => {
    //   if (char === '#') {
    //     for (let i = 0; i < value.length; i++) {
    //       if (isNumber(value[i])) {
    //         index = i + 1;
    //         return value[i]
    //       }
    //     }
    //   } else {
    //     return char
    //   }
    // }).join("");

    // dispatch();
  }

  if (binding.modifiers.card) {
    const card = el.value.replace(/\s/, "");
    const group = card.match(/(\d{1,4})/g);
    if (group) {
      verify(card);

      el.value = group.slice(0, 4).join(" ");

      dispatch();
    }
  }

  if (binding.modifiers.date) {
    const date = el.value.replace(/D+/g, "");
    const group = date.match(/(\d{1,2})/g);
    if (group) {
      el.value = group.slice(0, 2).join("/");

      dispatch();

      if (date.length === 4 && binding.modifiers.check) {
        const [YY, MM] = moment().format("YY,MM").split(",");
        const [mm, yy] = group;

        (YY + MM < yy + mm) ? el.classList.remove("invalid") : el.classList.add("invalid");
      } else {
        el.classList.remove("invalid")
      }
    }
  }

  function verify(number) {
    if (number.length >= 15) {
      /**
       * Luhn algorithm in JavaScript: validate credit card number supplied as string of numbers
       * @author ShirtlessKirk. Copyright (c) 2012.
       * @license WTFPL (http://www.wtfpl.net/txt/copying)
       */
      const valid = (function (arr) {
        return function (card) {
          var
            len = card.length,
            bit = 1,
            sum = 0,
            val;

          while (len) {
            val = parseInt(card.charAt(--len), 10);
            sum += (bit ^= 1) ? arr[val] : val;
          }

          return sum && sum % 10 === 0;
        };
      }([0, 2, 4, 6, 8, 1, 3, 5, 7, 9]))(number);

      el.dataset.valid = valid;

      if (binding.modifiers.check)
        valid ? el.classList.remove("invalid") : el.classList.add("invalid");

    } else {
      el.classList.remove("invalid");
    }
  }


  function dispatch() {
    setTimeout(() => {
      const e = document.createEvent("HTMLEvents");
      e.initEvent("input", true, true);
      el.dispatchEvent(e);
    }, 0)
  }
})

Vue.directive("outer-click", {
  bind: function (el, binding, vNode) {
    if (typeof binding.value !== "function") {
      const component = vNode.context.name;
      let warn = `[Vue-outer-click:] provided expression '${
        binding.expression
        }' is not a function.`;
      if (component) {
        warn += `Found in component '${component}'`;
      }
      console.warn(warn);
    }
    const bubble = binding.modifiers.bubble;
    const handler = e => {
      if (bubble || (!el.contains(e.target) && el !== e.target)) {
        binding.value(e);
      }
    };
    el.__vueOuterClick__ = handler;
    document.addEventListener("click", handler);
  },

  unbind: function (el, binding) {
    document.removeEventListener("click", el.__vueOuterClick__);
    el.__vueOuterClick__ = null;
  }
});

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

  let start = 0;

  while (start <= 255) {
    const target = ip + start;
    (function (target) {
      const scanner = Net.connect(
        {
          host: target,
          port: 8888
        },
        () => {
          scanner.destroy();
          resolve(target);
        }
      );

      setTimeout(() => {
        scanner.destroy();
      }, 2000);
      scanner.on("error", () => scanner.destroy());
    })(target);
    start++;
  }
}).then(ip => {
  Vue.use(VueSocketio, `http://${ip}:8888`);

  let printScript = document.createElement("script");
  printScript.src = `http://${ip}:8000/CLodopfuncs.js?priority=1`;
  let head =
    document.head ||
    document.getElementsByTagName("head")[0] ||
    document.documentElement;
  head.insertBefore(printScript, head.firstChild);

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
});
