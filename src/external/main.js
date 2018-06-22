import Vue from "vue";
import Electron from "vue-electron";

import App from "./App";
import router from "./router";

Vue.use(Electron);

new Vue({
    components: { App },
    router,
    template: "<App/>"
}).$mount("#app");