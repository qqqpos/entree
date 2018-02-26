<template>
  <section>
    <form>
      <data-input id="phone" label="dashboard.phone" v-model="customer.phone" :autoComplete="predict.phone" @focus="setInput" @fill="autoFill" @input="autoComplete"></data-input>
      <data-input id="extension" label="dashboard.extension" v-model="customer.extension" :autoComplete="predict.extension" @focus="setInput"></data-input>
      <data-input id="name" label="dashboard.name" v-model="customer.name" :autoComplete="predict.name" @focus="setInput"></data-input>
      <data-input id="address" label="dashboard.address" v-model="customer.address" :autoComplete="predict.address" :distance="customer.distance" :duration="customer.duration" @focus="setInput" class="address" @fill="autoAddress" @input="autoComplete"></data-input>
      <data-input id="city" label="dashboard.city" v-model="customer.city" :autoComplete="predict.city" @focus="setInput" @fill="autoCity"></data-input>
      <data-input id="note" label="dashboard.note" v-model="customer.note" @focus="setInput" class="note"></data-input>
    </form>
    <keyboard @input="input" @backspace="delChar" @cancel="cancelOrder" @create="createOrder" @clear="clearInput" @search="search"></keyboard>
    <div :is="component" :init="componentData"></div>
  </section>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import keyboard from "./keyboard";
import dialoger from "../common/dialoger";
import dataInput from "./component/dataInput";

