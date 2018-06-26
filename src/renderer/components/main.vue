<template>
  <div class="container">
    <dock-module></dock-module>
    <router-view></router-view>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import inputModule from "./component/inputer";
import coupon from "./menu/component/coupon";
import dialogModule from "./common/dialog";
import unlockModule from "./common/unlock";
import menuModule from "./dock/posMenu";
import dockModule from "./dock/dock";

export default {
  components: {
    dialogModule,
    unlockModule,
    inputModule,
    menuModule,
    dockModule,
    coupon
  },
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  created() {
    this.$bus.on("__THREAD__OPEN", this.openComponent);
  },
  beforeDestroy() {
    this.$bus.off("__THREAD__OPEN", this.openComponent);
  },
  computed: {
    ...mapGetters(["op"])
  },
  methods: {
    openComponent({ threadID, component, args }) {
      switch (component) {
        case "discount":
          new Promise((resolve, reject) => {
            this.componentData = Object.assign({}, { resolve, reject }, args);
            this.component = "inputModule";
          })
            .then(result => {
              this.$bus.emit("__THREAD__CLOSE", {
                result,
                component,
                threadID
              });
              this.exitComponent();
            })
            .catch(this.exitComponent);
          break;
        case "gratuity":
        case "delivery":
          new Promise((resolve, reject) => {
            this.componentData = Object.assign({}, { resolve, reject }, args);
            this.component = "inputModule";
          })
            .then(result => {
              this.$bus.emit("__THREAD__CLOSE", {
                result,
                component,
                threadID
              });
              this.exitComponent();
            })
            .catch(this.exitComponent);

          break;
        case "coupon":
          this.$socket.emit("[COUPON] LIST", coupons => {
            coupons.forEach(coupon =>
              Object.assign(coupon, { redeem: false, enable: true })
            );

            new Promise((resolve, reject) => {
              this.componentData = Object.assign(
                {},
                { resolve, reject, coupons },
                args
              );
              this.component = component;
            })
              .then(result => {
                this.$bus.emit("__THREAD__CLOSE", {
                  result,
                  component,
                  threadID
                });
                this.exitComponent();
              })
              .catch(this.exitComponent);
          });
          break;
        case "dockMenu":
          this.$open("menuModule", { args });
          break;
        case "dialog":
          this.$checkPermission("modify", "item")
            .then(() => {
              this.$dialog(args)
                .then(() => {
                  this.$bus.emit("__THREAD__CLOSE", {
                    result: true,
                    component,
                    threadID
                  });
                  this.exitComponent();
                })
                .catch(() => {
                  this.$bus.emit("__THREAD__CLOSE", {
                    result: false,
                    component,
                    threadID
                  });
                  this.exitComponent();
                });
            })
            .catch(() => {});

          break;
      }
    }
  }
};
</script>
