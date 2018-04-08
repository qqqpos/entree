<template>
  <main :class="{form:keyboard}">
    <switch-type :type.sync="type" @change="setType"></switch-type>
    <header>
      <i class="fa fa-user-circle avatar"></i>
      <div>
        <span>{{$t(order.source === 'POS' ? 'title.customerProfile' : 'title.ticketProfile')}}</span>
      </div>
      <div class="f1">
        <div class="flags" v-if="flags.length">
          <span class="alert">{{$t('text.beAdvised')}}</span>
        <ul>
          <li v-for="(flag,index) in flags" :key="index" :title="stringify(flag.logs)">
            <span>{{$t('reason.'+flag.text)}} {{$t('text.times',flag.count)}}</span>
          </li>
        </ul>
        </div>
      </div>
      <div class="edit" v-show="status.exist">
        <button @click="editInvoice" :disabled="!status.editable">{{$t('button.editInvoice')}}</button>
      </div>
      <i class="fa fa-times cancel" @click="cancel"></i>
    </header>
    <router-view @focus="setFocus" @query="search"></router-view>
    <page-tab></page-tab>
    <div :is="component" :init="componentData"></div>
    <keyboard :display="keyboard" @input="input" @cancel="cancel" @reset="reset" @backspace="backspace" @create="create" @search="search"></keyboard>
  </main>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import unlock from "../common/unlock";
import dialoger from "../common/dialoger";
import pageTab from "./component/pageTab";
import keyboard from "./component/keyboard";
import switchType from "./component/switchType";

