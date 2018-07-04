<template>
    <div class="map">
        <img :src="url" @load="loading = false" @error="exception">
        <div :is="component" :init="componentData" :display="loading"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

import loader from "../common/loader";
import dialogModule from "../common/dialog";

export default {
  components: { loader, dialogModule },
  computed: {
    ...mapGetters(["store", "customer"])
  },
  data() {
    return {
      componentData: null,
      component: null,
      loading: true,
      guide: [],
      url: null
    };
  },
  created() {
    this.getPolyline();
  },
  mounted() {
    this.$open("loader");
  },
  methods: {
    getPolyline() {
      const { matrix, zipCode } = this.store;
      const { api } = matrix;

      if (!api) {
        const prompt = {
          title: "dialog.cantExecute",
          msg: "dialog.apiKeyRequired",
          buttons: [{ text: "button.confirm", fn: "resovle" }]
        };

        this.$dialog(prompt).then(this.exitComponent);
        return;
      }

      const origin = this.parseAddress(
        this.store.address,
        this.store.city,
        this.store.zipCode
      );
      const destination = this.parseAddress(
        this.customer.address,
        this.customer.city || this.store.city,
        this.customer.zipCode || this.store.zipCode
      );

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${api}`;

      this.$socket.emit("[GOOGLE] ADDRESS", url, raw => {
        const result = JSON.parse(raw);
        const polyline = result.routes[0].overview_polyline.points;

        this.guide = result.routes[0].legs[0].steps;
        this.url = `https://maps.googleapis.com/maps/api/staticmap?scale=1&size=650x250&maptype=roadmap&format=png&path=enc:${polyline}&key=${api}`;
      });
    },
    parseAddress(address, city, zipCode) {
      address = util
        .formatAddress(address)
        .split(" ")
        .join("+");
      city = city.split(" ").join("+");
      zipCode = zipCode ? `+${zipCode}` : "";

      return `${address},${city}+${this.store.state}${zipCode}`;
    },
    exception() {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.map {
  position: relative;
  height: 272px;
}
img {
  margin: 10px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}
</style>