export default {
  created() {
    this.resetAutoComplete();
  },
  mounted() {
    document.querySelector("input#phone").classList.add("active");
    document.querySelector("main.window").classList.add("moveUp");
    this.toggleKeyboard(true);
    this.customer.phone.length === 10 && this.anchor("address");
  },
  data() {
    return {
      componentData: null,
      component: null,
      predict: null,
      target: "phone",
      caret: 0,
      query: false
    };
  },
  methods: {
    setInput(field) {
      this.target = field.target;
      this.caret = field.caret;
      field.target === "phone" && this.getLastCall();
      this.toggleKeyboard(true);
      this.resetAutoComplete();
    },
    input(char) {
      this.autoComplete(this.validator(char));
      this.focus();
    },
    delChar() {
      let text = this.customer[this.target];
      this.customer[this.target] =
        text.substr(0, this.caret - 1) + text.substr(this.caret);
      this.caret = this.caret === 0 ? 0 : this.caret - 1;
      this.focus();
      this.autoComplete();
    },
    focus() {
      this.$nextTick(() => {
        let dom = document.querySelector("input.active");
        dom.focus();
        dom.setSelectionRange(this.caret, this.caret);
      });
    },
    validator(char) {
      let type = this.target;
      let value = this.customer[this.target];
      let length = value.length;
      let keyword = null;
      switch (type) {
        case "phone":
          if (isNumber(char)) {
            if (length === 0) {
              this.customer.phone = char;
              this.caret = 1;
            } else {
              let a = value.substr(0, this.caret);
              let b = value.substr(this.caret);
              this.customer.phone = a + char + b;
              this.caret++;
              keyword = this.customer.phone;
            }
          }
          break;
        case "address":
          if (length === 0) {
            this.customer.address = char;
            this.caret = 1;
          } else if (length < 40) {
            let a = value.substr(0, this.caret);
            let b = value.substr(this.caret);
            this.customer.address = a + char + b;
            this.caret++;
          }
          break;
        case "extension":
        case "name":
        case "city":
          if (length === 0) {
            this.customer[this.target] = char;
            this.caret = 1;
          } else if (length < 16) {
            let a = value.substr(0, this.caret);
            let b = value.substr(this.caret);
            this.customer[this.target] = a + char + b;
            this.caret++;
          }
          break;
        case "note":
          if (length === 0) {
            this.customer[this.target] = char;
            this.caret = 1;
          } else if (length < 50) {
            let a = value.substr(0, this.caret);
            let b = value.substr(this.caret);
            this.customer[this.target] = a + char + b;
            this.caret++;
          }
          break;
      }
      return keyword;
    },
    getLastCall() {
      this.customer.phone.length === 0 && this.autoComplete("@");
    },
    autoComplete(keyword) {
      keyword = keyword ? keyword : this.customer[this.target];
      if (this.target === "address")
        keyword = this.customer.address
          .replace(/ +/g, " ")
          .trim()
          .split(" ")
          .slice(1)
          .join(" ");
      if (!keyword) return;
      this.$socket.emit("[SEARCH] AUTO_COMPLETE", {
        type: this.target,
        keyword
      });
    },
    autoFill(data) {
      this.setCustomer(data);
      this.resetAutoComplete();
      this.anchor("address");
      if (data.address && (!data.duration || !data.distance)) {
        this.calculateDistance({
          address: data.address,
          city: data.city || this.store.city
        });
      }
    },
    autoAddress(data) {
      let address =
        this.customer.address.replace(/ +/g, " ").split(" ")[0] +
        " " +
        data.street;
      this.setCustomer({ address, city: data.city });
      this.resetAutoComplete();
      this.calculateDistance({ address, city: data.city });
      this.anchor("address");
      this.highlight([]);
    },
    autoCity(city) {
      this.setCustomer({ city });
      this.resetAutoComplete();
    },
    resetAutoComplete() {
      this.predict = {
        phone: null,
        extension: null,
        name: null,
        address: null,
        city: null
      };
    },
    anchor(target) {
      this.$nextTick(() => {
        let dom = document.querySelector("input.active");
        dom && dom.classList.remove("active");
        dom = document.querySelector("input#" + target);
        dom.classList.add("active");
        dom.focus();
        this.target = target;
        this.caret = this.customer[target].length;
        dom.setSelectionRange(this.caret, this.caret);
      });
    },
    formatAddress(data) {
      let { address, city, state, zipCode } = data;

      address = this.$options.filters
        .formatAddress(address)
        .split(" ")
        .join("+");

      city = city.split(" ").join("+");
      state = state || this.store.state;
      zipCode = zipCode ? `+${zipCode}` : "";

      return `${address},${city}+${state}${zipCode}`;
    },
    calculateDistance(data) {
      this.getCoordinate(data);
      const { enable, api, coordinate } = this.store.matrix;
      if (!enable || !api) return;

      let { address, city, state, zipCode } = this.store;
      const origin = this.formatAddress({ address, city, state, zipCode });
      const destination = this.formatAddress({
        address: data.address,
        city: data.city
      });

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${api}&language=en&units=imperial`;

      this.$socket.emit("[GOOGLE] ADDRESS", url, raw => {
        let result = JSON.parse(raw);

        if (result.status === "OK") {
          let addresses = result.destination_addresses;
          if (addresses.length > 1) {
            let predict = [];
            addresses.forEach(address => {
              let street = address.split(",")[0].toUpperCase();
              let city = address
                .split(",")[1]
                .trim()
                .toUpperCase();
              predict.push({ street, city });
            });
            this.predict.address = predict;
          } else if (addresses.length === 1) {
            let address, city, note;
            let addressArray = addresses[0].split(",");

            if (addressArray.length === 5) {
              address = addressArray[1].trim().toUpperCase();
              city = addressArray[2].trim().toUpperCase();
              note = addressArray[0].trim();
            } else {
              address = addressArray[0].trim().toUpperCase();
              city = addressArray[1].trim().toUpperCase();
            }

            const matrix = result.rows[0].elements[0];
            const distance = matrix.distance.text;
            const duration = matrix.duration.text;

            if (address.indexOf(this.customer.address.trim()) !== -1) {
              this.setCustomer({ address, city, distance, duration });
              note && this.setCustomer({ note });
            } else {
              this.$dialog({
                title: "dialog.addressMismatch",
                msg: ["dialog.replaceAddress", this.customer.address, address]
              })
                .then(() => {
                  this.setCustomer({ address, city, distance, duration });
                  note && this.setCustomer({ note });
                  this.$q();
                })
                .catch(() => this.$q());
            }
          }
        }
      });
    },
    getCoordinate({ address, city }) {
      const street = this.formatAddress({ address, city });
      const { enable, api, coordinate } = this.store.matrix;
      if (!enable || !api || !coordinate) return;

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${street}&key=${api}&language=en&units=imperial`;

      fetch(url)
        .then(response => response.json())
        .then(result => {
          if (result.status === "OK") {
            const { geometry } = result.results[0];
            const store = coordinate.split(",");
            const { lat, lng } = geometry.location;
            const direction = this.getOrientation([lat, lng], store);

            this.setCustomer({ direction });
          }
        });
    },
    getOrientation(end, start) {
      const x1 = end[0];
      const y1 = end[1];
      const x2 = start[0];
      const y2 = start[1];
      const getAtan2 = (y, x) => Math.atan2(y, x);
      const radians = getAtan2(y1 - y2, x1 - x2);
      const compassReading = radians * (180 / Math.PI);
      const direction = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
      let index = Math.round(compassReading / 45);

      if (index < 0) {
        index = index + 8;
      }

      return direction[index];
    },
    highlight(list) {
      const p = this.customer.address
        .replace(/ +/g, " ")
        .trim()
        .split(" ")
        .slice(1)
        .join(" ").length;
      const next = list
        .map(address => address.street[p] && address.street[p])
        .filter((v, i, s) => s.indexOf(v) === i);
      const doms = document.querySelectorAll("div.next");
      doms.forEach(dom => dom.classList.remove("next"));

      next.forEach(key => {
        if (key) {
          key = key.toUpperCase();
          document.getElementById(key) &&
            document.getElementById(key).classList.add("next");
        }
      });
    },
    cancelOrder() {
      this.resetDashboard();
      this.resetAll();
      this.setApp({ opLastAction: new Date(), mode: "create" });
      this.$router.push({ path: "/main" });
    },
    createOrder() {
      //set mode to create
      if (this.ticket.type === "DELIVERY" && this.customer.phone.length !== 10)
        return;

      this.$socket.emit("[CUSTOMER] UPDATE", this.customer, profile => {
        this.emptyCustomerInfo(profile);
        this.$router.push({ path: "/main/menu" });
      });
    },
    clearInput() {
      this.customer[this.target] = "";
      this.target === "address" &&
        this.setCustomer({
          direction: "",
          distance: "",
          duration: "",
          city: ""
        });
      this.query = false;
    },
    search() {
      if (!this.customer.address) return;
      if (this.query) return;
      this.calculateDistance({
        address: this.customer.address,
        city: this.customer.city || this.store.city
      });
      this.query = true;
    },
    ...mapActions([
      "emptyCustomerInfo",
      "toggleKeyboard",
      "resetDashboard",
      "setCustomer",
      "resetAll",
      "setApp"
    ])
  },
  beforeDestroy() {
    let dom = document.querySelector("main.window");
    dom && dom.classList.remove("moveUp");
  },
  computed: {
    ...mapGetters(["store", "customer", "ticket"])
  },
  components: {
    keyboard,
    dataInput,
    dialoger
  },
  filters: {
    formatAddress(address) {
      let reg = /\d+(\s+\w+){1,}\s+(?:st(?:\.|reet)?|dr(?:\.|ive)?|pl(?:\.|ace)?|ave(?:\.|nue)?|rd|road|lane|drive|way|court|plaza|square|run|parkway|point|pike|square|driveway|trace|park|terrace|blvd|broadway)/i;
      let match = address.match(reg);
      return match ? match[0] : address;
    }
  },
  sockets: {
    AUTO_COMPLETE(data) {
      this.predict[data.type] = data.results;
      if (data.type === "phone" && this.customer.phone.length === 10) {
        this.anchor("address");
        let profile = data.results.find(
          predict => predict.phone === this.customer.phone
        );
        profile && this.setCustomer(profile);
        this.resetAutoComplete();
      }
      data.type === "address" && this.highlight(data.results);
    }
  }
};
</script>

<style scoped>
form {
  width: 608px;
  padding: 5px 20px 15px;
}
</style>