export default {
  components: { switchType, keyboard, dialoger, pageTab, unlock },
  computed: {
    checkOrder() {},
    ...mapGetters([
      "op",
      "app",
      "order",
      "store",
      "ticket",
      "customer",
      "history"
    ])
  },
  data() {
    return {
      type: null,
      caret: 0,
      flags: [],
      entry: "phone",
      keyboard: true,
      componentData: null,
      component: null,
      status: {
        exist: false,
        editable: false
      }
    };
  },
  created() {
    this.type = this.app.newTicket ? this.ticket.type : this.order.type;
  },
  mounted() {},
  methods: {
    setType(type) {
      this.type = type;
      this.setTicket({ type });
    },
    setFocus(entry) {
      this.entry = entry;

      setTimeout(() => {
        this.caret = document.querySelector(
          ".wrap.active input"
        ).selectionStart;
      });
    },
    checkIfOrderToday() {
      this.$socket.emit("[CUSTOMER] INTEGRITY", this.customer._id, flags => {
        this.flags = flags;
      });

      const ticket = this.history.find(
        t => t.customer._id === this.customer._id
      );

      if (ticket) {
        this.status = {
          exist: true,
          editable: !ticket.settled && ticket.status === 1
        };
      }
    },
    input(char) {
      const value = this.customer[this.entry];

      this.customer[this.entry] =
        value.substr(0, this.caret) + char + value.substr(this.caret);
      this.caret++;

      this.$nextTick(() => {
        document
          .querySelector(".wrap.active input")
          .setSelectionRange(this.caret, this.caret);
      });
    },
    reset() {
      switch (this.entry) {
        case "phone":
          this.resetCustomer();
          break;
        case "address":
          this.setCustomer({
            address: "",
            city: "",
            duration: "",
            distance: "",
            direction: ""
          });
          break;
        default:
          this.customer[this.entry] = "";
      }
      this.caret = 0;
    },
    backspace() {
      const value = this.customer[this.entry];

      this.customer[this.entry] =
        value.substr(0, this.caret - 1) + value.substr(this.caret);
      this.caret = this.caret !== 0 ? this.caret - 1 : 0;

      this.$nextTick(() => {
        document
          .querySelector(".wrap.active input")
          .setSelectionRange(this.caret, this.caret);
      });
    },
    cancel() {
      this.resetMenu();
      this.resetCustomer();
      this.$router.push({ path: "/main" });
    },
    create() {
      Array.isArray(this.customer.favorite) &&
        this.customer.favorite.length &&
        this.setFavorites(this.customer.favorite);
      this.$socket.emit("[CUSTOMER] UPDATE", this.customer, profile => {
        this.emptyCustomerInfo(profile);
        this.setOrder({ type: this.ticket.type });
        this.$router.push({ path: "/main/menu" });
      });
    },
    async search() {
      this.$bus.emit("GOOGLE_ADDRESS_QUERY", true);

      const address = util.formatAddress(this.customer.address);
      const city = this.customer.city || this.store.city;
      const zipCode = this.customer.zipCode || this.store.zipCode;
      const { enable, api, coordinate } = this.store.matrix;

      if (!enable || !api || !address) {
        this.$bus.emit("GOOGLE_ADDRESS_QUERY", false);
        return;
      }

      try {
        await this.calculateDistance({ address, city, zipCode });
        await this.getCoordinate({ address, city });
        this.$bus.emit("GOOGLE_ADDRESS_QUERY", false);
      } catch (e) {
        console.log(e);
        this.$bus.emit("GOOGLE_ADDRESS_QUERY", false);
      }
    },
    parseAddress({ address, city, zipCode }) {
      address = util
        .formatAddress(address)
        .split(" ")
        .join("+");
      city = city.split(" ").join("+");
      zipCode = zipCode ? `+${zipCode}` : "";

      return `${address},${city}+${this.store.state}${zipCode}`;
    },
    calculateDistance({ address, city, zipCode }) {
      return new Promise((next, stop) => {
        const origin = this.parseAddress({
          address: this.store.address,
          city: this.store.city,
          zipCode: this.store.zipCode
        });

        const destination = this.parseAddress({ address, city, zipCode });
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${
          this.store.matrix.api
        }&language=en&units=imperial`;

        this.$socket.emit("[GOOGLE] ADDRESS", url, raw => {
          const result = JSON.parse(raw);

          if (result.status === "OK") {
            let addresses = result.destination_addresses;

            if (addresses.length > 1) {
            } else if (addresses.length === 1) {
              let address, city, zipCode, note;
              let addressArray = addresses[0].split(",");

              if (addressArray.length === 5) {
                //has location name information
                address = addressArray[1].trim().toUpperCase();
                city = addressArray[2].trim().toUpperCase();
                zipCode = addressArray[3].replace(/\D/g, "");
                note = address[0].trim();
              } else {
                //regular residential address
                address = addressArray[0].trim().toUpperCase();
                city = addressArray[1].trim().toUpperCase();
                zipCode = addressArray[2].replace(/\D/g, "");
              }

              const matrix = result.rows[0].elements[0];
              const distance = matrix.distance.text;
              const duration = matrix.duration.text;

              if (address.indexOf(this.customer.address.trim()) !== -1) {
                this.setCustomer({
                  address,
                  city,
                  distance,
                  duration,
                  zipCode
                });
                note && this.setCustomer({ note });
                next();
              } else {
                const prompt = {
                  title: "dialog.addressMismatch",
                  msg: ["dialog.replaceAddress", this.customer.address, address]
                };

                this.$dialog(prompt)
                  .then(() => {
                    this.setCustomer({
                      address,
                      city,
                      distance,
                      duration,
                      zipCode
                    });
                    note && this.setCustomer({ note });
                    this.$q();
                    next();
                  })
                  .catch(() => this.$q());
              }
            } else {
            }
          } else {
            stop("No response from Google Matrix server");
          }
        });
      });
    },
    getCoordinate({ address, city }) {
      return new Promise((next, stop) => {
        const place = this.parseAddress({ address, city });
        const { api, coordinate } = this.store.matrix;

        if (!coordinate) {
          stop("The store coordinate parameter is missing.");
          return;
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${place}&key=${api}&language=en&units=imperial`;

        fetch(url)
          .then(response => response.json())
          .then(result => {
            if (result.status === "OK") {
              const { geometry } = result.results[0];
              const store = coordinate.split(",");
              const { lat, lng } = geometry.location;
              const direction = this.getOrientation([lat, lng], store);

              this.setCustomer({ direction, coordinate: [lat, lng] });
              next();
            } else {
              stop("No response from Google Matrix server");
            }
          });
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
    editInvoice() {
      const ticket = this.history.find(
        t => t.customer._id === this.customer._id
      );

      if (ticket.status === 1 && !ticket.settled) {
        this.$checkPermission("modify", "order")
          .then(() => {
            this.setApp({ newTicket: false });
            this.setCustomer(this.order.customer);
            this.setTicket({ type: ticket.type, number: ticket.number });
            this.setOrder(ticket);
            this.$router.push({ path: "/main/menu" });
          })
          .catch(this.editFailed);
      }
    },
    editFailed() {},
    stringify(logs) {
      return logs
        .map(
          log =>
            moment(log.time).format("MM-DD HH:mm") +
            ` (${moment(log.time).fromNow()}) ` +
            this.$t("type." + log.type) +
            " " +
            log.amount
        )
        .join("\n");
    },
    ...mapActions([
      "setApp",
      "setTicket",
      "setOrder",
      "resetMenu",
      "setCustomer",
      "setFavorites",
      "resetCustomer",
      "emptyCustomerInfo"
    ])
  },
  watch:{
    'customer._id':'checkIfOrderToday'
  }
};
</script>

<style scoped>
main {
  position: relative;
  background: #fff;
  width: 668px;
  z-index: 1;
  box-shadow: var(--shadow);
}

main.form {
  margin-bottom: 200px;
}

header {
  position: relative;
  height: 45px;
  display: flex;
  align-items: center;
  padding: 0 0 0 85px;
  border-bottom: 1px solid #eee;
  background: #607d8b;
  color: #fff;
}

i.avatar {
  position: absolute;
  font-size: 4em;
  background: #fff;
  border-radius: 50%;
  border: 3px solid #fff;
  color: #2196f3;
  text-shadow: 0 1px 1px #3c3c3c;
  box-shadow: 0 1px 1px #788e98;
  top: -34px;
  left: 10px;
}

.edit button {
  background: linear-gradient(#fefefe, #cfd0d3);
  box-shadow: 0 1px 3px #333;
  border: none;
  padding: 8px 15px;
  border-radius: 2px;
  font-family: "Yuanti-SC";
  color: #3c3c3c;
  cursor: pointer;
}

.cancel {
  padding: 15px 23px;
  cursor: pointer;
}

.flags {
  display: flex;
  justify-content: center;
}

.alert {
  position: absolute;
  bottom: -10px;
  left: 65px;
  background: #ff9800;
  padding: 0 7px;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(51, 51, 51, 0.64);
}

ul {
  display: flex;
}

li {
  padding: 0 5px;
}
</style>