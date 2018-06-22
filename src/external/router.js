import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: "/",
            name: "load",
            component: require("./components/load")
        },
        {
            path: "idle",
            name: "idle",
            component: require("./components/idle")
        },
        {
            path: "order",
            name: "order",
            component: require("./components/order")
        },
        {
            path: "*",
            redirect: "/"
        }
    ]
})